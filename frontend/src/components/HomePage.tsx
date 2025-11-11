import { ChevronLeft, ChevronRight, Search as SearchIcon, Calendar, ArrowRight, ScrollText, Sparkles, PenLine, Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import { eventsAPI, postAPI, userAPI, statsAPI } from '../utils/api';
import { PostCard } from './PostCard';
import { TopPoemsCarousel } from './TopPoemsCarousel';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface HomePageProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onNavigate?: (page: string) => void;
}

export function HomePage({ onPostClick, onUserClick, onNavigate }: HomePageProps) {
  const [featuredPoetIndex, setFeaturedPoetIndex] = useState(0);
  const [featuredPoets, setFeaturedPoets] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [qotd, setQotd] = useState<any | null>(null);
  const [topFive, setTopFive] = useState<any[]>([]);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [users, feed, top, evtsWrap, stats] = await Promise.all([
          userAPI.getTopUsers(),
          postAPI.getPosts({ limit: 10 }),
          postAPI.getTopPosts(),
          eventsAPI.getEvents().catch(() => ({ events: [] })),
          statsAPI.getCommunity().catch(() => null),
        ]);
        if (!mounted) return;
        const evts = Array.isArray((evtsWrap as any)) ? (evtsWrap as any) : ((evtsWrap as any)?.events ?? []);
        setFeaturedPoets(users);
        setPosts(feed);
        setTopPosts(top || []);
        setEvents(evts || []);
        // compute daily selections
        const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const seed = xmur3(todayKey)();
        const rng = mulberry32(seed);
        // Quote of the Day: deterministic random across entire DB if we know total poems
        const totalPoems: number | undefined = (stats && (stats.totalPoems || stats.poems || stats.posts)) as any;
        if (typeof totalPoems === 'number' && totalPoems > 0) {
          const index = Math.floor(rng() * totalPoems);
          try {
            const one = await postAPI.getPosts({ limit: 1, offset: index });
            if (Array.isArray(one) && one[0]) setQotd(one[0]);
            else if ((top || []).length > 0) setQotd(top[Math.floor(rng() * (top.length))]);
            else setQotd(null);
          } catch {
            if ((top || []).length > 0) setQotd(top[Math.floor(rng() * (top.length))]);
            else setQotd(null);
          }
        } else {
          // Fallback to topPosts pool if stats unavailable
          if ((top || []).length > 0) setQotd(top[Math.floor(rng() * (top.length))]);
          else setQotd(null);
        }
        const pool = (feed || top || []).filter(Boolean);
        const picks = pickUniqueIndices(pool.length, 5, rng).map(i => pool[i]).filter(Boolean);
        setTopFive(picks);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Deterministic daily helpers (seeded RNG)
  function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  function mulberry32(a: number) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickUniqueIndices(n: number, k: number, rng: () => number) {
    const idxs: number[] = [];
    const max = Math.max(0, Math.min(n, k));
    while (idxs.length < max) {
      const i = Math.floor(rng() * n);
      if (!idxs.includes(i)) idxs.push(i);
    }
    return idxs;
  }
  
  const scrollPoets = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setFeaturedPoetIndex(Math.max(0, featuredPoetIndex - 4));
    } else {
      setFeaturedPoetIndex(Math.min(featuredPoets.length - 4, featuredPoetIndex + 4));
    }
  };

  const handleFollowToggle = async (userId: string) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId && currentUserId === userId) return;
    const isNow = !followed[userId];
    setFollowed((m) => ({ ...m, [userId]: isNow }));
    try {
      if (isNow) await userAPI.follow(userId);
      else await userAPI.unfollow(userId);
    } catch {
      setFollowed((m) => ({ ...m, [userId]: !isNow }));
    }
  };

  const goSearch = () => {
    if (onNavigate) onNavigate('search');
  };

  const goExplore = () => onNavigate?.('explore');
  const goEvents = () => onNavigate?.('events');
  const goWrite = () => onNavigate?.('write');

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero Section with Search */}
        <div className="relative rounded-2xl overflow-hidden mb-12 border border-gray-200 bg-gradient-to-br from-rose-50 to-amber-50">
          <div className="px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 tracking-tight mb-3">
              Where Words Find Their Soul
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto mb-10">
              A soulful, elegant, and minimal cultural platform for Hindi and Urdu poetry. Discover, write, and share the verses that move you.
            </p>
            <div className="mx-auto flex gap-2 items-center bg-white rounded-full p-2 pl-4 border border-gray-200 w-full max-w-2xl shadow-sm">
              <SearchIcon className="w-5 h-5 text-gray-400" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
                placeholder="Search for a theme, poet, or poem..."
                className="border-0 focus-visible:ring-0 focus:outline-none"
              />
              <Button className="rounded-full px-6 bg-rose-600 hover:bg-rose-700 text-white" onClick={goSearch}>Search</Button>
            </div>
          </div>
        </div>

        {/* Quote of the Day (deterministic daily from top posts) */}
        {qotd && (
          <div className="mb-12">
            <h2 className="text-center text-sm uppercase tracking-[0.25em] text-gray-500 mb-4">Quote of the Day</h2>
            <div className="max-w-3xl mx-auto bg-amber-50/70 border border-amber-100 rounded-2xl p-10 text-center">
              <button onClick={() => onPostClick(qotd.id)} className="block w-full group">
                <div className="text-3xl text-gray-900 leading-relaxed whitespace-pre-wrap italic group-hover:text-rose-600 transition-colors" style={{ fontFamily: 'serif' }}>
                  {(qotd.content || '').split('\n').slice(0, 2).join('\n')}
                </div>
                <div className="mt-3 text-gray-500 text-sm tracking-wide">— {qotd.user?.name}</div>
              </button>
            </div>
          </div>
        )}

        {/* Today’s Top Five (deterministic daily random) */}
        {topFive.length > 0 && (
          <div className="mb-12">
            <h2 className="text-center text-sm uppercase tracking-[0.25em] text-gray-500 mb-6">Today's Top Five</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
              {topFive.map((p) => (
                <button key={p.id} onClick={() => onPostClick(p.id)} className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-rose-200 hover:shadow-sm transition-all">
                  <div className="text-gray-900 line-clamp-3 whitespace-pre-wrap" style={{ fontFamily: 'serif' }}>
                    {(p.content || '').split('\n')[0]}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{p.user?.name || 'Unknown'}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Explore Poetry categories */}
        <div className="mb-12">
          <h2 className="text-center text-sm uppercase tracking-[0.25em] text-gray-500 mb-6">Explore Poetry</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { title: 'Ghazal', desc: 'Classic couplets of longing', icon: <ScrollText className="w-5 h-5 text-rose-600" /> },
              { title: 'Shayari', desc: 'A couplet of deep emotions', icon: <Sparkles className="w-5 h-5 text-rose-600" /> },
              { title: 'Nazm', desc: 'A modern, lyrical poem', icon: <PenLine className="w-5 h-5 text-rose-600" /> },
              { title: 'Modern Poetry', desc: 'Contemporary expressions', icon: <Leaf className="w-5 h-5 text-rose-600" /> },
            ].map((c) => (
              <button key={c.title} onClick={goExplore} className="text-left bg-rose-50/60 hover:bg-rose-50 border border-rose-100 rounded-2xl p-5 transition-all shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-100/60 border border-rose-200 flex items-center justify-center mb-3">
                  {c.icon}
                </div>
                <div className="text-gray-900 font-medium">{c.title}</div>
                <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Poets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900">Featured Poets</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollPoets('left')}
                disabled={featuredPoetIndex === 0}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollPoets('right')}
                disabled={featuredPoetIndex >= featuredPoets.length - 4}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {featuredPoets.slice(featuredPoetIndex, featuredPoetIndex + 6).map((poet) => {
              const isSelf = (localStorage.getItem('currentUserId') || '') === poet.id;
              const isFollowing = !!followed[poet.id];
              return (
                <div key={poet.id} className="flex flex-col items-center group">
                  <button onClick={() => onUserClick(poet.id)} className="flex flex-col items-center">
                    <Avatar className="w-20 h-20 mb-3 ring-2 ring-rose-100 group-hover:ring-rose-300 transition-all shadow-sm">
                      <AvatarImage src={poet.avatar || ''} alt={poet.name} />
                      <AvatarFallback>{(poet.name || 'U')[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-gray-900 text-center truncate w-full group-hover:text-rose-600 transition-colors">
                      {poet.name}
                    </p>
                  </button>
                  {!isSelf && (
                    <button
                      onClick={() => handleFollowToggle(poet.id)}
                      className={`mt-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-gray-900">Upcoming Events</h2>
              <Button variant="ghost" onClick={goEvents} className="text-rose-600">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((ev) => (
                <div key={ev.id} className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-center min-w-[56px]">
                      <div className="text-sm font-semibold text-gray-900">{new Date(ev.startsAt).toLocaleString(undefined, { month: 'short' }).toUpperCase()}</div>
                      <div className="text-lg text-gray-900">{new Date(ev.startsAt).getDate()}</div>
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium">{ev.title}</div>
                      {ev.subtitle && <div className="text-sm text-gray-600">{ev.subtitle}</div>}
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Calendar className="w-4 h-4" /> {new Date(ev.startsAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Button variant="link" className="text-rose-600" onClick={goEvents}>Learn More</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Top Carousel */}
        <TopPoemsCarousel onPostClick={onPostClick} />

        {/* Posts Feed */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl text-gray-900 mb-6">Latest Poems</h2>
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostClick={onPostClick}
                onUserClick={onUserClick}
              />
            ))}
          </div>

          {/* Publish CTA */}
          <div className="mt-12 bg-rose-50/70 border border-rose-100 rounded-2xl p-10 text-center">
            <h3 className="text-2xl text-gray-900 mb-2">Have a poem to share?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Join our vibrant community of writers and poets. Share your words, get discovered, and leave your audience in awe.</p>
            <Button onClick={goWrite} className="rounded-full px-6 bg-rose-600 hover:bg-rose-700 text-white">Write & Publish Your Poem</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
