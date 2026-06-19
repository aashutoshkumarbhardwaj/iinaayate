import { Heart, MessageCircle, Share2, Bookmark, Check, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { usePostActions } from '../hooks/usePostActions';
import { PostOwnerMenu } from './PostOwnerMenu';

interface PostCardProps {
  post: any;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function PostCard({ post, onPostClick, onUserClick }: PostCardProps) {
  const [localPost, setLocalPost] = useState(post);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    setLocalPost(post);
    setIsDeleted(false);
  }, [post]);

  const { isLiked, likes, isSaved, toggleLike, toggleSave, share, download } =
    usePostActions(localPost);

  const user = localPost.user;
  if (!user || isDeleted) return null;

  const content = localPost.content || '';
  const previewLines = content.split('\n').slice(0, 4).join('\n');
  const hasMore = content.split('\n').length > 4;
  const createdDate = localPost.createdAt ? new Date(localPost.createdAt) : null;
  const createdAt = createdDate ? createdDate.toLocaleString() : '';
  const counts = localPost._count || {};

  const currentUserId =
    typeof window !== 'undefined' ? localStorage.getItem('currentUserId') : null;
  const isOwner = !!currentUserId && currentUserId === user.id;

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
    return `${Math.floor(d / 7)} week${Math.floor(d / 7) > 1 ? 's' : ''} ago`;
  };

  const fmt = (n?: number) => {
    const v = n ?? 0;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}m`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return String(v);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card group flex flex-col gap-5 rounded-[20px] p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => onUserClick(user.id)} className="shrink-0">
          <Avatar className="h-12 w-12 border border-slate-200 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUserClick(user.id)}
              className="transition-colors hover:text-slate-700"
            >
              <p className="truncate font-medium text-slate-950">{user.name}</p>
            </button>
            {user.isVerified && (
              <div className="flex-shrink-0 rounded-full bg-blue-500 p-0.5">
                <Check className="h-3 w-3 fill-white text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500">Posted {timeAgo(createdDate)}</p>
        </div>
        {localPost.genre && (
          <Badge
            variant="secondary"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-700"
          >
            {localPost.genre}
          </Badge>
        )}
        <PostOwnerMenu
          post={localPost}
          isOwner={isOwner}
          onUpdated={(updated) => setLocalPost(updated)}
          onDeleted={() => setIsDeleted(true)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
        />
      </div>

      {/* Content preview */}
      <button onClick={() => onPostClick(localPost.id)} className="w-full text-left">
        <div className="flex items-center gap-2">
          <h3 className="mb-3 text-2xl font-semibold tracking-tight text-slate-950 transition-colors duration-300 group-hover:text-slate-700">
            {localPost.title}
          </h3>
        </div>
        <div className="font-poetry whitespace-pre-wrap text-base leading-8 text-slate-600">
          {previewLines}
        </div>
        {hasMore && (
          <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-500">
            Continue reading
          </div>
        )}
      </button>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {localPost.genre && (
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
            #{localPost.genre}
          </span>
        )}
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
          {createdAt}
        </span>
      </div>

      {/* Actions */}
      <div className="glass-panel flex flex-wrap items-center gap-5 rounded-[20px] border border-slate-200 px-4 py-3 text-slate-500">
        {/* Like */}
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 transition-transform duration-300 hover:scale-105 ${
            isLiked ? 'text-rose-500' : ''
          }`}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="text-sm font-medium">{fmt(likes)}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => onPostClick(localPost.id)}
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:text-slate-700"
          aria-label="View comments"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{fmt(counts.comments)}</span>
        </button>

        {/* Share */}
        <button
          onClick={share}
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:text-slate-700"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium">Share</span>
        </button>

        {/* Download */}
        <button
          onClick={download}
          className="flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:text-slate-700"
          aria-label="Download poem"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Save */}
        <button
          onClick={toggleSave}
          className={`ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300 hover:scale-105 ${
            isSaved
              ? 'border-rose-200 bg-rose-50 text-rose-500'
              : 'border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50'
          }`}
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="text-sm font-medium">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </motion.article>
  );
}
