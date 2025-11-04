import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
  const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
  const counts = post._count || {};

  return (
    <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => onUserClick(user.id)}>
          <Avatar className="w-10 h-10 ring-2 ring-accent/30">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1">
          <button
            onClick={() => onUserClick(user.id)}
            className="hover:text-primary transition-colors"
          >
            <p className="text-foreground">{user.name}</p>
          </button>
          <p className="text-sm text-muted-foreground">@{user.username} · {createdAt}</p>
        </div>
        <Badge variant="secondary" className="bg-accent/20 text-foreground border-border">
          {post.genre}
        </Badge>
      </div>

      {/* Post Content */}
      <button
        onClick={() => onPostClick(post.id)}
        className="w-full text-left group"
      >
        <h3 className="text-2xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-2">
          {previewLines}
          {hasMore && (
            <span className="text-primary ml-2">... Read more</span>
          )}
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/60">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${post.isLiked ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-primary' : ''}`} />
          <span>{counts.likes ?? 0}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span>{counts.comments ?? 0}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Share2 className="w-4 h-4" />
          <span>{post.shares ?? 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ml-auto ${post.isSaved ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-primary' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
