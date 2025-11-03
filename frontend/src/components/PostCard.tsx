import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Post, getUserById } from '../data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function PostCard({ post, onPostClick, onUserClick }: PostCardProps) {
  const user = getUserById(post.userId);
  
  if (!user) return null;

  // Get preview of content (first 3-4 lines)
  const previewLines = post.content.split('\n').slice(0, 4).join('\n');
  const hasMore = post.content.split('\n').length > 4;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => onUserClick(user.id)}>
          <Avatar className="w-10 h-10 ring-2 ring-rose-100">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1">
          <button
            onClick={() => onUserClick(user.id)}
            className="hover:text-rose-600 transition-colors"
          >
            <p className="text-gray-900">{user.name}</p>
          </button>
          <p className="text-sm text-gray-500">@{user.username} · {post.createdAt}</p>
        </div>
        <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">
          {post.genre}
        </Badge>
      </div>

      {/* Post Content */}
      <button
        onClick={() => onPostClick(post.id)}
        className="w-full text-left group"
      >
        <h3 className="text-2xl text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
          {post.title}
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">
          {previewLines}
          {hasMore && (
            <span className="text-rose-500 ml-2">... Read more</span>
          )}
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${post.isLiked ? 'text-rose-500' : 'text-gray-600'}`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
          <span>{post.likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
          <Share2 className="w-4 h-4" />
          <span>{post.shares}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ml-auto ${post.isSaved ? 'text-rose-500' : 'text-gray-600'}`}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-rose-500' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
