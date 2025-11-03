import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { mockPosts, mockUsers } from '../data/mockData';
import { PostCard } from './PostCard';
import { TopPoemsCarousel } from './TopPoemsCarousel';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface HomePageProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export function HomePage({ onPostClick, onUserClick }: HomePageProps) {
  const [featuredPoetIndex, setFeaturedPoetIndex] = useState(0);
  
  // Get top poets
  const featuredPoets = [...mockUsers].sort((a, b) => b.followers - a.followers).slice(0, 8);
  
  const scrollPoets = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setFeaturedPoetIndex(Math.max(0, featuredPoetIndex - 4));
    } else {
      setFeaturedPoetIndex(Math.min(featuredPoets.length - 4, featuredPoetIndex + 4));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <p className="text-lg text-gray-500 mb-2">Biggest collection of</p>
          <h1 className="text-5xl text-gray-900 mb-1">
            new-age <span className="relative inline-block">
              <span className="text-purple-600">poetry</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M2 5C50 2 150 2 198 5" stroke="#9333ea" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
        </div>

        {/* Featured Poets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900">Featured Poets</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollPoets('left')}
                disabled={featuredPoetIndex === 0}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollPoets('right')}
                disabled={featuredPoetIndex >= featuredPoets.length - 4}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {featuredPoets.slice(featuredPoetIndex, featuredPoetIndex + 6).map((poet) => (
              <button
                key={poet.id}
                onClick={() => onUserClick(poet.id)}
                className="flex flex-col items-center group"
              >
                <Avatar className="w-20 h-20 mb-2 ring-2 ring-rose-100 group-hover:ring-rose-300 transition-all">
                  <AvatarImage src={poet.avatar} alt={poet.name} />
                  <AvatarFallback>{poet.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-900 text-center truncate w-full group-hover:text-rose-600 transition-colors">
                  {poet.name.split(' ')[0]}...
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Top Carousel */}
        <TopPoemsCarousel onPostClick={onPostClick} />

        {/* Posts Feed */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl text-gray-900 mb-6">Latest Poems</h2>
          <div className="space-y-6">
            {mockPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostClick={onPostClick}
                onUserClick={onUserClick}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="text-rose-500 hover:text-rose-600 transition-colors">
              Load more poems
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
