import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://capturarentals.com';
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/portfolio/weddings`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/portfolio/corporate`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/portfolio/events`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/portfolio/content`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/portfolio/graduation`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/rental`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/rental/how-to-book`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/rental/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/rental/support`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/logistics`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
