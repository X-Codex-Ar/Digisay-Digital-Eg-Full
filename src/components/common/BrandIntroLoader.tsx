import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { brand } from "@/data/site";

export function BrandIntroLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("loading-intro");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    try {
      sessionStorage.setItem("digisay_intro_seen", "true");
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    // Check if already seen in this session
    try {
      if (sessionStorage.getItem("digisay_intro_seen")) {
        document.documentElement.classList.remove("loading-intro");
        setVisible(false);
        return;
      }
    } catch {
      // ignore
    }

    // Lock page scrollbar completely while intro is active
    document.documentElement.classList.add("loading-intro");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Progress counter 0 -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            handleDismiss();
          }, 350);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => {
      clearInterval(interval);
      document.documentElement.classList.remove("loading-intro");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [handleDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -15,
            transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden overscroll-none bg-[#090a0d] text-white select-none"
        >
          {/* Subtle ambient brand glow (DigiSay Brand Red) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[420px] rounded-full bg-[#d90a2c]/12 blur-[100px]" />
          </div>

          <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center">
            {/* Brand Logo / Monogram */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative mb-5 flex size-16 sm:size-20 items-center justify-center rounded-2xl border border-primary/30 bg-white/5 p-3 shadow-[0_0_35px_rgba(217,10,44,0.25)] backdrop-blur-md"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-full max-w-full object-contain filter brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
              />
              <motion.div
                className="absolute inset-0 rounded-2xl border border-primary/40"
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Typography Reveal */}
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-xl font-extrabold tracking-[0.2em] text-white sm:text-2xl md:text-3xl"
            >
              DIGISAY GROUP
            </motion.h1>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-2 max-w-[90vw] text-[11px] font-semibold uppercase tracking-wider text-primary sm:text-xs sm:tracking-[0.2em]"
            >
              The Digital Media Solutions Leader
            </motion.p>

            {/* High-tech Loading Progress bar in Brand Colors */}
            <div className="mt-8 flex w-44 sm:w-52 max-w-[85vw] flex-col items-center gap-2">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-primary shadow-[0_0_12px_rgba(217,10,44,0.9)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="flex w-full justify-between text-[10px] sm:text-[11px] font-mono tracking-widest text-white/50">
                <span>INITIALIZING</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Quick skip */}
            <button
              type="button"
              onClick={handleDismiss}
              className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              Skip intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}