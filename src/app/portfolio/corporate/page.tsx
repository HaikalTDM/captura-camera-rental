'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, Rocket, Users, Megaphone } from 'lucide-react';
import PortfolioNav from '@/components/portfolio/PortfolioNav';
import ServiceHero from '@/components/portfolio/service/ServiceHero';
import FounderDeal from '@/components/portfolio/service/FounderDeal';
import ServiceHighlights from '@/components/portfolio/service/ServiceHighlights';
import HowItWorks from '@/components/portfolio/service/HowItWorks';
import ServiceFaq from '@/components/portfolio/service/ServiceFaq';
import TickerMarquee from '@/components/portfolio/service/TickerMarquee';
import ServiceInquiryForm from '@/components/portfolio/ServiceInquiryForm';
import PortfolioFooter from '@/components/portfolio/service/PortfolioFooter';
import { getServiceById } from '@/data/portfolioData';

const service = getServiceById('corporate');

const heroConfig = {
  headingFont: 'font-space-grotesk',
  handwritingFont: 'font-kalam',
  eyebrow: 'corporate & brand, the honest bit',
  heading: ['Zero corporate videos.', 'So far.'] as [string, string],
  copy: [
    "Here's the truth: we haven't made a corporate video yet. But we've made wedding films that made people cry happy tears, so the camera knows what it's doing.",
    'Your competitors have corporate videos that put people to sleep. Yours could actually get watched. All we need is one brave first client.',
  ],
  caption: 'CORPORATE FILMS: STATUS NOTHING YET (YET)',
  media: 'blank' as const,
};

const dealConfig = {
  eyebrow: 'the founder brands deal',
  heading: ['First 5 brands get', 'the founder price.'] as [string, string],
  copy: "We need proof. You need a video. Let's trade. The first five brands to say 'count me in' get a special price, extra takes, and a director who is embarrassingly invested in your success.",
  perks: [
    'A video people actually finish watching',
    'Special founder price for the first 5 brands',
    "Extra takes and extra care. Our reputation is on the line",
    "Boardroom bragging rights: 'we were their first'",
  ],
  smallPrint:
    'First 5 brands only. After that, we get famous and the price goes up.',
  waMessage:
    'RESERVE MY FOUNDER SPOT! 🏢 We want to be one of the first Founder Brands. Tell us the founder price!',
  waSource: 'corporate-founder-deal',
  heroCtaLabel: 'Reserve My Founder Spot',
  dealCtaLabel: 'Get My Founder Price',
};

const highlights = {
  eyebrow: 'what we make',
  heading: ['The kind of videos', 'people actually watch.'] as [string, string],
  items: [
    {
      icon: Building2,
      title: 'Brand videos',
      body: 'For brands that want to be remembered, not just seen.',
    },
    {
      icon: Rocket,
      title: 'Product launches',
      body: 'The kind of launch video that makes people actually show up.',
    },
    {
      icon: Users,
      title: 'Company culture',
      body: 'Show the humans behind the logo. That\u2019s where trust lives.',
    },
    {
      icon: Megaphone,
      title: 'Social campaigns',
      body: 'Short, punchy, made for feeds. Sound like a person, not a press release.',
    },
  ],
};

const steps = [
  {
    step: '01',
    title: 'Reach out',
    body: 'Tell us about your brand and what you need. We reply within 24 hours, usually with too many questions. It means we care.',
  },
  {
    step: '02',
    title: 'We plan and shoot',
    body: 'Script, shots, and enough prep to embarrass a movie set. We show up ready, and we make your team look good.',
  },
  {
    step: '03',
    title: 'You get a video',
    body: 'Delivered in 2 to 3 weeks. One that people actually watch, and one you are proud to share.',
  },
];

const faqs = [
  {
    q: 'Have you really never done a corporate video?',
    a: 'Correct. Zero. That is exactly why the founder price exists. You get a bargain, we get a portfolio, everyone wins.',
  },
  {
    q: 'Will it look amateur?',
    a: "No. We bring the same care we give wedding films, which people have cried at. We'll show you references before we start.",
  },
  {
    q: 'How long does it take?',
    a: '2 to 3 weeks from shoot to delivery. If you need it faster, tell us. We like a challenge.',
  },
  {
    q: 'What do you need from us?',
    a: "Your logo, your story, and about 2 hours of your team's time for the shoot. We handle the rest.",
  },
  {
    q: 'Why should we trust you?',
    a: "Because we told you the truth before you even asked. That's rare in this industry, and it says everything.",
  },
];

const tickerItems = [
  'founder brands: 5 spots',
  'no boring videos allowed',
  'special founder price',
  'extra takes, always',
  'be the first',
];

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] font-space-grotesk">
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
        config={heroConfig}
        accent={service.accent}
        waMessage={dealConfig.waMessage}
        waSource={dealConfig.waSource}
        ctaLabel={dealConfig.heroCtaLabel}
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
        heading={['Simple, even', 'for a boardroom.'] as [string, string]}
        steps={steps}
      />

      <ServiceFaq
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        accentSoft={service.accentSoft}
        eyebrow="questions, honest answers"
        heading={['Things bosses', 'ask us.'] as [string, string]}
        items={faqs}
      />

      {/* Inquiry */}
      <section id="inquiry" className="py-16 sm:py-24 bg-[#fdfcfa] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-kalam text-2xl sm:text-3xl mb-2" style={{ color: service.accent }}>
              got a project in mind?
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
              Let&apos;s make your brand watchable
            </h2>
          </div>
          <ServiceInquiryForm serviceId="corporate" accent={service.accent} />
        </div>
      </section>

      <PortfolioFooter />
    </div>
  );
}
