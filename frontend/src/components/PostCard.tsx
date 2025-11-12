import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useState } from 'react';
import { postAPI } from '../utils/api';

interface PostCardProps {
  post: any;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function PostCard({ post, onPostClick, onUserClick }: PostCardProps) {
  const user = post.user;
  if (!user) return null;

  // Get preview of content (first 3-4 lines)
  const content = post.content || '';
  const previewLines = content.split('\n').slice(0, 4).join('\n');
  const hasMore = content.split('\n').length > 4;
  const createdDate = post.createdAt ? new Date(post.createdAt) : null;
  const createdAt = createdDate ? new Date(createdDate).toLocaleString() : '';
  const counts = post._count || {};

  // Inline like state
  const [isLiked, setIsLiked] = useState<boolean>(!!post.isLiked);
  const [likes, setLikes] = useState<number>(
    typeof post.likesCount === 'number' ? post.likesCount : (counts.likes ?? 0)
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
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'm';
    if (v >= 1_000) return (v / 1_000).toFixed(1) + 'k';
    return String(v);
  };

  const handleToggleLike = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Not authenticated - ignore for now (parent gating handles auth)
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikes((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
    (async () => {
      try {
        if (next) await postAPI.likePost(post.id);
        else await postAPI.unlikePost(post.id);
      } catch {
        // rollback
        setIsLiked(!next);
        setLikes((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
      }
    })();
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => onUserClick(user.id)}>
          <Avatar className="w-10 h-10 ring-2 ring-rose-100">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1">
          <button onClick={() => onUserClick(user.id)} className="hover:text-rose-600 transition-colors">
            <p className="text-gray-900 font-medium">{user.name}</p>
          </button>
          <p className="text-sm text-gray-500">Posted {timeAgo(createdDate)}</p>
        </div>
        {post.genre && (
          <Badge variant="secondary" className="bg-rose-50 text-rose-700 border border-rose-200">
            {post.genre}
          </Badge>
        )}
      </div>

      {/* Content */}
      <button onClick={() => onPostClick(post.id)} className="w-full text-left group">
        <h3 className="text-2xl font-serif text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
          {post.title}
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {previewLines}
        </div>
      </button>
      <div className="mt-3">
        <button onClick={() => onPostClick(post.id)} className="text-rose-600 font-medium text-sm hover:underline">
          Read More
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {post.genre && (
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs">#{post.genre}</span>
        )}
      </div>

      {/* Footer actions */
      }
      <div className="mt-5 pt-4 border-t border-rose-100/80">
        <div className="flex items-center gap-6 text-gray-600 bg-rose-50/40 border border-rose-100 rounded-xl px-4 py-2">
          <button onClick={handleToggleLike} className={`flex items-center gap-2 ${isLiked ? 'text-rose-600' : ''}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span className="text-sm">{fmt(likes)}</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{fmt(counts.comments)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{fmt(post.shares)}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
