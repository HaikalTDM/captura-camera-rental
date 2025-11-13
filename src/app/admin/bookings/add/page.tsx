'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createBooking,
  createCustomer,
  getAllCameras
} from '@/lib/api/bookings';
import type { Camera } from '@/lib/supabase';
import { Sparkles, MessageSquare, Loader2, CheckCircle2, Send, ChevronDown } from 'lucide-react';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export default function AddBookingPage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // AI Parser State
  const [showAIParser, setShowAIParser] = useState(true);
  const [aiInputText, setAiInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  // WhatsApp Confirmation State
  const [showWhatsAppConfirmation, setShowWhatsAppConfirmation] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Simple customer details (no existing customer selection)
  const [customerDetails, setCustomerDetails] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: ''
  });

  // Booking form data
  const [bookingData, setBookingData] = useState({
    camera_id: '',
    start_date: '',
    end_date: '',
    total_days: 1,
    daily_rate: 0,
    total_amount: 0,
    deposit_amount: 0,
    deposit_paid: false,
    deposit_paid_date: null as string | null,
    final_payment_amount: 0,
    final_payment_paid: false,
    final_payment_paid_date: null as string | null,
    pickup_method: 'pickup' as const,
    pickup_address: '',
    delivery_fee: 0,
    booking_source: 'manual' as const,
    notes: ''
  });

  // Social media discount state
  const [socialMediaDiscount, setSocialMediaDiscount] = useState(false);
  const [discountPerDay, setDiscountPerDay] = useState(5); // RM5 per day default

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    const camerasData = await getAllCameras();
    setCameras(camerasData);
  };

  // Calculate totals when dates or camera change
  useEffect(() => {
    if (bookingData.start_date && bookingData.end_date && bookingData.camera_id) {
      const start = new Date(bookingData.start_date);
      const end = new Date(bookingData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const camera = cameras.find(c => c.id === bookingData.camera_id);
      if (camera && days > 0) {
        let dailyRate = camera.daily_rate;

        // Apply social media discount if enabled
        if (socialMediaDiscount) {
          dailyRate = dailyRate - discountPerDay;
        }

        const totalAmount = dailyRate * days; // Delivery fee handled separately
        const depositAmount = 100; // Fixed RM100 deposit
        const finalPaymentAmount = totalAmount; // Full rental amount (separate from deposit)

        setBookingData(prev => ({
          ...prev,
          total_days: days,
          daily_rate: dailyRate,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          final_payment_amount: finalPaymentAmount
        }));
      }
    }
  }, [bookingData.start_date, bookingData.end_date, bookingData.camera_id, bookingData.delivery_fee, bookingData.deposit_paid, cameras, socialMediaDiscount, discountPerDay]);

  // AI Text Parser Handler
  const handleParseText = async () => {
    if (!aiInputText.trim()) {
      alert('Please enter customer message text to parse');
      return;
    }

    setIsParsing(true);
    setParseResult(null);

    try {
      const response = await fetch('/api/admin/parse-booking-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiInputText,
          availableCameras: cameras.map(c => ({
            id: c.id,
            name: c.name,
            brand: c.brand,
            model: c.model
          }))
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('API Error Details:', result);
        const errorMsg = result.details
          ? `${result.error}: ${result.details}`
          : result.error || 'Failed to parse text';

        // Show debug info if available
        if (result.debug) {
          console.error('Debug Info:', result.debug);
          if (!result.debug.hasApiKey) {
            throw new Error('DeepSeek API key is not configured in production. Please add DEEPSEEK_API_KEY to Vercel environment variables.');
          }
        }

        throw new Error(errorMsg);
      }

      setParseResult(result.data);

      // Auto-fill form with parsed data
      if (result.data) {
        const parsed = result.data;

        // Fill customer details
        setCustomerDetails({
          full_name: parsed.customer_name || '',
          email: parsed.customer_email || '',
          phone: parsed.customer_phone || '',
          whatsapp: parsed.customer_whatsapp || parsed.customer_phone || '',
          address: parsed.pickup_address || ''
        });

        // Match camera
        if (parsed.camera_name) {
          const matchedCamera = cameras.find(c =>
            c.name.toLowerCase().includes(parsed.camera_name.toLowerCase()) ||
            c.model.toLowerCase().includes(parsed.camera_name.toLowerCase())
          );
          if (matchedCamera) {
            setBookingData(prev => ({ ...prev, camera_id: matchedCamera.id }));
          }
        }

        // Set dates - if only start_date, use same for end_date (single day booking)
        if (parsed.start_date) {
          const endDate = parsed.end_date || parsed.start_date;
          setBookingData(prev => ({
            ...prev,
            start_date: parsed.start_date,
            end_date: endDate
          }));
        }

        // Auto-detect delivery if address is provided
        const hasAddress = parsed.pickup_address && parsed.pickup_address.trim().length > 0;
        const pickupMethod = hasAddress ? 'delivery' : (parsed.pickup_method || 'pickup');

        setBookingData(prev => ({
          ...prev,
          pickup_method: pickupMethod as 'pickup' | 'delivery',
          pickup_address: parsed.pickup_address || ''
        }));

        // Set notes
        if (parsed.notes) {
          setBookingData(prev => ({ ...prev, notes: parsed.notes }));
        }
      }

    } catch (error) {
      console.error('Error parsing text:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse text');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer details
    if (!customerDetails.full_name || !customerDetails.email || !customerDetails.phone) {
      alert('Please fill in customer name, email, and phone');
      return;
    }

    // Validate booking details
    if (!bookingData.camera_id || !bookingData.start_date || !bookingData.end_date) {
      alert('Please select camera and dates');
      return;
    }

    setIsLoading(true);
    try {
      // Create customer first
      const customer = await createCustomer({
        ...customerDetails,
        whatsapp: customerDetails.whatsapp || customerDetails.phone,
        id_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });

      if (!customer) {
        alert('Failed to create customer');
        setIsLoading(false);
        return;
      }

      // Prepare notes with discount info
      const selectedCamera = cameras.find(c => c.id === bookingData.camera_id);
      let finalNotes = bookingData.notes;

      if (socialMediaDiscount && selectedCamera) {
        const originalRate = selectedCamera.daily_rate;
        const discountTotal = discountPerDay * bookingData.total_days;
        const discountNote = `\n\n💰 SOCIAL MEDIA DISCOUNT APPLIED:\n- Original Rate: RM${originalRate}/day\n- Discounted Rate: RM${bookingData.daily_rate}/day\n- Discount: RM${discountPerDay}/day × ${bookingData.total_days} days = RM${discountTotal}\n- Customer shared/reposted/followed our account`;
        finalNotes = (finalNotes || '') + discountNote;
      }

      // Create booking with customer ID
      const booking = await createBooking({
        ...bookingData,
        notes: finalNotes,
        customer_id: customer.id,
        status: 'pending' as const
      });

      if (booking) {
        const camera = cameras.find(c => c.id === bookingData.camera_id);

        setCreatedBooking({
          ...booking,
          customer,
          camera,
          bookingData
        });

        // Show WhatsApp confirmation modal
        setShowWhatsAppConfirmation(true);
      } else {
        alert('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating the booking');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!createdBooking) return '';

    const { customer, camera, bookingData } = createdBooking;

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const selectedCamera = cameras.find(c => c.id === bookingData.camera_id);
    const originalRate = selectedCamera?.daily_rate || bookingData.daily_rate;
    const discountAmount = socialMediaDiscount ? (originalRate - bookingData.daily_rate) * bookingData.total_days : 0;

    return `🎥 *CAPTURA Camera Rental - Booking Confirmation*

Hi ${customer?.full_name || 'Customer'}! 👋

Your camera rental booking has been confirmed! Here are the details:

📋 *Booking Details:*
• Camera: ${camera?.name || 'Camera'}
• Rental Period: ${bookingData.total_days} day${bookingData.total_days > 1 ? 's' : ''}
• Pickup Date: ${formatDate(bookingData.start_date)}
• Return Date: ${formatDate(bookingData.end_date)}

💰 *Payment Information:*${socialMediaDiscount ? `
• Original Rate: RM${originalRate.toFixed(2)}/day
• Discounted Rate: RM${bookingData.daily_rate.toFixed(2)}/day 🎉
• Discount: -RM${discountAmount.toFixed(2)} (Social Media Discount)` : `
• Daily Rate: RM${bookingData.daily_rate.toFixed(2)}`}
• Total Rental: RM${bookingData.total_amount.toFixed(2)}
• Deposit: RM${bookingData.deposit_amount.toFixed(2)}
${bookingData.delivery_fee > 0 ? `• Delivery Fee: RM${bookingData.delivery_fee.toFixed(2)}` : ''}

📦 *Pickup Method:* ${bookingData.pickup_method === 'delivery' ? 'Delivery' : 'Self Pickup'}
${bookingData.pickup_method === 'delivery' && bookingData.pickup_address ? `📍 Delivery Address: ${bookingData.pickup_address}` : ''}

${bookingData.notes ? `📝 *Notes:* ${bookingData.notes}\n` : ''}
⏰ *Pickup Time:* After 9:30 PM (day before rental starts)
🔙 *Return Time:* By 10:00 PM on return date
${socialMediaDiscount ? `
━━━━━━━━━━━━━━━━━━━━━━

📱 *GET EXTRA RM10 OFF!*
Complete these steps before pickup:

🎵 *TikTok Promo (RM5 OFF):*
1️⃣ Follow @captura.my on TikTok
2️⃣ Repost our latest video
3️⃣ Show proof at pickup = *RM5 OFF*

📸 *Instagram Promo (RM5 OFF):*
4️⃣ Tag @captura.my_ in your IG story
5️⃣ Show proof at pickup = *RM5 OFF*

�💡 *Complete both promos = Extra RM10 OFF per day of your total!*

━━━━━━━━━━━━━━━━━━━━━━
` : ''}
Thank you for choosing CAPTURA! 📸

If you have any questions, feel free to reply to this message.`;
  };

  const handleSendWhatsApp = () => {
    if (!createdBooking?.customer) return;

    const message = generateWhatsAppMessage();
    const phoneNumber = createdBooking.customer.whatsapp || createdBooking.customer.phone;
    const formattedPhone = formatPhoneWithCountryCode(phoneNumber);
    const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleSkipWhatsApp = () => {
    router.push('/admin/bookings');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quick Booking with AI</h1>
          <p className="text-slate-600 mt-2">Paste customer message and let AI fill the form automatically</p>
        </div>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Back to Bookings
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* AI Text Parser Section */}
        {showAIParser && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">AI-Powered Form Filler</h2>
                  <p className="text-sm text-slate-600">Paste customer message and extract booking details automatically</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIParser(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                Hide
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Customer Message
                </label>
                <textarea
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 font-mono text-sm"
                  rows={6}
                  placeholder="Paste customer message here... Examples:&#10;&#10;• Hi, saya Ahmad (012-3456789, ahmad@gmail.com). Nak sewa Sony A7III dari 25-28 Dec.&#10;• Name: Sarah Lee, Phone: 0123456789, Email: sarah@email.com, Camera: GoPro Hero 11, Dates: Christmas to New Year&#10;• Customer called, wants Canon R6 from next Friday for 3 days, contact 012-345-6789"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={isParsing || !aiInputText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Extracting Details...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Extract Booking Details
                    </>
                  )}
                </button>

                {parseResult && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    Details extracted! Check form below.
                  </div>
                )}
              </div>

              {/* Confidence Indicators */}
              {parseResult && (
                <div className="bg-white rounded-xl p-4 border border-purple-200">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Extraction Confidence:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(parseResult.confidence).map(([field, level]: [string, any]) => (
                      <div key={field} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          level === 'high' ? 'bg-green-500' :
                          level === 'medium' ? 'bg-yellow-500' :
                          level === 'low' ? 'bg-orange-500' :
                          'bg-slate-300'
                        }`} />
                        <span className="text-xs text-slate-600 capitalize">{field.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    🟢 High confidence • 🟡 Medium confidence • 🟠 Low confidence • ⚪ Not found
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!showAIParser && (
          <button
            type="button"
            onClick={() => setShowAIParser(true)}
            className="w-full bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-300 rounded-xl p-4 text-purple-700 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Show AI Form Filler
          </button>
        )}

        {/* Main Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-8">
          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerDetails.full_name}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  placeholder="Ahmad bin Abdullah"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  placeholder="ahmad@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  placeholder="012-345-6789"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={customerDetails.whatsapp}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  placeholder="Same as phone if empty"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Address (Optional)</label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  rows={2}
                  placeholder="123 Jalan Merdeka, Kuala Lumpur"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Camera Dropdown - Professional Design */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Camera *</label>
                <div className="relative">
                  <select
                    value={bookingData.camera_id}
                    onChange={(e) => setBookingData(prev => ({ ...prev, camera_id: e.target.value }))}
                    className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none cursor-pointer transition-all hover:border-slate-300 bg-white"
                    required
                  >
                    <option value="">Select a camera</option>
                    {cameras.map(camera => (
                      <option key={camera.id} value={camera.id}>
                        {camera.name} - RM{camera.daily_rate}/day
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Booking Source Dropdown */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Booking Source *</label>
                <div className="relative">
                  <select
                    value={bookingData.booking_source}
                    onChange={(e) => setBookingData(prev => ({ ...prev, booking_source: e.target.value as any }))}
                    className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none cursor-pointer transition-all hover:border-slate-300 bg-white"
                    required
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone Call</option>
                    <option value="walk-in">Walk-in</option>
                    <option value="website">Website</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={bookingData.start_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={bookingData.end_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
                  required
                />
              </div>

              {/* Pickup Method Dropdown */}
              <div className="relative md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pickup Method *</label>
                <div className="relative max-w-md">
                  <select
                    value={bookingData.pickup_method}
                    onChange={(e) => setBookingData(prev => ({ ...prev, pickup_method: e.target.value as any }))}
                    className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none cursor-pointer transition-all hover:border-slate-300 bg-white"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Delivery Address - Shows when delivery is selected */}
            {bookingData.pickup_method === 'delivery' && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-blue-50 rounded-xl border-2 border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Address *</label>
                  <textarea
                    value={bookingData.pickup_address}
                    onChange={(e) => setBookingData(prev => ({ ...prev, pickup_address: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all bg-white"
                    rows={2}
                    placeholder="123 Jalan Merdeka, Kuala Lumpur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Fee (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bookingData.delivery_fee}
                    onChange={(e) => setBookingData(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Social Media Discount - Only for Canon R50 */}
          {(() => {
            const selectedCamera = cameras.find(c => c.id === bookingData.camera_id);
            const isCanonR50 = selectedCamera?.name.toLowerCase().includes('canon') && selectedCamera?.name.toLowerCase().includes('r50');

            if (!isCanonR50) return null;

            return (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      🎉 Social Media Discount (Canon R50 Only)
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">Customer shared/reposted/followed your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialMediaDiscount}
                      onChange={(e) => setSocialMediaDiscount(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {socialMediaDiscount && (
                  <div className="mt-4 p-4 bg-white rounded-xl border-2 border-purple-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Discount per Day (RM)</label>
                    <input
                      type="number"
                      step="1"
                      value={discountPerDay}
                      onChange={(e) => setDiscountPerDay(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 transition-all bg-white"
                      placeholder="5"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      💡 Default: RM5/day. Total discount: RM{(discountPerDay * bookingData.total_days).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Payment Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Days</label>
                <div className="text-2xl font-bold text-slate-900">{bookingData.total_days}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Daily Rate</label>
                <div className="text-2xl font-bold text-slate-900">
                  {socialMediaDiscount && (
                    <div className="text-sm text-slate-400 line-through">
                      RM{(cameras.find(c => c.id === bookingData.camera_id)?.daily_rate || 0).toFixed(2)}
                    </div>
                  )}
                  RM{bookingData.daily_rate.toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Total Amount</label>
                <div className="text-2xl font-bold text-blue-600">RM{bookingData.total_amount.toFixed(2)}</div>
                {socialMediaDiscount && (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    Saved RM{(discountPerDay * bookingData.total_days).toFixed(2)}!
                  </div>
                )}
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <label className="block text-xs font-semibold text-green-700 mb-1">Deposit</label>
                <div className="text-2xl font-bold text-green-600">RM100.00</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 transition-all"
              rows={3}
              placeholder="Any special requests, extra accessories needed, etc..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* WhatsApp Confirmation Modal */}
      {showWhatsAppConfirmation && createdBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Booking Created Successfully!</h2>
                  <p className="text-slate-600">Send confirmation to customer via WhatsApp</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Customer:</span>
                    <p className="font-semibold text-slate-900">{createdBooking.customer?.full_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phone:</span>
                    <p className="font-semibold text-slate-900">{createdBooking.customer?.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Camera:</span>
                    <p className="font-semibold text-slate-900">{createdBooking.camera?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Duration:</span>
                    <p className="font-semibold text-slate-900">{createdBooking.bookingData.total_days} days</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Amount:</span>
                    <p className="font-semibold text-slate-900">RM{createdBooking.bookingData.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Deposit:</span>
                    <p className="font-semibold text-slate-900">RM{createdBooking.bookingData.deposit_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2">WhatsApp Message Preview:</h3>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {generateWhatsAppMessage()}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Send WhatsApp Confirmation
                </button>
                <button
                  onClick={handleSkipWhatsApp}
                  className="px-6 py-4 border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Skip & Go to Bookings
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                💡 Tip: Clicking "Send WhatsApp" will open WhatsApp Web with the pre-filled message. You can edit it before sending.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
