'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Presentation, Rocket, Wine, PartyPopper } from 'lucide-react';
import PortfolioNav from '@/components/portfolio/PortfolioNav';
import ServiceHero from '@/components/portfolio/service/ServiceHero';
import FounderDeal from '@/components/portfolio/service/FounderDeal';
import ServiceHighlights from '@/components/portfolio/service/ServiceHighlights';
import HowItWorks from '@/components/portfolio/service/HowItWorks';
import ServiceFaq from '@/components/portfolio/service/ServiceFaq';
import TickerMarquee from '@/components/portfolio/service/TickerMarquee';
import ServiceInquiryForm from '@/components/portfolio/ServiceInquiryForm';
import VideoModal from '@/components/portfolio/VideoModal';
import PortfolioFooter from '@/components/portfolio/service/PortfolioFooter';
import { getServiceById, type PortfolioItem } from '@/data/portfolioData';

const service = getServiceById('events');

const heroConfig = {
  headingFont: 'font-bebas',
  handwritingFont: 'font-caveat',
  eyebrow: 'events, we\u2019ve covered exactly one',
  heading: ['One event down.', 'Zero missed.'] as [string, string],
  copy: [
    'We filmed our first event and honestly? We crushed it. One event, one very happy organiser, zero complaints.',
    "Now we're hunting for event number two. The first few get the founder price. Every legend has an origin story. Yours comes with a discount.",
  ],
  caption: 'EVENT #2: COULD BE YOURS',
  media: 'polaroid' as const,
  mediaCaption: 'event #1, we nailed it',
};

const dealConfig = {
  eyebrow: 'the founder events deal',
  heading: ['First 5 events.', 'Founder price.'] as [string, string],
  copy: "We're building our event reel one banger at a time. The first five organisers who say yes get a special price, a same-day teaser option, and coverage so thorough you'll feel like a celebrity.",
  perks: [
    'Special price for the first 5 events',
    'Same-day teaser for your socials',
    'Two cameras of energy on a one-camera budget (for now)',
    'Your event gets the VIP treatment, always',
  ],
  smallPrint: 'First 5 events only. After that, you\u2019ll be telling people you knew us early.',
  waMessage:
    'LOCK IN MY FOUNDER DEAL! 🎉 We want our event to be one of the first Founder Events. Tell us the founder price!',
  waSource: 'events-founder-deal',
  heroCtaLabel: 'Lock In My Founder Deal',
  dealCtaLabel: 'Claim My Event Spot',
};

const highlights = {
  eyebrow: 'what we cover',
  heading: ['If people gather,', 'we\u2019re in.'] as [string, string],
  items: [
    {
      icon: Presentation,
      title: 'Conferences',
      body: 'Keynotes, panels, and the moment the internet goes down. We capture it all.',
    },
    {
      icon: Rocket,
      title: 'Product launches',
      body: 'Big reveal? We\u2019ll make it feel even bigger.',
    },
    {
      icon: Wine,
      title: 'Galas & dinners',
      body: 'Speeches, sparkle, and dancing. We make it all look effortless.',
    },
    {
      icon: PartyPopper,
      title: 'Parties & gatherings',
      body: 'If people gathered and had fun, we want to be there.',
    },
  ],
};

const steps = [
  {
    step: '01',
    title: 'Tell us about it',
    body: 'Date, venue, and the vibe. We reply within 24 hours with a coverage plan.',
  },
  {
    step: '02',
    title: 'We show up early',
    body: "We scout the room, find the light, and blend into the crowd. You won't notice us until the video drops.",
  },
  {
    step: '03',
    title: 'You relive it',
    body: 'Teaser in days, full recap in 2 to 3 weeks. Post it while your guests are still talking about the night.',
  },
];

const faqs = [
  {
    q: 'You only have one event video?',
    a: 'One. But watch it. We promise it slaps. Event number two could be yours.',
  },
  {
    q: 'How fast do we get the video?',
    a: 'Teaser same day if you are on the founder deal. Full recap in 2 to 3 weeks.',
  },
  {
    q: 'Do you cover big conferences?',
    a: "That's literally the dream. Bring it on. We'll bring two cameras and unshakeable energy.",
  },
  {
    q: 'What if it rains?',
    a: "We've got you. Indoors or out, we adapt. Rain footage looks cool anyway.",
  },
  {
    q: 'Can you film our gala dinner?',
    a: 'Yes, and we\u2019ll make the speeches sound even better than they did.',
  },
];

const tickerItems = [
  'founder events: 5 spots',
  'event #2 could be yours',
  'same-day teaser',
  'vip treatment, always',
  'be the first',
];

export default function EventsPage() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <PortfolioNav />

      {/* Back to all work */}
      <div className="bg-[#0d0d0d] px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            Back to all work
          </Link>
        </div>
      </div>

      {/* Hero — full-width banner */}
      <ServiceHero
        config={{ ...heroConfig, mediaItem: service.items[0] }}
        accent={service.accent}
        waMessage={dealConfig.waMessage}
        waSource={dealConfig.waSource}
        ctaLabel={dealConfig.heroCtaLabel}
        onOpen={setSelectedItem}
      />

      <TickerMarquee accent={service.accent} items={tickerItems} />

      <FounderDeal
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        eyebrow={dealConfig.eyebrow}
        heading={dealConfig.heading}
        copy={dealConfig.copy}
        perks={dealConfig.perks}
        smallPrint={dealConfig.smallPrint}
        waMessage={dealConfig.waMessage}
        waSource={dealConfig.waSource}
        ctaLabel={dealConfig.dealCtaLabel}
      />

      <ServiceHighlights
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        eyebrow={highlights.eyebrow}
        heading={highlights.heading}
        items={highlights.items}
      />

      <HowItWorks
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        eyebrow="how it works"
        heading={['Three steps,', 'zero stress.'] as [string, string]}
        steps={steps}
      />

      <ServiceFaq
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        accentSoft={service.accentSoft}
        eyebrow="questions, answered honestly"
        heading={['Things organisers', 'ask us.'] as [string, string]}
        items={faqs}
      />

      {/* Inquiry */}
      <section id="inquiry" className="py-16 sm:py-24 bg-[#fdfcfa] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-caveat text-2xl sm:text-3xl mb-2" style={{ color: service.accent }}>
              got an event coming up?
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
              Let&apos;s make it event #2
            </h2>
          </div>
          <ServiceInquiryForm serviceId="events" accent={service.accent} />
        </div>
      </section>

      <PortfolioFooter />

      {/* Video Lightbox */}
      <VideoModal item={selectedItem} accent={service.accent} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
