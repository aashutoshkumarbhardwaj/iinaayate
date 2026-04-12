import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { postAPI } from '../utils/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PostOwnerMenuProps {
  post: {
    id: string;
    title?: string;
    content?: string;
    genre?: string;
  };
  isOwner: boolean;
  onUpdated?: (updatedPost: any) => void;
  onDeleted?: () => void;
  className?: string;
}

export function PostOwnerMenu({ post, isOwner, onUpdated, onDeleted, className }: PostOwnerMenuProps) {
  if (!isOwner) return null;

  const handleUpdate = async () => {
    const nextTitle = window.prompt('Update title', post.title || '');
    if (nextTitle === null) return;

    const nextContent = window.prompt('Update content', post.content || '');
    if (nextContent === null) return;

    const nextGenre = window.prompt('Update category', post.genre || '');
    if (nextGenre === null) return;

    const title = nextTitle.trim();
    const content = nextContent.trim();
    const genre = nextGenre.trim();
    if (!title || !content || !genre) {
      toast.error('Title, content, and category are required.');
      return;
    }

    try {
      const updated = await postAPI.updatePost(post.id, { title, content, genre });
      onUpdated?.(updated);
      toast.success('Post updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    try {
      await postAPI.deletePost(post.id);
      onDeleted?.();
      toast.success('Post deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete post');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={className || 'flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'}
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-[18px] border border-slate-200 bg-white text-slate-900">
        <DropdownMenuItem onClick={handleUpdate} className="focus:bg-slate-100 focus:text-slate-900">
          <PencilLine className="mr-2 h-4 w-4" />
          Update Post
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-rose-600 focus:bg-rose-50 focus:text-rose-700">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
