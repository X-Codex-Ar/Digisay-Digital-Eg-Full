import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { mainNav } from "@/data/navigation";
import { brand } from "@/data/site";
import { cn } from "@/lib/utils";

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
      className="fixed inset-x-0 top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-md"
      data-stuck={stuck}
    >
      <nav className="mx-auto flex h-20 items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
        <Link to="/" className="flex items-center" aria-label={brand.name}>
          <img src={brand.logo} alt={brand.name} className="h-10 w-auto" loading="lazy" />
        </Link>
        <DesktopNavigation />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/contact"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.03] md:inline-flex"
            aria-label="Contact DigiSay"
          >
            Let's Talk
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted md:hidden"
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
