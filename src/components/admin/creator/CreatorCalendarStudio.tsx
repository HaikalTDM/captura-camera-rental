'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Image as ImageIcon,
  Layers3,
  Maximize2,
  Sparkles,
  X,
} from 'lucide-react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Booking, Camera } from '@/lib/supabase';

type CreatorTheme = 'playful' | 'premium';
type ExportFormat = 'png' | 'jpeg';

interface CreatorBooking {
  id: string;
  customerName: string;
  cameraName: string;
  cameraImage: string | null;
  totalAmount: number;
  bookingStatus: string;
  startDate: Date;
  endDate: Date;
  accent: string;
}

interface CreatorDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: CreatorBooking[];
}

interface CreatorThemeStyles {
  appBg: string;
  posterBg: string;
  posterText: string;
  posterMuted: string;
  heading: string;
  accent: string;
  accentSoft: string;
  panel: string;
  panelBorder: string;
  dayBg: string;
  dayMutedBg: string;
  dayBorder: string;
}

const CAMERA_IMAGE_FALLBACKS: Array<{ pattern: RegExp; image: string }> = [
  { pattern: /osmo pocket 3 \(ii\)/i, image: '/images/osmo-pocket-31.jpg' },
  { pattern: /osmo pocket 3/i, image: '/images/osmo-pocket-31.jpg' },
  { pattern: /action 5 pro/i, image: '/images/dji-action-5-pro1.jpg' },
  { pattern: /fujifilm x-t30 ii/i, image: '/images/fujifilm_xt30.png' },
];

const THEME_STYLES: Record<CreatorTheme, CreatorThemeStyles> = {
  playful: {
    appBg: 'radial-gradient(circle at top left, rgba(255,181,122,0.18), transparent 24%), linear-gradient(135deg, #191513 0%, #12100f 68%, #181412 100%)',
    posterBg: 'linear-gradient(180deg, #fff6eb 0%, #f6ede2 50%, #f0e7db 100%)',
    posterText: '#1f1813',
    posterMuted: '#6b5a4c',
    heading: '#1e1712',
    accent: '#d9792f',
    accentSoft: '#ffe0c2',
    panel: '#fffdf8',
    panelBorder: '#e8d6c2',
    dayBg: '#fffaf3',
    dayMutedBg: '#efe4d7',
    dayBorder: '#e7d4c0',
  },
  premium: {
    appBg: 'radial-gradient(circle at top left, rgba(201,107,44,0.12), transparent 26%), linear-gradient(135deg, #181513 0%, #11100f 72%, #171412 100%)',
    posterBg: 'linear-gradient(180deg, #f5efe7 0%, #efe7dd 100%)',
    posterText: '#191613',
    posterMuted: '#685a4c',
    heading: '#151210',
    accent: '#c96b2c',
    accentSoft: '#f7dcc2',
    panel: '#fcf8f3',
    panelBorder: '#dfd0c0',
    dayBg: '#faf5ef',
    dayMutedBg: '#ece2d7',
    dayBorder: '#ded0c2',
  },
};

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1920;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateOnly(value: string | null | undefined) {
  if (!value) return new Date();
  const raw = value.split('T')[0];
  const [year, month, day] = raw.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthBounds(date: Date) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA <= endB && endA >= startB;
}

function buildCalendarDays(currentDate: Date, bookings: CreatorBooking[]) {
  const { start, end } = getMonthBounds(currentDate);
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());
  const totalCells = Math.ceil((start.getDay() + end.getDate()) / 7) * 7;
  const today = startOfDay(new Date());

  const days: CreatorDay[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    days.push({
      date,
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isToday: formatDateKey(date) === formatDateKey(today),
      bookings: bookings.filter((booking) => rangesOverlap(date, date, booking.startDate, booking.endDate)),
    });
  }

  return days;
}

function getCameraImage(camera?: Camera | null, cameraName?: string) {
  const directImage = camera?.image_url || camera?.image || camera?.images?.[0];
  if (directImage) return directImage;

  const fallback = CAMERA_IMAGE_FALLBACKS.find((item) => item.pattern.test(cameraName || ''));
  return fallback?.image || null;
}

function getCameraAccent(name: string) {
  if (/pocket/i.test(name)) return '#ff9e57';
  if (/action/i.test(name)) return '#f97316';
  if (/canon/i.test(name)) return '#d97706';
  if (/fujifilm/i.test(name)) return '#8b5cf6';
  return '#c96b2c';
}

function normalizeBookingStatus(booking: Booking) {
  return booking.booking_status || booking.status || 'confirmed';
}

function isVisibleCreatorBooking(booking: Booking) {
  const status = normalizeBookingStatus(booking);
  return !['cancelled', 'rejected'].includes(status);
}

function getMonthName(date: Date) {
  return date.toLocaleDateString('en-MY', { month: 'long' });
}

function getFormattedMonthYear(date: Date) {
  return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
}

async function waitForImages(root: ParentNode) {
  const images = Array.from(root.querySelectorAll('img'));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const finish = () => resolve();
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        }),
    ),
  );
}

function CreatorSticker({
  booking,
  index,
}: {
  booking: CreatorBooking;
  index: number;
}) {
  const rotation = [-2, 1.5, -1, 2][index % 4];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 24,
        padding: 2,
        transform: `rotate(${rotation}deg)`,
        height: 76,
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: '100%',
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {booking.cameraImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={booking.cameraImage}
              alt={booking.cameraName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter:
                  'drop-shadow(0 0 0 #ffffff) drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 5px #ffffff) drop-shadow(0 3px 10px rgba(17,14,11,0.18))',
              }}
              crossOrigin="anonymous"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CreatorPoster({
  currentDate,
  theme,
  days,
}: {
  currentDate: Date;
  theme: CreatorTheme;
  days: CreatorDay[];
}) {
  const styles = THEME_STYLES[theme];

  return (
    <div
      style={{
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        background: styles.posterBg,
        color: styles.posterText,
        borderRadius: 44,
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            theme === 'playful'
              ? 'radial-gradient(circle at top left, rgba(255,171,102,0.26), transparent 22%), radial-gradient(circle at bottom right, rgba(253, 224, 71, 0.16), transparent 20%)'
              : 'radial-gradient(circle at top left, rgba(201,107,44,0.18), transparent 24%), radial-gradient(circle at bottom right, rgba(79, 70, 60, 0.10), transparent 18%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '56px 56px 42px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: 28,
                background: '#fffdf9',
                border: `1px solid ${styles.panelBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 18px 30px rgba(42, 32, 24, 0.10)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/captura_icon.png"
                alt="CAPTURA"
                style={{ width: 42, height: 42, objectFit: 'contain' }}
              />
            </div>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: styles.accentSoft,
                  color: styles.accent,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
              >
                Creator Calendar
              </div>
              <div
                style={{
                  fontSize: 68,
                  fontWeight: 900,
                  letterSpacing: '-0.06em',
                  lineHeight: 0.95,
                  color: styles.heading,
                }}
              >
                {getMonthName(currentDate)}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: styles.posterMuted,
                  fontWeight: 600,
                  marginTop: 10,
                }}
              >
                Captura booking board for TikTok and social posts
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 14,
              minWidth: 0,
            }}
          >
          </div>
        </div>

        <div
          style={{
            borderRadius: 34,
            border: `1px solid ${styles.panelBorder}`,
            background: styles.panel,
            padding: 24,
            boxShadow: '0 24px 36px rgba(28, 20, 14, 0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: styles.posterMuted,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {days.map((day) => (
              (() => {
                const imageBookings = day.bookings.filter((booking) => !!booking.cameraImage);
                const visibleBookings = imageBookings.slice(0, 3);
                const hiddenCount = Math.max(day.bookings.length - visibleBookings.length, 0);

                return (
                  <div
                    key={formatDateKey(day.date)}
                    style={{
                      borderRadius: 30,
                      border: `1px solid ${styles.dayBorder}`,
                      background: day.isCurrentMonth ? styles.dayBg : styles.dayMutedBg,
                      padding: 14,
                      minHeight: 228,
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: day.isToday ? '0 14px 24px rgba(201, 107, 44, 0.14)' : 'none',
                      outline: day.isToday ? `3px solid ${styles.accent}` : 'none',
                      outlineOffset: -3,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 900,
                          color: day.isCurrentMonth ? styles.heading : styles.posterMuted,
                          opacity: day.isCurrentMonth ? 1 : 0.75,
                          letterSpacing: '-0.04em',
                        }}
                      >
                        {day.date.getDate()}
                      </span>
                      {day.bookings.length > 0 && (
                        <span
                          style={{
                            borderRadius: 999,
                            minWidth: 32,
                            height: 32,
                            background: styles.accentSoft,
                            color: styles.accent,
                            fontSize: 14,
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            lineHeight: 1,
                          }}
                        >
                          {day.bookings.length}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gap: 6, flex: 1 }}>
                      {visibleBookings.map((booking, index) => (
                        <CreatorSticker
                          key={`${formatDateKey(day.date)}-${booking.id}`}
                          booking={booking}
                          index={index}
                        />
                      ))}

                      {hiddenCount > 0 && (
                        <div
                          style={{
                            marginTop: 'auto',
                            borderRadius: 18,
                            border: `1px dashed ${styles.dayBorder}`,
                            padding: '12px 14px',
                            fontSize: 18,
                            fontWeight: 800,
                            color: styles.posterMuted,
                            background: 'rgba(255,255,255,0.46)',
                          }}
                        >
                          +{hiddenCount} more bookings
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function PosterPreview({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resize = () => {
      setScale(Math.min(container.clientWidth / POSTER_WIDTH, 1));
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden border border-[#2f2923] bg-[#0f0d0c] ${compact ? 'rounded-[24px] p-2' : 'rounded-[32px] p-4'}`}
    >
      <div style={{ width: POSTER_WIDTH * scale, height: POSTER_HEIGHT * scale }}>
        <div
          style={{
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CreatorCalendarStudio() {
  const { bookings, cameras, isLoading, error } = useAdminData();
  const isCompactLayout = useIsMobile(1024);
  const isPhone = useIsMobile(640);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [theme, setTheme] = useState<CreatorTheme>('playful');
  const [bookedOnly, setBookedOnly] = useState(true);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [sectionOpen, setSectionOpen] = useState({
    controls: true,
    export: false,
    ideas: false,
  });

  const toggleSection = (section: keyof typeof sectionOpen) => {
    setSectionOpen((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const creatorBookings = useMemo<CreatorBooking[]>(() => {
    const { start, end } = getMonthBounds(currentDate);

    return bookings
      .filter(isVisibleCreatorBooking)
      .map((booking) => {
        const camera = booking.camera || cameras.find((item) => item.id === booking.camera_id);
        const cameraName = booking.camera?.name || camera?.name || 'Camera';

        return {
          id: booking.id,
          customerName: booking.customer?.full_name || 'Customer',
          cameraName,
          cameraImage: getCameraImage(camera, cameraName),
          totalAmount: booking.total_amount || booking.totalAmount || 0,
          bookingStatus: normalizeBookingStatus(booking),
          startDate: parseDateOnly(booking.start_date),
          endDate: parseDateOnly(booking.end_date),
          accent: getCameraAccent(cameraName),
        };
      })
      .filter((booking) => rangesOverlap(booking.startDate, booking.endDate, start, end))
      .filter((booking) => (bookedOnly ? ['confirmed', 'approved', 'completed'].includes(booking.bookingStatus) : true))
      .sort((left, right) => left.startDate.getTime() - right.startDate.getTime());
  }, [bookings, cameras, currentDate, bookedOnly]);

  const days = useMemo(() => buildCalendarDays(currentDate, creatorBookings), [creatorBookings, currentDate]);
  const ideaCards = useMemo(() => {
    const weekendDays = days.filter(
      (day) => day.isCurrentMonth && [5, 6].includes(day.date.getDay()) && day.bookings.length > 0,
    );
    const openDays = days.filter((day) => day.isCurrentMonth && day.bookings.length === 0).length;

    return [
      {
        title: 'Weekend Sell-Out Hook',
        body:
          weekendDays.length > 0
            ? `${weekendDays.length} weekend days already have bookings. Turn that into a "slots are filling fast" post.`
            : 'Weekends are still open. A "book early for creator weekends" reel would work well here.',
      },
      {
        title: 'Camera Spotlight',
        body:
          creatorBookings.length === 0
            ? 'Pick one hero camera and build a simple "why creators rent this" reel.'
            : `Use the strongest-looking camera sticker from this month as the hero of one short-form post.`,
      },
      {
        title: 'Availability Angle',
        body:
          openDays > 0
            ? `${openDays} days still look open this month. Great for a "few weekday slots still available" story.`
            : 'This month is packed. A "limited slots left" creator update would feel believable right now.',
      },
    ];
  }, [creatorBookings.length, days]);

  const exportPoster = async (format: ExportFormat) => {
    setExporting(format);
    setNotice(null);
    let iframe: HTMLIFrameElement | null = null;

    try {
      const exportElement = document.getElementById('creator-calendar-export');
      if (!exportElement) {
        throw new Error('Creator poster not found');
      }

      iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.position = 'fixed';
      iframe.style.left = '-100000px';
      iframe.style.top = '0';
      iframe.style.width = `${POSTER_WIDTH}px`;
      iframe.style.height = `${POSTER_HEIGHT}px`;
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) {
        throw new Error('Unable to prepare export frame');
      }

      iframeDoc.open();
      iframeDoc.write('<!doctype html><html><head><meta charset="utf-8"><title>Creator Export</title></head><body style="margin:0;background:transparent;"></body></html>');
      iframeDoc.close();

      const clonedElement = exportElement.cloneNode(true) as HTMLElement;
      iframeDoc.body.appendChild(clonedElement);
      await waitForImages(iframeDoc);
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(clonedElement, {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
      } as Parameters<typeof html2canvas>[1]);

      const extension = format === 'png' ? 'png' : 'jpg';
      const link = document.createElement('a');
      link.download = `captura-creator-${getMonthName(currentDate).toLowerCase()}-${currentDate.getFullYear()}-${theme}.${extension}`;
      link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', format === 'png' ? 1 : 0.94);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotice({
        tone: 'success',
        message: `Creator calendar exported as ${extension.toUpperCase()} successfully.`,
      });
    } catch (exportError) {
      console.error('Creator export failed:', exportError);
      setNotice({
        tone: 'error',
        message: 'Export failed. Please try again.',
      });
    } finally {
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      setExporting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-[#2f2822] bg-[#141210]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2b2621] border-t-orange-500" />
          <p className="text-sm font-medium text-stone-400">Loading Creator studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-[#4a2926] bg-[#1a1312] p-8 text-center">
        <h1 className="text-2xl font-bold text-stone-100">Creator Studio Unavailable</h1>
        <p className="mt-3 text-sm text-stone-400">
          We couldn&apos;t load bookings for the creator calendar right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`overflow-hidden border border-[#2d2823] shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${isCompactLayout ? 'rounded-[24px] p-5' : 'rounded-[32px] p-8'}`}
        style={{ background: THEME_STYLES[theme].appBg }}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#3a332c] bg-[#1a1714] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300">
              <Sparkles className="h-3.5 w-3.5" />
              Creator
            </div>
            <h1 className={`font-bold text-stone-50 ${isCompactLayout ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>Creator Calendar Studio</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400 sm:text-base">
              Turn your current bookings into a stylish social poster for TikTok, Instagram Stories, and creator updates.
            </p>
          </div>

          <div className={`grid gap-3 ${isPhone ? 'grid-cols-1' : isCompactLayout ? 'grid-cols-2' : 'sm:grid-cols-3'} xl:min-w-[560px]`}>
            {[
              { label: 'Poster Style', value: theme === 'playful' ? 'Playful' : 'Premium', icon: Layers3 },
              { label: 'Sticker Cap', value: '3 per day', icon: ImageIcon },
              { label: 'Mode', value: bookedOnly ? 'Booked only' : 'All visible', icon: CalendarDays },
            ].map(({ label, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`rounded-[24px] border border-[#2f2a25] bg-[#181513]/90 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${isCompactLayout && !isPhone && index === 2 ? 'col-span-2' : ''}`}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#241b15]">
                  <Icon className="h-5 w-5 text-orange-300" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</div>
                <div className={`mt-2 font-bold tracking-tight text-stone-100 ${isCompactLayout ? 'text-xl' : 'text-3xl'}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
        <div className={`min-w-0 space-y-4 xl:space-y-6 ${isCompactLayout ? 'order-2' : ''}`}>
          <div className={`overflow-hidden border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${isCompactLayout ? 'rounded-[24px] p-4' : 'rounded-[28px] p-6'}`}>
            {isCompactLayout ? (
              <>
                <button
                  onClick={() => toggleSection('controls')}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#312b25] bg-[#191715] px-4 py-4 text-left"
                >
                  <div>
                    <h2 className="text-lg font-bold text-stone-100">Creator Controls</h2>
                    <p className="mt-1 text-sm text-stone-400">Month, theme, and poster visibility.</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 shrink-0 text-stone-400 transition-transform ${sectionOpen.controls ? 'rotate-90' : ''}`} />
                </button>
                {sectionOpen.controls && (
                  <div className="mt-4 space-y-5">
                    <div className="flex items-center justify-between rounded-2xl border border-[#312b25] bg-[#191715] p-3">
                      <button
                        onClick={() => setCurrentDate((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3a332c] bg-[#1d1916] text-stone-300 transition-colors hover:bg-[#25211d]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="text-center">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Poster Month</div>
                        <div className="mt-1 text-xl font-bold text-stone-100">{getFormattedMonthYear(currentDate)}</div>
                      </div>
                      <button
                        onClick={() => setCurrentDate((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3a332c] bg-[#1d1916] text-stone-300 transition-colors hover:bg-[#25211d]"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    <div>
                      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Theme</div>
                      <div className="grid grid-cols-2 gap-3">
                        {(['playful', 'premium'] as CreatorTheme[]).map((option) => (
                          <button
                            key={option}
                            onClick={() => setTheme(option)}
                            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                              theme === option
                                ? 'border-[#c96b2c] bg-[#281b14] text-stone-100 shadow-[0_18px_34px_rgba(201,107,44,0.18)]'
                                : 'border-[#312b25] bg-[#191715] text-stone-400 hover:bg-[#201c19]'
                            }`}
                          >
                            <div className="font-semibold capitalize">{option}</div>
                            <div className="mt-1 text-xs text-inherit opacity-80">
                              {option === 'playful' ? 'Sticker-board, warm, expressive' : 'Cleaner, calmer, premium'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          title: 'Booked-only mode',
                          description: 'Hide tentative jobs and keep the poster focused on confirmed activity.',
                          checked: bookedOnly,
                          onChange: () => setBookedOnly((value) => !value),
                          icon: Eye,
                        },
                      ].map(({ title, description, checked, onChange, icon: Icon }) => (
                        <button
                          key={title}
                          onClick={onChange}
                          className="flex w-full items-start gap-3 rounded-2xl border border-[#312b25] bg-[#191715] p-4 text-left transition-colors hover:bg-[#201c19]"
                        >
                          <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${checked ? 'bg-[#281b14] text-orange-300' : 'bg-[#221f1b] text-stone-500'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-stone-100">{title}</div>
                            <div className="mt-1 text-sm leading-5 text-stone-400">{description}</div>
                          </div>
                          <div className={`mt-1 h-6 w-11 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-[#332d27]'}`}>
                            <div className={`mt-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-stone-100">Creator Controls</h2>
                <p className="mt-2 text-sm text-stone-400">Set the month, the vibe, and what stays visible on the poster.</p>

                <div className="mt-5 space-y-5">
                  <div className="flex items-center justify-between rounded-2xl border border-[#312b25] bg-[#191715] p-3">
                    <button
                      onClick={() => setCurrentDate((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3a332c] bg-[#1d1916] text-stone-300 transition-colors hover:bg-[#25211d]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Poster Month</div>
                      <div className="mt-1 text-xl font-bold text-stone-100">{getFormattedMonthYear(currentDate)}</div>
                    </div>
                    <button
                      onClick={() => setCurrentDate((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3a332c] bg-[#1d1916] text-stone-300 transition-colors hover:bg-[#25211d]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div>
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Theme</div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['playful', 'premium'] as CreatorTheme[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => setTheme(option)}
                          className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                            theme === option
                              ? 'border-[#c96b2c] bg-[#281b14] text-stone-100 shadow-[0_18px_34px_rgba(201,107,44,0.18)]'
                              : 'border-[#312b25] bg-[#191715] text-stone-400 hover:bg-[#201c19]'
                          }`}
                        >
                          <div className="font-semibold capitalize">{option}</div>
                          <div className="mt-1 text-xs text-inherit opacity-80">
                            {option === 'playful' ? 'Sticker-board, warm, expressive' : 'Cleaner, calmer, premium'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        title: 'Booked-only mode',
                        description: 'Hide tentative jobs and keep the poster focused on confirmed activity.',
                        checked: bookedOnly,
                        onChange: () => setBookedOnly((value) => !value),
                        icon: Eye,
                      },
                    ].map(({ title, description, checked, onChange, icon: Icon }) => (
                      <button
                        key={title}
                        onClick={onChange}
                        className="flex w-full items-start gap-3 rounded-2xl border border-[#312b25] bg-[#191715] p-4 text-left transition-colors hover:bg-[#201c19]"
                      >
                        <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${checked ? 'bg-[#281b14] text-orange-300' : 'bg-[#221f1b] text-stone-500'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-stone-100">{title}</div>
                          <div className="mt-1 text-sm leading-5 text-stone-400">{description}</div>
                        </div>
                        <div className={`mt-1 h-6 w-11 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-[#332d27]'}`}>
                          <div className={`mt-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={`overflow-hidden border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${isCompactLayout ? 'rounded-[24px] p-4' : 'rounded-[28px] p-6'}`}>
            {isCompactLayout ? (
              <>
                <button
                  onClick={() => toggleSection('export')}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#312b25] bg-[#191715] px-4 py-4 text-left"
                >
                  <div>
                    <h2 className="text-lg font-bold text-stone-100">Export</h2>
                    <p className="mt-1 text-sm text-stone-400">PNG or JPEG for social posting.</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 shrink-0 text-stone-400 transition-transform ${sectionOpen.export ? 'rotate-90' : ''}`} />
                </button>
                {sectionOpen.export && (
                  <>
                    <p className="mt-4 text-sm leading-6 text-stone-400">
                      Use the creator poster as a TikTok story, announcement slide, or quick booking-update asset.
                    </p>

                    <div className="mt-5 grid gap-3">
                      <button
                        onClick={() => exportPoster('png')}
                        disabled={!!exporting}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#f3efe8] px-5 py-4 font-semibold text-[#11100f] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <ImageIcon className="h-5 w-5" />
                        {exporting === 'png' ? 'Exporting PNG...' : 'Export PNG'}
                      </button>
                      <button
                        onClick={() => exportPoster('jpeg')}
                        disabled={!!exporting}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-[#3a332c] bg-[#1d1916] px-5 py-4 font-semibold text-stone-200 transition-all hover:bg-[#24201c] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Download className="h-5 w-5" />
                        {exporting === 'jpeg' ? 'Exporting JPEG...' : 'Export JPEG'}
                      </button>
                    </div>

                    {notice && (
                      <div
                        className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                          notice.tone === 'success'
                            ? 'border-[#3a332c] bg-[#1b1815] text-stone-200'
                            : 'border-[#4a2926] bg-[#1a1312] text-red-200'
                        }`}
                      >
                        {notice.message}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-stone-100">Export</h2>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  Use the creator poster as a TikTok story, announcement slide, or quick booking-update asset.
                </p>

                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => exportPoster('png')}
                    disabled={!!exporting}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#f3efe8] px-5 py-4 font-semibold text-[#11100f] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <ImageIcon className="h-5 w-5" />
                    {exporting === 'png' ? 'Exporting PNG...' : 'Export PNG'}
                  </button>
                  <button
                    onClick={() => exportPoster('jpeg')}
                    disabled={!!exporting}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-[#3a332c] bg-[#1d1916] px-5 py-4 font-semibold text-stone-200 transition-all hover:bg-[#24201c] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Download className="h-5 w-5" />
                    {exporting === 'jpeg' ? 'Exporting JPEG...' : 'Export JPEG'}
                  </button>
                </div>

                {notice && (
                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                      notice.tone === 'success'
                        ? 'border-[#3a332c] bg-[#1b1815] text-stone-200'
                        : 'border-[#4a2926] bg-[#1a1312] text-red-200'
                    }`}
                  >
                    {notice.message}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={`overflow-hidden border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${isCompactLayout ? 'rounded-[24px] p-4' : 'rounded-[28px] p-6'}`}>
            {isCompactLayout ? (
              <>
                <button
                  onClick={() => toggleSection('ideas')}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#312b25] bg-[#191715] px-4 py-4 text-left"
                >
                  <div>
                    <h2 className="text-lg font-bold text-stone-100">More Creator Ideas</h2>
                    <p className="mt-1 text-sm text-stone-400">Quick content prompts from this month.</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 shrink-0 text-stone-400 transition-transform ${sectionOpen.ideas ? 'rotate-90' : ''}`} />
                </button>
                {sectionOpen.ideas && (
                  <div className="mt-4 grid gap-3">
                    {ideaCards.map((idea) => (
                      <div key={idea.title} className="rounded-2xl border border-[#312b25] bg-[#191715] p-4">
                        <div className="font-semibold text-stone-100">{idea.title}</div>
                        <div className="mt-2 text-sm leading-6 text-stone-400">{idea.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-stone-100">More Creator Ideas</h2>
                <div className="mt-5 grid gap-3">
                  {ideaCards.map((idea) => (
                    <div key={idea.title} className="rounded-2xl border border-[#312b25] bg-[#191715] p-4">
                      <div className="font-semibold text-stone-100">{idea.title}</div>
                      <div className="mt-2 text-sm leading-6 text-stone-400">{idea.body}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`min-w-0 space-y-4 xl:space-y-6 ${isCompactLayout ? 'order-1' : ''}`}>
          <div className={`overflow-hidden border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${isCompactLayout ? 'rounded-[24px] p-4' : 'rounded-[28px] p-6'}`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-100">Live Poster Preview</h2>
                <p className="mt-1 text-sm text-stone-400">{isCompactLayout ? 'Compact preview below. Open full poster for a better phone view.' : 'Vertical 1080 x 1920 layout with sticker cutouts and export-safe styling.'}</p>
              </div>
              <div className="flex items-center gap-2">
                {isCompactLayout && (
                  <button
                    onClick={() => setShowMobilePreview(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#3a332c] bg-[#1d1916] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-orange-300" />
                    Full Preview
                  </button>
                )}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#332d27] bg-[#1d1916] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                  {theme === 'playful' ? 'Playful Creator' : 'Clean Premium'}
                </div>
              </div>
            </div>

            {isCompactLayout ? (
              <div className="space-y-4">
                <div className={`mx-auto ${isPhone ? 'max-w-[220px]' : 'max-w-[280px]'}`}>
                  <PosterPreview compact>
                    <CreatorPoster
                      currentDate={currentDate}
                      theme={theme}
                      days={days}
                    />
                  </PosterPreview>
                </div>
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="w-full rounded-2xl border border-[#3a332c] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-200 transition-colors hover:bg-[#24201c]"
                >
                  Open full poster preview
                </button>
              </div>
            ) : (
              <PosterPreview>
                <CreatorPoster
                  currentDate={currentDate}
                  theme={theme}
                  days={days}
                />
              </PosterPreview>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          left: '-100000px',
          top: 0,
          width: POSTER_WIDTH,
          height: POSTER_HEIGHT,
          pointerEvents: 'none',
        }}
      >
        <div id="creator-calendar-export">
          <CreatorPoster
            currentDate={currentDate}
            theme={theme}
            days={days}
          />
        </div>
      </div>

      {isCompactLayout && showMobilePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#2d2823] bg-[#141210] px-4 py-4">
              <div>
                <h2 className="text-lg font-bold text-stone-100">Poster Preview</h2>
                <p className="text-xs text-stone-400">Full mobile view of the creator poster</p>
              </div>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#332d27] bg-[#1d1916] text-stone-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0d0c0b] p-3">
              <PosterPreview compact>
                <CreatorPoster
                  currentDate={currentDate}
                  theme={theme}
                  days={days}
                />
              </PosterPreview>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
