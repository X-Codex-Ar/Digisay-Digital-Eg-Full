import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { brand } from "@/data/site";
import { Magnetic } from "@/components/common/Magnetic";
import { ThemeToggle } from "@/components/common/ThemeToggle";
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
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        stuck
          ? "border-b border-border/60 bg-background/90 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
      data-stuck={stuck}
    >
      <nav className="mx-auto flex h-20 items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
        <Link to="/" className="flex items-center" aria-label={brand.name}>
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-10 w-auto object-contain"
            width={120}
            height={40}
          />
        </Link>
        <DesktopNavigation />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden md:block">
            <Magnetic>
              <Link
                to="/contact"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#bf0826] hover:shadow-lg hover:shadow-primary/20"
                aria-label="Contact DigiSay"
              >
                Let's Talk
              </Link>
            </Magnetic>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label="Open main menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </nav>
      <MobileNavigation open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
