import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type PrimaryButtonProps = {
  to?: string;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  magnetic?: boolean;
};

const baseClass =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

export function PrimaryButton({
  to,
  href,
  children,
  className,
  size = "md",
  disabled,
  onClick,
  magnetic = true,
}: PrimaryButtonProps) {
  const classes = cn(baseClass, sizes[size], className);
  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-0 bg-gradient-to-r from-[#d90a2c]/20 via-transparent to-primary/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </>
  );

  const buttonElement = to ? (
    <Link to={to as never} className={classes} disabled={disabled ?? false} onClick={onClick}>
      {content}
    </Link>
  ) : href ? (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {content}
    </a>
  ) : (
    <button type="button" className={classes} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );

  if (magnetic && !disabled) {
    return <Magnetic className="inline-block">{buttonElement}</Magnetic>;
  }

  return buttonElement;
}
