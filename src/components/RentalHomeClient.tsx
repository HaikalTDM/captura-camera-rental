'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { GalleryImage } from '@/lib/api/gallery';
import Image from 'next/image';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import PickupDeliverySection from '@/components/PickupDeliverySection';

// Define a client-side Camera type that matches what we receive from props
interface ClientCamera {
    id: string;
    name: string;
    description: string;
    image: string;
    images: string[];
    dailyRate: number;
    discountRate: number;
    features: string[];
    specifications: Record<string, unknown>;
}

interface RentalHomeClientProps {
    cameras: ClientCamera[];
    galleryImages: GalleryImage[];
}

export default function RentalHomeClient({ cameras, galleryImages }: RentalHomeClientProps) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30 overflow-x-hidden">

            {/* Hero Section */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative h-[90vh] flex flex-col justify-center items-center px-6 overflow-hidden"
            >
                {/* Abstract Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-900/20 rounded-full blur-[100px] animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8 inline-block"
                    >
                        <div className="flex items-center justify-center bg-white/10 backdrop-blur-xl px-8 py-5 rounded-full border border-white/10 ring-1 ring-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                            <Image
                                src="/images/captura_logo_big.png"
                                alt="CAPTURA"
                                width={200}
                                height={60}
                                className="h-14 w-auto opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                priority
                            />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 leading-[0.9]"
                    >
                        <motion.span variants={fadeInUp} className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Create</motion.span>
                        <motion.span variants={fadeInUp} className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Cinematic</motion.span>
                        <motion.span variants={fadeInUp} className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">Stories</motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto mb-10 font-medium leading-relaxed"
                    >
                        Professional DJI gear at your fingertips. No deposit required for existing creators.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => router.push('/rental/cameras')}
                            className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Rent Camera
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                        </button>
                        <a
                            href="https://wa.me/60177464121"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-md hover:bg-white/10 transition-colors"
                        >
                            WhatsApp Us
                        </a>
                    </motion.div>
                </div>
            </motion.section>

            {/* Featured Gear - Horizontal Scroll */}
            <section className="py-20 bg-zinc-950/50 backdrop-blur-sm border-t border-white/5">
                <div className="px-6 mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Popular Gear</h2>
                        <p className="text-zinc-500 text-sm">Most rented by creators this week</p>
                    </div>
                    <button onClick={() => router.push('/rental/cameras')} className="text-xs font-bold text-white border-b border-white pb-0.5 hover:text-zinc-300 transition-colors">See All</button>
                </div>

                {/* Scroll Container */}
                <div className="flex overflow-x-auto px-6 pb-8 gap-6 scrollbar-hide snap-x">
                    {cameras.length === 0 ? (
                        <div className="w-full text-center text-zinc-500 py-10">No cameras available at the moment.</div>
                    ) : (
                        cameras.map((camera) => (
                            <motion.div
                                key={camera.id}
                                className="flex-shrink-0 w-[260px] snap-center aspect-[3/4] rounded-3xl bg-zinc-900 border border-white/5 relative overflow-hidden group"
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Image */}
                                <div className="absolute inset-0 bg-white/5">
                                    <Image
                                        src={camera.image}
                                        alt={camera.name}
                                        fill
                                        className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-110"
                                        sizes="260px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                                </div>

                                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                                    <div className="flex justify-between items-start">
                                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase tracking-wider">
                                            {camera.name.includes('Pocket') ? 'Hot' : camera.name.includes('Action') ? 'Action' : 'Pro'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold leading-tight mb-1 text-white">{camera.name}</h3>
                                        <div className="text-zinc-400 text-sm mb-4">Starting from <span className="text-white font-bold text-lg">RM{camera.dailyRate}</span>/day</div>
                                        <button
                                            onClick={() => router.push('/rental/cameras')}
                                            className="w-full py-3 bg-white text-black font-black uppercase tracking-wider rounded-xl text-xs hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* Infinite Gallery Marquee */}
            <section className="py-20 overflow-hidden bg-zinc-950">
                <div className="mb-10 px-6 text-center">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">#ShotOnCaptura</h2>
                    <p className="text-zinc-500 mt-2">Join 150+ creators sharing their stories.</p>
                </div>

                <div className="relative w-full overflow-hidden">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />

                    <motion.div
                        className="flex gap-4 w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ ease: "linear", duration: 25, repeat: Infinity }}
                    >
                        {[...galleryImages, ...galleryImages, ...galleryImages].map((img, i) => (
                            <div key={i} className="relative w-[180px] h-[240px] rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer">
                                <Image
                                    src={img.image_url || '/placeholder.jpg'}
                                    alt="Gallery"
                                    fill
                                    className="object-cover"
                                    sizes="180px"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        ))}
                        {/* Fallback if no images */}
                        {galleryImages.length === 0 && Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-[180px] h-[240px] bg-zinc-900 rounded-xl border border-white/5 mx-2 flex items-center justify-center">
                                <span className="text-zinc-700 font-bold">Soon</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Us - Bento Grid Style */}
            <section className="px-6 pb-32">
                <h2 className="text-3xl font-bold mb-8 text-center">Why Captura?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                        <p className="text-zinc-500 text-sm">We are always awake. Text us anytime if you need help with the gear.</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4 text-yellow-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Top Rated Service</h3>
                        <p className="text-zinc-500 text-sm">Trusted by 150+ creators. We go the extra mile to ensure your shoot is a success.</p>
                    </div>
                </div>

                {/* Pickup Section Component */}
                <div className="mt-8 rounded-3xl overflow-hidden border border-white/5">
                    <PickupDeliverySection />
                </div>
            </section>

            <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}
