import type { ReactNode } from "react";
import { Link as Link2 } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type SecondaryButtonProps = {
  to?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
};

export function SecondaryButton({
  to,
  href,
  children,
  className,
  size = "md",
  magnetic = true,
}: SecondaryButtonProps) {
  const sizes = {
    sm: "h-9 px-4 text-xs rounded-xl",
    md: "h-11 px-6 text-sm rounded-xl",
    lg: "h-12 px-8 text-base rounded-xl",
  } as const;

  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-card/80 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98]",
    sizes[size],
    className,
  );

  const content = <span className="relative z-10 flex items-center gap-2">{children}</span>;

  const buttonElement = to ? (
    <Link2 to={to as never} className={cn(classes, className)}>
      {content}
    </Link2>
  ) : href ? (
    <a href={href} className={cn(classes, className)} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <button type="button" className={cn(classes, className)}>
      {content}
    </button>
  );

  if (magnetic) {
    return <Magnetic className="inline-block">{buttonElement}</Magnetic>;
  }

  return buttonElement;
}
