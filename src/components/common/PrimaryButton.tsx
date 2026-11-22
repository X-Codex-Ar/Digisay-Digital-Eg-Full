import { ArrowRight } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type PrimaryButtonProps = {
  to?: string;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
};

const baseClass =
  "group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

export function PrimaryButton({ to, href, children, className, size = "md", disabled }: PrimaryButtonProps) {
  const classes = cn(baseClass, sizes[size], className);
  const content = (
    <>
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );
  if (to) {
    return (
      <Link to={to as never} className={classes} disabled={disabled}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} disabled={disabled}>
      {content}
    </button>
  );
}
