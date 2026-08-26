'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  id: string;
  value: string;
  options: string[];
  placeholder: string;
  hasError: boolean;
  accent: string;
  onChangeValue: (value: string) => void;
}

export default function CustomSelect({
  id,
  value,
  options,
  placeholder,
  hasError,
  accent,
  onChangeValue,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const select = (opt: string) => {
    onChangeValue(opt);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(options.indexOf(value));
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) select(options[activeIndex]);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          'w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-left flex items-center justify-between gap-2 transition-colors duration-200 focus:outline-none focus:ring-1 min-h-[44px]',
          hasError
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-200 focus:border-stone-400 focus:ring-stone-300',
        ].join(' ')}
      >
        <span className={value ? 'text-stone-900' : 'text-stone-400'}>{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute z-30 mt-2 w-full rounded-xl bg-white border border-stone-200 shadow-xl max-h-56 overflow-auto py-1"
          >
            {options.map((opt, i) => {
              const isSelected = opt === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={opt}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(opt)}
                  className={[
                    'flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150',
                    isActive || isSelected ? 'text-stone-900 font-semibold' : 'text-stone-600',
                  ].join(' ')}
                  style={isActive ? { backgroundColor: `${accent}12` } : undefined}
                >
                  <span>{opt}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0" style={{ color: accent }} strokeWidth={2.5} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
