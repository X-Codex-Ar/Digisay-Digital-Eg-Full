import { FileText } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
};

export function ImageWithFallback({ src, alt, className, fallback }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/50", className)}>
        {fallback ?? <FileText className="size-1/2 text-muted-foreground" />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
