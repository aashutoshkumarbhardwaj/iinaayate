import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useEffect, useMemo, useState } from 'react';
import { postAPI } from '../utils/api';

interface BlogPageProps {
  onBack: () => void;
  onBlogClick?: (blogId: string) => void;
}

// Data is fetched from backend posts API; no hardcoded content.

export function BlogPage({ onBack, onBlogClick }: BlogPageProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await postAPI.getPosts({ limit: 60 });
        if (mounted) setPosts(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load blog posts');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);
  const coverFor = (title: string) =>
    `https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&auto=format&fit=crop&w=1600&h=900&ixlib=rb-4.0.3&sat=-10&blend=111827&blend-mode=normal&txt=${encodeURIComponent(
      title,
    )}`;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) if (p.genre) set.add(p.genre);
    return ['All', ...Array.from(set)];
  }, [posts]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const base = rest;
    if (selectedCat === 'All') return base;
    return base.filter((p) => p.genre === selectedCat);
  }, [rest, selectedCat]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-stone-50/40">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Loading / error states */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">Loading…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200 text-red-700">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No blog posts yet.</p>
          </div>
        ) : (
          <>
            {/* Featured hero */}
            {featured && (
              <button
                onClick={() => onBlogClick?.(featured.id)}
                className="relative w-full overflow-hidden rounded-3xl group ring-1 ring-black/5 mb-6"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <img src={coverFor(featured.title)} alt={featured.title} className="w-full h-[360px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="px-8 md:px-12">
                    <h2 className="text-white text-3xl md:text-4xl font-serif max-w-2xl mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      {featured.title}
                    </h2>
                    {featured.user?.name && (
                      <p className="text-white/85 mb-4">By {featured.user.name}</p>
                    )}
                    <Button className="bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-full px-5">
                      Read More
                    </Button>
                  </div>
                </div>
              </button>
            )}

            {/* Categories */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCat(c);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    selectedCat === c
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

        {/* Articles grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <button
              key={post.id}
              onClick={() => onBlogClick?.(post.id)}
              className="text-left group"
            >
              <div className="rounded-2xl overflow-hidden mb-3">
                <img src={coverFor(post.title)} alt={post.title} className="w-full h-44 object-cover" />
              </div>
              <h3 className="text-lg text-gray-900 mb-1 group-hover:text-amber-700 transition-colors">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                  <AvatarFallback>{post.user?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <span className="truncate">{post.user?.name ?? 'Unknown'}</span>
                <span className="opacity-40">•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : ''}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{(post.content || '').split('\n').join(' ')}</p>
            </button>
          ))}
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 bg-white"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).slice(0, 8).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-full text-sm font-medium ${
                    page === n ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {n}
                </button>
              );
            })}
            {totalPages > 8 && <span className="px-2 text-gray-500">…</span>}
            <button
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 bg-white"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
