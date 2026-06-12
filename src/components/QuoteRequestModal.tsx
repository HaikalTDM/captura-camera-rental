'use client';

import { useState, useEffect } from 'react';

type ServiceType = 'photography' | 'videography';
type Step = 'select' | 'form';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
}

interface PhotoFormData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  guestCount: string;
  coverageHours: string;
  shooterSetup: string;
  notes: string;
}

interface VideoFormData {
  name: string;
  phone: string;
  email: string;
  projectType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  coverageHours: string;
  finalLength: string;
  droneNeeded: string;
  stylePreference: string;
  notes: string;
}

const emptyPhoto: PhotoFormData = {
  name: '', phone: '', email: '', eventType: '', eventDate: '', eventTime: '',
  venue: '', guestCount: '', coverageHours: '', shooterSetup: '', notes: '',
};

const emptyVideo: VideoFormData = {
  name: '', phone: '', email: '', projectType: '', eventDate: '', eventTime: '',
  venue: '', coverageHours: '', finalLength: '', droneNeeded: '',
  stylePreference: '', notes: '',
};

const WHATSAPP_NUMBER = '60177464121';

export default function QuoteRequestModal({ isOpen, onClose, initialService }: QuoteRequestModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [service, setService] = useState<ServiceType | null>(null);
  const [photoForm, setPhotoForm] = useState<PhotoFormData>(emptyPhoto);
  const [videoForm, setVideoForm] = useState<VideoFormData>(emptyVideo);

  useEffect(() => {
    if (isOpen) {
      if (initialService) {
        setService(initialService);
        setStep('form');
      } else {
        setService(null);
        setStep('select');
      }
    }
  }, [isOpen, initialService]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectService = (s: ServiceType) => {
    setService(s);
    setStep('form');
  };

  const handleBack = () => {
    setStep('select');
    setService(null);
  };

  const formatPhotoMessage = (d: PhotoFormData) => {
    return [
      `*Photography Quote Request*`,
      ``,
      `*Name:* ${d.name}`,
      `*Phone:* ${d.phone}`,
      d.email && `*Email:* ${d.email}`,
      ``,
      `*Event Type:* ${d.eventType}`,
      `*Date:* ${d.eventDate}${d.eventTime ? ` at ${d.eventTime}` : ''}`,
      `*Venue:* ${d.venue}`,
      d.guestCount && `*Estimated Guests:* ${d.guestCount}`,
      `*Coverage:* ${d.coverageHours}`,
      `*Photographer Setup:* ${d.shooterSetup}`,
      ``,
      d.notes && `*Special Requests:*\n${d.notes}`,
      ``,
      `_Sent via Captura Studio website_`,
    ].filter(Boolean).join('\n');
  };

  const formatVideoMessage = (d: VideoFormData) => {
    return [
      `*Videography Quote Request*`,
      ``,
      `*Name:* ${d.name}`,
      `*Phone:* ${d.phone}`,
      d.email && `*Email:* ${d.email}`,
      ``,
      `*Project Type:* ${d.projectType}`,
      `*Date:* ${d.eventDate}${d.eventTime ? ` at ${d.eventTime}` : ''}`,
      `*Venue:* ${d.venue}`,
      `*Coverage:* ${d.coverageHours}`,
      d.finalLength && `*Final Video Length:* ${d.finalLength}`,
      d.droneNeeded && `*Drone Footage:* ${d.droneNeeded}`,
      d.stylePreference && `*Style Preference:* ${d.stylePreference}`,
      ``,
      d.notes && `*Special Requests:*\n${d.notes}`,
      ``,
      `_Sent via Captura Studio website_`,
    ].filter(Boolean).join('\n');
  };

  const saveInquiry = async () => {
    try {
      const payload = service === 'photography'
        ? {
            serviceType: 'photography' as const,
            clientName: photoForm.name,
            clientPhone: photoForm.phone,
            clientEmail: photoForm.email,
            eventType: photoForm.eventType,
            eventDate: photoForm.eventDate,
            eventTime: photoForm.eventTime,
            venue: photoForm.venue,
            coverageDuration: photoForm.coverageHours,
            guestCount: photoForm.guestCount,
            shooterSetup: photoForm.shooterSetup,
            specialRequests: photoForm.notes,
          }
        : {
            serviceType: 'videography' as const,
            clientName: videoForm.name,
            clientPhone: videoForm.phone,
            clientEmail: videoForm.email,
            eventType: videoForm.projectType,
            eventDate: videoForm.eventDate,
            eventTime: videoForm.eventTime,
            venue: videoForm.venue,
            coverageDuration: videoForm.coverageHours,
            finalVideoLength: videoForm.finalLength,
            droneNeeded: videoForm.droneNeeded,
            stylePreference: videoForm.stylePreference,
            specialRequests: videoForm.notes,
          };

      await fetch('/api/studio/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Non-blocking — even if save fails, we still send to WhatsApp
      console.error('Failed to save inquiry:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save inquiry to database (non-blocking failure — won't prevent WhatsApp)
    await saveInquiry();

    const message = service === 'photography'
      ? formatPhotoMessage(photoForm)
      : formatVideoMessage(videoForm);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
    // Reset forms
    setPhotoForm(emptyPhoto);
    setVideoForm(emptyVideo);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-[#fdfcfa] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === 'form' && !initialService && (
              <button onClick={handleBack} className="text-stone-400 hover:text-stone-700 transition-colors -ml-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <p className="text-[#a08520] text-[9px] tracking-[0.4em] uppercase font-medium">
                {step === 'select' ? 'Get Quote' : service === 'photography' ? 'Photography' : 'Videography'}
              </p>
              <h2 className="text-xl sm:text-2xl font-serif text-stone-900 leading-tight">
                {step === 'select' ? 'What do you need?' : 'Tell us about it'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {step === 'select' && <ServiceSelect onSelect={handleSelectService} />}
          {step === 'form' && service === 'photography' && (
            <PhotographyForm data={photoForm} onChange={setPhotoForm} onSubmit={handleSubmit} />
          )}
          {step === 'form' && service === 'videography' && (
            <VideographyForm data={videoForm} onChange={setVideoForm} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}

// ====== Service Selection ======
function ServiceSelect({ onSelect }: { onSelect: (s: ServiceType) => void }) {
  return (
    <div className="p-6 sm:p-8">
      <p className="text-stone-500 text-sm mb-6">
        Pick the service you&apos;re interested in. We&apos;ll ask a few quick questions to send you a tailored quote.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('photography')}
          className="group text-left p-6 bg-white border-2 border-stone-200 rounded-xl hover:border-[#d4af37] hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#d4af37]/20 transition-colors">
            <svg className="w-6 h-6 text-[#a08520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-stone-900 mb-1">Photography</h3>
          <p className="text-stone-500 text-sm">Wedding, nikah, sanding &amp; portraits</p>
        </button>

        <button
          onClick={() => onSelect('videography')}
          className="group text-left p-6 bg-white border-2 border-stone-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-stone-900 mb-1">Videography</h3>
          <p className="text-stone-500 text-sm">Wedding films, brand videos &amp; reels</p>
        </button>
      </div>
    </div>
  );
}

// ====== Photography Form ======
function PhotographyForm({
  data, onChange, onSubmit,
}: { data: PhotoFormData; onChange: (d: PhotoFormData) => void; onSubmit: (e: React.FormEvent) => void }) {
  const set = (k: keyof PhotoFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [k]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-5">
      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input type="text" required value={data.name} onChange={set('name')} className={inputCls} placeholder="e.g. Aisha" />
        </Field>
        <Field label="WhatsApp number" required>
          <input type="tel" required value={data.phone} onChange={set('phone')} className={inputCls} placeholder="+60 17-xxx xxxx" />
        </Field>
      </div>

      <Field label="Email (optional)">
        <input type="email" value={data.email} onChange={set('email')} className={inputCls} placeholder="you@email.com" />
      </Field>

      {/* Event details */}
      <Field label="Event type" required>
        <select required value={data.eventType} onChange={set('eventType')} className={inputCls}>
          <option value="">Select event type</option>
          <option value="Nikah (Solemnization)">Nikah (Solemnization)</option>
          <option value="Sanding (Reception)">Sanding (Reception)</option>
          <option value="Tunang (Engagement)">Tunang (Engagement)</option>
          <option value="Nikah + Sanding (Combo)">Nikah + Sanding (Combo)</option>
          <option value="Private Event">Private Event</option>
          <option value="Portrait Session">Portrait Session</option>
          <option value="Corporate Event">Corporate Event</option>
          <option value="Other">Other</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Event date" required>
          <input type="date" required value={data.eventDate} onChange={set('eventDate')} className={inputCls} />
        </Field>
        <Field label="Start time">
          <input type="time" value={data.eventTime} onChange={set('eventTime')} className={inputCls} />
        </Field>
      </div>

      <Field label="Venue / location" required>
        <input type="text" required value={data.venue} onChange={set('venue')} className={inputCls} placeholder="e.g. Hotel Maya KL, or address" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Coverage hours" required>
          <select required value={data.coverageHours} onChange={set('coverageHours')} className={inputCls}>
            <option value="">Select</option>
            <option value="1 hour">1 hour</option>
            <option value="2 hours">2 hours</option>
            <option value="3 hours">3 hours</option>
            <option value="5 hours">5 hours</option>
            <option value="Full day">Full day</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </Field>
        <Field label="Estimated guests">
          <select value={data.guestCount} onChange={set('guestCount')} className={inputCls}>
            <option value="">Select</option>
            <option value="Under 50">Under 50</option>
            <option value="50-150">50-150</option>
            <option value="150-300">150-300</option>
            <option value="300+">300+</option>
          </select>
        </Field>
      </div>

      <Field label="Photographer setup" required>
        <select required value={data.shooterSetup} onChange={set('shooterSetup')} className={inputCls}>
          <option value="">Select setup</option>
          <option value="Main shooter only">Main shooter only</option>
          <option value="Main + Second shooter">Main + Second shooter</option>
          <option value="Not sure — recommend me">Not sure — recommend me</option>
        </select>
      </Field>

      <Field label="Special requests (optional)">
        <textarea value={data.notes} onChange={set('notes')} rows={3} className={inputCls} placeholder="Any specific shots, style preferences, or other details..." />
      </Field>

      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <p className="text-xs text-stone-400 text-center sm:text-left sm:flex-1 sm:self-center">
          Submitting will send these details to our WhatsApp.
        </p>
        <button type="submit" className="px-7 py-3 bg-stone-900 text-white text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#a08520] transition-colors inline-flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send via WhatsApp
        </button>
      </div>
    </form>
  );
}

// ====== Shared form helpers ======
const inputCls = 'w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-300';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// ====== Videography Form ======
function VideographyForm({
  data, onChange, onSubmit,
}: { data: VideoFormData; onChange: (d: VideoFormData) => void; onSubmit: (e: React.FormEvent) => void }) {
  const set = (k: keyof VideoFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [k]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" required>
          <input type="text" required value={data.name} onChange={set('name')} className={inputCls} placeholder="e.g. Hafiz" />
        </Field>
        <Field label="WhatsApp number" required>
          <input type="tel" required value={data.phone} onChange={set('phone')} className={inputCls} placeholder="+60 17-xxx xxxx" />
        </Field>
      </div>

      <Field label="Email (optional)">
        <input type="email" value={data.email} onChange={set('email')} className={inputCls} placeholder="you@email.com" />
      </Field>

      <Field label="Project type" required>
        <select required value={data.projectType} onChange={set('projectType')} className={inputCls}>
          <option value="">Select project type</option>
          <option value="Wedding Highlight (3-5 min)">Wedding Highlight (3-5 min)</option>
          <option value="Full Wedding Film (15-30 min)">Full Wedding Film (15-30 min)</option>
          <option value="Wedding Highlight + Full Film">Wedding Highlight + Full Film</option>
          <option value="Corporate Video / Brand Profile">Corporate Video / Brand Profile</option>
          <option value="Social Reels / TikTok Content">Social Reels / TikTok Content</option>
          <option value="Event Recap">Event Recap</option>
          <option value="Other">Other</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Shoot date" required>
          <input type="date" required value={data.eventDate} onChange={set('eventDate')} className={inputCls} />
        </Field>
        <Field label="Start time">
          <input type="time" value={data.eventTime} onChange={set('eventTime')} className={inputCls} />
        </Field>
      </div>

      <Field label="Venue / location" required>
        <input type="text" required value={data.venue} onChange={set('venue')} className={inputCls} placeholder="e.g. Hotel Maya KL, or address" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Coverage duration" required>
          <select required value={data.coverageHours} onChange={set('coverageHours')} className={inputCls}>
            <option value="">Select</option>
            <option value="2 hours">2 hours</option>
            <option value="4 hours">4 hours</option>
            <option value="Half day (6 hrs)">Half day (6 hrs)</option>
            <option value="Full day (8-10 hrs)">Full day (8-10 hrs)</option>
            <option value="Multi-day">Multi-day</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </Field>
        <Field label="Final video length">
          <select value={data.finalLength} onChange={set('finalLength')} className={inputCls}>
            <option value="">Select</option>
            <option value="Under 1 min (reel)">Under 1 min (reel)</option>
            <option value="1-3 min (highlight)">1-3 min (highlight)</option>
            <option value="3-5 min (highlight)">3-5 min (highlight)</option>
            <option value="10-15 min">10-15 min</option>
            <option value="15-30 min (full film)">15-30 min (full film)</option>
            <option value="Open to suggestions">Open to suggestions</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Drone footage">
          <select value={data.droneNeeded} onChange={set('droneNeeded')} className={inputCls}>
            <option value="">Select</option>
            <option value="Yes, please">Yes, please</option>
            <option value="No">No</option>
            <option value="Not sure — recommend">Not sure — recommend</option>
          </select>
        </Field>
        <Field label="Style preference">
          <select value={data.stylePreference} onChange={set('stylePreference')} className={inputCls}>
            <option value="">Select</option>
            <option value="Cinematic (slow, emotional)">Cinematic (slow, emotional)</option>
            <option value="Documentary (real, candid)">Documentary (real, candid)</option>
            <option value="Mixed (cinematic + documentary)">Mixed (cinematic + documentary)</option>
            <option value="Trendy / Social-style">Trendy / Social-style</option>
            <option value="Open to suggestions">Open to suggestions</option>
          </select>
        </Field>
      </div>

      <Field label="Special requests (optional)">
        <textarea value={data.notes} onChange={set('notes')} rows={3} className={inputCls} placeholder="Specific moments to capture, music preferences, references..." />
      </Field>

      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <p className="text-xs text-stone-400 text-center sm:text-left sm:flex-1 sm:self-center">
          Submitting will send these details to our WhatsApp.
        </p>
        <button type="submit" className="px-7 py-3 bg-stone-900 text-white text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send via WhatsApp
        </button>
      </div>
    </form>
  );
}
