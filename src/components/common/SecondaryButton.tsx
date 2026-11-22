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
  const classes =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-[0.98] md:px-6 md:py-3" +
    (size === "sm"
      ? " px-4 py-2 text-xs rounded-xl"
      : size === "lg"
        ? " px-8 py-3.5 text-base rounded-xl"
        : " rounded-xl");

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
