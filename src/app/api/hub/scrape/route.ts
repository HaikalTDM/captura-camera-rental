import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import TurndownService from 'turndown';
import { getSupabaseAdmin } from '@/lib/supabase';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'description'],
  }
});
const turndownService = new TurndownService();

// RSS Feeds to scrape for the Hub
const RSS_FEEDS = [
  'https://petapixel.com/feed/' // Excellent source for camera/photography news
];

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Basic security to prevent unauthorized scraping
  if (secret !== 'GATES_CRON_SECRET' && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let addedCount = 0;

  try {
    for (const feedUrl of RSS_FEEDS) {
      console.log(`📡 Fetching feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      // We only take the latest 3 items per run to keep the DB light
      const latestItems = feed.items.slice(0, 3);

      for (const item of latestItems) {
        if (!item.title) continue;

        // Check if an article with this exact exact title already exists to prevent duplicates
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('title', item.title)
          .limit(1)
          .single();
          
        if (existing) {
          console.log(`⏭️ Skipping existing: ${item.title}`);
          continue;
        }

        // Clean slug pattern
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

        // Find cover image (RSS feeds sometimes bury them in content)
        let imageUrl = null;
        if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
          imageUrl = item['media:content']['$'].url;
        } else if (item.content || item.description) {
          const imgMatch = (item.content || item.description || '').match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }

        // Convert HTML to crisp Markdown
        let markdownContent = '';
        if (item.content || item.description) {
           markdownContent = turndownService.turndown(item.content || item.description || '');
           
           // Remove all markdown images to prevent duplicating the hero image in the article body
           markdownContent = markdownContent.replace(/!\[.*?\]\(.*?\)/g, '');
           
           // Truncate text and add a link to the original article to respect SEO and copyright
           const paragraphs = markdownContent.split('\n\n').slice(0, 4).join('\n\n');
           markdownContent = `${paragraphs}\n\n...\n\n### 🔗 [Read the full article and see more photos on PetaPixel](${item.link})`;
        }

        // Construct preview excerpt
        let excerpt = '';
        if (item.contentSnippet) {
          excerpt = item.contentSnippet.split(' ').slice(0, 25).join(' ') + '...';
        }

        // Inject into Supabase Articles Table
        const { error } = await supabase.from('articles').insert([{
          title: item.title,
          slug: slug,
          content: markdownContent,
          excerpt: excerpt,
          category: 'News',
          image_url: imageUrl,
          published: true // Automatically push to the active Hub
        }]);

        if (error) {
          console.error(`❌ DB Insert Failed: ${error.message}`);
        } else {
          console.log(`✅ Scraped & Saved: ${item.title}`);
          addedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Scraper executed successfully. ${addedCount} new articles added to the Hub.`,
      new_articles: addedCount
    });

  } catch (err: any) {
    console.error('🚨 Scraping error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
