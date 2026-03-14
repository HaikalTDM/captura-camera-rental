import Image from 'next/image';
import Link from 'next/link';
import { getAllArticles } from '@/lib/api/hub';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HubLandingPage() {
  const articles = await getAllArticles();

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-center sm:text-left">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 text-white">
          The Creator Hub
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl font-medium max-w-2xl">
          Techniques, gear reviews, and stories from the Captura community. Read, learn, and shoot better.
        </p>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {articles.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">No stories yet.</h3>
            <p className="text-zinc-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <Link key={article.id} href={`/rental/hub/${article.slug}`}>
                <div className={`
                  group rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 transition-all duration-300 hover:scale-[1.02] hover:border-white/20
                  ${idx === 0 ? 'md:col-span-2 lg:col-span-2 aspect-[16/9] md:aspect-[21/9]' : 'aspect-square md:aspect-[4/3]'}
                `}>
                  <div className="relative w-full h-full">
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-zinc-800">
                      <Image 
                        src={article.image_url || '/placeholder.jpg'} 
                        alt={article.title} 
                        fill 
                        className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                      <div className="mb-3">
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider text-zinc-300">
                          {article.category}
                        </span>
                      </div>
                      <h2 className={`font-bold text-white mb-2 leading-tight ${idx === 0 ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className={`text-zinc-400 font-medium line-clamp-2 ${idx === 0 ? 'text-base sm:text-lg' : 'text-sm'}`}>
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="mt-4 flex items-center text-xs font-extrabold text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                        Read Story
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
