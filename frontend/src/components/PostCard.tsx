import { Heart, MessageCircle, Share2, Bookmark, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { postAPI } from '../utils/api';

interface PostCardProps {
  post: any;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function PostCard({ post, onPostClick, onUserClick }: PostCardProps) {
  const user = post.user;
  if (!user) return null;

  const content = post.content || '';
  const previewLines = content.split('\n').slice(0, 4).join('\n');
  const hasMore = content.split('\n').length > 4;
  const createdDate = post.createdAt ? new Date(post.createdAt) : null;
  const createdAt = createdDate ? new Date(createdDate).toLocaleString() : '';
  const counts = post._count || {};

  const [isLiked, setIsLiked] = useState<boolean>(!!post.isLiked);
  const [likes, setLikes] = useState<number>(
    typeof post.likesCount === 'number' ? post.likesCount : (counts.likes ?? 0)
  );
  const [isSaved, setIsSaved] = useState<boolean>(!!post.isSaved);
  const [savedCount, setSavedCount] = useState<number>(
    typeof post.savedCount === 'number' ? post.savedCount : (counts.saved ?? 0)
  );

  const timeAgo = (date?: Date | null) => {
    if (!date) return '';
    const diff = Date.now() - date.getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'Just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
    const w = Math.floor(d / 7);
    return `${w} week${w > 1 ? 's' : ''} ago`;
  };

  const fmt = (n?: number) => {
    const v = n ?? 0;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}m`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return String(v);
  };

  const handleToggleLike = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const next = !isLiked;
    setIsLiked(next);
    setLikes((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    (async () => {
      try {
        if (next) await postAPI.likePost(post.id);
        else await postAPI.unlikePost(post.id);
      } catch {
        setIsLiked(!next);
        setLikes((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
      }
    })();
  };

  const handleToggleSave = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const next = !isSaved;
    setIsSaved(next);
    setSavedCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    (async () => {
      try {
        if (next) await postAPI.savePost(post.id);
        else await postAPI.unsavePost(post.id);
      } catch {
        setIsSaved(!next);
        setSavedCount((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
      }
    })();
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card group flex flex-col gap-5 rounded-[20px] p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => onUserClick(user.id)} className="shrink-0">
          <Avatar className="h-12 w-12 border border-slate-200 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button onClick={() => onUserClick(user.id)} className="transition-colors hover:text-slate-700">
              <p className="truncate font-medium text-slate-950">{user.name}</p>
            </button>
            {user.isVerified && (
              <div className="flex-shrink-0 rounded-full bg-blue-500 p-0.5">
                <Check className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500">Posted {timeAgo(createdDate)}</p>
        </div>
        {post.genre && (
          <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-700">
            {post.genre}
          </Badge>
        )}
      </div>

      <button onClick={() => onPostClick(post.id)} className="w-full text-left">
        <div className="flex items-center gap-2">
          <h3 className="mb-3 text-2xl font-semibold tracking-tight text-slate-950 transition-colors duration-300 group-hover:text-slate-700">
            {post.title}
          </h3>
          {post.isVerified && (
            <Check className="h-5 w-5 text-blue-500 fill-blue-500 flex-shrink-0 mt-1" />
          )}
        </div>
        <div className="font-poetry whitespace-pre-wrap text-base leading-8 text-slate-600">{previewLines}</div>
        {hasMore && (
          <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-500">
            Continue reading
          </div>
        )}
      </button>

      <div className="flex flex-wrap gap-2">
        {post.genre && (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">#{post.genre}</span>
        )}
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{createdAt}</span>
      </div>

      <div className="glass-panel flex flex-wrap items-center gap-5 rounded-[20px] border border-slate-200 px-4 py-3 text-slate-500">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-2 transition-transform duration-300 hover:scale-105 ${isLiked ? 'text-rose-500' : ''}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="text-sm font-medium">{fmt(likes)}</span>
        </button>
        <button 
          onClick={() => onPostClick(post.id)}
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:text-slate-700"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{fmt(counts.comments)}</span>
        </button>
        <button
          onClick={() => {
            const text = `${post.title}\n\n${previewLines}`;
            if (navigator.share) {
              navigator.share({
                title: post.title,
                text: text,
              }).catch(() => {});
            }
          }}
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:text-slate-700"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium">{fmt(post.shares || 0)}</span>
        </button>
        <button
          onClick={handleToggleSave}
          className={`ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300 hover:scale-105 ${
            isSaved 
              ? 'border-rose-200 bg-rose-50 text-rose-500' 
              : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="text-sm font-medium">{isSaved ? fmt(savedCount) : 'Save'}</span>
        </button>
      </div>
    </motion.article>
  );
}
