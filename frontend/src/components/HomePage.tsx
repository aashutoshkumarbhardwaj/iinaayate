import {
  ArrowRight,
  BookOpenText,
  Compass,
  Heart,
  PenLine,
  Sparkles,
  Star,
  TrendingUp,
  Share2,
  Users,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { moodsAPI, postAPI, statsAPI, userAPI } from '../utils/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { SwipeableCardStack } from './ui/tinder-like-swipe';

interface HomePageProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onNavigate?: (page: string, options?: { searchQuery?: string }) => void;
}

function formatCount(value?: number) {
  const n = value ?? 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function excerpt(text: string, lines = 3) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, lines)
    .join('\n');
}

function initials(name?: string) {
  const parts = (name || 'U').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

function safeDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function isValidPost(post: any) {
  return !!post && typeof post === 'object' && !!post.id && !!(post.content || post.title);
}

function uniqueUsersFromPosts(posts: any[], limit = 11) {
  const seen = new Set<string>();
  const users: any[] = [];

  for (const post of posts) {
    const user = post?.user;
    if (!user?.id || seen.has(user.id)) continue;
    seen.add(user.id);
    users.push(user);
    if (users.length >= limit) break;
  }

  return users;
}

function poetryText(post: any, lines = 3) {
  if (!post) return 'मंजिलें उन्हीं को मिलती हैं,\nजिनके सपनों में जान होती है।';
  const text = excerpt(post.content || '', lines).trim();
  return text || post.title || 'मंजिलें उन्हीं को मिलती हैं,\nजिनके सपनों में जान होती है।';
}

function PoetryCard({
  post,
  onPostClick,
  onUserClick,
  compact = false,
}: {
  post: any;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
  compact?: boolean;
}) {
  return (
    <article className={`relative overflow-hidden rounded-[8px] border border-[#f3ede4] bg-[#fffdfa] text-[#6f7f91] shadow-[0_8px_24px_rgba(26,46,68,0.04)] ${compact ? 'p-4' : 'p-5 md:p-6'}`}>
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f6f0e7]" aria-hidden="true" />
      <div className="relative flex h-full min-h-[240px] flex-col">
        <div className="flex items-start gap-3">
          <button
            onClick={() => post.user?.id && onUserClick(post.user.id)}
            className="shrink-0"
          >
            <Avatar className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} border border-[#e7e0d7]`}>
              <AvatarImage src={post.user?.avatar || ''} alt={post.user?.name || 'Poet'} />
              <AvatarFallback className="bg-[#1A2E44] text-white">
                {initials(post.user?.name)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0 flex-1">
            <button onClick={() => post.user?.id && onUserClick(post.user.id)} className="block text-left">
              <h4 className={`truncate font-serif font-semibold text-[#1b2e45] ${compact ? 'text-[1rem]' : 'text-[1.15rem]'}`}>
                {post.user?.name || 'Unknown writer'}
              </h4>
            </button>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.28em] text-[#b8b0a4]">
              {post.genre || 'Kavita'}
            </p>
          </div>
        </div>

        <button onClick={() => onPostClick(post.id)} className="mt-5 block text-left">
          <blockquote
            className={`font-poetry whitespace-pre-line italic text-[#6c7a8a] ${compact ? 'text-[1.05rem]' : 'text-[1.15rem] md:text-[1.25rem]'}`}
            style={{ lineHeight: 1.8 }}
          >
            &ldquo;{poetryText(post, compact ? 2 : 3)}&rdquo;
          </blockquote>
        </button>

        <div className="mt-auto flex items-center justify-between pt-6 text-[#b8b8b8]">
          <button type="button" className="transition-colors hover:text-[#8e4e14]" aria-label="Like poem">
            <Heart className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
          <button type="button" className="transition-colors hover:text-[#8e4e14]" aria-label="Share poem">
            <Share2 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </div>
      </div>
    </article>
  );
}

function JournalCard({
  post,
  onClick,
}: {
  post: any;
  onClick: () => void;
}) {
  const title = post?.title || excerpt(post?.content || '', 1).split('\n')[0] || 'Untitled note';
  const summary = excerpt(post?.content || '', 3);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[20px] border border-[#e8ddd1]/50 bg-gradient-to-b from-[#fdfbf7] to-[#faf8f4] text-left shadow-[0_8px_24px_rgba(26,46,68,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(26,46,68,0.10)]"
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f6f0e7]" aria-hidden="true" />
      <div className="relative flex h-full min-h-[240px] flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#b98a5c]">Journal</p>
            <h4 className="mt-2 truncate font-serif text-[1.55rem] leading-tight text-[#1b2e45] md:text-[1.8rem]">
              {title}
            </h4>
          </div>
          <span className="shrink-0 rounded-full border border-[#e8ddd1] bg-white/80 px-3 py-1 text-[0.64rem] uppercase tracking-[0.28em] text-[#8e4e14]">
            {post?.genre || 'Lekh'}
          </span>
        </div>

        <p className="mt-4 line-clamp-4 flex-1 whitespace-pre-wrap text-[0.98rem] leading-7 text-[#46505d]">
          {summary}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 text-[0.82rem] text-[#7f8a99]">
          <span className="truncate font-serif italic text-[#a36116]">
            {post?.user?.name || 'Unknown writer'}
          </span>
          <span className="shrink-0">
            {post?.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : ''}
          </span>
        </div>
      </div>
    </button>
  );
}

function FittedPoemText({
  text,
  minFontSize,
  maxFontSize,
  nudgeLeftPx = 0,
}: {
  text: string;
  minFontSize: number;
  maxFontSize: number;
  nudgeLeftPx?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLQuoteElement | null>(null);
  const [fontSize, setFontSize] = useState(minFontSize);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const quote = quoteRef.current;
    if (!container || !quote) return;

    setIsReady(false);
    const fitText = () => {
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;
      if (!availableWidth || !availableHeight) return;

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      quote.style.whiteSpace = 'normal';
      quote.style.wordBreak = 'keep-all';
      quote.style.overflowWrap = 'normal';
      quote.style.hyphens = 'manual';
      quote.style.textWrap = 'balance';
      quote.style.maxWidth = '100%';
      quote.style.margin = '0';

      while (high - low > 0.5) {
        const mid = (low + high) / 2;
        quote.style.fontSize = `${mid}px`;
        quote.style.lineHeight = '1.14';
        quote.style.letterSpacing = '-0.03em';

        if (quote.scrollWidth <= availableWidth && quote.scrollHeight <= availableHeight) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      quote.style.fontSize = `${best}px`;
      quote.style.lineHeight = '1.14';
      quote.style.letterSpacing = '-0.03em';
      setFontSize(best);
      setIsReady(true);
    };

    let cancelled = false;
    const runFit = () => {
      if (cancelled) return;
      fitText();
    };

    const observer = new ResizeObserver(runFit);
    observer.observe(container);

    const fontSet = (document as any).fonts;
    if (fontSet?.ready) {
      fontSet.ready.then(runFit).catch(runFit);
    } else {
      runFit();
    }

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [maxFontSize, minFontSize, text]);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      <blockquote
        ref={quoteRef}
        className="w-full whitespace-normal break-words [text-wrap:balance] text-center font-medium text-[#142945]"
        style={{
          fontFamily: '"Noto Serif Devanagari", "Playfair Display", ui-serif, Georgia, serif',
          fontSize: `${fontSize}px`,
          lineHeight: 1.14,
          letterSpacing: '-0.03em',
          maxWidth: '100%',
          transform: nudgeLeftPx ? `translateX(${nudgeLeftPx}px)` : undefined,
          opacity: isReady ? 1 : 0,
          visibility: isReady ? 'visible' : 'hidden',
          transition: 'opacity 120ms ease-out',
        }}
      >
        {text}
      </blockquote>
    </div>
  );
}

function MinimalPoetryCard({
  post,
  onPostClick,
  onUserClick,
}: {
  post: any;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}) {
  return (
    <article 
      onClick={() => onPostClick(post.id)}
      className="relative overflow-hidden rounded-[20px] border border-[#e8ddd1]/50 bg-gradient-to-b from-[#fdfbf7] to-[#faf8f4] cursor-pointer transition-all duration-300 hover:shadow-[0_16px_40px_rgba(26,46,68,0.10)] hover:-translate-y-1 flex flex-col justify-between min-h-[380px]"
    >
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#f4a261]/6 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#1A2E44]/4 blur-3xl pointer-events-none" />

      {/* "iinaayate" text in Hindi in background center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
        <p className="text-[5rem] md:text-[6.5rem] leading-none text-[#d4a574] font-serif select-none">ईनायते</p>
      </div>

      {/* User Header - Horizontal Line */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-8 py-5 md:py-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            post.user?.id && onUserClick(post.user.id);
          }}
          className="flex items-center gap-2 group"
        >
          <Avatar className="h-10 w-10 md:h-11 md:w-11 border-2 border-[#d4a574]/50 shadow-sm flex-shrink-0">
            <AvatarImage src={post.user?.avatar || ''} alt={post.user?.name || 'Poet'} />
            <AvatarFallback className="bg-gradient-to-br from-[#a89968] to-[#8e7a4f] text-white text-xs font-semibold">
              {initials(post.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 group-hover:text-[#8e4e14] transition-colors min-w-0">
            <p className="truncate text-sm font-serif font-bold text-[#1b2e45]">
              {post.user?.name || 'Unknown writer'}
            </p>
            <svg className="h-4 w-4 text-[#0b1d35] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.372a3.066 3.066 0 01-2.812 3.062 3.066 3.066 0 01-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 01-1.745-.723 3.066 3.066 0 01-2.812-3.062V6.517a3.066 3.066 0 012.812-3.062zm7.75 4.932a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm2.25.75a.75.75 0 100-1.5.75.75 0 000 1.5zM5.5 9.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Three dot menu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-2 hover:bg-[#f0ebe5] rounded-full transition-colors text-[#a89968] hover:text-[#8e4e14] flex-shrink-0"
          aria-label="More options"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="6" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Poetry text - centered and prominent */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-8 md:py-10">
        <blockquote
          className="text-[1.3rem] md:text-[1.55rem] leading-[1.75] md:leading-[1.9] text-[#1b2e45] font-serif italic font-medium text-center"
          style={{ fontFamily: '"Noto Serif Devanagari", "Playfair Display", ui-serif, Georgia, serif' }}
        >
          &ldquo;{poetryText(post, 2)}&rdquo;
        </blockquote>
      </div>

      {/* Like, Share and Download buttons */}
      <div className="relative z-10 flex items-center justify-center gap-8 text-[#b8b8b8] px-6 md:px-8 py-5 md:py-6">
        <button 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="transition-all duration-200 hover:text-[#d4a574] hover:scale-110 p-2" 
          aria-label="Like poem"
        >
          <Heart className="h-5 w-5" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="transition-all duration-200 hover:text-[#d4a574] hover:scale-110 p-2" 
          aria-label="Share poem"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="transition-all duration-200 hover:text-[#d4a574] hover:scale-110 p-2" 
          aria-label="Download poem"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Tags Section */}
      <div className="relative z-10 px-6 md:px-8 py-4 md:py-5 border-t border-[#e8ddd1]/30 flex flex-wrap gap-2 justify-center">
        {post.mood && (
          <span className="text-[0.7rem] md:text-[0.75rem] px-2.5 py-1.5 rounded-full bg-[#f0ebe5] text-[#8e4e14] font-medium hover:bg-[#e8ddd1] transition-colors cursor-pointer">
            #{post.mood}
          </span>
        )}
        {post.genre && (
          <span className="text-[0.7rem] md:text-[0.75rem] px-2.5 py-1.5 rounded-full bg-[#f0ebe5] text-[#8e4e14] font-medium hover:bg-[#e8ddd1] transition-colors cursor-pointer">
            #{post.genre}
          </span>
        )}
        <span className="text-[0.7rem] md:text-[0.75rem] px-2.5 py-1.5 rounded-full bg-[#f0ebe5] text-[#8e4e14] font-medium hover:bg-[#e8ddd1] transition-colors cursor-pointer">
          #poetry
        </span>
      </div>
    </article>
  );
}

function PoetPortraitCard({
  poet,
  onUserClick,
}: {
  poet: any;
  onUserClick: (userId: string) => void;
}) {
  return (
    <button
      key={poet.id}
      onClick={() => onUserClick(poet.id)}
      className="group flex shrink-0 flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2"
    >
      <div className="rounded-[8px] bg-[#f7f0e6] p-2 shadow-[0_10px_24px_rgba(26,46,68,0.08)]">
        <div className="relative h-[250px] w-[170px] overflow-hidden rounded-[3px] border border-[#e7dfd4] bg-[#111] sm:h-[280px] sm:w-[180px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.34))]" />
          <Avatar className="h-full w-full rounded-[3px]">
            <AvatarImage
              src={poet.avatar || ''}
              alt={poet.name}
              className="object-cover grayscale contrast-110 transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.02]"
            />
            <AvatarFallback className="h-full w-full rounded-[3px] bg-gradient-to-b from-[#4b4b4b] to-[#111] text-white">
              {initials(poet.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="font-serif text-[1.7rem] leading-none text-[#233a56] sm:text-[1.85rem]">
          {poet.name}
        </h4>
        <p className="mt-3 text-[0.72rem] uppercase tracking-[0.28em] text-[#b7895e]">
          {poet.username || 'VOICE'}
        </p>
      </div>
    </button>
  );
}

function GenreBentoCard({
  title,
  description,
  number,
  onClick,
  tone,
  icon,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}: {
  title: string;
  description: string;
  number: string;
  onClick: () => void;
  tone: 'dark' | 'light' | 'peach' | 'cream';
  icon?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  const tones = {
    dark: 'bg-[#1a2e44] text-[#fdf9f3]',
    light: 'bg-[#ebe8e2] text-[#03192e]',
    peach: 'bg-[#ffdcc4] text-[#2f1400]',
    cream: 'bg-[#f7f3ed] text-[#03192e]',
  } as const;

  const numberClass = {
    dark: 'text-white/55',
    light: 'text-[#8e4e14]',
    peach: 'text-[#6f3800]',
    cream: 'text-[#8e4e14]',
  } as const;

  const titleToneClass = {
    dark: 'text-[#fdf9f3]',
    light: 'text-[#03192e]',
    peach: 'text-[#2f1400]',
    cream: 'text-[#03192e]',
  } as const;

  const descToneClass = {
    dark: 'text-[#b4c8e4]/80',
    light: 'text-[#43474d]',
    peach: 'text-[#6f3800]/80',
    cream: 'text-[#43474d]',
  } as const;

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-[18px] p-3.5 text-left transition-transform duration-300 hover:-translate-y-1 md:p-5 ${tones[tone]} ${className}`}
    >
      <div className="flex h-full min-h-[112px] flex-col justify-between md:min-h-[170px]">
        <div className="flex items-start justify-between">
          <span className={`text-[9px] uppercase tracking-[0.32em] ${numberClass[tone]}`}>{number}</span>
          {icon ? (
            <span className={
              tone === 'dark'
                ? 'text-[#ffdcc4]'
                : tone === 'light'
                  ? 'text-[#8e4e14]/70'
                  : tone === 'peach'
                    ? 'text-[#6f3800]'
                    : 'text-[#03192e]'
            }>
              {icon}
            </span>
          ) : (
            <span className="h-5 w-5" />
          )}
        </div>

        <div>
          <h2 className={`font-serif text-[1.35rem] italic leading-none sm:text-[2.4rem] ${titleToneClass[tone]} ${titleClassName}`}>
            {title}
          </h2>
          <p className={`mt-1.5 max-w-[12ch] text-[0.68rem] leading-[1.15rem] sm:mt-3 sm:text-sm sm:leading-5 ${descToneClass[tone]} ${descriptionClassName}`}>
            {description}
          </p>
        </div>
      </div>

      {tone === 'light' && (
        <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-[28px] bg-[#f7f2eb] md:h-24 md:w-24" aria-hidden="true" />
      )}
    </button>
  );
}

function PoetryHeroSwipeCard({
  poetryOfDay,
  poetryOfDayText,
  poetryOfDayLength,
  heroSlide,
  setHeroSlide,
  onPostClick,
}: {
  poetryOfDay: any;
  poetryOfDayText: string;
  poetryOfDayLength: number;
  heroSlide: number;
  setHeroSlide: (value: number) => void;
  onPostClick: (postId: string) => void;
}) {
  const author = poetryOfDay?.user?.name || 'अज्ञात';
  const showReadMore = poetryOfDayLength > 110;
  const posterTitle = poetryOfDay?.title || 'कविता का दिन';
  const heroText =
    poetryOfDayText ||
    'हज़ारों ख़्वाहिशें ऐसी कि हर ख़्वाहिश पे दम निकले,\nबहुत निकले मेरे अरमां लेकिन फिर भी कम निकले।';
  const heroFallback = excerpt(poetryOfDay?.content || heroText, 3);

  const endDrag = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) setHeroSlide(1);
    if (info.offset.x > 80) setHeroSlide(0);
  };

  return (
    <article className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#f1e7d9] bg-[#fffaf2] shadow-[0_18px_46px_rgba(79,54,24,0.08)] sm:max-w-[680px] lg:max-w-[760px]">
      <motion.div
        className="flex h-full w-[200%]"
        animate={{ x: heroSlide === 0 ? '0%' : '-50%' }}
        transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={endDrag}
      >
        <div className="relative w-1/2 overflow-hidden px-5 py-6 sm:px-12 sm:py-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(254,249,243,0.96),rgba(247,239,229,0.92))]" />
          <div
            className="absolute left-[-6%] top-[3%] select-none font-serif text-[8rem] font-semibold leading-none tracking-[-0.2em] text-[#e6ddd3]/90 sm:text-[11rem]"
            style={{ transform: 'translateX(4px) translateY(0)' }}
          >
            अ
          </div>
          <div className="absolute left-5 top-7 h-24 w-24 rounded-full bg-[#f3e4d2]/60 blur-2xl" />
          <div
            className="absolute bottom-0 right-0 h-20 w-20 bg-[#efe5d8]/80"
            style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
            aria-hidden="true"
          />

          <div className="relative flex min-h-[290px] flex-col items-center justify-between text-center sm:min-h-[380px] lg:min-h-[420px]">
            <div className="flex flex-col items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#eedec7] bg-[#f8efe2] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8e4e14] shadow-[0_8px_18px_rgba(79,54,24,0.04)]">
                <span className="h-2 w-2 rounded-full bg-[#a36116]" />
                {posterTitle}
              </span>
              {showReadMore && (
                <button
                  type="button"
                  onClick={() => poetryOfDay && onPostClick(poetryOfDay.id)}
                  className="rounded-full border border-[#0b1d35]/10 bg-white/60 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-[#0b1d35]/60 backdrop-blur-sm transition-colors hover:bg-white/90 hover:text-[#0b1d35]"
                >
                  Tap to open
                </button>
              )}
            </div>

            <button onClick={() => poetryOfDay && onPostClick(poetryOfDay.id)} className="group w-full px-1 py-2 sm:py-4">
              <div className="mx-auto flex min-h-[11rem] w-full max-w-[20rem] items-center justify-center overflow-hidden px-1 sm:min-h-[15rem] sm:max-w-[24rem] lg:min-h-[16rem] lg:max-w-[28rem]">
                <FittedPoemText
                  text={heroText}
                  minFontSize={24}
                  maxFontSize={84}
                  nudgeLeftPx={-2}
                />
              </div>
            </button>

            <div className="flex w-full items-center justify-center gap-4 pb-0.5 sm:pb-1">
              <span className="h-px w-10 bg-[#d7d0c7]" />
              <cite
                className="not-italic text-[1.02rem] leading-none text-[#7f8a99] sm:text-[1.45rem]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {author}
              </cite>
              <span className="h-px w-10 bg-[#d7d0c7]" />
            </div>

            <button
              type="button"
              onClick={() => setHeroSlide(1)}
              aria-label="Tap to see the alternate poetry style"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e6d8c8]/70 bg-white/45 px-2.5 py-6 text-[10px] uppercase tracking-[0.25em] text-[#8e4e14] opacity-40 backdrop-blur-sm transition-all hover:opacity-80"
            >
              tap
              <span className="mt-1 block text-[0.95rem] leading-none">→</span>
            </button>
          </div>
        </div>

        <div className="relative w-1/2 overflow-hidden px-5 py-6 sm:px-12 sm:py-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(244,236,225,0.5))]" />
          <div className="absolute left-8 top-8 h-1 w-24 bg-[#b57a34]" />
          <div className="absolute right-6 top-8 text-right">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[#b57a34]">KAVITA KA DIN</p>
          </div>
          <div
            className="absolute right-0 bottom-0 h-28 w-28 bg-[#ece6dc]"
            style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 right-[22%] h-40 w-24 rounded-t-full bg-[#d9d6cf]/60" />
          <div
            className="absolute bottom-4 right-8 h-32 w-24 bg-[#e5e1da]/90"
            style={{ clipPath: 'polygon(0 16%, 100% 0, 100% 100%, 0 84%)' }}
          />

          <div className="relative flex min-h-[290px] flex-col justify-between text-center sm:min-h-[380px] lg:min-h-[420px]">
            <div className="mt-6 max-w-[21rem] sm:mt-10 sm:max-w-[24rem] lg:max-w-[28rem]">
              <button onClick={() => poetryOfDay && onPostClick(poetryOfDay.id)} className="block w-full">
                <div className="flex min-h-[11rem] items-center justify-center overflow-hidden sm:min-h-[16rem] lg:min-h-[17rem]">
                  <FittedPoemText
                    text={heroText}
                    minFontSize={22}
                    maxFontSize={82}
                    nudgeLeftPx={-2}
                  />
                </div>
              </button>
              <p className="mt-3 max-w-[16rem] line-clamp-3 text-[0.9rem] leading-6 text-[#46505d] sm:mt-5 sm:text-[1.1rem] sm:leading-7">
                {heroFallback}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="h-px w-16 bg-[#cdb79b]" />
              <span className="font-serif text-[0.95rem] italic text-[#a36116] sm:text-[1.3rem]">
                {author}
              </span>
              <span className="h-px w-16 bg-[#cdb79b]" />
            </div>

            <button
              type="button"
              onClick={() => setHeroSlide(0)}
              aria-label="Tap to return to the poster style"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e6d8c8]/70 bg-white/45 px-2.5 py-6 text-[10px] uppercase tracking-[0.25em] text-[#8e4e14] opacity-40 backdrop-blur-sm transition-all hover:opacity-80"
            >
              tap
              <span className="mt-1 block text-[0.95rem] leading-none">←</span>
            </button>

            <button
              type="button"
              onClick={() => poetryOfDay && onPostClick(poetryOfDay.id)}
              className="mt-3 inline-flex w-fit items-center rounded-[16px] bg-[#0b1d35] px-4 py-2 text-[0.85rem] text-white shadow-[0_10px_24px_rgba(11,29,53,0.16)] transition-transform hover:-translate-y-0.5 sm:mt-6 sm:px-5 sm:py-3 sm:text-[0.95rem]"
            >
              Read more
            </button>
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-[#e8ddd1]/80 bg-white/55 px-3 py-1.5 shadow-[0_6px_16px_rgba(79,54,24,0.05)] backdrop-blur-sm">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#a36116]">Swipe</span>
          <span className={`h-1.5 w-1.5 rounded-full ${heroSlide === 0 ? 'bg-[#0b1d35]' : 'bg-[#d7c8b6]'}`} />
          <span className={`h-1.5 w-1.5 rounded-full ${heroSlide === 1 ? 'bg-[#0b1d35]' : 'bg-[#d7c8b6]'}`} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#b98a5c]">
          tap or drag to explore another style
        </p>
      </div>
    </article>
  );
}

export function HomePage({ onPostClick, onUserClick, onNavigate }: HomePageProps) {
  const PAGE_SIZE = 11;
  const [featuredPoets, setFeaturedPoets] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [moods, setMoods] = useState<Array<{ mood: string; count: number }>>([]);
  const [qotd, setQotd] = useState<any | null>(null);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [topFive, setTopFive] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState<any | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [feedPage, setFeedPage] = useState(0);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsFeedLoading(true);

    (async () => {
      try {
        const [feed, top, stats, moodsData] = await Promise.all([
          postAPI.getPosts({ limit: PAGE_SIZE, offset: feedPage * PAGE_SIZE }),
          postAPI.getTopPosts(),
          statsAPI.getCommunity().catch(() => null),
          moodsAPI.get().catch(() => ({ moods: [] })),
        ]);

        if (!mounted) return;

        const feedList = Array.isArray(feed) ? feed.filter(isValidPost) : [];
        const topList = Array.isArray(top) ? top.filter(isValidPost) : [];
        const moodList = Array.isArray((moodsData as any)?.moods) ? (moodsData as any).moods : [];
        const userList = uniqueUsersFromPosts(feedList.length ? feedList : topList, PAGE_SIZE);

        setFeaturedPoets(userList);
        setPosts(feedList);
        setTopPosts(topList);
        setCommunityStats(stats);
        setMoods(moodList);
        setHasMoreFeed(feedList.length === PAGE_SIZE);

        const totalPoems = (stats && (stats.totalPoems || stats.poems || stats.posts)) as number | undefined;
        const pool = feedList.length ? feedList : topList;
        const todaySeed = new Date().toISOString().slice(0, 10);
        const seed = [...todaySeed].reduce((acc, char) => acc + char.charCodeAt(0), 0);

        if (typeof totalPoems === 'number' && totalPoems > 0 && pool.length > 0) {
          const pick = pool[seed % pool.length];
          setQotd(pick || null);
        } else {
          setQotd(topList[0] || feedList[0] || null);
        }

        const picks = Array.from(
          new Set([0, 1, 2, 3, 4].map((offset) => pool[(seed + offset) % Math.max(1, pool.length)]))
        ).filter(Boolean);
        setTopFive(picks.slice(0, 5));
      } catch {
        // resilient
        if (mounted) setHasMoreFeed(false);
      } finally {
        if (mounted) setIsFeedLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [feedPage]);

  const genres = useMemo(() => {
    const map = new Map<string, { count: number; sample: any | null }>();
    for (const post of [...topPosts, ...posts]) {
      const key = post.genre || post.mood || 'Other';
      const entry = map.get(key) || { count: 0, sample: null };
      entry.count += 1;
      entry.sample ||= post;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .map(([name, info]) => ({ name, count: info.count, sample: info.sample }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [posts, topPosts]);

  const searchChips = useMemo(() => {
    const terms = [
      ...genres.map((g) => g.name),
      ...moods.map((m) => m.mood),
      'Urdu',
      'Hindi',
      'Hinglish',
    ];
    return Array.from(new Set(terms.filter(Boolean))).slice(0, 6);
  }, [genres, moods]);

  const heroPost = qotd || topPosts[0] || posts[0] || null;
  const firstFeature = topPosts[0] || posts[0] || null;
  const quoteFeature = topPosts[1] || qotd || posts[1] || null;
  const secondFeature = topPosts[2] || posts[2] || null;
  const poetryOfDay = heroPost || quoteFeature || firstFeature || null;
  const poetryOfDayText = poetryOfDay?.title
    ? `${poetryOfDay.title}${poetryOfDay.content ? `\n${excerpt(poetryOfDay.content, 2)}` : ''}`
    : excerpt(poetryOfDay?.content || 'मंजिलें उन्हीं को मिलती हैं,\nजिनके सपनों में जान होती है।', 3);
  const poetryOfDayLength = poetryOfDayText.replace(/\s+/g, '').length;
  const hindiPoetry = topFive.length > 0 ? topFive : (topPosts.length > 0 ? topPosts : posts).slice(0, 5);
  const goJournal = () => onNavigate?.('blog');
  const stresthLekh = (posts.length > 0 ? posts : topPosts).slice(0, 3);
  const extraGenreOptions = Array.from(new Set([...searchChips, 'Romantic', 'Melancholy', 'Performance', 'Free Verse']))
    .filter((term) => !['Sher', 'Ghazal', 'Nazm', 'Kavita'].includes(term))
    .slice(0, 4);
  const genreTiles = [
    { number: '01', title: genres[0]?.name || 'Sher', description: genres[0]?.count ? `${formatCount(genres[0].count)} poems in the feed` : 'दो पंक्तियों की जादुई दुनिया', tone: 'dark' as const, icon: <PenLine className="h-4 w-4 md:h-5 md:w-5" />, onClick: () => onNavigate?.('search', { searchQuery: genres[0]?.name || 'Sher' }), className: 'md:col-span-2 md:row-span-2 min-h-[112px] md:min-h-[360px]', titleClassName: 'mt-2 text-[1.2rem] sm:text-[2.5rem] md:text-[2.8rem]' },
    { number: '02', title: genres[1]?.name || 'Ghazal', description: genres[1]?.count ? `${formatCount(genres[1].count)} poems` : 'लफ़्ज़ और लय की परतें', tone: 'light' as const, icon: <span className="text-[2.6rem] leading-none opacity-10 sm:text-[4rem]">♪</span>, onClick: () => onNavigate?.('search', { searchQuery: genres[1]?.name || 'Ghazal' }), className: 'md:col-span-1 md:row-span-1 min-h-[112px] md:min-h-[165px]', titleClassName: 'mt-2.5 text-[1.2rem] sm:mt-6 sm:text-[2.45rem]' },
    { number: '03', title: genres[2]?.name || 'Nazm', description: genres[2]?.count ? `${formatCount(genres[2].count)} poems` : 'कहानी, प्रवाह और अर्थ', tone: 'peach' as const, icon: <BookOpenText className="h-4 w-4 md:h-5 md:w-5" />, onClick: () => onNavigate?.('search', { searchQuery: genres[2]?.name || 'Nazm' }), className: 'md:col-span-1 md:row-span-2 min-h-[112px] md:min-h-[354px]', titleClassName: 'mt-2.5 text-[1.25rem] sm:mt-8 sm:text-[2.7rem]' },
    { number: '04', title: genres[3]?.name || 'Kavita', description: genres[3]?.count ? `${formatCount(genres[3].count)} poems` : 'छंद और मुक्तक का संगम', tone: 'cream' as const, icon: <ArrowRight className="h-4 w-4 rounded-full border border-[#c4c6cd]/40 p-1.5 text-[#03192e] md:h-5 md:w-5 md:p-2" />, onClick: () => onNavigate?.('search', { searchQuery: genres[3]?.name || 'Kavita' }), className: 'md:col-span-1 md:row-span-1 min-h-[112px] md:min-h-[165px]', titleClassName: 'mt-2.5 text-[1.2rem] sm:mt-6 sm:text-[2.45rem]', descriptionClassName: 'max-w-[10ch]' },
    ...extraGenreOptions.map((term, index) => ({
      number: String(index + 5).padStart(2, '0'),
      title: term,
      description:
        term === 'Romantic'
          ? 'दिल की नर्म परतें'
          : term === 'Melancholy'
            ? 'गहरे एहसासों की धुन'
            : term === 'Performance'
              ? 'मंच और आवाज़ का संगम'
              : 'भाव, लय और अभिव्यक्ति',
      tone: (['light', 'cream', 'dark', 'peach'] as const)[index % 4],
      icon: <ArrowRight className="h-4 w-4" />,
      onClick: () => onNavigate?.('search', { searchQuery: term }),
      className: index % 4 === 0 ? 'md:col-span-1 md:row-span-1 min-h-[112px] md:min-h-[140px]' : index % 4 === 1 ? 'md:col-span-1 md:row-span-1 min-h-[112px] md:min-h-[140px]' : index % 4 === 2 ? 'md:col-span-1 md:row-span-1 min-h-[112px] md:min-h-[140px]' : 'md:col-span-1 md:row-span-1 min-h-[112px] md:min-h-[140px]',
      titleClassName: 'mt-2.5 text-[1rem] sm:mt-4 sm:text-[2rem]',
      descriptionClassName: 'max-w-[14ch] text-[0.65rem] leading-4 sm:text-[0.78rem] sm:leading-5',
    })),
  ];
  const marqueePoets = useMemo(
    () => (featuredPoets.length > 0 ? [...featuredPoets, ...featuredPoets] : []),
    [featuredPoets]
  );
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('currentUserId') : null;

  const handleFollowToggle = async (userId: string) => {
    if (currentUserId && currentUserId === userId) return;
    const isNow = !followed[userId];
    setFollowed((v) => ({ ...v, [userId]: isNow }));
    try {
      if (isNow) await userAPI.follow(userId);
      else await userAPI.unfollow(userId);
    } catch {
      setFollowed((v) => ({ ...v, [userId]: !isNow }));
    }
  };

  const goExplore = () => onNavigate?.('explore');
  const goWrite = () => onNavigate?.('write');
  const goEvents = () => onNavigate?.('events');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdf9f3]">
      <Helmet>
        <title>iinaayate - Hindi Urdu Poetry & Shayari</title>
        <meta name="description" content="Read, write, and share Hindi, Urdu, and Hinglish poetry and shayari on iinaayate. Discover ghazals, nazms, sher, and more." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="iinaayate - Hindi Urdu Poetry & Shayari" />
        <meta property="og:description" content="Read, write, and share poetry and shayari in Hindi, Urdu, and Hinglish." />
      </Helmet>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-6%] h-72 w-72 rounded-full bg-[#F4A261]/15 blur-3xl" />
        <div className="absolute right-[-4%] top-[12%] h-96 w-96 rounded-full bg-[#1A2E44]/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[20%] h-80 w-80 rounded-full bg-sky-200/12 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ── Hero / Kavita ka Din ── */}
        <section className="relative mt-4 mb-4 flex flex-col items-center gap-8">
          <div className="absolute -top-12 -left-8 h-64 w-64 rounded-full bg-[#F4A261]/10 blur-3xl -z-10" />

          <PoetryHeroSwipeCard
            poetryOfDay={poetryOfDay}
            poetryOfDayText={poetryOfDayText}
            poetryOfDayLength={poetryOfDayLength}
            heroSlide={heroSlide}
            setHeroSlide={setHeroSlide}
            onPostClick={onPostClick}
          />

        </section>

        {/* ── Genre Bento Grid ── */}
        <section>
          <h3 className="mb-8 flex items-center gap-2 font-serif text-2xl text-[#03192e]">
            <Sparkles className="h-5 w-5 text-[#8e4e14]" />
            श्रेणियाँ
          </h3>
          <div className="mx-auto grid max-w-[340px] grid-cols-2 auto-rows-[minmax(112px,auto)] gap-2.5 md:max-w-[920px] md:grid-cols-4 md:gap-5 [grid-auto-flow:dense]">
            {genreTiles.map((tile, index) => (
              <GenreBentoCard
                key={`${tile.title}-${index}`}
                number={tile.number}
                title={tile.title}
                description={tile.description}
                tone={tile.tone}
                onClick={tile.onClick}
                icon={tile.icon}
                className={tile.className}
                titleClassName={tile.titleClassName}
                descriptionClassName={tile.descriptionClassName}
              />
            ))}
          </div>
        </section>

        {/* ── Hindi Poetry ── */}
        <section>
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Hindi Poetry</p>
              <h3 className="mt-2 font-serif text-2xl text-[#03192e]">पाँच हिंदी कविताएँ</h3>
            </div>
            <button
              onClick={() => onNavigate?.('search', { searchQuery: 'Hindi' })}
              className="font-sans text-xs text-[#8e4e14] uppercase tracking-widest border-b border-[#8e4e14]/30 pb-1 hover:border-[#8e4e14] transition-all"
            >
              View All
            </button>
          </div>

          <div className="md:hidden">
            <SwipeableCardStack
              items={hindiPoetry}
              className="h-[350px]"
              renderCard={(post) => (
                <PoetryCard
                  post={post}
                  compact
                  onPostClick={onPostClick}
                  onUserClick={onUserClick}
                />
              )}
            />
          </div>

          <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-5">
            {hindiPoetry.map((post) => (
              <PoetryCard
                key={post.id}
                post={post}
                compact
                onPostClick={onPostClick}
                onUserClick={onUserClick}
              />
            ))}
          </div>
        </section>

        {/* ── Stresth Lekh ── */}
        <section>
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Journal</p>
              <h3 className="mt-2 font-serif text-2xl text-[#03192e]">Stresth Lekh</h3>
            </div>
            <button
              onClick={goJournal}
              className="font-sans text-xs text-[#8e4e14] uppercase tracking-widest border-b border-[#8e4e14]/30 pb-1 hover:border-[#8e4e14] transition-all"
            >
              View All Journal
            </button>
          </div>

          <div className="md:hidden">
            <SwipeableCardStack
              items={stresthLekh}
              className="h-[330px]"
              renderCard={(post) => (
                <JournalCard
                  post={post}
                  onClick={goJournal}
                />
              )}
            />
          </div>

          <div className="hidden gap-4 lg:grid lg:grid-cols-3">
            {stresthLekh.map((post) => (
              <JournalCard
                key={post.id}
                post={post}
                onClick={goJournal}
              />
            ))}
          </div>
        </section>

        {/* ── Featured Poets ── */}
        <section className="px-0 py-6 sm:py-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h3 className="font-serif text-[2.15rem] leading-none text-[#20344d] sm:text-[3rem]">
              Prasidh Kavi
            </h3>
            <div className="mx-auto mt-4 h-[3px] w-14 bg-[#a36116]" />
            <p className="mx-auto mt-5 max-w-2xl font-serif text-[1.05rem] leading-8 text-[#6f7a86] sm:text-[1.2rem]">
              The timeless voices that continue to shape the literary horizon of the subcontinent.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#fdf9f3] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#fdf9f3] to-transparent" />

            {featuredPoets.length > 0 ? (
              <motion.div
                className="flex w-max items-start gap-10 py-3"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 64,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              >
                {marqueePoets.map((poet, index) => (
                  <PoetPortraitCard
                    key={`${poet.id}-${index}`}
                    poet={poet}
                    onUserClick={onUserClick}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#c4c6cd] bg-white/40 px-6 py-8 text-sm text-[#43474d]">
                Featured writers will appear here as soon as the community data loads.
              </div>
            )}
          </div>

        </section>

        {/* ── Latest Feed ── */}
        <section>
          <div className="mb-10 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#b98a5c]">Latest feed</p>
              <h3 className="mt-2 font-serif text-2xl text-[#03192e]">Fresh writing from the community</h3>
            </div>
            <button
              onClick={goExplore}
              className="font-sans text-xs text-[#8e4e14] uppercase tracking-widest border-b border-[#8e4e14]/30 pb-1 hover:border-[#8e4e14] transition-all"
            >
              Explore feed
            </button>
          </div>

          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            {posts.length > 0 ? (
              posts.map((post) => (
                <MinimalPoetryCard
                  key={post.id}
                  post={post}
                  onPostClick={onPostClick}
                  onUserClick={onUserClick}
                />
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#c4c6cd] bg-white/40 p-6 text-sm leading-7 text-[#43474d]">
                The feed is quiet right now. As soon as new poems arrive, they will appear here.
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedPage((page) => page + 1)}
              disabled={!hasMoreFeed || isFeedLoading}
              className="rounded-full border-[#e8ddd1] bg-white/70 px-5 text-[#8e4e14] shadow-sm hover:bg-white"
            >
              {isFeedLoading ? 'Loading...' : hasMoreFeed ? 'Next 11' : 'No more poems'}
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
