import { FileText } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager";
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  width,
  height,
  loading = "lazy",
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted/50", className)}
        style={{
          width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
          height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
        }}
      >
        {fallback ?? <FileText className="size-1/2 text-muted-foreground" />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("h-full w-full object-cover", className)}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
