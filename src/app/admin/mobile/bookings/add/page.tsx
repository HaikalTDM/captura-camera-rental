'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createBooking,
  createCustomer,
  getAllCameras
} from '@/lib/api/bookings';
import type { Camera } from '@/lib/supabase';
import { getRateForDuration } from '@/lib/cameraPricing';
import { Sparkles, Loader2, ChevronLeft, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

type BookingFormData = {
  camera_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_date: string | null;
  final_payment_amount: number;
  final_payment_paid: boolean;
  final_payment_paid_date: string | null;
  pickup_method: 'pickup' | 'delivery';
  pickup_address: string;
  delivery_fee: number;
  booking_source: 'manual' | 'website' | 'phone' | 'whatsapp' | 'walk-in' | 'historical';
  notes: string;
};

type ParsedBookingData = {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_whatsapp?: string;
  pickup_address?: string;
  camera_name?: string;
  start_date?: string;
  end_date?: string;
  pickup_method?: 'pickup' | 'delivery';
  notes?: string;
};

type ParseBookingTextResponse = {
  success: boolean;
  data?: ParsedBookingData;
  error?: string;
  details?: string;
  debug?: {
    hasApiKey?: boolean;
  };
};

export default function MobileAddBookingPage() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // AI Parser State
  const [showAIParser, setShowAIParser] = useState(true);
  const [aiInputText, setAiInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedBookingData | null>(null);

  // Customer details
  const [customerDetails, setCustomerDetails] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: ''
  });

  // Booking form data
  const [bookingData, setBookingData] = useState<BookingFormData>({
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
    pickup_method: 'pickup',
    pickup_address: '',
    delivery_fee: 0,
    booking_source: 'manual',
    notes: ''
  });

  // Social media discount state
  const [socialMediaDiscount, setSocialMediaDiscount] = useState(false);
  const [discountPerDay, setDiscountPerDay] = useState(5);

  useEffect(() => {
    loadCameras();
    // Check dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
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
        let dailyRate = getRateForDuration(camera, days);

        if (socialMediaDiscount) {
          dailyRate = dailyRate - discountPerDay;
        }

        const totalAmount = dailyRate * days;
        const depositAmount = 100;
        const finalPaymentAmount = totalAmount;

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
  }, [bookingData.start_date, bookingData.end_date, bookingData.camera_id, cameras, socialMediaDiscount, discountPerDay]);

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

      const result: ParseBookingTextResponse = await response.json();

      if (!response.ok || !result.success) {
        console.error('API Error Details:', result);
        const errorMsg = result.details
          ? `${result.error}: ${result.details}`
          : result.error || 'Failed to parse text';

        if (result.debug) {
          console.error('Debug Info:', result.debug);
          if (!result.debug.hasApiKey) {
            throw new Error('DeepSeek API key is not configured. Please add DEEPSEEK_API_KEY to environment variables.');
          }
        }

        throw new Error(errorMsg);
      }

      setParseResult(result.data);

      // Auto-fill form with parsed data
      if (result.data) {
        const parsed = result.data;

        setCustomerDetails({
          full_name: parsed.customer_name || '',
          email: parsed.customer_email || '',
          phone: parsed.customer_phone || '',
          whatsapp: parsed.customer_whatsapp || parsed.customer_phone || '',
          address: parsed.pickup_address || ''
        });

        if (parsed.camera_name) {
          const matchedCamera = cameras.find(c =>
            c.name.toLowerCase().includes(parsed.camera_name.toLowerCase()) ||
            c.model.toLowerCase().includes(parsed.camera_name.toLowerCase())
          );
          if (matchedCamera) {
            setBookingData(prev => ({ ...prev, camera_id: matchedCamera.id }));
          }
        }

        if (parsed.start_date) {
          const endDate = parsed.end_date || parsed.start_date;
          setBookingData(prev => ({
            ...prev,
            start_date: parsed.start_date,
            end_date: endDate
          }));
        }

        const hasAddress = parsed.pickup_address && parsed.pickup_address.trim().length > 0;
        const pickupMethod = hasAddress ? 'delivery' : (parsed.pickup_method || 'pickup');

        setBookingData(prev => ({
          ...prev,
          pickup_method: pickupMethod as 'pickup' | 'delivery',
          pickup_address: parsed.pickup_address || ''
        }));

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

    if (!customerDetails.full_name || !customerDetails.email || !customerDetails.phone) {
      toast.error('Please fill in customer name, email, and phone');
      return;
    }

    if (!bookingData.camera_id || !bookingData.start_date || !bookingData.end_date) {
      toast.error('Please select camera and dates');
      return;
    }

    setIsLoading(true);
    try {
      const customer = await createCustomer({
        ...customerDetails,
        whatsapp: customerDetails.whatsapp || customerDetails.phone,
        id_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });

      if (!customer) {
        toast.error('Failed to create customer');
        setIsLoading(false);
        return;
      }

      const selectedCamera = cameras.find(c => c.id === bookingData.camera_id);
      let finalNotes = bookingData.notes;

      if (socialMediaDiscount && selectedCamera) {
        const originalRate = selectedCamera.daily_rate;
        const discountTotal = discountPerDay * bookingData.total_days;
        const discountNote = `\n\n💰 SOCIAL MEDIA DISCOUNT APPLIED:\n- Original Rate: RM${originalRate}/day\n- Discounted Rate: RM${bookingData.daily_rate}/day\n- Discount: RM${discountPerDay}/day × ${bookingData.total_days} days = RM${discountTotal}\n- Customer shared/reposted/followed our account`;
        finalNotes = (finalNotes || '') + discountNote;
      }

      try {
        const booking = await createBooking({
          customer_id: customer.id,
          camera_id: bookingData.camera_id,
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          total_days: bookingData.total_days,
          daily_rate: bookingData.daily_rate,
          total_amount: bookingData.total_amount,
          deposit_amount: bookingData.deposit_amount,
          deposit_paid: bookingData.deposit_paid,
          deposit_paid_date: bookingData.deposit_paid_date,
          final_payment_amount: bookingData.final_payment_amount,
          final_payment_paid: bookingData.final_payment_paid,
          final_payment_paid_date: bookingData.final_payment_paid_date,
          pickup_method: bookingData.pickup_method,
          pickup_address: bookingData.pickup_address,
          delivery_fee: bookingData.delivery_fee,
          booking_source: bookingData.booking_source,
          notes: finalNotes,
          booking_status: 'pending_approval'
        });

        if (booking) {
          toast.success('Booking created successfully!');
          router.push('/admin/mobile/bookings');
        } else {
          toast.error('Failed to create booking');
        }
      } catch (bookingError: unknown) {
        // Handle availability errors specifically
        const bookingErrorMessage = bookingError instanceof Error ? bookingError.message : '';

        if (bookingErrorMessage.includes('Camera not available')) {
          toast.error(bookingErrorMessage, { duration: 6000 });
        } else {
          toast.error('Failed to create booking. Please try again.');
        }
        throw bookingError; // Re-throw to be caught by outer catch
      }
    } catch (error: unknown) {
      console.error('Error creating booking:', error);
      // Only show generic error if we haven't already shown a specific error
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Camera not available')) {
        toast.error('Failed to create booking');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-slate-50'} pb-20`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-black' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} backdrop-blur-lg bg-opacity-95`}>
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-slate-900' : 'hover:bg-slate-100'} transition-colors`}
          >
            <ChevronLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
          </button>
          <div className="flex-1">
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Add New Booking
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Create a new camera rental booking
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* AI Parser Section */}
        {showAIParser && (
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-purple-900 to-indigo-900' : 'bg-gradient-to-br from-purple-50 to-indigo-50'} rounded-3xl p-5 border-2 ${isDarkMode ? 'border-purple-700' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-800' : 'bg-purple-200'}`}>
                  <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Smart Paste
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Auto-fill from message
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIParser(false)}
                className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-purple-800' : 'hover:bg-purple-200'} transition-colors`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`} />
              </button>
            </div>

            <textarea
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              placeholder="Paste customer WhatsApp message here...&#10;&#10;Example:&#10;Hi, I want to rent Canon EOS R5 from Nov 15 to Nov 20. My name is John Doe, phone 0123456789, email john@example.com"
              className={`w-full px-4 py-3 rounded-2xl border-2 ${isDarkMode
                  ? 'bg-slate-900 border-purple-700 text-white placeholder-slate-500'
                  : 'bg-white border-purple-200 text-slate-900 placeholder-slate-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm`}
              rows={6}
            />

            <button
              onClick={handleParseText}
              disabled={isParsing || !aiInputText.trim()}
              className={`w-full mt-3 px-6 py-3 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isParsing || !aiInputText.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                }`}
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Parse with AI</span>
                </>
              )}
            </button>

            {parseResult && (
              <div className={`mt-4 p-4 rounded-2xl ${isDarkMode ? 'bg-green-900/30 border-2 border-green-700' : 'bg-green-50 border-2 border-green-200'}`}>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-green-300' : 'text-green-700'} mb-2`}>
                  ✓ Parsed Successfully! Form auto-filled below.
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Review and adjust the details if needed.
                </p>
              </div>
            )}
          </div>
        )}

        {!showAIParser && (
          <button
            onClick={() => setShowAIParser(true)}
            className={`w-full px-4 py-3 rounded-2xl border-2 border-dashed ${isDarkMode
                ? 'border-purple-700 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
                : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
              } transition-colors flex items-center justify-center gap-2 font-bold`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Show Smart Paste</span>
          </button>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Details Section */}
          <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl p-5 border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
              Customer Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerDetails.full_name}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, full_name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={customerDetails.whatsapp}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="Leave empty to use phone number"
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Address
                </label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Booking Details Section */}
          <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl p-5 border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
              Booking Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Camera *
                </label>
                <select
                  value={bookingData.camera_id}
                  onChange={(e) => setBookingData(prev => ({ ...prev, camera_id: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                >
                  <option value="">Select a camera</option>
                  {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name} - RM{camera.daily_rate}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.end_date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, end_date: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    required
                  />
                </div>
              </div>

              {/* Social Media Discount */}
              <div className={`p-4 rounded-xl border-2 ${socialMediaDiscount
                  ? isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                  : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={socialMediaDiscount}
                    onChange={(e) => setSocialMediaDiscount(e.target.checked)}
                    className="w-5 h-5 rounded accent-green-600"
                  />
                  <div className="flex-1">
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Social Media Discount
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Customer shared/followed our account
                    </p>
                  </div>
                </label>

                {socialMediaDiscount && (
                  <div className="mt-3">
                    <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                      Discount per day (RM)
                    </label>
                    <input
                      type="number"
                      value={discountPerDay}
                      onChange={(e) => setDiscountPerDay(Number(e.target.value))}
                      min="0"
                      step="1"
                      className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                  </div>
                )}
              </div>

              {/* Pickup Method */}
              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Pickup Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingData(prev => ({ ...prev, pickup_method: 'pickup' }))}
                    className={`px-4 py-3 rounded-xl border-2 font-bold transition-all ${bookingData.pickup_method === 'pickup'
                        ? isDarkMode
                          ? 'bg-purple-900 border-purple-600 text-white'
                          : 'bg-purple-100 border-purple-500 text-purple-900'
                        : isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                  >
                    Self Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingData(prev => ({ ...prev, pickup_method: 'delivery' }))}
                    className={`px-4 py-3 rounded-xl border-2 font-bold transition-all ${bookingData.pickup_method === 'delivery'
                        ? isDarkMode
                          ? 'bg-purple-900 border-purple-600 text-white'
                          : 'bg-purple-100 border-purple-500 text-purple-900'
                        : isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {bookingData.pickup_method === 'delivery' && (
                <div>
                  <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                    Delivery Address
                  </label>
                  <textarea
                    value={bookingData.pickup_address}
                    onChange={(e) => setBookingData(prev => ({ ...prev, pickup_address: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                  Notes
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {bookingData.total_amount > 0 && (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-100'} rounded-3xl p-5 border-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>
                Payment Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Daily Rate
                  </span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    RM{bookingData.daily_rate}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Total Days
                  </span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {bookingData.total_days} {bookingData.total_days === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Rental Amount
                    </span>
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      RM{bookingData.total_amount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Deposit (Fixed)
                    </span>
                    <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      RM{bookingData.deposit_amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-4 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 ${isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Creating Booking...</span>
              </>
            ) : (
              <span>Create Booking</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

