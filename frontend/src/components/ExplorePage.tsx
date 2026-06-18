import { TrendingUp, Users, Hash, Star, Headphones, Compass, Mic2, ChevronDown, ShoppingBag, Feather, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { genresAPI, postAPI, userAPI, statsAPI } from '../utils/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostCard } from './PostCard';
import { Helmet } from 'react-helmet-async';

interface ExplorePageProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onDailyPoemClick?: () => void;
  onNavigate?: (page: string) => void;
}

export function ExplorePage({ onPostClick, onUserClick, onDailyPoemClick, onNavigate }: ExplorePageProps) {
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [topAuthors, setTopAuthors] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalPoems: number; activePoets: number; newThisWeek: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [showMoodChips, setShowMoodChips] = useState(false);
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [genreCounts, setGenreCounts] = useState<Array<{ genre: string; count: number }>>([]);
  const derivedStats = useMemo(() => {
    if (!feedPosts || feedPosts.length === 0) return null;
    const totalPoems = feedPosts.length;
    const uniqueUsers = new Set<string>();
    let newThisWeek = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const p of feedPosts) {
      if (p.userId) uniqueUsers.add(p.userId);
      const ts = p.createdAt ? new Date(p.createdAt).getTime() : 0;
      if (ts >= weekAgo) newThisWeek += 1;
    }
    return { totalPoems, activePoets: uniqueUsers.size, newThisWeek };
  }, [feedPosts]);

  // Initial and filter-changed load: reset and fetch first page
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setOffset(0);
        setHasMore(true);
        const [topPosts, firstPage, users, community, genreData] = await Promise.all([
          postAPI.getTopPosts(),
          postAPI.getPosts({ limit, offset: 0, hasAudio: audioOnly, mood: moodFilter || undefined }),
          userAPI.getTopUsers(),
          statsAPI.getCommunity().catch(() => null),
          genresAPI.get().catch(() => ({ genres: [] })),
        ]);
        if (mounted) {
          setTrendingPosts(topPosts);
          setFeedPosts(firstPage);
          setTopAuthors(users);
          if (community) setStats(community);
          setGenreCounts((genreData as any)?.genres ?? []);
          setHasMore(Array.isArray(firstPage) && firstPage.length === limit);
          setOffset(limit);
        }
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [audioOnly, moodFilter, limit]);

  // Independent stats fetch with retry so it's not tied to feed filters
  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        let attempts = 0;
        let result: any = null;
        while (attempts < 3 && !result) {
          try {
            result = await statsAPI.getCommunity();
          } catch {
            attempts += 1;
            await new Promise((r) => setTimeout(r, 500 * attempts));
          }
        }
        if (mounted && result) setStats(result);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  // Load more handler
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = await postAPI.getPosts({ limit, offset, hasAudio: audioOnly, mood: moodFilter || undefined });
      setFeedPosts((prev) => [...prev, ...next]);
      setHasMore(Array.isArray(next) && next.length === limit);
      setOffset((o) => o + limit);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const genres = useMemo(() => {
    const map = new Map<string, { count: number; totalLikes: number }>();
    for (const p of feedPosts) {
      const key = p.genre || 'Other';
      const likes = p._count?.likes ?? 0;
      const entry = map.get(key) || { count: 0, totalLikes: 0 };
      entry.count += 1;
      entry.totalLikes += likes;
      map.set(key, entry);
    }
    return Array.from(map.entries()).map(([name, stats]) => ({ name, ...stats }));
  }, [feedPosts]);

  const topTags = useMemo(() => {
    return [...genres]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((g) => `#${g.name.toLowerCase()}`);
  }, [genres]);

  const moods = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of feedPosts) {
      const mood = p.mood?.trim();
      if (!mood) continue;
      map.set(mood, (map.get(mood) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  }, [feedPosts]);

  // Helper to format counts like "1.2k", "56k"
  function formatGenreCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  }

  // Lookup count for a genre from DB data
  function getGenreCount(name: string): string {
    const entry = genreCounts.find(
      (g) => g.genre.toLowerCase() === name.toLowerCase()
    );
    return entry ? formatGenreCount(entry.count) : '—';
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-app">
      <div className="relative">
      <Helmet>
        <title>Explore Poetry – iinaayate</title>
        <meta name="description" content="Discover trending poems, top poets, genres, and moods on iinaayate. Explore Hindi, Urdu, and Hinglish shayari." />
        <link rel="canonical" href="/explore" />
        <meta property="og:title" content="Explore Poetry – iinaayate" />
        <meta property="og:description" content="Trending poems, top poets, and genres in Hindi, Urdu, and Hinglish." />
      </Helmet>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#8e4e14] shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Explore iinaayate
          </div>
          <h1 className="font-serif text-4xl text-[#1a2e44] md:text-5xl lg:text-[3.6rem]">
            Discover poetry with more depth
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f6b78] md:text-lg">
            Discover trending poems, top poets, and vibrant communities
          </p>
        </div>

        {/* Explore Bento Grid */}
        <section className="mb-10 overflow-hidden rounded-[36px] border border-white/70 bg-white/55 p-4 shadow-[0_24px_60px_rgba(26,46,68,0.08)] backdrop-blur-md lg:p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Explore grid</p>
              <h2 className="mt-2 font-serif text-2xl text-[#03192e]">Explore iinaayate</h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-[#5f6b78] md:block">
              A denser, more editorial layout for the same paths, tuned to feel sharper, calmer, and easier to scan.
            </p>
          </div>

          <div className="grid grid-cols-2 auto-rows-[180px] gap-3 md:grid-cols-4 md:auto-rows-[minmax(112px,auto)] md:gap-4 [grid-auto-flow:dense]">
            <button
              type="button"
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#fffaf0] via-[#fffdf9] to-[#f4e6d6] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:col-span-2 md:row-span-2 md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(255,255,255,0)_55%)]" aria-hidden="true" />
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[#f3d7b8]/90" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#8e4e14]">Sher</p>
                    <p
                      className="mt-4 bg-gradient-to-br from-[#1a2e44] via-[#8e4e14] to-[#f4a261] bg-clip-text font-serif text-[3rem] leading-none text-transparent md:text-[3.9rem]"
                    >
                      {getGenreCount('Sher')}
                    </p>
                  </div>
                  <div className="rounded-full border border-[#eadfce] bg-white/85 p-3 text-[#8e4e14] shadow-[0_12px_24px_rgba(26,46,68,0.08)]">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="max-w-[12rem] text-sm leading-6 text-[#4b5968]">
                    The strongest pulse from the feed, framed with a quieter, more premium read.
                  </p>
                  <span className="rounded-full border border-[#eadfce] bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[#8e4e14] shadow-sm">
                    Live
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#fff1f6] via-[#fffdf9] to-[#f8e5ee] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_55%)]" aria-hidden="true" />
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#efbfd0]/90" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#b65f86]">Ghazal</p>
                  <p className="mt-4 font-serif text-[2.15rem] leading-none text-[#1a2e44]">{getGenreCount('Ghazal')}</p>
                </div>
                <p className="text-sm leading-6 text-[#4b5968]">Romantic, layered, and easy to scan at a glance.</p>
              </div>
            </button>

            <button
              type="button"
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#fff6df] via-[#fffdf9] to-[#f8e7bc] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(255,255,255,0)_58%)]" aria-hidden="true" />
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f0cd6f]/90" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#9a6b13]">Nazm</p>
                  <p className="mt-4 font-serif text-[2.15rem] leading-none text-[#1a2e44]">{getGenreCount('Nazm')}</p>
                </div>
                <p className="text-sm leading-6 text-[#4b5968]">Compact, contemporary, and visually anchored.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setAudioOnly(true); setMoodFilter(null); }}
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#f4ecff] via-[#fffdf9] to-[#e9dcff] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:col-span-2 md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_58%)]" aria-hidden="true" />
              <div className="relative flex h-full items-start justify-between gap-4">
                <div className="max-w-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-[#7b4fe0] shadow-[0_12px_24px_rgba(26,46,68,0.08)] ring-1 ring-[#ead9c8]">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#7b4fe0]">Poetry audios</p>
                  <p className="mt-3 text-sm leading-6 text-[#4b5968]">
                    Listen-first discovery, styled to feel more like a feature tile than a shortcut.
                  </p>
                </div>
                <div className="mt-auto rounded-full border border-[#eadfce] bg-white/85 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[#8e4e14] shadow-sm">
                  Audio
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('writers')}
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#eef8ef] via-[#fffdf9] to-[#dff0e3] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%)]" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-[#3d7a4d] shadow-[0_12px_24px_rgba(26,46,68,0.08)] ring-1 ring-[#dfeadf]">
                    <Compass className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-[#6b7d6d]">Writers</span>
                </div>
                <p className="text-sm leading-6 text-[#4b5968]">A direct route into creator profiles and voices.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('events')}
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#eaf4ff] via-[#fffdf9] to-[#dce9fb] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%)]" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-[#2f6fbf] shadow-[0_12px_24px_rgba(26,46,68,0.08)] ring-1 ring-[#d8e5f6]">
                    <Mic2 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-[#5b7092]">Events</span>
                </div>
                <p className="text-sm leading-6 text-[#4b5968]">Live shayari moments, kept concise and prominent.</p>
              </div>
            </button>

            <div className="group relative overflow-hidden rounded-[28px] border border-[#e8ddd1] bg-gradient-to-br from-[#f7f7f7] via-[#fffdfa] to-[#eef0f3] p-5 text-left shadow-[0_10px_28px_rgba(26,46,68,0.05)] transition-all duration-300 md:col-span-2 md:p-6">
              <div className="relative flex h-full flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setShowMoodChips((s) => !s)}
                  className="flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#7a7f87]">Moods</p>
                    <p className="mt-2 text-sm leading-6 text-[#4b5968]">Filter by feeling without overwhelming the layout.</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-[#7a7f87] transition-transform ${showMoodChips ? 'rotate-180' : ''}`} />
                </button>
                {showMoodChips && (
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <button
                        key={m.mood}
                        onClick={() => { setMoodFilter(m.mood); setAudioOnly(false); }}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${moodFilter === m.mood ? 'border-[#8e4e14] bg-[#8e4e14] text-white shadow-sm' : 'border-[#e8ddd1] bg-white text-[#46505d] hover:border-[#d7c6b3] hover:bg-[#faf7f2]'}`}
                        title={`${m.count} posts`}
                      >
                        {m.mood}
                      </button>
                    ))}
                    {moods.length === 0 && (
                      <span className="text-sm text-[#7a7f87]">No moods yet</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#fff1e5] via-[#fffdf9] to-[#f5dfcb] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%)]" aria-hidden="true" />
              <div className="relative flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-[#c47a34] shadow-[0_12px_24px_rgba(26,46,68,0.08)] ring-1 ring-[#ead9cb]">
                    <Feather className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-[#9a6b13]">Sher Swipe</span>
                </div>
                <p className="text-sm leading-6 text-[#4b5968]">A clean swipe surface for quicker poem discovery.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('blog')}
              className="group relative h-full overflow-hidden rounded-[28px] border border-[#ead9c8] bg-gradient-to-br from-[#fbeef3] via-[#fffdf9] to-[#f7dfe8] p-5 text-left shadow-[0_22px_50px_rgba(26,46,68,0.08)] ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(26,46,68,0.14)] md:h-auto md:p-6"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%)]" aria-hidden="true" />
              <div className="relative flex h-full items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#b56a8c]">Blog</p>
                  <p className="mt-2 text-sm leading-6 text-[#4b5968]">Editorial reading, grouped into a tighter, more premium card.</p>
                </div>
                <Feather className="h-5 w-5 text-[#7d8794] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </button>
          </div>
        </section>

        {/* Featured Daily Poem Banner */}
        <button
          onClick={onDailyPoemClick}
          className="mb-8 w-full overflow-hidden rounded-[28px] border border-[#e8ddd1] bg-gradient-to-r from-[#f4a261] via-[#e66f87] to-[#8f6cf7] p-6 text-left text-white shadow-[0_14px_36px_rgba(26,46,68,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(26,46,68,0.18)] md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-7 w-7 fill-current" />
              <div>
                <h2 className="font-serif text-2xl md:text-3xl">Poem of the Day</h2>
                <p className="mt-1 text-sm leading-6 text-white/85 md:text-base">
                  Discover today's featured poem selected by our community
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/90">
              Featured
            </span>
          </div>
        </button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trending & Filters */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full bg-white border border-gray-200 rounded-xl p-1 mb-6">
                <TabsTrigger value="all" className="flex-1">
                  <Hash className="w-4 h-4 mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="genres" className="flex-1">
                  <Hash className="w-4 h-4 mr-2" />
                  By Genre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {feedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostClick={onPostClick}
                    onUserClick={onUserClick}
                  />
                ))}
                <div className="mt-2 flex justify-center">
                  <Button onClick={loadMore} disabled={loading || !hasMore} className="min-w-[160px]">
                    {loading ? 'Loading…' : hasMore ? 'Next page' : 'No more poems'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                {trendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostClick={onPostClick}
                    onUserClick={onUserClick}
                  />
                ))}
                {/* Load More for Trending uses main feed below in Genres tab; keep actions in one place */}
              </TabsContent>

              <TabsContent value="genres">
                <div className="grid md:grid-cols-2 gap-4">
                  {genres.map((g) => (
                    <button
                      key={g.name}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">
                          {g.name}
                        </Badge>
                        <Hash className="w-5 h-5 text-gray-400 group-hover:text-rose-400 transition-colors" />
                      </div>
                      <p className="text-gray-600 mb-2">
                        {g.count} poems
                      </p>
                      <p className="text-sm text-gray-500">
                        {g.totalLikes} total likes
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button onClick={loadMore} disabled={loading || !hasMore} className="min-w-[160px]">
                    {loading ? 'Loading…' : hasMore ? 'Next page' : 'No more poems'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Premium, Bookmarks & More */}
          <div className="hidden space-y-6 lg:block">
            {/* Premium Card */}
            <div className="bg-gray-900 rounded-2xl border-2 border-amber-400 p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Feather className="w-12 h-12 text-amber-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Starting ₹7 /week</p>
              <h3 className="text-2xl text-white mb-6">Unlimited coins<br/>
                <span className="text-lg text-gray-400">with iinaayate Pro</span>
              </h3>
              <Button className="bg-amber-400 hover:bg-amber-500 text-gray-900">
                Start trial
              </Button>
            </div>

            {/* Shayari Bookmarks */}
            <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-2xl text-gray-900 mb-2" style={{ fontFamily: 'cursive' }}>
                Shayari<br/>Bookmarks
              </h3>
              <p className="text-gray-700 text-sm mb-4">Starting from ₹19</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Buy Now
              </Button>
            </div>

            {/* Top Authors */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl text-gray-900">
                  Top Poets
                </h2>
              </div>
              <div className="space-y-4">
                {topAuthors.map((author, index) => (
                  <button
                    key={author.id}
                    onClick={() => onUserClick(author.id)}
                    className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="text-gray-400 w-6">
                      #{index + 1}
                    </div>
                    <Avatar className="w-10 h-10 ring-2 ring-rose-100">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900">{author.name}</p>
                      <p className="text-sm text-gray-500">{(author.followersCount ?? author._count?.followers ?? 0).toLocaleString()} followers</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags (from DB genres) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl text-gray-900">
                  Popular Tags
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm hover:bg-rose-100 transition-colors border border-rose-100"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl p-6">
              <h3 className="text-lg text-gray-900 mb-4">
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Poems</span>
                  <span className="text-gray-900">{stats ? stats.totalPoems.toLocaleString() : (statsLoading ? 'Loading…' : '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Active Poets</span>
                  <span className="text-gray-900">{stats ? stats.activePoets.toLocaleString() : (statsLoading ? 'Loading…' : '—')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">This Week</span>
                  <span className="text-gray-900">{stats ? `${stats.newThisWeek.toLocaleString()} new poems` : (statsLoading ? 'Loading…' : '—')}</span>
                </div>
                {!stats && !statsLoading && (
                  <div className="pt-2">
                    <Button size="sm" variant="secondary" onClick={async () => {
                      setStatsLoading(true);
                      try { const s = await statsAPI.getCommunity(); setStats(s); } finally { setStatsLoading(false); }
                    }}>Retry</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
