import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { brand } from "@/data/site";

export function BrandIntroLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if already shown in this session
    const hasSeenIntro = sessionStorage.getItem("digisay_intro_seen");
    if (hasSeenIntro) {
      setVisible(false);
      return;
    }

    // Animate progress 0 -> 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            try {
              sessionStorage.setItem("digisay_intro_seen", "true");
            } catch {
              // ignore storage errors
            }
          }, 350);
          return 100;
        }
        return prev + 5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -20,
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#090a0d] text-white selection:bg-[#d90a2c]/20"
        >
          {/* Subtle ambient brand background glow (DigiSay Brand Red #d90a2c) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-[#d90a2c]/12 blur-[120px]" />
            <div className="absolute left-1/3 top-1/3 size-[300px] rounded-full bg-[#ff2a4b]/8 blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {/* Brand Logo / Monogram */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-6 flex size-20 items-center justify-center rounded-2xl border border-[#d90a2c]/30 bg-white/5 p-3 shadow-[0_0_40px_rgba(217,10,44,0.2)] backdrop-blur-md"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-full max-w-full object-contain filter brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
              <motion.div
                className="absolute inset-0 rounded-2xl border border-[#d90a2c]/40"
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Typography Reveal */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl font-bold tracking-[0.25em] text-white sm:text-3xl"
            >
              DIGISAY GROUP
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-[#d90a2c]"
            >
              The Digital Media Solutions Leader
            </motion.p>

            {/* High-tech Loading Progress bar in Brand Colors */}
            <div className="mt-8 flex w-48 flex-col items-center gap-2">
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#d90a2c] via-[#ff3b56] to-[#d90a2c] shadow-[0_0_12px_rgba(217,10,44,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="flex w-full justify-between text-[11px] font-mono tracking-widest text-white/50">
                <span>INITIALIZING</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Quick skip */}
            <button
              type="button"
              onClick={() => {
                setVisible(false);
                try {
                  sessionStorage.setItem("digisay_intro_seen", "true");
                } catch {
                  // ignore
                }
              }}
              className="mt-6 text-xs text-white/40 transition-colors hover:text-white"
            >
              Skip intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
