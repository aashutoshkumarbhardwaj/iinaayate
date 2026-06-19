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

export function SkeletonPoetryCard() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="relative overflow-hidden rounded-[8px] border border-[#f3ede4] bg-[#fffdfa] p-5 md:p-6"
    >
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#f6f0e7]" />
      <div className="relative flex h-full min-h-[240px] flex-col">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-2 flex-1">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between pt-6">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonAuthorCard() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left"
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </motion.div>
  );
}

export function SkeletonEventCard() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="rounded-2xl border border-gray-200 overflow-hidden"
    >
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonBlogCard() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="rounded-[24px] border border-black/8 bg-white p-5"
    >
      <Skeleton className="h-32 w-full rounded-[12px] mb-3" />
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </motion.div>
  );
}
