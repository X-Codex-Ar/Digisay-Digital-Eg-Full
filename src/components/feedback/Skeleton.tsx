import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonProps = { className?: string; children?: ReactNode };

export function TextSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-4 rounded-sm", className)} />;
}

export function ImageSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn("aspect-[16/9] rounded-2xl", className)} />;
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-card p-6", className)}>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 md:p-8">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-6 w-1/2 rounded-sm" />
      <Skeleton className="h-4 w-full rounded-sm" />
      <Skeleton className="h-4 w-2/3 rounded-sm" />
    </div>
  );
}

export function PageSectionSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-10 w-2/3" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
