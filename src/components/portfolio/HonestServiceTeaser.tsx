'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Check, ArrowRight, ArrowDown } from 'lucide-react';
import { whatsappLinks } from '@/utils/whatsapp';
import { getServiceById, TIKTOK_HANDLE, TIKTOK_URL, type PortfolioItem } from '@/data/portfolioData';
import OfficeCaption from './service/OfficeCaption';
import { BlankBoard, PolaroidCard, TikTokCard } from './service/ServiceMedia';

const NOISE =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")';

interface TeaserConfig {
  id: 'corporate' | 'events' | 'content' | 'graduation';
  headingFont: string;
  handwritingFont: string;
  eyebrow: string;
  heading: [string, string];
  copy: string[];
  caption: string;
  dealName: string;
  dealPerks: [string, string];
  waMessage: string;
  waSource: string;
  ctaLabel: string;
  media: 'blank' | 'polaroid' | 'tiktok';
  mediaCaption?: string;
  mediaPlayable?: boolean;
  pageHref: string;
  pageLabel: string;
}

const configs: Record<'corporate' | 'events' | 'content' | 'graduation', TeaserConfig> = {
  corporate: {
    id: 'corporate',
    headingFont: 'font-space-grotesk',
    handwritingFont: 'font-kalam',
    eyebrow: 'the honest section',
    heading: ['Corporate films made:', 'zero.'],
    copy: [
      "Here's the truth: we haven't made a corporate video yet. But we've made films that made people cry happy tears. How different can it be, really?",
      'Your competitors have boring corporate videos. You could have a fun one. From a company with nothing to hide and everything to prove.',
    ],
    caption: 'CORPORATE FILMS: STATUS NOTHING YET (YET)',
    dealName: 'the founder brands deal',
    dealPerks: [
      'special price for the first 5 brands',
      "extra takes + we'll talk about your brand forever",
    ],
    waMessage:
      'RESERVE MY FOUNDER SPOT! 🏢 We want to be one of the first Founder Brands. Tell us the founder price!',
    waSource: 'portfolio-corporate-founder',
    ctaLabel: 'Reserve My Founder Spot',
    media: 'blank',
    pageHref: '/portfolio/corporate',
    pageLabel: 'Explore Corporate Films',
  },
  events: {
    id: 'events',
    headingFont: 'font-bebas',
    handwritingFont: 'font-caveat',
    eyebrow: "events, we've covered exactly one",
    heading: ['One event down.', 'Zero missed.'],
    copy: [
      'We filmed our first event and honestly? We crushed it. One event, one very happy organiser.',
      "Now we're looking for event number two. The first few get the founder price. Every legend has an origin story. Yours gets a discount.",
    ],
    caption: 'EVENT #2: COULD BE YOURS',
    dealName: 'the founder events deal',
    dealPerks: [
      'special price for the first 5 events',
      'same-day teaser option + VIP treatment',
    ],
    waMessage:
      'LOCK IN MY FOUNDER DEAL! 🎉 We want our event to be one of the first Founder Events. Tell us the founder price!',
    waSource: 'portfolio-events-founder',
    ctaLabel: 'Lock In My Founder Deal',
    media: 'polaroid',
    mediaCaption: 'event #1, we nailed it',
    pageHref: '/portfolio/events',
    pageLabel: 'Explore Event Coverage',
  },
  content: {
    id: 'content',
    headingFont: 'font-poppins',
    handwritingFont: 'font-shadows',
    eyebrow: 'content creation, our tiktok is our cv',
    heading: ['We post.', 'You grow.'],
    copy: [
      "Our TikTok is basically our resume. Go watch it, we'll wait. That's the content we'd make for you: scroll-stopping, honest, actually fun.",
      "We're taking on the first few brands at a founder rate. Come say hi.",
    ],
    caption: '@CAPTURA.MY: VIEWS GROWING',
    dealName: 'the founder creator deal',
    dealPerks: [
      'monthly content at founder rate',
      'unlimited ideas, zero boring',
    ],
    waMessage:
      'JOIN THE FOUNDER BATCH! 📱 We want to be one of the first Founder Creators. Tell us the founder rate!',
    waSource: 'portfolio-content-founder',
    ctaLabel: 'Join The Founder Batch',
    media: 'tiktok',
    pageHref: '/portfolio/content',
    pageLabel: 'Explore Content Creation',
  },
  graduation: {
    id: 'graduation',
    headingFont: 'font-bungee',
    handwritingFont: 'font-caveat',
    eyebrow: 'graduations, the photography kind',
    heading: ['You survived.', 'We shoot it.'],
    copy: [
      "Listen. We haven't photographed a graduation yet. Zero. But we've made couples cry happy tears at weddings, so we know how to handle proud parents, dramatic aunties, and a cap toss in slow motion.",
      'You did the degree. Let us do the photos.',
    ],
    caption: 'GRADUATION PHOTOS TAKEN: 0 (SO FAR)',
    dealName: 'the founder grads deal',
    dealPerks: [
      'special price for the first 5 grads',
      'the cap toss, captured forever',
    ],
    waMessage:
      'CLAIM MY GRAD SPOT! 🎓 We want to be one of the first Founder Grads. Tell us the founder price!',
    waSource: 'portfolio-graduation-founder',
    ctaLabel: 'Lock In My Grad Deal',
    media: 'polaroid',
    mediaCaption: 'our first grad shoot: could be yours',
    mediaPlayable: false,
    pageHref: '/portfolio/graduation',
    pageLabel: 'Explore Graduation Photos',
  },
};

interface HonestServiceTeaserProps {
  id: 'corporate' | 'events' | 'content' | 'graduation';
  accent: string;
  onOpen?: (item: PortfolioItem) => void;
}

export default function HonestServiceTeaser({ id, accent, onOpen }: HonestServiceTeaserProps) {
  const config = configs[id];
  const service = getServiceById(id);

  const handlePM = () => {
    window.open(whatsappLinks.custom(config.waMessage, config.waSource), '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-3xl bg-[#0d0d0d] shadow-xl"
    >
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: NOISE }}
        aria-hidden="true"
      />

      <div className="relative grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
        {/* Copy */}
        <div>
          <p
            className={`${config.handwritingFont} text-2xl sm:text-3xl mb-4`}
            style={{ color: accent }}
          >
            {config.eyebrow}
          </p>

          <h2
            className={`${config.headingFont} font-bold text-4xl sm:text-6xl text-white leading-[1.05] mb-6`}
          >
            {config.heading[0]}{' '}
            <span className="italic" style={{ color: accent }}>
              {config.heading[1]}
            </span>
          </h2>

          <div className="space-y-3 mb-8">
            {config.copy.map((para) => (
              <p key={para} className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
                {para}
              </p>
            ))}
          </div>

          {/* Page door */}
          <Link
            href={config.pageHref}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-black font-extrabold text-xs tracking-[0.2em] uppercase transition-all duration-200 hover:scale-[1.03] hover:brightness-110 shadow-lg mb-8"
            style={{ backgroundColor: accent, boxShadow: `0 10px 30px ${accent}40` }}
          >
            {config.pageLabel}
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </Link>

          {/* Founder deal box */}
          <div
            className="relative rounded-2xl p-6 sm:p-7 max-w-md"
            style={{ border: `2px dashed ${accent}55`, backgroundColor: '#111111' }}
          >
            <span
              className="absolute -top-3.5 left-6 rotate-[-2deg] whitespace-nowrap px-3.5 py-0.5 text-black font-bold text-sm sm:text-base"
              style={{ backgroundColor: accent, borderRadius: '6px', fontFamily: 'inherit' }}
            >
              {config.dealName}
            </span>

            <ul className="mt-3 space-y-2.5 mb-6">
              {config.dealPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: accent }}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {perk}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handlePM}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-black font-extrabold text-xs tracking-[0.15em] uppercase transition-all duration-200 hover:scale-[1.03] hover:brightness-110 shadow-lg"
              style={{ backgroundColor: accent, boxShadow: `0 10px 26px ${accent}40` }}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              {config.ctaLabel}
            </button>
            <p className={`${config.handwritingFont} text-lg sm:text-xl text-white/45 mt-2.5`}>
              pm us for the founder price
            </p>
          </div>

          {/* Link to the inquiry form */}
          <a
            href="#inquiry"
            className="inline-flex items-center gap-1.5 mt-6 text-white/50 hover:text-white transition-colors text-sm font-semibold"
          >
            or tell us about your project
            <ArrowDown className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>

        {/* Media */}
        <div className="flex flex-col items-center gap-5">
          {config.media === 'blank' && (
            <BlankBoard accent={accent} handwritingFont={config.handwritingFont} />
          )}
          {config.media === 'polaroid' && (
            <PolaroidCard
              item={service.items[0]}
              handwritingFont={config.handwritingFont}
              caption={config.mediaCaption ?? 'the one so far'}
              onOpen={config.mediaPlayable !== false ? onOpen : undefined}
            />
          )}
          {config.media === 'tiktok' && (
            <TikTokCard
              item={service.items[0]}
              accent={accent}
              handle={TIKTOK_HANDLE}
              href={TIKTOK_URL}
            />
          )}
          <OfficeCaption text={config.caption} />
        </div>
      </div>
    </motion.div>
  );
}
