import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getArticleBySlug } from '@/lib/api/hub';

export const revalidate = 60;

export default async function HubArticlePage({ params }: { params: { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Format date
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', dateOptions);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">
      {/* Return Navigation */}
      <div className="pt-24 px-6 max-w-3xl mx-auto mb-8">
        <Link href="/rental/hub" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors font-bold text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Hub
        </Link>
      </div>

      {/* Article Header */}
      <div className="px-6 max-w-3xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider text-zinc-300">
            {article.category}
          </span>
          <span className="text-zinc-500 text-sm font-medium">{formattedDate}</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight text-white">
          {article.title}
        </h1>
        
        {article.excerpt && (
          <p className="text-xl text-zinc-400 font-medium leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </div>

      {/* Hero Image */}
      {article.image_url && (
        <div className="px-6 max-w-5xl mx-auto mb-16">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
            <Image 
              src={article.image_url} 
              alt={article.title} 
              fill 
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="px-6 max-w-3xl mx-auto">
        <div className="hub-markdown-content text-lg leading-loose text-zinc-300">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl sm:text-4xl font-black text-white mt-12 mb-6 tracking-tight" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl sm:text-3xl font-black text-white mt-10 mb-5 tracking-tight" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl sm:text-2xl font-bold text-white mt-8 mb-4 tracking-tight" {...props} />,
              p: ({node, ...props}) => <p className="mb-6 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-zinc-600" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-zinc-600" {...props} />,
              li: ({node, ...props}) => <li className="pl-2" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-6 py-2 my-8 italic text-zinc-400 bg-white/5 rounded-r-xl" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-white/20 hover:decoration-blue-300 transition-colors" {...props} />,
            }}
          >
            {article.content.replace(/\\n/g, '\n')}
          </ReactMarkdown>
        </div>
      </article>

      {/* Conversion CTA */}
      {article.related_camera_id && (
        <div className="px-6 max-w-3xl mx-auto mt-20">
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">Want to try it yourself?</h3>
              <p className="text-zinc-300 mb-8 max-w-md mx-auto">
                We have the exact gear used in this story ready for you to rent right now.
              </p>
              
              <Link 
                href="/rental/cameras" 
                className="inline-flex items-center justify-center bg-white text-black font-black px-8 py-4 rounded-xl hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                View Available Gear
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
