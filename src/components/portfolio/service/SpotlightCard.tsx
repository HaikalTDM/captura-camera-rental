'use client';

import { useRef, useState } from 'react';

interface SpotlightCardProps {
  accent: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

// Premium cursor-spotlight card: a soft accent glow follows the mouse
export default function SpotlightCard({ accent, className = '', style, children }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, ${accent}22, transparent 65%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
