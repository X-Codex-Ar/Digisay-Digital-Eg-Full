import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  narrow,
}: {
  children?: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1300px] px-4 sm:px-6 xl:px-8", className)}>
      {children}
    </div>
  );
}
