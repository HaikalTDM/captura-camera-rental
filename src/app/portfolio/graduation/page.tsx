'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarCheck, MapPin, Clock3, PackageCheck } from 'lucide-react';
import PortfolioNav from '@/components/portfolio/PortfolioNav';
import ServiceHero from '@/components/portfolio/service/ServiceHero';
import FounderDeal from '@/components/portfolio/service/FounderDeal';
import BeforeYouBook from '@/components/portfolio/service/BeforeYouBook';
import ServicePackages from '@/components/portfolio/service/ServicePackages';
import HowItWorks from '@/components/portfolio/service/HowItWorks';
import ServiceFaq from '@/components/portfolio/service/ServiceFaq';
import TickerMarquee from '@/components/portfolio/service/TickerMarquee';
import ServiceInquiryForm from '@/components/portfolio/ServiceInquiryForm';
import PortfolioFooter from '@/components/portfolio/service/PortfolioFooter';
import { getServiceById, graduationPackages } from '@/data/portfolioData';

const service = getServiceById('graduation');

const heroConfig = {
  headingFont: 'font-bungee',
  handwritingFont: 'font-caveat',
  eyebrow: 'graduations, the photography kind',
  heading: ['You survived.', 'We shoot it.'] as [string, string],
  copy: [
    "Listen. We haven't photographed a graduation yet. Zero. But we've made couples cry happy tears at weddings, so we know how to handle proud parents, dramatic aunties, and a cap toss in slow motion.",
    'You did the degree. Let us do the photos.',
  ],
  caption: 'GRADUATION PHOTOS TAKEN: 0 (SO FAR)',
  media: 'polaroid' as const,
  mediaCaption: 'our first grad shoot: could be yours',
  mediaPlayable: false,
};

const dealConfig = {
  eyebrow: 'the founder grads deal',
  heading: ['First 5 grads.', 'Founder price.'] as [string, string],
  copy: "We need proof we can shoot graduations. You need photos that make your mom cry (in a good way). This is the most beneficial arrangement since the cap was invented.",
  perks: [
    'Special price for the first 5 graduations',
    'The cap toss, captured forever',
    'Family shots where everyone looks good',
    "Bragging rights: 'my photographer was their first'",
  ],
  smallPrint: 'First 5 grads only. After that, we get famous and your photos will cost more.',
  waMessage:
    'CLAIM MY GRAD SPOT! 🎓 We want to be one of the first Founder Grads. Tell us the founder price!',
  waSource: 'graduation-founder-deal',
  heroCtaLabel: 'Lock In My Grad Deal',
  dealCtaLabel: 'Claim My Grad Spot',
};

const beforeYouBook = {
  eyebrow: 'before you book!',
  heading: ['The fine print,', 'but make it fun.'] as [string, string],
  intro:
    'To give every client the best experience, here are a few things to know before securing your booking. We would rather be upfront than surprise you with terms and conditions. This is the terms and conditions. But friendly.',
  blocks: [
    {
      icon: CalendarCheck,
      title: 'Booking',
      lines: [
        'A non-refundable booking fee reserves your date. Non-refundable because by then, we are already emotionally committed.',
        'The remaining balance is settled before the session or event begins. We are nice about it. But we do check.',
      ],
    },
    {
      icon: MapPin,
      title: 'Travel',
      lines: [
        'Based in Kuala Lumpur & Selangor. Available throughout Malaysia. If there is a story, we will travel for it.',
        'Travel charge: RM0.80 per km, round trip. Fair, transparent, and somehow still cheaper than therapy.',
        'Locations beyond 200 km: hotel accommodation may apply. We are dedicated, not superhuman.',
      ],
    },
    {
      icon: Clock3,
      title: 'Additional Coverage',
      lines: [
        'Additional hours: RM100/hour. The best-value overtime in this industry.',
        'Custom quotations for extended events, multiple venues, or unique requirements. If you can dream it, we can quote it.',
      ],
    },
    {
      icon: PackageCheck,
      title: 'Delivery',
      lines: [
        'Wedding galleries: 1 to 3 weeks.',
        'Portrait & graduation sessions: 7 to 14 days.',
        'Pixieset gallery available for 1 week, full-resolution Google Drive album for 1 month. You get the shots, we keep the shelf space.',
      ],
    },
  ],
  outro:
    'Moodboards, reference links, and "I want this exact vibe" texts are always welcome. We will judge you with love.',
};

const steps = [
  {
    step: '01',
    title: 'Tell us your date',
    body: 'Institution, hall, time. We reply within 24 hours, usually with too much enthusiasm.',
  },
  {
    step: '02',
    title: 'We show up early',
    body: 'We scout the light, check the crowd, and prepare for your name to be called. We have never been more ready for anything.',
  },
  {
    step: '03',
    title: 'You get the photos',
    body: '30 to 100+ edited photos in under a week. Faster than your transcript arrives.',
  },
];

const faqs = [
  {
    q: 'Have you actually shot a graduation before?',
    a: 'No. And we told you before you asked, which is exactly why you should trust us. First 5 grads get the founder price while we build our legacy (and our portfolio).',
  },
  {
    q: 'How many photos do we get?',
    a: '30 to 100+ depending on the pack. All edited, all yours, all ready to post.',
  },
  {
    q: 'How fast do we get them?',
    a: 'Within 1 week. Faster than your transcript arrives.',
  },
  {
    q: 'Can we do family photos too?',
    a: 'Please. The aunties demand it. We will make everyone look good, we promise.',
  },
  {
    q: 'What if we are awkward in front of the camera?',
    a: 'Perfect. Awkward is our specialty. We will direct you into looking effortlessly cool, or at least having fun trying.',
  },
  {
    q: 'Why are you so cheap right now?',
    a: 'Because we are new and honest about it. Lock in the founder rate before we get famous and charge famous prices.',
  },
];

const tickerItems = [
  'founder grads: 5 spots',
  'cap toss captured forever',
  'family chaos (affectionate)',
  'be the first',
  'mom will cry (happy tears)',
];

export default function GraduationPage() {
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

      <BeforeYouBook
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        eyebrow={beforeYouBook.eyebrow}
        heading={beforeYouBook.heading}
        intro={beforeYouBook.intro}
        blocks={beforeYouBook.blocks}
        outro={beforeYouBook.outro}
      />

      <ServicePackages
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        accentSoft={service.accentSoft}
        eyebrow="packs for grads"
        heading={['Pick your', 'grad pack.'] as [string, string]}
        note="these are our normal prices. founder grads pm us for the special one!"
        packages={graduationPackages}
        footnote="Extra hour RM 100/hr &middot; Custom quotes for multiple venues &amp; extended events"
      />

      <HowItWorks
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        eyebrow="how it works"
        heading={['Three steps to', 'your grad pics.'] as [string, string]}
        steps={steps}
      />

      <ServiceFaq
        headingFont={heroConfig.headingFont}
        handwritingFont={heroConfig.handwritingFont}
        accent={service.accent}
        accentSoft={service.accentSoft}
        eyebrow="things grads ask us"
        heading={['Questions,', 'grad-titude.'] as [string, string]}
        items={faqs}
      />

      {/* Inquiry */}
      <section id="inquiry" className="py-16 sm:py-24 bg-[#fdfcfa] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-caveat text-2xl sm:text-3xl mb-2" style={{ color: service.accent }}>
              walked the stage?
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
              Let&apos;s plan your grad photos
            </h2>
          </div>
          <ServiceInquiryForm serviceId="graduation" accent={service.accent} />
        </div>
      </section>

      <PortfolioFooter />
    </div>
  );
}
