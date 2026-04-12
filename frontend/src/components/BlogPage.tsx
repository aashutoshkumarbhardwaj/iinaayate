import { ArrowLeft, ArrowRight, BookOpenText, Compass, PenLine, Sparkles, Star, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { postAPI, statsAPI, userAPI } from '../utils/api';

interface BlogPageProps {
  onBack: () => void;
  onBlogClick?: (blogId: string) => void;
}

function excerpt(text: string, lines = 3) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, lines)
    .join('\n');
}

function initials(name?: string) {
  const parts = (name || 'U').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
}

function readTime(content?: string) {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 180));
}

function coverFor(title: string, seed: number, subtitle?: string) {
  const palettes = [
    'from-[#111c2d] via-[#23344a] to-[#8e4e14]',
    'from-[#1f3044] via-[#41586e] to-[#f0d2aa]',
    'from-[#141f30] via-[#5f6b78] to-[#f4ecd8]',
    'from-[#162133] via-[#7c4a13] to-[#f2b87c]',
    'from-[#223244] via-[#6f3800] to-[#f6e0c2]',
    'from-[#1a2435] via-[#46505d] to-[#d9c8a8]',
  ];
  const palette = palettes[seed % palettes.length];
  const label = subtitle || 'Journal';

  return (
    <div className={`relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br ${palette}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_55%_70%,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
      <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-white/80 backdrop-blur-sm">
        {label}
      </div>
      <div className="relative z-10 w-full p-5 md:p-6">
        <div className="max-w-[18ch]">
          <p className="font-serif text-[2rem] leading-none text-white md:text-[2.4rem]">
            {title}
          </p>
          <p className="mt-3 text-[0.72rem] leading-6 text-white/78">
            {subtitle || 'A softly lit editorial composition from the current issue.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function JournalNote({
  post,
  index,
  onClick,
}: {
  post: any;
  index: number;
  onClick: () => void;
}) {
  const title = post?.title || excerpt(post?.content || '', 1).split('\n')[0] || 'Untitled note';
  const summary = excerpt(post?.content || '', 2) || 'An editorial note from the current issue.';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[22px] border border-black/8 bg-white p-5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">
            Nov {String(12 - index * 4).padStart(2, '0')}
          </p>
          <h4 className="mt-3 font-serif text-[1.2rem] leading-tight text-[#1b2e45] md:text-[1.35rem]">
            {title}
          </h4>
        </div>
        <span className="rounded-full border border-[#e8ddd1] bg-[#faf7f2] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-[#8e4e14]">
          Note
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-[#5a6572]">
        {summary}
      </p>
      <div className="mt-5 flex items-center justify-between text-[0.72rem] uppercase tracking-[0.22em] text-[#8a7a67]">
        <span>{post?.genre || 'Journal'}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function ManuscriptCard({
  poet,
  onClick,
}: {
  poet: any;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[28px] border border-black/8 bg-white text-left shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
    >
      <div className="p-3 md:p-4">
        <div className="overflow-hidden rounded-[24px] border border-[#efe3d4] bg-[#f7f3ed]">
          <div className="relative aspect-[4/5] md:aspect-[4/5]">
            {poet?.avatar ? (
              <img src={poet.avatar} alt={poet.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2e44] via-[#4a5f75] to-[#8e4e14] text-4xl font-serif text-white md:text-5xl">
                {initials(poet?.name)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-white/12 px-2 py-1 text-[8px] uppercase tracking-[0.24em] text-white backdrop-blur-sm md:left-4 md:top-4 md:px-2.5 md:text-[9px]">
              Manuscript
            </div>
            <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4">
              <div className="max-w-[12ch] rounded-2xl bg-white px-3 py-2 text-[#1b2e45] shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                <p className="font-serif text-[1rem] leading-none md:text-lg">{poet?.name || 'Unknown poet'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4 md:mt-4">
          <div className="min-w-0">
            <h4 className="truncate font-serif text-[1.05rem] text-[#1b2e45] transition-colors group-hover:text-[#8e4e14] md:text-[1.2rem]">
              {poet?.name || 'Unknown poet'}
            </h4>
            <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-[#8a7a67] md:text-[10px] md:tracking-[0.24em]">
              {poet?.username || 'Manuscript'}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-black/8 bg-white px-2 py-1 text-[9px] uppercase tracking-[0.22em] text-[#a36116] md:px-2.5 md:text-[10px] md:tracking-[0.24em]">
            {poet?.followersCount ? `${poet.followersCount.toLocaleString()} followers` : 'Featured'}
          </span>
        </div>
      </div>
    </button>
  );
}

export function BlogPage({ onBack, onBlogClick }: BlogPageProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState<{ totalPoems: number; activePoets: number; newThisWeek: number } | null>(null);
  const [archivePage, setArchivePage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [data, users, community] = await Promise.all([
          postAPI.getPosts({ limit: 48 }).catch(() => []),
          userAPI.getTopUsers().catch(() => []),
          statsAPI.getCommunity().catch(() => null),
        ]);
        if (!mounted) return;
        setPosts(Array.isArray(data) ? data : []);
        setTopUsers(Array.isArray(users) ? users : []);
        setCommunityStats(community);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load journal');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const featured = posts[0];
  const manuscripts = topUsers.slice(0, 3);
  const archivePosts = useMemo(() => posts.slice(1, 8), [posts]);
  const archivePageSize = 4;
  const archivePageCount = Math.max(1, Math.ceil(Math.max(0, archivePosts.length - 2) / archivePageSize));
  const visibleArchivePosts = useMemo(() => {
    const start = archivePage * archivePageSize;
    return archivePosts.slice(start, start + archivePageSize);
  }, [archivePage, archivePosts]);
  const notes = useMemo(() => posts.slice(2, 4), [posts]);
  const manuscriptStories = useMemo(() => {
    return manuscripts.map((poet) => posts.find((post) => post?.user?.id === poet.id) || featured || posts[0]).filter(Boolean);
  }, [featured, manuscripts, posts]);

  useEffect(() => {
    setArchivePage(0);
  }, [posts]);

  const featuredSummary = featured
    ? excerpt(featured.content || '', 4) || 'Exploring the layered history of language, memory, and modern verse.'
    : 'Exploring the layered history of language, memory, and modern verse.';

  return (
    <div className="relative min-h-screen bg-[#fafaf8] text-[#1C1C1E]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(176,132,78,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.05),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(250,250,248,1)_35%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-24">
        <div className="sticky top-0 z-30 -mx-4 mb-8 border-b border-black/5 bg-[#fafaf8]/88 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="-ml-2 rounded-full px-3 text-[#1A2E44] hover:bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#a36116] shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
              <Sparkles className="h-3.5 w-3.5" />
              Journal
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[32px] border border-black/8 bg-white p-12 text-center text-[#6B6B6B] shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
            Loading…
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-12 text-center text-red-700 shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[32px] border border-black/8 bg-white p-12 text-center text-[#6B6B6B] shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
            No journal posts yet.
          </div>
        ) : (
          <>
            <section className="mb-24 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="order-2 lg:order-1 lg:col-span-7">
                <div className="relative overflow-hidden rounded-[32px] border border-black/8 bg-white p-3 shadow-[0_20px_44px_rgba(15,23,42,0.08)]">
                  <div className="overflow-hidden rounded-[26px]">
                    <div className="aspect-[4/3] md:aspect-[16/9]">
                      {coverFor(featured?.title || 'Lekh', 0, featured?.genre || 'Volume IV')}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 z-20 max-w-[12rem] rounded-[18px] border border-[#efdcc7] bg-[#f6b06d] px-4 py-4 text-[#2f1400] shadow-[0_14px_28px_rgba(15,23,42,0.12)]">
                    <p className="font-label text-[10px] uppercase tracking-[0.28em]">Featured issue</p>
                    <p className="mt-2 font-serif text-lg leading-tight">
                      {formatDate(featured?.createdAt) || 'This week'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-5">
                <p className="font-label text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">
                  Volume {communityStats ? `IV • ${communityStats.totalPoems.toLocaleString()} poems` : 'IV • Winter 2024'}
                </p>
                <h1 className="mt-4 font-serif text-[3.1rem] leading-[0.94] text-[#1C1C1E] md:text-[4.6rem]">
                  {featured?.title || 'काव्य की अनकही दास्ताँ'}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-[0.88rem] text-[#6B6B6B]">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {communityStats ? communityStats.activePoets.toLocaleString() : topUsers.length} poets
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpenText className="h-4 w-4" />
                    {readTime(featured?.content)} min read
                  </span>
                </div>
                <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-[#6B6B6B]">
                  {featuredSummary}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button
                    className="rounded-full bg-[#1A2E44] px-6 text-white hover:bg-[#132235]"
                    onClick={() => featured?.id && onBlogClick?.(featured.id)}
                    disabled={!featured}
                  >
                    READ THE FULL JOURNAL
                  </Button>
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#8a7a67]">
                    <span className="h-px w-12 bg-[#d9c8a8]" />
                    Editorial archive
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-24">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Manuscripts</p>
                  <h2 className="mt-2 font-serif text-[2rem] text-[#1C1C1E] md:text-[3.1rem]">The Great Masters</h2>
                </div>
                <button
                  type="button"
                  className="hidden items-center gap-2 border-b border-black/10 pb-1 text-[10px] uppercase tracking-[0.28em] text-[#6B6B6B] transition-colors hover:text-[#a36116] md:flex"
                  onClick={() => featured?.id && onBlogClick?.(featured.id)}
                >
                  View series
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {manuscripts.map((poet, index) => (
                  <ManuscriptCard
                    key={poet.id}
                    poet={poet}
                    onClick={() => onBlogClick?.(manuscriptStories[index]?.id || featured?.id || posts[0]?.id)}
                  />
                ))}
              </div>
            </section>

            <section className="mb-24 rounded-[34px] bg-[#0F172A] px-5 py-8 text-white shadow-[0_22px_52px_rgba(15,23,42,0.2)] md:px-8 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.35em] text-[#f4a261]">The Inkwell</p>
                  <h2 className="mt-3 font-serif text-[2.1rem] leading-tight text-white md:text-[3.2rem]">
                    Editor&apos;s Notes on <span className="italic text-[#f4a261]">Atmosphere</span>
                  </h2>
                  <p className="mt-5 max-w-xl text-[1rem] leading-8 text-white/78 md:text-[1.03rem]">
                    A quieter section for observation, criticism, and the slow-blooming kind of writing that lingers after the page is closed.
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/55">
                    <PenLine className="h-4 w-4 text-[#f4a261]" />
                    Editorial desk
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {notes.length > 0 ? notes.map((post, index) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => onBlogClick?.(post.id)}
                      className="rounded-[24px] border border-black/8 bg-[#f8f5f0] p-5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[#a36116]">
                        {formatDate(post.createdAt) || `Nov ${12 - index * 4}`}
                      </p>
                      <h3 className="mt-3 font-serif text-[1.3rem] leading-tight text-[#1C1C1E]">
                        {post.title || 'Untitled'}
                      </h3>
                      <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#6B6B6B]">
                        {excerpt(post.content || '', 3) || 'A compact editorial note from the journal desk.'}
                      </p>
                    </button>
                  )) : (
                    <>
                      <div className="rounded-[24px] border border-black/8 bg-[#f8f5f0] p-5 text-sm text-[#6B6B6B] shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                        Editorial notes are on their way.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="mb-24">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Archive</p>
                  <h2 className="mt-2 font-serif text-[2rem] text-[#1C1C1E] md:text-[3rem]">The Archive</h2>
                </div>
                <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#6B6B6B] md:flex">
                  <Compass className="h-4 w-4 text-[#b98a5c]" />
                  Latest articles
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:auto-rows-[280px]">
                {visibleArchivePosts[0] && (
                  <button
                    type="button"
                    onClick={() => onBlogClick?.(visibleArchivePosts[0].id)}
                    className="group relative overflow-hidden rounded-[30px] border border-black/8 bg-[#0F172A] text-left text-white shadow-[0_22px_52px_rgba(15,23,42,0.2)] lg:col-span-2 lg:row-span-2"
                  >
                    <div className="absolute inset-0">
                      {coverFor(visibleArchivePosts[0].title || 'Archive', 1, visibleArchivePosts[0].genre || 'Essays')}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08111f] via-[#08111f]/25 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
                      <p className="text-[9px] uppercase tracking-[0.32em] text-[#f4a261] md:text-[10px] md:tracking-[0.35em]">
                        Essays / {visibleArchivePosts[0].genre || 'Journal'}
                      </p>
                      <h3 className="mt-4 max-w-xl font-serif text-[1.5rem] leading-[1.08] md:text-[2.1rem] lg:text-[2.35rem]">
                        {visibleArchivePosts[0].title}
                      </h3>
                      <p className="mt-4 max-w-md text-[0.92rem] leading-7 text-white/76 md:text-sm">
                        {excerpt(visibleArchivePosts[0].content || '', 3)}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/68">
                        <TrendingUp className="h-4 w-4 text-[#f4a261]" />
                        {visibleArchivePosts[0].user?.name || 'Editor pick'}
                      </div>
                    </div>
                  </button>
                )}

                {visibleArchivePosts[1] && (
                  <button
                    type="button"
                    onClick={() => onBlogClick?.(visibleArchivePosts[1].id)}
                    className="group rounded-[30px] border border-black/8 bg-white p-6 text-left shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:col-span-2"
                  >
                    <div className="flex h-full flex-col justify-between gap-6">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] uppercase tracking-[0.32em] text-[#b98a5c] md:text-[10px] md:tracking-[0.35em]">Profiles</p>
                        <Star className="h-4 w-4 text-[#a36116]" />
                      </div>
                      <div>
                        <h3 className="max-w-xl font-serif text-[1.45rem] leading-tight text-[#1C1C1E] md:text-[2.2rem]">
                          {visibleArchivePosts[1].title}
                        </h3>
                        <p className="mt-3 max-w-xl text-[0.92rem] leading-7 text-[#6B6B6B] md:text-sm">
                          {excerpt(visibleArchivePosts[1].content || '', 3)}
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {visibleArchivePosts.slice(2, 4).map((post, index) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => onBlogClick?.(post.id)}
                    className={`group rounded-[30px] border border-black/8 p-6 text-left shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${
                      index === 0 ? 'bg-[#f6b06d]' : 'bg-white'
                    }`}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] uppercase tracking-[0.32em] text-[#b98a5c] md:text-[10px] md:tracking-[0.35em]">
                          {post.genre || 'Feature'}
                        </p>
                        <ArrowRight className="h-4 w-4 text-[#a36116] transition-transform group-hover:translate-x-1" />
                      </div>
                      <div>
                        <h3 className={`font-serif text-[1.2rem] leading-tight md:text-[1.45rem] ${index === 0 ? 'text-[#2f1400]' : 'text-[#1C1C1E]'}`}>
                          {post.title}
                        </h3>
                        <p className={`mt-3 text-[0.92rem] leading-7 md:text-sm ${index === 0 ? 'text-[#2f1400]/78' : 'text-[#6B6B6B]'}`}>
                          {excerpt(post.content || '', 2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {archivePageCount > 1 && (
                <div className="mt-6 flex justify-center px-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full max-w-[240px] rounded-full border-black/8 bg-white px-5 text-[#1C1C1E] hover:bg-[#faf9f6] sm:w-auto"
                    onClick={() => setArchivePage((page) => (page + 1) % archivePageCount)}
                  >
                    Next articles
                  </Button>
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-black/8 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Quick stats</p>
                  <h3 className="mt-2 font-serif text-[1.7rem] text-[#1C1C1E]">A living archive, refreshed with every post.</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-[18px] border border-black/8 bg-[#faf9f6] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#b98a5c]">Posts</p>
                    <p className="mt-2 font-serif text-xl text-[#1C1C1E]">{posts.length.toLocaleString()}</p>
                  </div>
                  <div className="rounded-[18px] border border-black/8 bg-[#faf9f6] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#b98a5c]">Poets</p>
                    <p className="mt-2 font-serif text-xl text-[#1C1C1E]">{topUsers.length.toLocaleString()}</p>
                  </div>
                  <div className="rounded-[18px] border border-black/8 bg-[#faf9f6] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#b98a5c]">Reads</p>
                    <p className="mt-2 font-serif text-xl text-[#1C1C1E]">{communityStats ? communityStats.totalPoems.toLocaleString() : '—'}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
