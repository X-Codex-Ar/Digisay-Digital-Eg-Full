import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  ShieldCheck,
  Film,
  Video,
  Share2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

import { mainNav, servicesMenu } from "@/data/navigation";
import { cn } from "@/lib/utils";

const navLinks = mainNav.filter((n) => n.label !== "Let's Talk" && n.label !== "Privacy Policy");

const serviceIcons: Record<string, typeof ShieldCheck> = {
  "/anti-piracy": ShieldCheck,
  "/content-management": Film,
  "/content-production": Video,
  "/social-media": Share2,
  "/growth-marketing": TrendingUp,
};

function NavLinkItem({ label, to }: { label: string; to: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to as never}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-xl px-2.5 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors duration-200",
        active
          ? "bg-muted/70 text-foreground font-bold"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { pathname } = useLocation();

  const isServicesActive =
    pathname === "/services" || servicesMenu.some((s) => pathname.startsWith(s.to));

  // Open immediately and clear any closing timer
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  };

  // Close with a 200ms grace period so mouse transitions never drop the menu
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-200",
          open || isServicesActive
            ? "bg-muted/70 text-foreground font-bold"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span>Services</span>
        <ChevronDown
          className={cn(
            "size-3.5 xl:size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-foreground",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="menu"
            className="absolute left-0 top-full z-50 pt-2"
          >
            {/* Invisible hover bridge to eliminate any gap between trigger and menu */}
            <div
              className="absolute -top-3 left-0 right-0 h-4 bg-transparent pointer-events-auto"
              aria-hidden="true"
            />

            <div className="w-[360px] overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
              {/* Header: Overview Link */}
              <div className="flex items-center justify-between border-b border-border/50 px-3 pb-2.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Our Verticals
                </span>
                <Link
                  to="/services"
                  onClick={() => setOpen(false)}
                  className="group inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>All Services</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Service Items */}
              <div className="mt-1.5 space-y-1">
                {servicesMenu.map((s) => {
                  const Icon = serviceIcons[s.to] || ShieldCheck;
                  const active = pathname === s.to;
                  return (
                    <Link
                      key={s.label}
                      to={s.to as never}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground/90 hover:bg-muted hover:text-primary",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <span className="truncate leading-snug">{s.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom quick CTA */}
              <div className="mt-2 border-t border-border/50 pt-2.5 px-2">
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <span>Need custom media solutions?</span>
                  <span className="font-bold text-primary">Let's Talk →</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesktopNavigation() {
  return (
    <nav className="hidden items-center gap-0.5 xl:gap-1.5 lg:flex" aria-label="Main">
      {navLinks.map((n) =>
        n.label === "Services" ? (
          <ServicesDropdown key={n.label} />
        ) : (
          <NavLinkItem key={n.label} label={n.label} to={n.to} />
        ),
      )}
    </nav>
  );
}
