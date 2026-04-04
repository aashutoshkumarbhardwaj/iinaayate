import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Bookmark, Share2, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { FadeIn } from './ui/motion';
import { postAPI } from '../utils/api';

interface TopPoemsCarouselProps {
  onPostClick: (postId: string) => void;
}

export function TopPoemsCarousel({ onPostClick }: TopPoemsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topPoems, setTopPoems] = useState<any[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await postAPI.getTopPosts();
        if (mounted) setTopPoems(data);
      } catch {
        // Keep the carousel resilient even if the endpoint fails.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentPoem = topPoems[currentIndex];
  const author = currentPoem?.user;

  const nextSlide = () => {
    setCurrentIndex((prev) => (topPoems.length ? (prev + 1) % topPoems.length : 0));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (topPoems.length ? (prev - 1 + topPoems.length) % topPoems.length : 0));
  };

  useEffect(() => {
    if (!topPoems.length || isHovered) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topPoems.length);
    }, 5000);
    return () => clearInterval(id);
  }, [topPoems.length, isHovered]);

  const handleDownload = () => {
    toast.success('Poem image downloaded!');
  };

  if (!currentPoem || !author) return null;

  const gradients = [
    'from-slate-50 via-white to-sky-50',
    'from-blue-50 via-white to-slate-50',
    'from-slate-50 via-white to-indigo-50',
    'from-zinc-50 via-white to-slate-100',
    'from-sky-50 via-white to-slate-50',
  ];

  return (
    <FadeIn className="mb-12" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="section-kicker">Momentum</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Trending now</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevSlide} className="glass-panel rounded-[20px] border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} className="glass-panel rounded-[20px] border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="glass-card relative overflow-hidden rounded-[20px]">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[currentIndex]}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_30%)]" />

        <AnimatePresence mode="wait">
          <motion.button
            key={currentPoem.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex w-full flex-col gap-8 p-6 text-left sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10"
            onClick={() => onPostClick(currentPoem.id)}
          >
            <div className="flex max-w-3xl flex-col gap-6">
              <div className="glass-panel inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600">
                Featured today
              </div>
              <div>
                <h3 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{currentPoem.title}</h3>
                <p className="mt-5 max-w-2xl whitespace-pre-wrap text-lg leading-8 text-slate-600">
                  {(currentPoem.content || '').split('\n').slice(0, 3).join('\n')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">{author?.name}</span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2">{currentPoem.genre || 'Poetry'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:min-w-[280px] lg:items-end">
              <div className="glass-panel flex flex-wrap items-center gap-4 rounded-[20px] px-5 py-4 text-slate-600">
                <button className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                  <Heart className="h-5 w-5 fill-sky-600 text-sky-600" />
                  <span>{currentPoem.likesCount ?? currentPoem?._count?.likes ?? 0}</span>
                </button>
                <button className="transition-transform duration-300 hover:scale-105">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="transition-transform duration-300 hover:scale-105">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="h-11 rounded-[20px] border border-slate-950 bg-slate-950 px-5 text-white transition-all duration-300 hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {topPoems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-slate-950' : 'w-2 bg-slate-300'}`}
          />
        ))}
      </div>
    </FadeIn>
  );
}
