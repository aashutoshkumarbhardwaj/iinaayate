import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type SwipeDirection = 'left' | 'right' | null;

export function SwipeableCardStack<T>({
  items = [],
  renderCard,
  borderRadius = 16,
  showInnerShadows = true,
  greenShadowColor = 'rgba(45, 150, 45, 0.18)',
  redShadowColor = 'rgba(224, 83, 83, 0.18)',
  innerStrokeColor = 'rgba(0, 0, 0, 0.08)',
  shadowSize = '0 8px 20px',
  shadowBlur = 'rgba(0, 0, 0, 0.16)',
  className = '',
}: {
  items?: T[];
  renderCard: (item: T, index: number, isTopCard: boolean) => React.ReactNode;
  borderRadius?: number;
  showInnerShadows?: boolean;
  greenShadowColor?: string;
  redShadowColor?: string;
  innerStrokeColor?: string;
  shadowSize?: string;
  shadowBlur?: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [dragDirection, setDragDirection] = React.useState<SwipeDirection>(null);
  const [swipeOutDirection, setSwipeOutDirection] = React.useState<SwipeDirection>(null);
  const swipeThreshold = 70;
  const keySignature = React.useMemo(
    () => items.map((item, index) => String((item as any)?.id ?? (item as any)?.title ?? index)).join('|'),
    [items]
  );

  React.useEffect(() => {
    setActiveIndex(0);
    setDragDirection(null);
    setSwipeOutDirection(null);
  }, [keySignature]);

  if (!items.length) {
    return <div className={`relative w-full ${className}`} />;
  }

  const current = items[activeIndex % items.length];
  const nextOne = items[(activeIndex + 1) % items.length];
  const nextTwo = items[(activeIndex + 2) % items.length];

  const moveToNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    setDragDirection(null);
    setSwipeOutDirection(null);
  };

  const handleDrag = (_: unknown, info: { offset: { x: number } }) => {
    setDragDirection(info.offset.x > 0 ? 'right' : 'left');
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setSwipeOutDirection(direction);
      window.setTimeout(moveToNext, 180);
      return;
    }
    setDragDirection(null);
  };

  const backgroundCard = (depth: number) => (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius,
        transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.03})`,
        boxShadow: `inset 0 0 0 1px ${innerStrokeColor}, ${shadowSize} ${shadowBlur}`,
        opacity: depth === 0 ? 0.18 : 0.12,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,242,233,0.92))',
      }}
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f6f0e7]" aria-hidden="true" />
    </div>
  );

  return (
    <div className={`relative w-full ${className}`} style={{ touchAction: 'pan-y' }}>
      <div className="absolute inset-0">
        {nextTwo && backgroundCard(2)}
        {nextOne && backgroundCard(1)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={String((current as any)?.id ?? (current as any)?.title ?? activeIndex)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.22}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          initial={{ scale: 0.98, y: 18, opacity: 0 }}
          animate={{
            scale: 1,
            y: 0,
            x: 0,
            opacity: 1,
            rotate: dragDirection === 'right' ? 2 : dragDirection === 'left' ? -2 : 0,
            transition: { duration: 0.22, ease: 'easeOut' },
          }}
          exit={{
            x: swipeOutDirection === 'right' ? 260 : -260,
            rotate: swipeOutDirection === 'right' ? 14 : -14,
            opacity: 0,
            transition: { duration: 0.18, ease: 'easeIn' },
          }}
          className="absolute inset-0"
          style={{
            borderRadius,
            boxShadow: `inset 0 0 0 1px ${innerStrokeColor}, ${shadowSize} ${shadowBlur}`,
            cursor: 'grab',
            zIndex: 3,
          }}
        >
          <div className="relative h-full w-full overflow-hidden" style={{ borderRadius }}>
            {renderCard(current, activeIndex, true)}
            {showInnerShadows && (
              <div
                className="pointer-events-none absolute inset-0 transition-all duration-200"
                style={{
                  borderRadius,
                  boxShadow:
                    dragDirection === 'right'
                      ? `inset 0px -90px 60px ${greenShadowColor}`
                      : dragDirection === 'left'
                        ? `inset 0px -90px 60px ${redShadowColor}`
                        : 'none',
                }}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
