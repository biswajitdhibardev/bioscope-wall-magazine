import * as React from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton rounded-md', className)}
      {...props}
    />
  );
}

function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton className={cn('h-4 w-full', className)} {...props} />
  );
}

function SkeletonImage({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton className={cn('w-full aspect-square rounded-lg', className)} {...props} />
  );
}

function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('flex flex-col space-y-3 p-4 rounded-xl border border-[#262626] bg-[#141414]', className)} {...props}>
      <SkeletonImage className="aspect-video" />
      <div className="space-y-2 mt-4">
        <SkeletonText className="w-2/3 h-5" />
        <SkeletonText className="w-full" />
        <SkeletonText className="w-4/5" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonImage, SkeletonCard };
