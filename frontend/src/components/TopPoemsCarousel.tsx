import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Bookmark, Share2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { postAPI } from '../utils/api';
import { toast } from 'sonner';

interface TopPoemsCarouselProps {
  onPostClick: (postId: string) => void;
}

export function TopPoemsCarousel({ onPostClick }: TopPoemsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topPoems, setTopPoems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await postAPI.getTopPosts();
        if (mounted) setTopPoems(data);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const currentPoem = topPoems[currentIndex];
  const author = currentPoem?.user;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % topPoems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + topPoems.length) % topPoems.length);
  };

  const handleDownload = () => {
    toast.success('Poem image downloaded! 🎨');
  };

  if (!currentPoem || !author) return null;

  // Different gradient themes for each slide
  const gradients = [
    'from-purple-600 to-purple-800',
    'from-rose-600 to-pink-700',
    'from-blue-600 to-indigo-700',
    'from-green-600 to-emerald-700',
    'from-orange-600 to-red-700',
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-gray-900">Today's top 5</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Card */}
      <div
        className={`relative bg-gradient-to-br ${gradients[currentIndex]} rounded-2xl overflow-hidden cursor-pointer group`}
        onClick={() => onPostClick(currentPoem.id)}
      >
        {/* Decorative Floral Pattern */}
        <div className="absolute right-8 bottom-8 opacity-30">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path
              d="M60 20C60 20 75 35 75 50C75 65 65 75 60 75C55 75 45 65 45 50C45 35 60 20 60 20Z"
              fill="white"
            />
            <path
              d="M60 100C60 100 45 85 45 70C45 55 55 45 60 45C65 45 75 55 75 70C75 85 60 100 60 100Z"
              fill="white"
            />
            <path
              d="M20 60C20 60 35 45 50 45C65 45 75 55 75 60C75 65 65 75 50 75C35 75 20 60 20 60Z"
              fill="white"
            />
            <path
              d="M100 60C100 60 85 75 70 75C55 75 45 65 45 60C45 55 55 45 70 45C85 45 100 60 100 60Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative p-12">
          {/* Poem Text - Urdu/Hindi style */}
          <div className="text-center mb-8">
            <p className="text-3xl text-white leading-relaxed mb-2 max-w-3xl mx-auto" style={{ fontFamily: 'serif' }}>
              {(currentPoem.content || '').split('\n').slice(0, 2).join('\n')}
            </p>
            <p className="text-white/80 text-lg mt-4">{author?.name}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-white hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 fill-white" />
                <span>{currentPoem.likesCount ?? currentPoem?._count?.likes ?? 0}</span>
              </button>
              <button className="text-white hover:scale-110 transition-transform">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="text-white hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {topPoems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-purple-600 w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
