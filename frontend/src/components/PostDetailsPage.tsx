import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { commentAPI, postAPI } from '../utils/api';

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

  const user = post?.user || null;

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
      } catch {}
    })();
    return () => { mounted = false; };
  }, [postId]);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Post Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
          {/* Author Section */}
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-gray-100">
            <button onClick={() => onUserClick(user.id)}>
              <Avatar className="w-16 h-16 ring-2 ring-rose-100">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </button>
            <div className="flex-1">
              <button
                onClick={() => onUserClick(user.id)}
                className="hover:text-rose-600 transition-colors"
              >
                <h3 className="text-xl text-gray-900">{user.name}</h3>
              </button>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-sm text-gray-500 mt-1">{user.followers} followers</p>
            </div>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white">
              Follow
            </Button>
          </div>

          {/* Genre Badge */}
          <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200 mb-4">
            {post.genre}
          </Badge>

          {/* Title */}
          <h1 className="text-4xl text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Full Poem Content */}
          <div className="text-xl text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
            {post.content}
          </div>

          {/* Post Meta */}
          <p className="text-gray-500 mb-6">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`gap-2 ${isLiked ? 'text-rose-500' : 'text-gray-600'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span>{likes}</span>
            </Button>
            <Button variant="ghost" className="gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length}</span>
            </Button>
            <Button variant="ghost" className="gap-2 text-gray-600" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleSave}
              className={`gap-2 ${isSaved ? 'text-rose-500' : 'text-gray-600'}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
            <Button
              onClick={handleDownloadImage}
              className="gap-2 ml-auto bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </Button>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <h3 className="text-xl text-gray-900 mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            <div className="mb-6">
              <Textarea
                placeholder="Share your thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-3 min-h-[100px]"
              />
              <Button
                className="bg-rose-500 hover:bg-rose-600 text-white"
                onClick={async () => {
                  if (!commentText.trim()) return;
                  try {
                    const created = await commentAPI.createComment(postId, commentText.trim());
                    setComments(prev => [...prev, created]);
                    setCommentText('');
                  } catch {}
                }}
              >
                Post Comment
              </Button>
            </div>

            {/* Comments List */}
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
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Poems */}
        {relatedPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl text-gray-900 mb-6">
              Related Poems
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <button
                  key={relatedPost.id}
                  onClick={() => onPostClick(relatedPost.id)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all text-left"
                >
                  <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200 mb-2">
                    {relatedPost.genre}
                  </Badge>
                  <h3 className="text-lg text-gray-900 mb-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600">by {relatedPost.user?.name || 'User'}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
