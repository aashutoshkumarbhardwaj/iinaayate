import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { userAPI, postAPI } from '../utils/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PostCard } from './PostCard';

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function UserProfilePage({ userId, onBack, onPostClick, onUserClick }: UserProfilePageProps) {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [limit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isSelf = currentUserId === userId;
  const [activeTab, setActiveTab] = useState<'poems' | 'likes' | 'collections'>('poems');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('currentUserId'));
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [userData, firstPostsData, savedPostsData] = await Promise.all([
          userAPI.getUser(userId),
          postAPI.getPosts({ userId, limit, offset: 0 }),
          postAPI.getSavedPosts(),
        ]);
        let following: any = null;
        if (!isSelf) {
          try { following = await userAPI.isFollowing(userId); } catch {}
        }
        if (!userData) {
          setError('User not found');
        } else {
          setUser(userData);
          setPosts(firstPostsData);
          setHasMore(Array.isArray(firstPostsData) && firstPostsData.length === limit);
          setOffset(limit);
          setSavedPosts(savedPostsData);
          setIsFollowing(isSelf ? null : !!following?.following);
        }
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, limit, isSelf]);

  const sortedPosts = useMemo(() => {
    const arr = [...posts];
    return arr.sort((a, b) => {
      const da = new Date(a.createdAt || a.created_at || 0).getTime();
      const db = new Date(b.createdAt || b.created_at || 0).getTime();
      return sortBy === 'date_desc' ? db - da : da - db;
    });
  }, [posts, sortBy]);

  const formatPublished = (iso: string | undefined) => {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Published: today';
    if (days === 1) return 'Published: 1 day ago';
    if (days < 7) return `Published: ${days} days ago`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'Published: 1 week ago' : `Published: ${weeks} weeks ago`;
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPosts = await postAPI.getPosts({ userId, limit, offset });
      setPosts((prev) => [...prev, ...nextPosts]);
      setHasMore(Array.isArray(nextPosts) && nextPosts.length === limit);
      setOffset((o) => o + limit);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Banner Image */}
        <div className="bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 h-48 rounded-2xl mb-6" />

        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 -mt-20 relative shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <button onClick={() => onUserClick(user.id)} className="group">
              <Avatar className="w-32 h-32 ring-4 ring-white -mt-16 group-hover:ring-rose-200 transition-all">
                <AvatarImage src={user.avatar || ''} alt={user.name || ''} />
                <AvatarFallback>{user.name ? user.name[0] : '?'}</AvatarFallback>
              </Avatar>
            </button>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl text-gray-900 mb-1">
                    {user.name}
                  </h1>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
                {!isSelf && (
                  <Button
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                    onClick={async () => {
                      try {
                        if (isFollowing) {
                          await userAPI.unfollow(userId);
                          setIsFollowing(false);
                        } else {
                          await userAPI.follow(userId);
                          setIsFollowing(true);
                        }
                      } catch (e) {
                        // ignore
                      }
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-4">{user.bio}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>—</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-xl text-gray-900">{user._count?.posts ?? posts.length}</div>
                  <div className="text-gray-600 text-sm">Poems</div>
                </div>
                <div>
                  <div className="text-xl text-gray-900">{user._count?.followers ?? 0}</div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div>
                <div>
                  <div className="text-xl text-gray-900">{user._count?.following ?? 0}</div>
                  <div className="text-gray-600 text-sm">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content: About + Tabs */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{user.bio || '—'}</p>
              <div className="text-sm text-gray-600">
                <div className="mb-2">
                  <span className="block text-gray-500">Joined</span>
                  <span>{new Date(user.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Tabs */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={(v: 'poems' | 'likes' | 'collections') => setActiveTab(v)}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="poems">Poems</TabsTrigger>
                  <TabsTrigger value="likes">Likes</TabsTrigger>
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                </TabsList>
                {activeTab === 'poems' && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
                  >
                    <option value="date_desc">Sort by Date</option>
                    <option value="date_asc">Oldest First</option>
                  </select>
                )}
              </div>

              <TabsContent value="poems">
                <div className="space-y-4">
                  {sortedPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl border border-rose-100 p-6">
                      <button onClick={() => onPostClick(post.id)} className="text-left w-full">
                        <h3 className="text-xl text-gray-900 mb-1">{post.title}</h3>
                        <p className="text-gray-700 line-clamp-2 whitespace-pre-wrap mb-3">{post.content}</p>
                        <div className="text-sm text-gray-500">{formatPublished(post.createdAt)}</div>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button onClick={loadMore} disabled={loading || !hasMore} className="min-w-[160px]">
                    {loading ? 'Loading…' : hasMore ? 'Load More' : 'No more poems'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="likes">
                <div className="text-center text-gray-500 py-12">No likes to show</div>
              </TabsContent>

              <TabsContent value="collections">
                <div className="space-y-4">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl border border-rose-100 p-6">
                      <button onClick={() => onPostClick(post.id)} className="text-left w-full">
                        <h3 className="text-xl text-gray-900 mb-1">{post.title}</h3>
                        <p className="text-gray-700 line-clamp-2 whitespace-pre-wrap mb-3">{post.content}</p>
                        <div className="text-sm text-gray-500">{formatPublished(post.createdAt)}</div>
                      </button>
                    </div>
                  ))}
                  {savedPosts.length === 0 && (
                    <div className="text-center text-gray-500 py-12">No items in collections</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
