import { motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";

export interface PlayVideoButtonProps {
  onClick: () => void;
  label?: string;
  variant?: "hero" | "card" | "minimal";
  className?: string;
}

export function PlayVideoButton({
  onClick,
  label = "Watch Video",
  variant = "hero",
  className = "",
}: PlayVideoButtonProps) {
  const reduced = useReducedMotion();

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`group relative flex items-center justify-center ${className}`}
      >
        {/* Pulsing radar waves */}
        {!reduced && (
          <>
            <span className="absolute size-20 rounded-full bg-primary/20 animate-ping opacity-60" />
            <span className="absolute size-24 rounded-full border border-primary/40 animate-pulse" />
          </>
        )}

        {/* Central Play Orb */}
        <div className="relative flex size-16 sm:size-20 items-center justify-center rounded-2xl sm:rounded-3xl border border-white/20 bg-primary text-white shadow-2xl shadow-primary/50 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#b80824] group-active:scale-95">
          <Play className="ml-1 size-7 fill-white text-white sm:size-8" />
        </div>
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`group inline-flex items-center gap-2.5 text-sm font-semibold text-foreground transition-colors hover:text-primary ${className}`}
      >
        <span className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-muted/30 text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
          <Play className="ml-0.5 size-4 fill-current" />
        </span>
        <span>{label}</span>
      </button>
    );
  }

  // "hero" variant
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduced ? {} : { scale: 1.03 }}
      whileTap={reduced ? {} : { scale: 0.97 }}
      className={`group relative inline-flex h-16 items-center gap-3.5 rounded-2xl border border-border/70 bg-card/80 px-5 sm:px-6 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/10 ${className}`}
    >
      {/* Pulsing play icon badge */}
      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
        {!reduced && (
          <span className="absolute -inset-1 rounded-xl bg-primary/30 animate-pulse" />
        )}
        <Play className="relative z-10 ml-0.5 size-4 fill-white text-white" />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
          Showreel
        </span>
        <span className="text-sm font-bold text-foreground sm:text-base">
          {label}
        </span>
      </div>
    </motion.button>
  );
}
