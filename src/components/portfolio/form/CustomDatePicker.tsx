'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CustomDatePickerProps {
  id: string;
  value: string;
  placeholder: string;
  hasError: boolean;
  accent: string;
  onChangeValue: (value: string) => void;
}

const parseISO = (iso: string): Date | null => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDisplay = (iso: string) => {
  const d = parseISO(iso);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CustomDatePicker({
  id,
  value,
  placeholder,
  hasError,
  accent,
  onChangeValue,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [view, setView] = useState(() => {
    const d = parseISO(value) ?? new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Keep the calendar in sync if the value changes externally (e.g. form reset)
  useEffect(() => {
    const d = parseISO(value);
    if (d) setView({ year: d.getFullYear(), month: d.getMonth() });
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const moveMonth = (delta: number) => {
    setView((v) => {
      const month = v.month + delta;
      return month < 0
        ? { year: v.year - 1, month: 11 }
        : month > 11
          ? { year: v.year + 1, month: 0 }
          : { year: v.year, month };
    });
  };

  const selectDay = (day: number) => {
    onChangeValue(toISO(new Date(view.year, view.month, day)));
    setOpen(false);
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selected = parseISO(value);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={[
          'w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-left flex items-center justify-between gap-2 transition-colors duration-200 focus:outline-none focus:ring-1 min-h-[44px]',
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-200 focus:border-stone-400 focus:ring-stone-300',
        ].join(' ')}
      >
        <span className="flex items-center gap-2.5">
          <CalendarDays className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className={value ? 'text-stone-900' : 'text-stone-400'}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Pick a date"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute z-30 mt-2 w-[300px] rounded-xl bg-white border border-stone-200 shadow-xl p-4"
          >
            {/* Month header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                aria-label="Previous month"
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>
              <p className="text-sm font-bold text-stone-900">
                {MONTHS[view.month]} {view.year}
              </p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                aria-label="Next month"
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Weekday row */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="flex items-center justify-center h-8 text-[10px] font-bold uppercase tracking-wide text-stone-400"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <span key={`empty-${i}`} />;
                const isSelected =
                  selected && selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === day;
                const isToday =
                  new Date().getFullYear() === view.year &&
                  new Date().getMonth() === view.month &&
                  new Date().getDate() === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={[
                      'flex items-center justify-center h-9 rounded-full text-sm transition-all duration-150',
                      isSelected
                        ? 'text-black font-bold'
                        : 'text-stone-600 hover:font-semibold',
                    ].join(' ')}
                    style={
                      isSelected
                        ? { backgroundColor: accent, boxShadow: `0 4px 12px ${accent}40` }
                        : isToday
                          ? { boxShadow: `inset 0 0 0 1.5px ${accent}` }
                          : undefined
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
