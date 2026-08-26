'use client';

interface TickerMarqueeProps {
  accent: string;
  items: string[];
}

// Infinite scrolling ticker strip (reuses the site's scroll-infinite keyframes)
export default function TickerMarquee({ accent, items }: TickerMarqueeProps) {
  const row = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden bg-[#111111] border-y border-white/5 py-3.5" aria-hidden="true">
      <div className="flex w-max animate-scroll-infinite whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 font-mono text-xs uppercase tracking-[0.25em] text-white/45">
              {item}
            </span>
            <span style={{ color: accent }} className="text-sm">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
