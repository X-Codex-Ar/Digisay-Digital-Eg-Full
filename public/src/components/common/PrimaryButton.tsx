import { ArrowRight, MessageSquare, type LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type PrimaryButtonProps = {
  to?: string;
  href?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "hero";
  subtitle?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
  magnetic?: boolean;
};

const baseClass =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-[#bf0826] hover:shadow-xl hover:shadow-primary/25 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const sizes = {
  sm: "h-9 px-4 text-xs font-semibold rounded-xl",
  md: "h-11 px-6 text-sm font-semibold rounded-2xl",
  lg: "h-16 px-8 text-base font-bold rounded-2xl shadow-lg shadow-primary/25",
} as const;

export function PrimaryButton({
  to,
  href,
  children,
  className,
  size = "md",
  variant = "default",
  subtitle,
  icon,
  disabled,
  onClick,
  magnetic = true,
}: PrimaryButtonProps) {
  if (variant === "hero") {
    const IconComponent = icon || MessageSquare;
    const heroClasses = cn(
      "group relative inline-flex h-16 items-center gap-3.5 rounded-2xl bg-primary text-primary-foreground px-5 sm:px-6 shadow-md shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:bg-[#bf0826] hover:shadow-xl hover:shadow-primary/35 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
      className,
    );

    const heroContent = (
      <>
        {/* Pulsing icon badge matching PlayVideoButton */}
        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
          <IconComponent className="size-5 fill-white/20 text-white transition-transform duration-300 group-hover:scale-110" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors group-hover:text-white">
            {subtitle || "Get In Touch"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-bold text-white sm:text-base">
            {children}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </>
    );

    const buttonElement = to ? (
      <Link to={to as never} className={heroClasses} disabled={disabled ?? false} onClick={onClick}>
        {heroContent}
      </Link>
    ) : href ? (
      <a
        href={href}
        className={heroClasses}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {heroContent}
      </a>
    ) : (
      <button type="button" className={heroClasses} disabled={disabled} onClick={onClick}>
        {heroContent}
      </button>
    );

    if (magnetic && !disabled) {
      return <Magnetic className="inline-block">{buttonElement}</Magnetic>;
    }

    return buttonElement;
  }

  const classes = cn(baseClass, sizes[size], className);
  const content = (
    <span className="relative z-10 flex items-center gap-2">
      {children}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
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
