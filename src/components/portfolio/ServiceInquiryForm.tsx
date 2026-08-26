'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { serviceForms, type ServiceId } from '@/data/portfolioData';
import CustomSelect from '@/components/portfolio/form/CustomSelect';
import CustomDatePicker from '@/components/portfolio/form/CustomDatePicker';

const WHATSAPP_NUMBER = '60177464121';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9][0-9\s\-()]{6,}$/;

interface ServiceInquiryFormProps {
  serviceId: ServiceId;
  accent: string;
}

type Values = Record<string, string>;
type Errors = Record<string, string>;

export default function ServiceInquiryForm({ serviceId, accent }: ServiceInquiryFormProps) {
  const form = serviceForms[serviceId];
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = (name: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const setFieldValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    for (const field of form.fields) {
      const value = (values[field.name] ?? '').trim();
      if (field.required && !value) {
        next[field.name] = `${field.label} is required`;
      } else if (value && field.type === 'email' && !EMAIL_RE.test(value)) {
        next[field.name] = 'Please enter a valid email address';
      } else if (value && field.type === 'tel' && !PHONE_RE.test(value)) {
        next[field.name] = 'Please enter a valid phone number';
      }
    }
    return next;
  };

  const buildWhatsAppMessage = () => {
    const lines: string[] = [`*${form.title}*`, ``];
    for (const field of form.fields) {
      const value = (values[field.name] ?? '').trim();
      if (value) lines.push(`*${field.label}:* ${value}`);
    }
    lines.push(``, `_Sent via Captura Portfolio_`);
    return lines.join('\n');
  };

  const saveInquiry = () => {
    // Non-blocking — the WhatsApp message is already on its way
    const payload: Record<string, string> = { serviceType: form.serviceType };
    for (const field of form.fields) {
      const value = (values[field.name] ?? '').trim();
      if (!value) continue;
      switch (field.name) {
        case 'clientName': payload.clientName = value; break;
        case 'email': payload.clientEmail = value; break;
        case 'phone': payload.clientPhone = value; break;
        case 'eventDate': payload.eventDate = value; break;
        case 'venue': payload.venue = value; break;
        case 'stylePreference': payload.stylePreference = value; break;
        case 'projectType': payload.eventType = value; break;
        case 'eventType': payload.eventType = value; break;
        case 'institution': payload.eventType = value; break;
        case 'projectTimeline': payload.projectTimeline = value; break;
        case 'budgetRange': payload.budgetRange = value; break;
        case 'coverageDuration': payload.coverageDuration = value; break;
        case 'contentType': payload.contentType = value; break;
        case 'uploadFrequency': payload.uploadFrequency = value; break;
        case 'message': payload.specialRequests = value; break;
      }
    }
    fetch('/api/studio/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      // WhatsApp already covers delivery — log only
      console.error('Failed to save portfolio inquiry:', err);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Open WhatsApp synchronously (preserves the user gesture for popups),
    // then persist the inquiry to the database in the background.
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`,
      '_blank'
    );
    saveInquiry();
    setSubmitted(true);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="text-center py-10 sm:py-14"
            role="status"
          >
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: accent }} strokeWidth={1.5} />
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-3">
              Inquiry sent — thank you!
            </h3>
            <p className="text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
              Your details are on their way to our team (and open in WhatsApp if you want to add
              anything). We typically reply within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setValues({});
                setErrors({});
              }}
              className="px-7 py-3 rounded-full text-white text-xs tracking-[0.3em] uppercase font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: accent }}
            >
              Send Another Inquiry
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-2">{form.title}</h3>
            <p className="text-stone-500 text-sm sm:text-base mb-8">{form.description}</p>

            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {form.fields.map((field) => (
                <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5" htmlFor={`${form.serviceId}-${field.name}`}>
                    {field.label}{' '}
                    {field.required && <span className="text-red-500" aria-hidden="true">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <CustomSelect
                      id={`${form.serviceId}-${field.name}`}
                      value={values[field.name] ?? ''}
                      options={field.options ?? []}
                      placeholder={`Select ${field.label.toLowerCase()}`}
                      hasError={!!errors[field.name]}
                      accent={accent}
                      onChangeValue={(v) => setFieldValue(field.name, v)}
                    />
                  ) : field.type === 'date' ? (
                    <CustomDatePicker
                      id={`${form.serviceId}-${field.name}`}
                      value={values[field.name] ?? ''}
                      placeholder={`Select ${field.label.toLowerCase()}`}
                      hasError={!!errors[field.name]}
                      accent={accent}
                      onChangeValue={(v) => setFieldValue(field.name, v)}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={`${form.serviceId}-${field.name}`}
                      value={values[field.name] ?? ''}
                      onChange={setValue(field.name)}
                      rows={4}
                      placeholder={field.placeholder}
                      required={field.required}
                      aria-invalid={!!errors[field.name]}
                      className={inputCls(!!errors[field.name])}
                    />
                  ) : (
                    <input
                      id={`${form.serviceId}-${field.name}`}
                      type={field.type}
                      value={values[field.name] ?? ''}
                      onChange={setValue(field.name)}
                      placeholder={field.placeholder}
                      required={field.required}
                      aria-invalid={!!errors[field.name]}
                      className={inputCls(!!errors[field.name])}
                    />
                  )}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1.5" role="alert">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-stone-400 text-center sm:text-left">
                  Submitting will open WhatsApp with your details pre-filled.
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white text-xs tracking-[0.3em] uppercase font-bold transition-all duration-200 hover:scale-[1.02] hover:brightness-110 shadow-lg"
                  style={{ backgroundColor: accent, boxShadow: `0 8px 20px ${accent}40` }}
                >
                  <Send className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  Send Inquiry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  [
    'w-full px-4 py-2.5 bg-white border rounded-lg text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-1 transition-colors duration-200',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
      : 'border-stone-200 focus:border-stone-400 focus:ring-stone-300',
  ].join(' ');
