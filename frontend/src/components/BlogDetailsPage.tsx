import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { postAPI, commentAPI } from '../utils/api';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface BlogDetailsPageProps {
  postId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export function BlogDetailsPage({ postId, onBack, onPostClick }: BlogDetailsPageProps) {
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const p = await postAPI.getPost(postId);
        if (!mounted) return;
        setPost(p);
        try {
          const cs = await commentAPI.getComments(postId);
          if (mounted) setComments(cs || []);
        } catch {}
        try {
          const rel = await postAPI.getPosts({ limit: 6, genre: p?.genre || undefined });
          if (mounted) setRelated((rel || []).filter((r: any) => r.id !== p.id).slice(0, 3));
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [postId]);

  const coverFor = (title: string) =>
    `https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&auto=format&fit=crop&w=1600&h=900&ixlib=rb-4.0.3&sat=-10&blend=111827&blend-mode=normal&txt=${encodeURIComponent(title)}`;

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const c = await commentAPI.createComment(postId, commentText.trim());
      setComments((prev) => [c, ...prev]);
      setCommentText('');
    } catch {}
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
          <div className="mt-6 text-gray-500">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl overflow-hidden mb-6">
          <img src={coverFor(post.title)} alt={post.title} className="w-full h-64 object-cover" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-gray-900 text-center mb-2">{post.title}</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={post.user?.avatar} alt={post.user?.name}/>
              <AvatarFallback>{post.user?.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <span>{post.user?.name ?? 'Unknown'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : ''}</span>
          </div>
          <span>•</span>
          <span>{Math.max(2, Math.ceil(((post.content || '').length || 400) / 900))} min read</span>
          <button className="ml-4 text-gray-600 hover:text-gray-900" aria-label="Share"><Share2 className="w-4 h-4"/></button>
        </div>

        <article className="prose max-w-none prose-p:text-gray-800 prose-headings:text-gray-900">
          {(post.content || '').split('\n').map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Share */}
        <div className="flex items-center gap-3 mt-8 text-sm text-gray-600">
          <span>Share this article</span>
          <button className="hover:text-gray-900" aria-label="Share"><Share2 className="w-4 h-4"/></button>
        </div>

        {/* Comments */}
        <div className="mt-12">
          <h3 className="text-lg text-gray-900 mb-3">Comments ({comments.length})</h3>
          <div className="rounded-2xl border border-gray-200 p-4 mb-4">
            <textarea
              className="w-full resize-none outline-none bg-transparent"
              rows={3}
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!commentText.trim()}>Post Comment</Button>
            </div>
          </div>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={c.user?.avatar} alt={c.user?.name} />
                  <AvatarFallback>{c.user?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{c.user?.name ?? 'User'}</div>
                  <div className="text-sm text-gray-700">{c.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg text-gray-900 mb-4">Related Articles</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <button key={r.id} onClick={() => onPostClick(r.id)} className="text-left">
                  <div className="rounded-2xl overflow-hidden mb-3">
                    <img src={coverFor(r.title)} alt={r.title} className="w-full h-32 object-cover" />
                  </div>
                  <div className="text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-600">{r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : ''}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="py-16" />
      </div>
    </div>
  );
}
