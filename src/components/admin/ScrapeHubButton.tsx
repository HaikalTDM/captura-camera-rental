'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScrapeHubButton() {
  const [isScraping, setIsScraping] = useState(false);

  const handleScrape = async () => {
    setIsScraping(true);
    const toastId = toast.loading('PetaPixel scraper engaged. Fetching external news...');

    try {
      const res = await fetch('/api/hub/scrape?secret=GATES_CRON_SECRET', {
        method: 'GET',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Scraping complete! Added ${data.new_articles} new articles to the Hub.`, { id: toastId });
      } else {
        toast.error(`Scrape failed: ${data.error || 'Unknown error'}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Network error: ${err.message}`, { id: toastId });
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleScrape}
      disabled={isScraping}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors
        ${isScraping ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
      `}
    >
      <RefreshCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
      {isScraping ? 'Scraping Hub...' : 'Refresh Hub Content'}
    </motion.button>
  );
}
