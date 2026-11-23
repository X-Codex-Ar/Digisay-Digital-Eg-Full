import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { Magnetic } from "./Magnetic";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    // Initialize based on current DOM state or saved preference
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    const updateDOM = () => {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      try {
        localStorage.setItem("digisay_theme", nextTheme);
      } catch {
        // ignore
      }
      setTheme(nextTheme);
    };

    // Modern Motion Transition inspired by motionsites.ai
    if (typeof document !== "undefined" && "startViewTransition" in document && !reduced) {
      const rect = e.currentTarget.getBoundingClientRect();
      // Center of button or mouse click coordinates
      const x = e.clientX || rect.left + rect.width / 2;
      const y = e.clientY || rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transition = (document as any).startViewTransition(updateDOM);

      transition.ready
        .then(() => {
          const animation = document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
            },
            {
              duration: 500,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              pseudoElement: "::view-transition-new(root)",
            },
          );
          return animation.finished;
        })
        .catch(() => {
          // If interrupted or aborted, DOM state has already been committed cleanly
        });
    } else {
      // Smooth CSS fallback transition for browsers without View Transitions
      document.documentElement.classList.add("theme-transitioning");
      updateDOM();
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 450);
    }
  };

  if (!mounted) {
    return (
      <div className="size-10 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm" />
    );
  }

  const isDark = theme === "dark";

  return (
    <Magnetic>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={`group relative flex size-10 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card/70 backdrop-blur-sm text-foreground shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-card hover:text-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95 ${
          className || ""
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 45, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex items-center justify-center text-primary"
            >
              <Moon className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 45, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -45, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex items-center justify-center text-amber-500"
            >
              <Sun className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </Magnetic>
  );
}
