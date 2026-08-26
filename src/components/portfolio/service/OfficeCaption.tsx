'use client';

interface OfficeCaptionProps {
  text: string;
}

export default function OfficeCaption({ text }: OfficeCaptionProps) {
  return (
    <div className="w-full max-w-sm rotate-[-1deg]">
      <div className="bg-black border border-white/25 px-4 py-2.5 text-center shadow-lg">
        <p className="font-mono text-white text-xs sm:text-sm tracking-[0.2em] uppercase">
          {text}
        </p>
      </div>
    </div>
  );
}
