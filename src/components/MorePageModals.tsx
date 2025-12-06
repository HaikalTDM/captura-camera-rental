'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900 z-10">
                    <h3 className="text-xl font-black text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 pb-24 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}

// ==================== HOW TO BOOK ====================

export function HowToBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const steps = [
        {
            title: "Choose Your Gear",
            description: "Browse our events or full camera catalog to find the perfect match for your needs.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
            ),
            color: "bg-blue-500"
        },
        {
            title: "Select Dates",
            description: "Pick your pickup and return dates. We offer flexible daily and weekly rates.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: "bg-indigo-500"
        },
        {
            title: "Secure Booking",
            description: "Pay securely via WhatsApp or online transfer to lock in your dates.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "bg-purple-500"
        },
        {
            title: "Pickup & Create",
            description: "Collect your gear from our KL studio (same-day available) and start shooting!",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "bg-green-500"
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="How to Book">
            <div className="space-y-8 relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-zinc-800"></div>

                {steps.map((step, index) => (
                    <div key={index} className="relative flex gap-6 group">
                        {/* Icon Bubble */}
                        <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center flex-shrink-0 relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <div className="text-white">
                                {step.icon}
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 bg-zinc-800/50 rounded-2xl p-5 border border-white/5 hover:bg-zinc-800 transition-colors">
                            <h4 className="text-white font-black text-lg mb-1">{step.title}</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <Button
                        onClick={() => window.open('https://wa.me/60177464121', '_blank')}
                        className="w-full bg-white text-black font-black hover:bg-zinc-200"
                    >
                        Start Booking Now
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// ==================== SPECS MODAL ====================

export function SpecsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const cameras = [
        {
            name: "DJI Osmo Pocket 3",
            specs: ["4K/120fps", "1-inch Sensor", "ActiveTrack 6.0", "2-inch Rotating Screen"]
        },
        {
            name: "Insta360 X4",
            specs: ["8K 360° Video", "72MP Photos", "Invisible Selfie Stick", "FlowState Stabilization"]
        },
        {
            name: "DJI Action 4",
            specs: ["4K/120fps", "1/1.3-inch Sensor", "10-bit Color", "18m Waterproof"]
        },
        {
            name: "Insta360 Go 3S",
            specs: ["4K Video", "Tiny Form Factor", "Action Pod", "Magnetic Mounting"]
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Equipment Specifications">
            <div className="grid gap-4">
                {cameras.map((cam, i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                        <h4 className="text-white font-black text-lg mb-3">{cam.name}</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {cam.specs.map((spec, j) => (
                                <div key={j} className="flex items-center gap-2 text-xs text-zinc-400 bg-black/20 rounded-lg px-2 py-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                                    {spec}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="mt-4 text-center">
                    <p className="text-zinc-500 text-xs">
                        Full technical manuals available upon booking confirmation.
                    </p>
                </div>
            </div>
        </Modal>
    );
}

// ==================== FAQ MODAL ====================

export function FAQModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const faqs = [
        {
            q: "Is a deposit required?",
            a: "Yes, a fully refundable security deposit is required for all rentals. The amount depends on the equipment value."
        },
        {
            q: "Can I pickup same-day?",
            a: "Absolutely! We support same-day pickups subject to equipment availability. Message us to check stock."
        },
        {
            q: "Do you offer delivery?",
            a: "We primarily operate via self-pickup, but delivery can be arranged via Lalamove/Grab at the renter's expense."
        },
        {
            q: "What if I damage the gear?",
            a: "Please inform us immediately. Minor wear is expected, but significant damage will be deducted from the deposit or invoiced."
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Frequently Asked Questions">
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="bg-zinc-800/30 rounded-2xl p-5 border border-white/5">
                        <h4 className="text-white font-bold text-base mb-2">{faq.q}</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                ))}
                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                    <p className="text-blue-200 text-sm font-semibold mb-2">Still have questions?</p>
                    <Button
                        onClick={() => window.open('https://wa.me/60177464121', '_blank')}
                        variant="link"
                        className="text-white font-bold underline"
                    >
                        Chat with Support
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
