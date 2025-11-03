import { ArrowLeft, Star, Calendar, Share2, Heart, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { PostCard } from './PostCard';
import { mockPosts, getUserById } from '../data/mockData';

interface DailyPoemPageProps {
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function DailyPoemPage({ onBack, onPostClick, onUserClick }: DailyPoemPageProps) {
  // Featured poem (highest likes)
  const featuredPost = mockPosts.reduce((prev, current) =>
    prev.likes > current.likes ? prev : current
  );
  const featuredAuthor = getUserById(featuredPost.userId);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Previous featured poems
  const previousFeatured = mockPosts.filter(p => p.id !== featuredPost.id).slice(0, 3);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Featured Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full shadow-lg mb-4">
            <Star className="w-5 h-5 fill-white" />
            <span className="text-lg">Featured Poem of the Day</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <p>{currentDate}</p>
          </div>
        </div>

        {/* Featured Poem Card */}
        <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-2xl p-8 md:p-12 mb-12">
          {/* Author Info */}
          {featuredAuthor && (
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <button onClick={() => onUserClick(featuredAuthor.id)}>
                <Avatar className="w-16 h-16 ring-2 ring-amber-200">
                  <AvatarImage src={featuredAuthor.avatar} alt={featuredAuthor.name} />
                  <AvatarFallback>{featuredAuthor.name[0]}</AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1">
                <button
                  onClick={() => onUserClick(featuredAuthor.id)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <h3 className="text-xl text-gray-900">{featuredAuthor.name}</h3>
                </button>
                <p className="text-gray-600">@{featuredAuthor.username}</p>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                {featuredPost.genre}
              </Badge>
            </div>
          )}

          {/* Poem Title */}
          <h1 className="text-5xl text-center text-gray-900 mb-8 leading-tight">
            {featuredPost.title}
          </h1>

          {/* Poem Content */}
          <div className="max-w-2xl mx-auto">
            <div className="text-2xl text-gray-800 leading-relaxed whitespace-pre-wrap text-center mb-8 font-serif">
              {featuredPost.content}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Actions */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className={`gap-2 ${isLiked ? 'text-rose-500' : 'text-gray-600'}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span className="text-lg">{featuredPost.likes}</span>
            </Button>
            <Button variant="ghost" className="gap-2 text-gray-600">
              <Share2 className="w-6 h-6" />
              <span className="text-lg">Share</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsSaved(!isSaved)}
              className={`gap-2 ${isSaved ? 'text-rose-500' : 'text-gray-600'}`}
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-rose-500' : ''}`} />
              <span className="text-lg">{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
          </div>

          {/* View Full */}
          <div className="text-center mt-8">
            <Button
              onClick={() => onPostClick(featuredPost.id)}
              className="bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white"
            >
              View Full Poem & Comments
            </Button>
          </div>
        </div>

        {/* Why This Poem? */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-2xl text-gray-900">
              Why This Poem?
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            This beautiful piece has captured the hearts of our community with its profound emotional
            depth and masterful use of imagery. The poet's ability to weave universal themes of love,
            longing, and hope into such elegant verses makes this a must-read for anyone who appreciates
            the art of poetry. With {featuredPost.likes} likes and {featuredPost.comments} thoughtful
            comments, it's clear that this poem resonates deeply with readers from all walks of life.
          </p>
        </div>

        {/* Previous Featured Poems */}
        <div>
          <h2 className="text-2xl text-gray-900 mb-6">
            Previously Featured
          </h2>
          <div className="space-y-6">
            {previousFeatured.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostClick={onPostClick}
                onUserClick={onUserClick}
              />
            ))}
          </div>
        </div>

        {/* Subscribe to Daily Poems */}
        <div className="mt-12 bg-gradient-to-r from-rose-100 to-purple-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl text-gray-900 mb-3">
            Never Miss a Featured Poem
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Get the poem of the day delivered straight to your inbox every morning.
            Start your day with beautiful words and inspiring verses.
          </p>
          <Button className="bg-rose-500 hover:bg-rose-600 text-white">
            Subscribe to Daily Poems
          </Button>
        </div>
      </div>
    </div>
  );
}
