import { ArrowLeft, SlidersHorizontal, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { postAPI, statsAPI, userAPI } from '../utils/api';

interface WritersPageProps {
  onBack: () => void;
  onUserClick: (userId: string) => void;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function initials(name?: string) {
  const parts = (name || 'U').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

export function WritersPage({ onBack, onUserClick }: WritersPageProps) {
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [writers, setWriters] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState(11);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [topPoets, setTopPoets] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState<{ totalPoems: number; activePoets: number; newThisWeek: number } | null>(null);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  // Initial load and when filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setOffset(0);
        setHasMore(true);
        const resp = await userAPI.listUsers({ limit, offset: 0, sort: sortBy as any, startsWith: selectedLetter || undefined });
        if (!mounted) return;
        const first = Array.isArray(resp?.users) ? resp.users : resp;
        const tot = typeof resp?.total === 'number' ? resp.total : first.length;
        setWriters(first);
        setTotal(tot);
        setHasMore(first.length > 0 && (first.length + 0) < tot);
        setOffset(first.length);
      } catch {
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sortBy, selectedLetter, limit]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [topUsers, community, topPosts] = await Promise.all([
          userAPI.getTopUsers().catch(() => []),
          statsAPI.getCommunity().catch(() => null),
          postAPI.getTopPosts().catch(() => []),
        ]);
        if (!mounted) return;
        setTopPoets(Array.isArray(topUsers) ? topUsers : []);
        setCommunityStats(community);
        const tagCounts = new Map<string, number>();
        for (const post of Array.isArray(topPosts) ? topPosts : []) {
          const tag = post?.genre || 'Other';
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
        setPopularTags(
          Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name)
        );
      } catch {
        if (mounted) {
          setTopPoets([]);
          setCommunityStats(null);
          setPopularTags([]);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const resp = await userAPI.listUsers({ limit, offset, sort: sortBy as any, startsWith: selectedLetter || undefined });
      const next = Array.isArray(resp?.users) ? resp.users : resp;
      setWriters((prev) => [...prev, ...next]);
      const newTotal = typeof resp?.total === 'number' ? resp.total : total;
      const newOffset = offset + next.length;
      setHasMore(newOffset < newTotal);
      setOffset(newOffset);
      if (typeof resp?.total === 'number') setTotal(resp.total);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Data already comes filtered/sorted from backend
  const sortedWriters = writers;
  const featuredWriter = topPoets[0] || sortedWriters[0];
  const mobileWriters = sortedWriters.slice(0, 5);

  // Card background colors - soft pastels
  const cardColors = [
    'bg-rose-50/50',
    'bg-blue-50/50',
    'bg-amber-50/50',
    'bg-purple-50/50',
    'bg-green-50/50',
    'bg-pink-50/50',
  ];

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="md:hidden">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="-ml-2 rounded-full px-3 text-[#1A2E44] hover:bg-white/70">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dcc8] bg-white/90 text-[#1A2E44] shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <section className="rounded-[32px] border border-[#e7dcc8] bg-white/82 p-5 shadow-[0_16px_36px_rgba(26,46,68,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#b98a5c]">Writers</p>
                <h1 className="mt-2 font-serif text-[2.8rem] leading-[0.95] text-[#1a2e44]">लेखक</h1>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eadfce] bg-[#1a2e44] text-white shadow-sm">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
            <p className="mt-4 max-w-[20rem] text-sm leading-7 text-[#5f6b78]">
              Minimal portraits, quieter motion, and a calmer reading flow.
            </p>
          </section>

          <section className="mt-4 rounded-[28px] border border-[#eadfce] bg-white/82 p-4 shadow-[0_12px_28px_rgba(26,46,68,0.06)] backdrop-blur-md">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[20px] border border-[#efe2d0] bg-[#fbfaf7] px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#b98a5c]">Poets</p>
                <p className="mt-2 text-xl font-serif text-[#1a2e44]">{topPoets.length || '—'}</p>
              </div>
              <div className="rounded-[20px] border border-[#efe2d0] bg-[#fbfaf7] px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#b98a5c]">Poems</p>
                <p className="mt-2 text-xl font-serif text-[#1a2e44]">{communityStats ? communityStats.totalPoems.toLocaleString() : '—'}</p>
              </div>
              <div className="rounded-[20px] border border-[#efe2d0] bg-[#fbfaf7] px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#b98a5c]">Tags</p>
                <p className="mt-2 text-xl font-serif text-[#1a2e44]">{popularTags.length || '—'}</p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[28px] border border-[#d9c8a8] bg-[#081b39] p-5 text-white shadow-[0_18px_40px_rgba(8,27,57,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/55">Poet of the month</p>
                <h2 className="mt-2 font-serif text-[2rem] leading-none">
                  {featuredWriter?.name || 'अमृता प्रीतम'}
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[#f4a261]">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
            <blockquote className="mt-4 rounded-2xl border-l-2 border-[#f4a261] bg-white/5 p-4 text-sm leading-7 italic text-white/84">
              “अल्फ़ाज़ वही चमकते हैं, जिनमें दिल की रौशनी हो।”
            </blockquote>
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                className="bg-[#a36116] text-white hover:bg-[#8e4e14]"
                onClick={() => featuredWriter?.id && onUserClick(featuredWriter.id)}
              >
                Follow
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={() => featuredWriter?.id && onUserClick(featuredWriter.id)}
              >
                Works
              </Button>
            </div>
          </section>

          <div className="mt-4 grid gap-3">
            {mobileWriters.map((writer, index) => (
              <button
                key={writer.id}
                type="button"
                onClick={() => onUserClick(writer.id)}
                className={`${cardColors[index % cardColors.length]} w-full rounded-[24px] border border-[#eadfce] p-4 text-left shadow-[0_10px_24px_rgba(26,46,68,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(26,46,68,0.1)]`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0 rounded-2xl border border-white bg-white shadow-sm">
                    <AvatarImage src={writer.avatar || ''} alt={writer.name} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[#1a2e44] to-[#8e4e14] text-sm text-white">
                      {initials(writer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-[1.15rem] text-[#091a35]">{writer.name}</h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#8a7a67]">
                          {writer.username || 'Poet'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#eadfce] bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-[#8e4e14]">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#5f6b78]">
                      {(writer.followersCount ?? 0).toLocaleString()} followers
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-[#eadfce] bg-white/82 p-4 shadow-[0_12px_28px_rgba(26,46,68,0.06)] backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Popular tags</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularTags.length > 0 ? (
                popularTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#eadfce] bg-[#faf7f2] px-3 py-1 text-xs text-[#46505d]"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#6b7580]">No tags yet</span>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-center pb-4">
            {hasMore ? (
              <Button
                onClick={loadMore}
                disabled={loading}
                className="min-w-[180px] rounded-full bg-[#1A2E44] text-white hover:bg-[#132235]"
              >
                {loading ? 'Loading…' : 'Next page'}
              </Button>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#8a7a67]">
                No more writers
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2 text-[#1A2E44] hover:bg-white/70">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-[#eadfce] bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#8e4e14] shadow-sm backdrop-blur-sm">
              Writers
            </div>
            <h1 className="font-serif text-5xl text-[#1a2e44]">Writers</h1>
            <p className="mt-3 text-sm text-[#6b7580]">{total.toLocaleString()} writers</p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f6b78]">
              Discover talented poets and their beautiful works.
            </p>
          </div>

          <div className="mb-8 grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[28px] border border-[#eadfce] bg-white/80 p-5 shadow-[0_14px_32px_rgba(26,46,68,0.06)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Sort</p>
                  <h2 className="mt-2 font-serif text-2xl text-[#1a2e44]">Refine the view</h2>
                </div>
                <Button variant="outline" className="rounded-full border-[#e8ddd1] bg-white/80 text-[#1a2e44] hover:bg-[#faf7f2]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter by letter
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] rounded-full border-[#e8ddd1] bg-white text-[#1a2e44]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                      !selectedLetter
                        ? 'border-[#8e4e14] bg-[#8e4e14] text-white'
                        : 'border-[#e8ddd1] bg-white text-[#46505d] hover:bg-[#faf7f2]'
                    }`}
                  >
                    All
                  </button>
                  {alphabet.slice(0, 10).map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                        selectedLetter === letter
                          ? 'border-[#8e4e14] bg-[#8e4e14] text-white'
                          : 'border-[#e8ddd1] bg-white text-[#46505d] hover:bg-[#faf7f2]'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-[#eadfce] bg-white/80 p-5 shadow-[0_14px_32px_rgba(26,46,68,0.06)] backdrop-blur-sm sm:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Top poets</p>
                <div className="mt-4 grid gap-3">
                  {topPoets.slice(0, 3).map((writer, index) => (
                    <button
                      key={writer.id}
                      onClick={() => onUserClick(writer.id)}
                      className="flex w-full items-center gap-3 rounded-[22px] border border-[#f0e6d7] bg-[#fbfaf7] px-4 py-3 text-left transition-colors hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a2e44] text-xs text-white">
                        #{index + 1}
                      </div>
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={writer.avatar || ''} alt={writer.name} />
                        <AvatarFallback>{(writer.name || 'U')[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1a2e44]">{writer.name}</p>
                        <p className="text-xs text-[#6b7580]">{(writer.followersCount ?? 0).toLocaleString()} followers</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eadfce] bg-white/80 p-5 shadow-[0_14px_32px_rgba(26,46,68,0.06)] backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Community</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b7580]">Poems</span>
                    <span className="text-sm text-[#1a2e44]">{communityStats ? communityStats.totalPoems.toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b7580]">Poets</span>
                    <span className="text-sm text-[#1a2e44]">{communityStats ? communityStats.activePoets.toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b7580]">This week</span>
                    <span className="text-sm text-[#1a2e44]">{communityStats ? communityStats.newThisWeek.toLocaleString() : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eadfce] bg-white/80 p-5 shadow-[0_14px_32px_rgba(26,46,68,0.06)] backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Tags</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {popularTags.length > 0 ? (
                    popularTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#eadfce] bg-[#faf7f2] px-3 py-1 text-xs text-[#46505d]"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#6b7580]">No tags yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Writers Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedWriters.map((writer, index) => (
              <button
                key={writer.id}
                onClick={() => onUserClick(writer.id)}
                className={`${cardColors[index % cardColors.length]} group overflow-hidden rounded-[28px] border border-[#eadfce] p-5 text-left shadow-[0_12px_30px_rgba(26,46,68,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(26,46,68,0.1)]`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-2xl border border-white bg-white shadow-sm">
                      <AvatarImage
                        src={writer.avatar || ''}
                        alt={writer.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[#1a2e44] to-[#8e4e14] text-sm text-white">
                        {initials(writer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-[1.35rem] text-[#1a2e44] transition-colors group-hover:text-[#8e4e14]">
                        {writer.name}
                      </h3>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#8a7a67]">
                        {writer.username || 'Poet'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#eadfce] bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-[#8e4e14]">
                    #{index + 1}
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-[#5f6b78]">
                  <span>{(writer.followersCount ?? 0).toLocaleString()} followers</span>
                  <span className="border-b border-[#e8ddd1] pb-1 text-[#8e4e14]">View profile</span>
                </div>
              </button>
            ))}
          </div>

          {sortedWriters.length === 0 && (
            <div className="py-16 text-center text-[#6b7580]">
              No writers found with this filter
            </div>
          )}

          {sortedWriters.length > 0 && (
            <div className="mb-16 mt-8 flex justify-center">
              <Button onClick={loadMore} disabled={loading || !hasMore} variant="outline" className="min-w-[180px] rounded-full border-[#e8ddd1] bg-white/80 text-[#1a2e44] hover:bg-[#faf7f2]">
                {loading ? 'Loading…' : hasMore ? 'Next page' : 'No more writers'}
              </Button>
            </div>
          )}

          <div className="rounded-[32px] border border-[#eadfce] bg-white/80 p-8 text-center shadow-[0_14px_32px_rgba(26,46,68,0.06)] backdrop-blur-sm">
            <h3 className="font-serif text-3xl text-[#1a2e44]">Share Your Poetry with the World</h3>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f6b78]">
              Join thousands of poets on iinaayate. Share your ghazals, shers, and nazms with a community that appreciates beautiful words.
            </p>
            <Button className="mt-6 rounded-full bg-[#1A2E44] text-white hover:bg-[#132235]">
              Start Writing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
