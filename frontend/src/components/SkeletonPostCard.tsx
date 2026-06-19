import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';

export function SkeletonPostCard() {
  return (
    <motion.article
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="glass-card group flex flex-col gap-5 rounded-[20px] p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-3/4" />

      {/* Content preview */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Actions */}
      <div className="glass-panel flex flex-wrap items-center gap-5 rounded-[20px] border border-slate-200 px-4 py-3">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="ml-auto h-8 w-20 rounded-full" />
      </div>
    </motion.article>
  );
}
