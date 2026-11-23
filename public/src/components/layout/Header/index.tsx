import { Link } from "@tanstack/react-router";
import { Menu, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { brand } from "@/data/site";
import { Magnetic } from "@/components/common/Magnetic";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";

export function SiteHeader() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:px-4 sm:pt-3 lg:px-6 lg:pt-4 pointer-events-none transition-all duration-300"
      data-stuck={stuck}
    >
      <nav
        className={`pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-4 px-3 sm:px-5 lg:px-6 rounded-2xl border transition-all duration-300 ${
          stuck
            ? "h-16 border-border/80 bg-background/90 shadow-lg shadow-black/5 dark:shadow-black/25 backdrop-blur-xl"
            : "h-20 border-border/40 bg-background/70 shadow-sm backdrop-blur-md"
        }`}
      >
        <Link to="/" className="flex items-center shrink-0 pr-1" aria-label={brand.name}>
          <ImageWithFallback
            src={brand.logo}
            alt={brand.name}
            fallback={
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                Digi<span className="text-primary">Say</span>
              </span>
            }
            className={`w-auto object-contain transition-all duration-300 ${
              stuck ? "h-8 sm:h-9" : "h-9 sm:h-10"
            }`}
            width={120}
            height={40}
            loading="eager"
          />
        </Link>

        {/* Desktop Navigation (visible on lg: 1024px and up) */}
        <DesktopNavigation />

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <div className="hidden lg:block">
            <Magnetic>
              <Link
                to="/contact"
                className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 xl:px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:bg-[#bf0826] hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] whitespace-nowrap"
                aria-label="Contact DigiSay"
              >
                <span>Let's Talk</span>
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
          </div>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card/70 text-foreground transition-all duration-200 hover:bg-muted active:scale-95 lg:hidden"
            aria-label="Open main menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </nav>
      <MobileNavigation open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
