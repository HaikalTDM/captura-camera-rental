import Image from 'next/image';

export default function Loading() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                {/* Logo with pulse animation */}
                <div className="animate-pulse">
                    <Image
                        src="/images/captura_logo_big.png"
                        alt="CAPTURA"
                        width={160}
                        height={48}
                        className="opacity-60"
                        priority
                    />
                </div>

                {/* Loading indicator */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
