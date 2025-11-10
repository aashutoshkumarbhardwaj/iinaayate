import { TrendingUp, Users, Hash, Star, Headphones, Compass, Mic2, ChevronDown, ShoppingBag, Feather } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { postAPI, userAPI, statsAPI, moodsAPI } from '../utils/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostCard } from './PostCard';

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
  const [moods, setMoods] = useState<Array<{ mood: string; count: number }>>([]);
  const [audioOnly, setAudioOnly] = useState(false);
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [showMoodChips, setShowMoodChips] = useState(false);
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [topPosts, feed, users, community, moodsData] = await Promise.all([
          postAPI.getTopPosts(),
          postAPI.getPosts({ limit: 100, hasAudio: audioOnly, mood: moodFilter || undefined }),
          userAPI.getTopUsers(),
          statsAPI.getCommunity().catch(() => null),
          moodsAPI.get().catch(() => ({ moods: [] })),
        ]);
        if (mounted) {
          setTrendingPosts(topPosts);
          setFeedPosts(feed);
          setTopAuthors(users);
          if (community) setStats(community);
          setMoods(moodsData.moods || []);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [audioOnly, moodFilter]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-gray-900 mb-3">
            Explore iinaayate
          </h1>
          <p className="text-lg text-gray-600">
            Discover trending poems, top poets, and vibrant communities
          </p>
        </div>

        {/* Genre Statistics - Poetistic Style */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all group">
            <p className="text-6xl mb-2 group-hover:scale-110 transition-transform" style={{ 
              background: 'linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>71k</p>
            <p className="text-lg text-gray-900">Sher</p>
          </button>
          <button className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all group">
            <p className="text-6xl mb-2 group-hover:scale-110 transition-transform" style={{ 
              background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>56k</p>
            <p className="text-lg text-gray-900">Ghazal</p>
          </button>
          <button className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all group">
            <p className="text-6xl mb-2 group-hover:scale-110 transition-transform" style={{ 
              background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>6k</p>
            <p className="text-lg text-gray-900">Nazm</p>
          </button>
        </div>

        {/* Featured Daily Poem Banner */}
        <button
          onClick={onDailyPoemClick}
          className="w-full bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 rounded-2xl p-8 mb-8 text-white hover:shadow-2xl transition-all group"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Star className="w-8 h-8 fill-white group-hover:scale-110 transition-transform" />
            <h2 className="text-3xl">
              Poem of the Day
            </h2>
          </div>
          <p className="text-white/90 text-lg">
            Discover today's featured poem selected by our community
          </p>
        </button>

        {/* Quick Access Cards - Poetistic Style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Poetry Audios */}
          <button
            onClick={() => { setAudioOnly(true); setMoodFilter(null); }}
            className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <Headphones className="w-16 h-16 text-purple-300" />
            </div>
            <p className="text-lg text-gray-900">Poetry audios</p>
          </button>

          {/* Writers */}
          <button 
            onClick={() => onNavigate?.('writers')}
            className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-green-300/50 flex items-center justify-center">
                <Compass className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-900">Writers</p>
          </button>

          {/* Shayari Events */}
          <button 
            onClick={() => onNavigate?.('events')}
            className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-lg bg-blue-300 flex items-center justify-center">
                <Mic2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-900">Shayari Events</p>
          </button>

          {/* Moods */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all text-left">
            <button
              onClick={() => setShowMoodChips((s) => !s)}
              className="w-full flex items-center justify-between"
            >
              <p className="text-lg text-gray-900">Moods</p>
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </button>
            {showMoodChips && (
              <div className="mt-4 flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m.mood}
                    onClick={() => { setMoodFilter(m.mood); setAudioOnly(false); }}
                    className={`px-3 py-1.5 rounded-full text-sm border ${moodFilter === m.mood ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    title={`${m.count} posts`}
                  >
                    {m.mood}
                  </button>
                ))}
                {moods.length === 0 && (
                  <span className="text-sm text-gray-500">No moods yet</span>
                )}
              </div>
            )}
          </div>

          {/* Sher Swipe */}
          <button className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 hover:shadow-xl transition-all text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-200 flex items-center justify-center">
                <Feather className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <p className="text-lg text-gray-900">Sher Swipe</p>
          </button>

          {/* Blog */}
          <button 
            onClick={() => onNavigate?.('blog')}
            className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 hover:shadow-xl transition-all text-left group flex items-center justify-between"
          >
            <p className="text-lg text-gray-900">Blog</p>
            <Feather className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trending & Filters */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="w-full bg-white border border-gray-200 rounded-xl p-1 mb-6">
                <TabsTrigger value="trending" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="genres" className="flex-1">
                  <Hash className="w-4 h-4 mr-2" />
                  By Genre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-6">
                {trendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostClick={onPostClick}
                    onUserClick={onUserClick}
                  />
                ))}
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Premium, Bookmarks & More */}
          <div className="space-y-6">
            {/* Premium Card */}
            <div className="bg-gray-900 rounded-2xl border-2 border-amber-400 p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Feather className="w-12 h-12 text-amber-400" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Starting ₹7 /week</p>
              <h3 className="text-2xl text-white mb-6">Unlimited coins<br/>
                <span className="text-lg text-gray-400">with Poetistic Pro</span>
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
                  <span className="text-gray-900">{(stats || derivedStats) ? (stats || derivedStats)!.totalPoems.toLocaleString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Active Poets</span>
                  <span className="text-gray-900">{(stats || derivedStats) ? (stats || derivedStats)!.activePoets.toLocaleString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">This Week</span>
                  <span className="text-gray-900">{(stats || derivedStats) ? `${(stats || derivedStats)!.newThisWeek.toLocaleString()} new poems` : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
