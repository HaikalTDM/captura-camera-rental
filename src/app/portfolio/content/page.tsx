'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clapperboard, ShoppingBag, CalendarClock, MessageSquareHeart } from 'lucide-react';
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
import { getServiceById, TIKTOK_HANDLE, TIKTOK_URL, type PortfolioItem } from '@/data/portfolioData';

const service = getServiceById('content');

const heroConfig = {
  headingFont: 'font-poppins',
  handwritingFont: 'font-shadows',
  eyebrow: 'content creation, our tiktok is our cv',
  heading: ['We post.', 'You grow.'] as [string, string],
  copy: [
    "Our TikTok is basically our resume. Go watch it, we'll wait. That's the energy we'd bring to your brand: scroll-stopping, honest, and actually fun.",
    "We're taking on the first few brands at a founder rate. You bring the product, we bring content that makes people stop scrolling.",
  ],
  caption: `${TIKTOK_HANDLE.toUpperCase()}: VIEWS GROWING`,
  media: 'tiktok' as const,
  tiktokHandle: TIKTOK_HANDLE,
  tiktokUrl: TIKTOK_URL,
};

const dealConfig = {
  eyebrow: 'the founder creator deal',
  heading: ['First 5 brands,', 'founder rate.'] as [string, string],
  copy: "We're looking for our first few content partners. You get consistent, scroll-stopping content at a rate that won't exist once we're famous. We get a portfolio we're proud of. Fair trade.",
  perks: [
    'Monthly content at the founder rate',
    'Reels, showcases, recaps. Whatever fits your brand',
    'Unlimited ideas, zero boring',
    "Never ask 'what do we post this week?' again",
  ],
  smallPrint: 'First 5 brands only. Lock it in before we get big.',
  waMessage:
    'JOIN THE FOUNDER BATCH! 📱 We want to be one of the first Founder Creators. Tell us the founder rate!',
  waSource: 'content-founder-deal',
  heroCtaLabel: 'Join The Founder Batch',
  dealCtaLabel: 'Start My Founder Rate',
};

const highlights = {
  eyebrow: 'what we make',
  heading: ['Content that', 'does the work.'] as [string, string],
  items: [
    {
      icon: Clapperboard,
      title: 'Reels that stop the scroll',
      body: 'Vertical, punchy, and made for thumb-stopping.',
    },
    {
      icon: ShoppingBag,
      title: 'Product showcases',
      body: 'Make your product the main character.',
    },
    {
      icon: CalendarClock,
      title: 'Event recaps',
      body: 'Turn your event into content you can post for weeks.',
    },
    {
      icon: MessageSquareHeart,
      title: 'Brand content',
      body: 'Content that sounds like a human wrote it, because we are humans.',
    },
  ],
};

const steps = [
  {
    step: '01',
    title: 'We study you',
    body: "Your brand, your voice, and your competitors' content. We take notes on what to do and what NOT to do.",
  },
  {
    step: '02',
    title: 'We create',
    body: 'We shoot, edit, caption, and deliver ready-to-post content. You just press upload.',
  },
  {
    step: '03',
    title: 'You grow',
    body: 'Post consistently, watch the numbers climb, and enjoy the free time we just gave you.',
  },
];

const faqs = [
  {
    q: 'What exactly do you post on TikTok?',
    a: "Wedding behind-the-scenes, creator content, and our honest takes. It's basically our portfolio, just with worse lighting in the early ones.",
  },
  {
    q: 'How many posts per month?',
    a: 'Founder partners get a monthly batch, sized to your brand. We agree on a number that works for both of us.',
  },
  {
    q: 'Do we get the raw files?',
    a: 'Yes. Everything you need, ready to post.',
  },
  {
    q: 'Can you match our brand voice?',
    a: "That's the whole job. We study you first, then we sound like you, but funnier.",
  },
  {
    q: 'Why are you so cheap right now?',
    a: "Because we're building our portfolio, and we'd rather be honest than pretend we're established. Lock in the founder rate while it lasts.",
  },
];

const tickerItems = [
  'founder creators: 5 spots',
  'monthly content',
  'scroll-stopping',
  'zero boring',
  'be the first',
];

export default function ContentPage() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  return (
    <div className="min-h-screen bg-[#0d0d0d] font-poppins">
      <PortfolioNav />

      {/* Hero — full-width banner */}
      <ServiceHero
        config={{ ...heroConfig, mediaItem: service.items[0] }}
        accent={service.accent}
        waMessage={dealConfig.waMessage}
        waSource={dealConfig.waSource}
        ctaLabel={dealConfig.heroCtaLabel}
        onOpen={setSelectedItem}
      />

      {/* Back to all work */}
      <div className="bg-[#0d0d0d] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto -mt-6 pb-2">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            Back to all work
          </Link>
        </div>
      </div>

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
        heading={['Three steps to', 'your next post.'] as [string, string]}
        steps={steps}
      />

      <ServiceFaq
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        accentSoft={service.accentSoft}
        eyebrow="questions, answered"
        heading={['Things brands', 'ask us.'] as [string, string]}
        items={faqs}
      />

      {/* Inquiry */}
      <section id="inquiry" className="py-16 sm:py-24 bg-[#fdfcfa] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-shadows text-2xl sm:text-3xl mb-2" style={{ color: service.accent }}>
              ready to stop asking 'what do we post?'
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
              Let&apos;s make content together
            </h2>
          </div>
          <ServiceInquiryForm serviceId="content" accent={service.accent} />
        </div>
      </section>

      <PortfolioFooter />

      {/* Video Lightbox */}
      <VideoModal item={selectedItem} accent={service.accent} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
