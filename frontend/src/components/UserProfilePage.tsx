import { ArrowLeft, BadgeCheck, BookOpenText, Calendar, ChevronLeft, Heart, MapPin, MoreHorizontal, PenLine, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { userAPI, postAPI } from '../utils/api';
import { Skeleton } from './ui/skeleton';
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
  const [coverOverride, setCoverOverride] = useState<string | null>(null);
  const [desktopRating, setDesktopRating] = useState(0);
  const [desktopLiked, setDesktopLiked] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileRating, setMobileRating] = useState(0);
  const [mobileLoved, setMobileLoved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatCompactCount = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    return String(value);
  };

  const coverFor = (seed: string, index = 0) =>
    `https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&h=900&q=80&sat=-100&blend=111827&blend-mode=multiply&txt=${encodeURIComponent(`${seed}-${index}`)}`;

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(`profile-cover-${userId}`);
      if (saved) setCoverOverride(saved);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    try {
      const savedRating = localStorage.getItem(`profile-rating-${userId}`);
      setDesktopRating(savedRating ? Number(savedRating) || 0 : 0);
      setDesktopLiked(localStorage.getItem(`profile-liked-${userId}`) === '1');
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    try {
      const savedRating = localStorage.getItem(`profile-mobile-rating-${userId}`);
      setMobileRating(savedRating ? Number(savedRating) || 0 : 0);
      setMobileLoved(localStorage.getItem(`profile-mobile-loved-${userId}`) === '1');
      setMobileMenuOpen(false);
    } catch {}
  }, [userId]);

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

  const mobileLikes = useMemo(
    () => posts.reduce((sum, post) => sum + (post._count?.likes ?? post.likesCount ?? 0), 0),
    [posts]
  );

  const mobileReviews = Math.max(1, Math.round((mobileLikes || posts.length || 1) / 3));
  const mobileMedia = (sortedPosts.length > 0 ? sortedPosts : posts).slice(0, 4);
  const mobileCover = coverOverride || (user ? coverFor(user.name || user.username || 'profile') : '');
  const mobileNazmCount = posts.filter((post) => (post.genre || '').toLowerCase().includes('nazm')).length;
  const mobileShayariCount = posts.filter((post) => (post.genre || '').toLowerCase().includes('shayari') || (post.genre || '').toLowerCase().includes('sher')).length;
  const mobileKavitaCount = posts.filter((post) => (post.genre || '').toLowerCase().includes('kavita') || (post.genre || '').toLowerCase().includes('poem')).length;
  const desktopRatingValue = desktopRating || 0;
  const mobileRatingValue = mobileRating || 0;

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
      <div className="min-h-screen bg-app flex items-center justify-center">
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
    <div className="min-h-screen bg-app">
        <div className="md:hidden min-h-screen bg-transparent text-slate-900">
          <div className="relative">
          <div
            className="relative h-[260px] overflow-hidden bg-slate-200"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(255, 95, 109, 0.92) 0%, rgba(248, 181, 0, 0.72) 22%, rgba(163, 109, 255, 0.78) 56%, rgba(52, 115, 255, 0.9) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {mobileCover && (
              <img
                src={mobileCover}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
            {isSelf && (
              <label className="absolute bottom-4 left-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-sm font-medium text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void (async () => {
                      try {
                        const nextUrl = await fileToDataUrl(file);
                        setCoverOverride(nextUrl);
                        localStorage.setItem(`profile-cover-${userId}`, nextUrl);
                      } catch {}
                    })();
                  }}
                />
              </label>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onBack();
              }}
              className="absolute left-5 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="absolute right-5 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm"
              aria-label="More"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-4 top-20 z-20 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileLoved((v) => {
                      const next = !v;
                      try {
                        localStorage.setItem(`profile-mobile-loved-${userId}`, next ? '1' : '0');
                      } catch {}
                      return next;
                    });
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>{mobileLoved ? 'Unlove' : 'Love'}</span>
                  <Heart className={`h-4 w-4 ${mobileLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                    } catch {}
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Copy link</span>
                  <span className="text-xs text-slate-400">URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>Close</span>
                  <span className="text-xs text-slate-400">x</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative -mt-10 rounded-t-[1.9rem] bg-white px-5 pb-8 pt-0 shadow-[0_-8px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-end justify-between">
              <div className="-mt-14">
                <button onClick={() => onUserClick(user.id)} className="group relative block">
                 <div className="relative w-fit">
  {/* Gradient Ring */}
  <div className="rounded-full bg-gradient-to-br from-[#f5d36c] via-[#f7b6c8] to-[#8cc4ff] p-[3px] shadow-[0_16px_34px_rgba(15,23,42,0.18)]">
    
    <Avatar className="h-32 w-32 rounded-full overflow-hidden bg-white">
      
      <AvatarImage
        src={user.avatar || ""}
        alt={user.name || ""}
        className="h-full w-full object-cover object-center"
      />

      <AvatarFallback className="flex items-center justify-center h-full w-full text-xl font-semibold bg-gray-200">
        {user.name ? user.name[0].toUpperCase() : "?"}
      </AvatarFallback>

    </Avatar>
  </div>

  {/* Status Dot */}
  <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-2 border-white rounded-full shadow-md"></div>
</div>
                  <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileLoved((v) => {
                    const next = !v;
                    try {
                      localStorage.setItem(`profile-mobile-loved-${userId}`, next ? '1' : '0');
                    } catch {}
                    return next;
                  });
                }}
                className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[0.98rem] font-medium text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              >
                <Heart className={`h-4 w-4 ${mobileLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{mobileLoved ? 'Loved' : 'Love'}</span>
              </button>
            </div>

            <div className="mt-1 flex items-center justify-end gap-2 text-[0.9rem] font-medium text-slate-600">
              <span>{formatCompactCount(user._count?.posts ?? posts.length ?? 0)} posts</span>
              <span className="text-slate-300">•</span>
              <span>{formatCompactCount(mobileLikes)} likes</span>
            </div>

            <div className="mt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-[1.72rem] font-semibold leading-none tracking-tight text-slate-900">
                  {user.name}
                </h1>
                {user.isVerified !== false && (
                  <BadgeCheck className="h-7 w-7 fill-[#1d74f5] text-[#1d74f5]" />
                )}
              </div>
              <p className="mt-1.5 text-[1rem] font-semibold text-slate-500">@{user.username}</p>

              <p className="mt-4 max-w-[26ch] text-[0.98rem] leading-7 text-slate-600">
                {user.bio || 'I will inspire 10 million people to do what they love the best they can!'}
              </p>

              <div className="mt-7 grid grid-cols-3 gap-0 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white">
                <div className="px-2 py-3.5 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                    <BookOpenText className="h-4 w-4" />
                  </div>
                  <div className="mt-2.5 text-[1rem] font-semibold text-slate-900">{formatCompactCount(mobileNazmCount || Math.max(1, Math.round(posts.length / 3)))}</div>
                  <div className="mt-1 text-[0.95rem] leading-5 text-slate-500">Nazm</div>
                </div>
                <div className="border-x border-slate-200 px-2 py-3.5 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                    <PenLine className="h-4 w-4" />
                  </div>
                  <div className="mt-2.5 text-[1rem] font-semibold text-slate-900">{formatCompactCount(mobileShayariCount || Math.max(1, Math.ceil(posts.length / 2)))}</div>
                  <div className="mt-1 text-[0.95rem] leading-5 text-slate-500">Shayari</div>
                </div>
                <div className="px-2 py-3.5 text-center">
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="mt-2.5 text-[1rem] font-semibold text-slate-900">
                    {formatCompactCount(mobileKavitaCount || (user._count?.followers ?? 0))}
                  </div>
                  <div className="mt-1 text-[0.95rem] leading-5 text-slate-500">Kavita</div>
                </div>
              </div>

              <div className="mt-7 rounded-[1rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_26px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[1.05rem] font-semibold text-slate-900">Rating</p>
                    <p className="mt-1 text-sm text-slate-500">1 to 5 stars</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">{mobileReviews} reviews</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const nextRating = index + 1;
                          setMobileRating(nextRating);
                          try {
                            localStorage.setItem(`profile-mobile-rating-${userId}`, String(nextRating));
                          } catch {}
                        }}
                        className="rounded-sm"
                        aria-label={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
                      >
                        <Star
                          className={`h-5 w-5 ${index < mobileRatingValue ? 'fill-amber-400 text-amber-400' : 'text-amber-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-[1.3rem] font-semibold text-slate-900">Media</h2>
                <div className="mt-5 flex gap-4 overflow-x-auto pb-2 pr-1">
                  {mobileMedia.map((post, index) => (
                    <button
                      key={post.id}
                      onClick={() => onPostClick(post.id)}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.05rem] bg-slate-200 shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
                    >
                      <img
                        src={coverFor(post.title || user.name || 'media', index)}
                        alt={post.title || 'Media'}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-left text-[0.75rem] font-medium leading-4 text-white">
                        {post.title || 'Poem'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-[1.3rem] font-semibold text-slate-900">Posts</h2>
                <div className="mt-5 space-y-4">
                  {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPostClick={onPostClick}
                        onUserClick={onUserClick}
                      />
                    ))
                  ) : (
                    <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
                      No created posts yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-transparent text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="relative">
            <div
              className="relative h-[320px] overflow-hidden rounded-[2rem] bg-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
              style={{
                backgroundImage: mobileCover
                  ? `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.18)), url(${mobileCover})`
                  : 'linear-gradient(180deg, rgba(226,232,240,0.88), rgba(203,213,225,0.98))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(1)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
              {isSelf && (
                <label className="absolute bottom-6 left-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/92 px-5 py-2.5 text-sm font-medium text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      void (async () => {
                        try {
                          const nextUrl = await fileToDataUrl(file);
                          setCoverOverride(nextUrl);
                          localStorage.setItem(`profile-cover-${userId}`, nextUrl);
                        } catch {}
                      })();
                    }}
                  />
                </label>
              )}
              <button
                type="button"
                onClick={onBack}
                className="absolute left-6 top-6 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setDesktopMenuOpen((v) => !v)}
                className="absolute right-6 top-6 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-sm"
                aria-label="More"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {desktopMenuOpen && (
                <div className="absolute right-6 top-20 w-56 rounded-[1.2rem] border border-slate-200 bg-white p-2 shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
                  {isSelf && (
                    <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          void (async () => {
                            try {
                              const nextUrl = await fileToDataUrl(file);
                              setCoverOverride(nextUrl);
                              localStorage.setItem(`profile-cover-${userId}`, nextUrl);
                            } catch {}
                          })();
                        }}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(window.location.href);
                      } catch {}
                      setDesktopMenuOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Copy profile link
                  </button>
                </div>
              )}
            </div>

            <div className="relative -mt-8 rounded-t-[2rem] bg-white px-8 pb-10 pt-0 shadow-[0_-10px_50px_rgba(15,23,42,0.1)]">
              <div className="flex items-end justify-between">
                <div className="-mt-[5.25rem] flex items-end gap-4">
                  <button onClick={() => onUserClick(user.id)} className="group relative block">
                    <div className="relative w-fit">
                      <div className="rounded-full bg-gradient-to-br from-[#f5d36c] via-[#f7b6c8] to-[#8cc4ff] p-[3px] shadow-[0_16px_34px_rgba(15,23,42,0.18)]">
                        <Avatar className="h-32 w-32 rounded-full overflow-hidden bg-white">
                          <AvatarImage
                            src={user.avatar || ""}
                            alt={user.name || ""}
                            className="h-full w-full object-cover object-center"
                          />
                          <AvatarFallback className="flex h-full w-full items-center justify-center bg-gray-200 text-xl font-semibold">
                            {user.name ? user.name[0].toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white bg-green-500 shadow-md" />
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !desktopLiked;
                    setDesktopLiked(next);
                    try {
                      localStorage.setItem(`profile-liked-${userId}`, next ? '1' : '0');
                    } catch {}
                  }}
                  className="mt-14 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[1rem] font-medium text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                >
                  <Heart className={`h-4 w-4 ${desktopLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>Like</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 text-[0.95rem] font-medium text-slate-600">
                <span>{formatCompactCount(user._count?.posts ?? posts.length ?? 0)} posts</span>
                <span className="text-slate-300">•</span>
                <span>{formatCompactCount(mobileLikes)} likes</span>
              </div>

              <div className="mt-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-[2.2rem] font-semibold leading-none tracking-tight text-slate-900">
                    {user.name}
                  </h1>
                  {user.isVerified !== false && (
                    <BadgeCheck className="h-8 w-8 fill-[#1d74f5] text-[#1d74f5]" />
                  )}
                </div>
                <p className="mt-2 text-[1rem] font-semibold text-slate-500">@{user.username}</p>

                <p className="mt-5 max-w-3xl text-[1rem] leading-8 text-slate-600">
                  {user.bio || 'I will inspire 10 million people to do what they love the best they can!'}
                </p>

                <div className="mt-7 grid grid-cols-3 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                  <div className="px-3 py-4 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                      <BookOpenText className="h-4 w-4" />
                    </div>
                    <div className="mt-2.5 text-[0.98rem] font-semibold text-slate-900">{formatCompactCount(mobileNazmCount || Math.max(1, Math.round(posts.length / 3)))}</div>
                    <div className="mt-1 text-[0.9rem] leading-5 text-slate-500">Nazm</div>
                  </div>
                  <div className="border-x border-slate-200 px-3 py-4 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                      <PenLine className="h-4 w-4" />
                    </div>
                    <div className="mt-2.5 text-[0.98rem] font-semibold text-slate-900">{formatCompactCount(mobileShayariCount || Math.max(1, Math.ceil(posts.length / 2)))}</div>
                    <div className="mt-1 text-[0.9rem] leading-5 text-slate-500">Shayari</div>
                  </div>
                  <div className="px-3 py-4 text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="mt-2.5 text-[0.98rem] font-semibold text-slate-900">
                      {formatCompactCount(mobileKavitaCount || (user._count?.followers ?? 0))}
                    </div>
                    <div className="mt-1 text-[0.9rem] leading-5 text-slate-500">Kavita</div>
                  </div>
                </div>

                <div id="desktop-rating-panel" className="mt-8 rounded-[1rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_14px_26px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[1.05rem] font-semibold text-slate-900">Rating</p>
                      <p className="mt-1 text-sm text-slate-500">1 to 5 stars</p>
                      <p className="mt-2 text-sm font-medium text-slate-500">{mobileReviews} reviews</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const active = value <= desktopRatingValue;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setDesktopRating(value);
                              try {
                                localStorage.setItem(`profile-rating-${userId}`, String(value));
                              } catch {}
                            }}
                            className="transition-transform hover:scale-110"
                            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                          >
                            <Star className={`h-5 w-5 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-9">
                  <h2 className="text-[1.35rem] font-semibold text-slate-900">Media</h2>
                  <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {mobileMedia.map((post, index) => (
                      <button
                        key={post.id}
                        onClick={() => onPostClick(post.id)}
                        className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                      >
                        <img
                          src={coverFor(post.title || user.name || 'media', index)}
                          alt={post.title || 'Media'}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-3 right-3 line-clamp-2 text-left text-[0.8rem] font-medium leading-4 text-white">
                          {post.title || 'Poem'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-9">
                  <h2 className="text-[1.35rem] font-semibold text-slate-900">Posts</h2>
                  <div className="mt-5 space-y-4">
                    {sortedPosts.length > 0 ? (
                      sortedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onPostClick={onPostClick}
                          onUserClick={onUserClick}
                        />
                      ))
                    ) : (
                      <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
                        No created posts yet
                      </div>
                    )}
                  </div>
                  {hasMore && (
                    <div className="mt-6 flex justify-center">
                      <Button onClick={loadMore} disabled={loading} className="min-w-[180px] rounded-full bg-slate-900 text-white hover:bg-slate-800">
                        {loading ? 'Loading…' : 'Load More Posts'}
                      </Button>
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
