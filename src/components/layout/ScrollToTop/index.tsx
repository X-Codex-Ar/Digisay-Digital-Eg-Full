import { useEffect, useState } from "react";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export function ScrollToTop({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        aria-label="Scroll to top"
        className={cn(
          "fixed bottom-6 right-6 z-40 rounded-xl border border-border bg-background p-3 shadow-lg transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
          className,
        )}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        whileHover={{ scale: reduced ? 1 : 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
      >
        <ArrowUp className="size-5 text-foreground" />
      </motion.button>
    </AnimatePresence>
  );
}
