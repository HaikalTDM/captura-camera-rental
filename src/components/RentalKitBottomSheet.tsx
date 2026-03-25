'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Camera, CameraVariant } from '@/types';
import {
  generateRentalKitWhatsAppUrl,
  type WebsiteBookingGroupData,
  type WebsiteBookingGroupItemData,
} from '@/lib/api/website-bookings';
import { calculateRentalCost, formatCurrency } from '@/lib/pricing';
import { calculateDaysBetween, formatDateForAPI } from '@/lib/dateUtils';
import { formatPhoneWithCountryCode, isValidMalaysianPhone } from '@/utils/phoneFormatter';

interface RentalKitBottomSheetProps {
  cameras: Camera[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveCamera: (cameraId: string) => void;
  onClearKit: () => void;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface SubmissionSuccess {
  bookingGroupReference: string;
  confirmationNumber: string;
  whatsappUrl: string;
}

type SelectedVariants = Record<string, string | null>;

const getDefaultVariantId = (camera: Camera): string | null => {
  return camera.variants && camera.variants.length > 0 ? camera.variants[0].id : null;
};

const getVariantForCamera = (camera: Camera, variantId: string | null): CameraVariant | null => {
  if (!camera.variants || !variantId) return null;
  return camera.variants.find((variant) => variant.id === variantId) ?? null;
};

const buildCameraForPricing = (camera: Camera, variantId: string | null): Camera => {
  const variant = getVariantForCamera(camera, variantId);

  if (!variant) {
    return camera;
  }

  return {
    ...camera,
    name: `${camera.name} (${variant.name})`,
    dailyRate: variant.dailyRate,
    discountRate: variant.discountRate,
  };
};

export default function RentalKitBottomSheet({
  cameras,
  isOpen,
  onClose,
  onRemoveCamera,
  onClearKit,
}: RentalKitBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [pickupAddress, setPickupAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubmissionSuccess | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    if (sheetRef.current) {
      sheetRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedVariants((current) => {
      const next: SelectedVariants = {};
      cameras.forEach((camera) => {
        next[camera.id] = current[camera.id] ?? getDefaultVariantId(camera);
      });
      return next;
    });
  }, [cameras]);

  const pricing = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        totalDays: 0,
        items: [] as Array<{
          camera: Camera;
          pricingCamera: Camera;
          totalCost: number;
          dailyRate: number;
        }>,
        subtotal: 0,
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return {
        totalDays: 0,
        items: [] as Array<{
          camera: Camera;
          pricingCamera: Camera;
          totalCost: number;
          dailyRate: number;
        }>,
        subtotal: 0,
      };
    }

    const items = cameras.map((camera) => {
      const pricingCamera = buildCameraForPricing(camera, selectedVariants[camera.id] ?? null);
      const rental = calculateRentalCost(pricingCamera, start, end);
      return {
        camera,
        pricingCamera,
        totalCost: rental.totalCost,
        dailyRate: rental.dailyRate,
      };
    });

    return {
      totalDays: calculateDaysBetween(start, end),
      items,
      subtotal: items.reduce((sum, item) => sum + item.totalCost, 0),
    };
  }, [cameras, endDate, selectedVariants, startDate]);

  const depositAmount = pricing.items.length * 100;
  const totalDueNow = pricing.subtotal + depositAmount;
  const todayString = useMemo(() => formatDateForAPI(new Date()), []);

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleVariantChange = (cameraId: string, variantId: string) => {
    setSelectedVariants((current) => ({ ...current, [cameraId]: variantId }));
  };

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;

    try {
      (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
    } catch {
      input.focus();
      input.click();
    }
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);

    if (endDate && value && new Date(endDate) < new Date(value)) {
      setEndDate(value);
    }

    setError(null);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setError(null);
  };

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setStartDate('');
    setEndDate('');
    setPickupMethod('pickup');
    setPickupAddress('');
    setSpecialRequests('');
    setCustomerDetails({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const validate = (): string | null => {
    if (cameras.length === 0) return 'Add at least one camera to continue.';
    if (!startDate || !endDate) return 'Please select a rental start and end date.';
    if (new Date(endDate) < new Date(startDate)) return 'Return date must be on or after the start date.';
    if (!customerDetails.name.trim()) return 'Full name is required.';
    if (!customerDetails.email.trim()) return 'Email is required.';
    if (!customerDetails.phone.trim()) return 'Phone number is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) return 'Invalid email format.';
    if (!isValidMalaysianPhone(customerDetails.phone)) return 'Invalid Malaysian phone number format.';
    if (pickupMethod === 'delivery' && !pickupAddress.trim()) return 'Delivery address is required.';

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const items: WebsiteBookingGroupItemData[] = pricing.items.map((item) => ({
        camera_id: item.camera.id,
        camera_name: item.pricingCamera.name,
        total_days: pricing.totalDays,
        daily_rate: item.dailyRate,
        total_amount: item.totalCost,
        deposit_amount: 100,
        final_payment_amount: item.totalCost,
      }));

      const payload: WebsiteBookingGroupData = {
        start_date: formatDateForAPI(new Date(startDate)),
        end_date: formatDateForAPI(new Date(endDate)),
        total_days: pricing.totalDays,
        customer_name: customerDetails.name.trim(),
        customer_email: customerDetails.email.trim(),
        customer_phone: formatPhoneWithCountryCode(customerDetails.phone.trim()),
        customer_whatsapp: formatPhoneWithCountryCode(customerDetails.phone.trim()),
        customer_address: customerDetails.address.trim() || undefined,
        pickup_method: pickupMethod,
        pickup_address: pickupMethod === 'delivery' ? pickupAddress.trim() : undefined,
        delivery_fee: 0,
        subtotal_amount: pricing.subtotal,
        deposit_amount: depositAmount,
        final_payment_amount: pricing.subtotal,
        total_amount: pricing.subtotal,
        special_requests: specialRequests.trim() || undefined,
        booking_source: 'website',
        items,
      };

      const response = await fetch('/api/bookings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.conflicts && Array.isArray(result.conflicts) && result.conflicts.length > 0) {
          throw new Error(`Some items are unavailable: ${result.conflicts.map((conflict: { camera_name: string }) => conflict.camera_name).join(', ')}`);
        }
        throw new Error(result.error || 'Failed to submit Rental Kit');
      }

      setSuccess({
        bookingGroupReference: result.booking_group_reference || result.confirmation_number,
        confirmationNumber: result.confirmation_number,
        whatsappUrl: generateRentalKitWhatsAppUrl(
          result.booking_group_reference || result.confirmation_number,
          payload,
        ),
      });
      onClearKit();
    } catch (submissionError) {
      console.error('Error submitting rental kit:', submissionError);
      setError(submissionError instanceof Error ? submissionError.message : 'Failed to submit Rental Kit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[210] flex items-end bg-black/70 backdrop-blur-md" onClick={handleClose}>
      <div
        ref={sheetRef}
        className="relative h-[92vh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-white/10 bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        <div className="sticky top-0 z-10 border-b border-white/5 bg-zinc-950/95 px-5 pb-4 pt-3 backdrop-blur-xl">
          <div className="mb-3 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-zinc-800" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400/80">Rental Kit</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Build Your Setup</h2>
              <p className="mt-1 max-w-lg text-sm text-zinc-400">
                One clean request for up to 3 cameras, one shared date range, one smoother checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-6 pb-28">
          {success ? (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Submitted</p>
              <h3 className="mt-2 text-2xl font-black text-white">Rental Kit Sent Successfully</h3>
              <p className="mt-3 text-sm text-zinc-300">
                Reference <span className="font-black text-white">{success.bookingGroupReference}</span>. We’ll review availability and confirm the full setup shortly.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a
                  href={success.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-center text-sm font-black text-black transition-colors hover:bg-emerald-400 sm:w-auto"
                >
                  Continue on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    onClose();
                  }}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-zinc-200 sm:w-auto"
                >
                  Back to Cameras
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold text-zinc-500">
                Best next step: continue on WhatsApp so the full setup can be confirmed faster.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <section className="rounded-3xl border border-white/5 bg-zinc-900/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Selected Gear</p>
                    <h3 className="mt-1 text-lg font-black text-white">{cameras.length} camera{cameras.length > 1 ? 's' : ''} in your kit</h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClearKit}
                    className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
                  >
                    Clear kit
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {cameras.map((camera) => (
                    <div key={camera.id} className="rounded-2xl border border-white/5 bg-zinc-950 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-black text-white">{camera.name}</h4>
                          <p className="mt-1 text-xs font-semibold text-zinc-500">Base rate {formatCurrency(camera.dailyRate)}/day</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveCamera(camera.id)}
                          className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
                        >
                          Remove
                        </button>
                      </div>

                      {camera.variants && camera.variants.length > 0 && (
                        <div className="mt-4">
                          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
                            Package
                          </label>
                          <select
                            value={selectedVariants[camera.id] ?? ''}
                            onChange={(event) => handleVariantChange(camera.id, event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                          >
                            {camera.variants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.name} - RM{variant.dailyRate}/day
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <section className="rounded-3xl border border-white/5 bg-zinc-900/70 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Rental Window</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-zinc-300">Start Date</label>
                        <button
                          type="button"
                          onClick={() => openDatePicker(startDateInputRef.current)}
                          className="relative w-full text-left"
                        >
                          <input
                            ref={startDateInputRef}
                            type="date"
                            value={startDate}
                            min={todayString}
                            onChange={(event) => handleStartDateChange(event.target.value)}
                            onFocus={() => openDatePicker(startDateInputRef.current)}
                            className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                            required
                          />
                        </button>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-zinc-300">End Date</label>
                        <button
                          type="button"
                          onClick={() => openDatePicker(endDateInputRef.current)}
                          className="relative w-full text-left"
                        >
                          <input
                            ref={endDateInputRef}
                            type="date"
                            value={endDate}
                            min={startDate || todayString}
                            onChange={(event) => handleEndDateChange(event.target.value)}
                            onFocus={() => openDatePicker(endDateInputRef.current)}
                            className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                            required
                          />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">
                      V1 keeps your entire Rental Kit on one shared date range so the flow stays clean and fast.
                    </p>
                  </section>

                  <section className="rounded-3xl border border-white/5 bg-zinc-900/70 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Customer Details</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-zinc-300">Full Name</label>
                        <input
                          type="text"
                          value={customerDetails.name}
                          onChange={(event) => handleInputChange('name', event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-zinc-300">Email Address</label>
                        <input
                          type="email"
                          value={customerDetails.email}
                          onChange={(event) => handleInputChange('email', event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-zinc-300">Phone Number</label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(event) => handleInputChange('phone', event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                          placeholder="+60123456789"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-zinc-300">Address</label>
                        <textarea
                          value={customerDetails.address}
                          onChange={(event) => handleInputChange('address', event.target.value)}
                          rows={3}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                          placeholder="Your address"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/5 bg-zinc-900/70 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Pickup Method</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${pickupMethod === 'pickup' ? 'border-white bg-white text-black' : 'border-white/10 bg-zinc-950 text-zinc-400'}`}>
                        <input
                          type="radio"
                          className="sr-only"
                          value="pickup"
                          checked={pickupMethod === 'pickup'}
                          onChange={() => setPickupMethod('pickup')}
                        />
                        <div className="text-sm font-black">Self Pickup</div>
                        <div className={`mt-1 text-xs font-semibold ${pickupMethod === 'pickup' ? 'text-black/70' : 'text-zinc-500'}`}>Collect directly from Captura.</div>
                      </label>
                      <label className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${pickupMethod === 'delivery' ? 'border-white bg-white text-black' : 'border-white/10 bg-zinc-950 text-zinc-400'}`}>
                        <input
                          type="radio"
                          className="sr-only"
                          value="delivery"
                          checked={pickupMethod === 'delivery'}
                          onChange={() => setPickupMethod('delivery')}
                        />
                        <div className="text-sm font-black">Lalamove Delivery</div>
                        <div className={`mt-1 text-xs font-semibold ${pickupMethod === 'delivery' ? 'text-black/70' : 'text-zinc-500'}`}>Delivery paid directly to the courier.</div>
                      </label>
                    </div>

                    {pickupMethod === 'delivery' && (
                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-bold text-zinc-300">Delivery Address</label>
                        <textarea
                          value={pickupAddress}
                          onChange={(event) => setPickupAddress(event.target.value)}
                          rows={3}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                          placeholder="Enter your delivery address"
                        />
                      </div>
                    )}
                  </section>

                  <section className="rounded-3xl border border-white/5 bg-zinc-900/70 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Special Requests</p>
                    <textarea
                      value={specialRequests}
                      onChange={(event) => setSpecialRequests(event.target.value)}
                      rows={3}
                      className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-white/20"
                      placeholder="Anything you want us to know before we confirm the setup?"
                    />
                  </section>
                </div>

                <aside className="space-y-6">
                  <section className="rounded-3xl border border-white/5 bg-zinc-900/70 p-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Pricing Snapshot</p>
                    <div className="mt-4 space-y-4">
                      {pricing.items.length > 0 ? (
                        pricing.items.map((item) => (
                          <div key={item.camera.id} className="rounded-2xl border border-white/5 bg-zinc-950 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-black text-white">{item.pricingCamera.name}</div>
                                <div className="mt-1 text-xs font-semibold text-zinc-500">
                                  {formatCurrency(item.dailyRate)}/day × {pricing.totalDays} day{pricing.totalDays > 1 ? 's' : ''}
                                </div>
                              </div>
                              <div className="text-sm font-black text-white">{formatCurrency(item.totalCost)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 p-4 text-sm text-zinc-500">
                          Select your dates to see the full Rental Kit total.
                        </div>
                      )}
                    </div>

                    <div className="mt-5 space-y-3 border-t border-white/5 pt-5 text-sm">
                      <div className="flex justify-between text-zinc-400">
                        <span>Rental subtotal</span>
                        <span className="font-bold text-white">{formatCurrency(pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Deposit hold</span>
                        <span className="font-bold text-white">{formatCurrency(depositAmount)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Delivery fee</span>
                        <span className="font-bold text-orange-400">Paid to Lalamove</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-4">
                        <span className="text-sm font-black text-white">Total due now</span>
                        <span className="text-2xl font-black text-white">{formatCurrency(totalDueNow)}</span>
                      </div>
                    </div>
                  </section>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Back to Cameras
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || cameras.length === 0}
                      className="w-full rounded-2xl bg-white px-5 py-4 text-base font-black text-black transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting Rental Kit...' : 'Submit Rental Kit'}
                    </button>
                  </div>

                  <p className="text-center text-xs font-semibold leading-relaxed text-zinc-500">
                    We’ll validate the whole setup together, then confirm availability and next steps with you.
                  </p>
                </aside>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
