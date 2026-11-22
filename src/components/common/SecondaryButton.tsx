import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SecondaryButtonProps = {
  to?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function SecondaryButton({ to, href, children, className, size = "md" }: SecondaryButtonProps) {
  const classes =
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-transparent px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-foreground hover:text-background md:bg-background md:px-6 md:py-3" +
    (size === "sm" ? " px-4 py-2 text-xs" : size === "lg" ? " px-8 py-4 text-base" : "");
  if (to) {
    return <Link2 to={to as never} className={cn(classes, className)}>{children}</Link2>;
  }
  if (href) {
    return (
      <a href={href} className={cn(classes, className)} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <button type="button" className={cn(classes, className)}>{children}</button>;
}

// Small local wrapper so Link behaves like a styled anchor for secondary buttons.
import { Link as Link2 } from "@tanstack/react-router";
