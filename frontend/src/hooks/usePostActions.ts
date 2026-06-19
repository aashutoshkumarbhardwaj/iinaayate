import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { postAPI } from '../utils/api';

/**
 * Shared hook that provides like / save / share / download actions for any post.
 * All mutations hit the real backend. Optimistic UI updates roll back on error.
 */
export function usePostActions(post: any) {
  const [isLiked, setIsLiked] = useState<boolean>(
    !!post?.isLiked
  );
  const [likes, setLikes] = useState<number>(
    typeof post?.likesCount === 'number'
      ? post.likesCount
      : (post?._count?.likes ?? 0)
  );
  const [isSaved, setIsSaved] = useState<boolean>(!!post?.isSaved);

  const isAuthed = () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      toast.error('Please log in to do that.');
      return false;
    }
    return true;
  };

  const toggleLike = useCallback(async () => {
    if (!isAuthed()) return;
    const postId = post?.id;
    if (!postId) return;

    const next = !isLiked;
    setIsLiked(next);
    setLikes((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (next) {
        await postAPI.likePost(postId);
      } else {
        await postAPI.unlikePost(postId);
      }
    } catch {
      // rollback
      setIsLiked(!next);
      setLikes((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
      toast.error('Could not update like. Try again.');
    }
  }, [post?.id, isLiked]);

  const toggleSave = useCallback(async () => {
    if (!isAuthed()) return;
    const postId = post?.id;
    if (!postId) return;

    const next = !isSaved;
    setIsSaved(next);

    try {
      if (next) {
        await postAPI.savePost(postId);
        toast.success('Saved to your collection.');
      } else {
        await postAPI.unsavePost(postId);
        toast.success('Removed from saved.');
      }
    } catch {
      setIsSaved(!next);
      toast.error('Could not save. Try again.');
    }
  }, [post?.id, isSaved]);

  const share = useCallback(async () => {
    const title = post?.title || 'Poem';
    const content = post?.content
      ? post.content.split('\n').slice(0, 3).join('\n')
      : '';
    const url = `${window.location.origin}${window.location.pathname}#post/${post?.id ?? ''}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: content, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // user cancelled share — not an error
    }
  }, [post?.id, post?.title, post?.content]);

  /**
   * Downloads the poem as a styled PNG using the Canvas API.
   * Falls back to a plain text file if Canvas is unavailable.
   */
  const download = useCallback(() => {
    const title = post?.title || 'Poem';
    const content = post?.content || '';
    const author = post?.user?.name || '';
    const genre = post?.genre || '';

    try {
      const canvas = document.createElement('canvas');
      const W = 1080;
      const H = 1350;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#fdf9f3');
      grad.addColorStop(1, '#f0e8da');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative corner
      ctx.fillStyle = 'rgba(244,162,97,0.12)';
      ctx.beginPath();
      ctx.arc(W, 0, 340, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(26,46,68,0.06)';
      ctx.beginPath();
      ctx.arc(0, H, 280, 0, Math.PI * 2);
      ctx.fill();

      // Brand watermark
      ctx.font = 'bold 38px serif';
      ctx.fillStyle = 'rgba(180,145,100,0.18)';
      ctx.textAlign = 'center';
      ctx.fillText('iinaayate', W / 2, H - 60);

      // Genre badge
      if (genre) {
        ctx.font = '500 22px sans-serif';
        ctx.fillStyle = '#8e4e14';
        ctx.textAlign = 'center';
        ctx.fillText(genre.toUpperCase(), W / 2, 80);
        ctx.fillStyle = 'rgba(142,78,20,0.25)';
        ctx.fillRect(W / 2 - 80, 86, 160, 2);
      }

      // Title
      ctx.font = 'bold 56px serif';
      ctx.fillStyle = '#1a2e44';
      ctx.textAlign = 'center';
      wrapText(ctx, title, W / 2, 155, W - 120, 68);

      // Poem content
      ctx.font = '34px serif';
      ctx.fillStyle = '#3d4f62';
      ctx.textAlign = 'center';
      const lines = content
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
        .slice(0, 16);

      let y = 320;
      for (const line of lines) {
        wrapText(ctx, line, W / 2, y, W - 120, 48);
        y += 52;
        if (y > H - 240) {
          ctx.fillStyle = '#8e4e14';
          ctx.font = '28px serif';
          ctx.fillText('…', W / 2, y);
          break;
        }
      }

      // Author
      if (author) {
        ctx.font = 'italic 30px serif';
        ctx.fillStyle = '#8e4e14';
        ctx.textAlign = 'center';
        ctx.fillText(`— ${author}`, W / 2, H - 120);
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, 'image/png');

      toast.success('Poem image downloaded!');
    } catch {
      // Fallback: download as plain text
      const text = `${title}\n${author ? `by ${author}\n` : ''}\n${content}\n\niinaayate.in`;
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Poem downloaded as text!');
    }
  }, [post?.title, post?.content, post?.user?.name, post?.genre]);

  return { isLiked, likes, isSaved, toggleLike, toggleSave, share, download };
}

/** Canvas text-wrap helper */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}
