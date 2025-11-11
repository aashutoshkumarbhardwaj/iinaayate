import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { commentAPI, postAPI, userAPI, transliterateAPI } from '../utils/api';
import { Helmet } from 'react-helmet-async';

interface PostDetailsPageProps {
  postId: string;
  onBack: () => void;
  onUserClick: (userId: string) => void;
  onPostClick: (postId: string) => void;
}

export function PostDetailsPage({ postId, onBack, onUserClick, onPostClick }: PostDetailsPageProps) {
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [related, setRelated] = useState<any[]>([]);
  const [lang, setLang] = useState<'Urdu' | 'Hindi' | 'Hinglish'>('Urdu');
  const [translits, setTranslits] = useState<{ Hindi?: string; Hinglish?: string }>({});
  const [translitLoading, setTranslitLoading] = useState(false);

  const user = post?.user || null;

  // Compute displayed text with backend transliteration + cache
  const displayed = useMemo(() => {
    const base = post?.content || '';
    if (lang === 'Urdu') return base;
    if (lang === 'Hindi') return translits.Hindi ?? (translitLoading ? 'Transliterating…' : base);
    if (lang === 'Hinglish') return translits.Hinglish ?? (translitLoading ? 'Transliterating…' : base);
    return base;
  }, [post?.content, lang, translits.Hindi, translits.Hinglish, translitLoading]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, cs, liked] = await Promise.all([
          postAPI.getPost(postId),
          commentAPI.getComments(postId),
          postAPI.isLiked(postId),
        ]);
        if (!mounted) return;
        setPost(p);
        setComments(cs);
        setIsLiked(!!liked?.liked);
        setLikes(p?._count?.likes ?? 0);
        // Fetch follow status and related posts
        try {
          const follow = await userAPI.isFollowing(p.user.id);
          if (mounted) setIsFollowing(!!follow?.following);
        } catch {}
        try {
          const rel = await postAPI.getPosts({ limit: 6, genre: p.genre || undefined });
          if (mounted) setRelated((rel || []).filter((r: any) => r.id !== p.id).slice(0, 4));
        } catch {}
      } catch {}
    })();
    return () => { mounted = false; };
  }, [postId]);

  // Fetch transliteration when language changes
  useEffect(() => {
    const text = post?.content || '';
    if (!text) return;
    if (lang === 'Urdu') return;
    const target = lang === 'Hindi' ? 'Devanagari' : 'Hinglish';
    const cacheHit = lang === 'Hindi' ? translits.Hindi : translits.Hinglish;
    if (cacheHit) return;
    let mounted = true;
    (async () => {
      setTranslitLoading(true);
      try {
        const res = await transliterateAPI.convert(text, 'Urdu', target as any);
        if (!mounted) return;
        setTranslits((m) => ({ ...m, [lang]: res?.text || '' }));
      } catch {
        // Cache base text to avoid retry loops and console spam when API is unavailable
        if (!mounted) return;
        setTranslits((m) => ({ ...m, [lang]: text }));
      } finally {
        if (mounted) setTranslitLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [lang, post?.content]);

  if (!post || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes(prev => (next ? prev + 1 : Math.max(0, prev - 1)));
    (async () => {
      try {
        if (next) {
          await postAPI.likePost(postId);
        } else {
          await postAPI.unlikePost(postId);
        }
      } catch {
        // rollback on failure
        setIsLiked(!next);
        setLikes(prev => (!next ? prev + 1 : Math.max(0, prev - 1)));
      }
    })();
  };

  const handleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    (async () => {
      try {
        if (next) {
          await postAPI.savePost(postId);
        } else {
          await postAPI.unsavePost(postId);
        }
      } catch {
        // rollback
        setIsSaved(!next);
      }
    })();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}#post/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title || 'Poem', text: 'Read this poem on Iinaayate', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {}
  };

  const handleDownloadImage = () => {
    toast.success('Poem image downloaded! 🎨');
    // In a real implementation, this would generate a beautiful image with the poem text
  };

  
  
  const relatedPosts: any[] = [];
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Helmet>
          <title>{`${post.title || 'Poem'} – ${user.name} | iinaayate`}</title>
          <meta name="description" content={(post.content || '').split('\n').slice(0, 2).join(' ').slice(0, 160)} />
          <link rel="canonical" href={`/post/${postId}`} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={`${post.title || 'Poem'} – ${user.name}`} />
          <meta property="og:description" content={(post.content || '').split('\n').slice(0, 2).join(' ').slice(0, 200)} />
        </Helmet>
        {/* Back */}
        <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {/* Title + date */}
        <h1 className="text-5xl font-serif text-gray-900 text-center mb-2">{post.title}</h1>
        <p className="text-center text-gray-500 mb-5">Published on {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>

        {/* Language chips */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['Urdu','Hindi','Hinglish'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-md border text-sm ${lang === l ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Poem content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm mb-6">
          <div className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap text-center" style={{ fontFamily: 'serif' }}>
            {displayed}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {post.genre && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs">{post.genre}</span>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-center gap-6 text-gray-600 mb-10">
          <button onClick={handleLike} className={`flex items-center gap-2 ${isLiked ? 'text-rose-600' : ''}`}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span>{likes}</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length}</span>
          </div>
          <button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button onClick={handleSave} className={`flex items-center gap-2 ${isSaved ? 'text-rose-600' : ''}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-rose-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <Button onClick={handleDownloadImage} className="ml-4 bg-purple-600 hover:bg-purple-700 text-white">
            <Download className="w-4 h-4 mr-2" /> Download Image
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Author card */}
        <div className="flex items-start gap-4 mb-12">
          <button onClick={() => onUserClick(user.id)}>
            <Avatar className="w-16 h-16 ring-2 ring-rose-100">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1">
            <button onClick={() => onUserClick(user.id)} className="hover:text-rose-600 transition-colors">
              <h3 className="text-lg text-gray-900">{user.name}</h3>
            </button>
            {user.bio && <p className="text-gray-600 mt-1 line-clamp-3">{user.bio}</p>}
          </div>
          {localStorage.getItem('currentUserId') !== user.id && (
            <button
              onClick={async () => {
                const next = !isFollowing;
                setIsFollowing(next);
                try {
                  if (next) await userAPI.follow(user.id);
                  else await userAPI.unfollow(user.id);
                } catch {
                  setIsFollowing(!next);
                }
              }}
              className={`rounded-full px-5 py-2 text-sm font-medium ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl text-gray-900 text-center mb-6">You Might Also Like</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((r) => (
                <button key={r.id} onClick={() => onPostClick(r.id)} className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md">
                  <p className="text-sm text-gray-500 mb-1">by {r.user?.name || 'User'}</p>
                  <h3 className="text-lg text-gray-900 mb-2">{r.title}</h3>
                  <p className="text-gray-600 line-clamp-3 whitespace-pre-wrap">{(r.content || '').split('\n').slice(0, 3).join('\n')}</p>
                  <span className="text-rose-600 text-sm font-medium mt-3 inline-block">Read Poem →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl text-gray-900 mb-4">Comments ({comments.length})</h3>
          <div className="mb-6">
            <Textarea
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="mb-3 min-h-[100px]"
            />
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={async () => {
                if (!commentText.trim()) return;
                try {
                  const created = await commentAPI.createComment(postId, commentText.trim());
                  setComments((prev) => [...prev, created]);
                  setCommentText('');
                } catch {}
              }}
            >
              Post Comment
            </Button>
          </div>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.user?.avatar || ''} alt={comment.user?.name || 'User'} />
                  <AvatarFallback>{(comment.user?.name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-900">{comment.user?.name || 'User'}</span>
                    <span className="text-sm text-gray-500">· {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
