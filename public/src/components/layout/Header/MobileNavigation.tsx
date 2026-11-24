import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  ShieldCheck,
  Film,
  Video,
  Share2,
  TrendingUp,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { mainNav, servicesMenu, socialLinks } from "@/data/navigation";
import { brand } from "@/data/site";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { SocialIcon } from "@/components/common/SocialIcons";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const serviceIcons: Record<string, typeof ShieldCheck> = {
  "/anti-piracy": ShieldCheck,
  "/content-management": Film,
  "/content-production": Video,
  "/social-media": Share2,
  "/growth-marketing": TrendingUp,
};

function MobileNavItem({
  label,
  to,
  className,
}: {
  label: string;
  to: string;
  className?: string;
}) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <SheetClose asChild>
      <Link
        to={to as never}
        className={cn(
          "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-all duration-200",
          active
            ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm"
            : "text-foreground hover:bg-muted/60 hover:text-primary",
          className,
        )}
        aria-current={active ? "page" : undefined}
      >
        <span>{label}</span>
        {active && <span className="size-2 rounded-full bg-primary animate-pulse" />}
      </Link>
    </SheetClose>
  );
}

function MobileServicesAccordion() {
  const { pathname } = useLocation();
  const isServicesActive =
    pathname === "/services" || servicesMenu.some((s) => pathname.startsWith(s.to));
  const [expanded, setExpanded] = useState(isServicesActive);

  return (
    <div className="my-1 rounded-2xl border border-border/60 bg-muted/20 overflow-hidden transition-all duration-200">
      {/* Accordion Header / Trigger Button */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3.5 text-base font-semibold transition-all duration-200",
          isServicesActive
            ? "bg-primary/10 text-primary font-bold"
            : "text-foreground hover:bg-muted/50 hover:text-primary",
        )}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span>Services</span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            5 Verticals
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-300",
            expanded && "rotate-180 text-primary",
          )}
        />
      </button>

      {/* Accordion Expandable Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1 p-2 pt-1 border-t border-border/40">
              {/* Individual Service Verticals */}
              {servicesMenu.map((s) => {
                const Icon = serviceIcons[s.to] || ShieldCheck;
                const active = pathname === s.to;
                return (
                  <SheetClose key={s.label} asChild>
                    <Link
                      to={s.to as never}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground/90 hover:bg-background hover:text-primary",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <span className="truncate">{s.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topLinks = mainNav.filter((n) => n.label !== "Let's Talk" && n.label !== "Services");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex flex-col justify-between overflow-hidden p-0 top-3 bottom-3 right-3 sm:top-4 sm:bottom-4 sm:right-4 h-[calc(100dvh-24px)] sm:h-[calc(100dvh-32px)] w-[calc(100vw-24px)] max-w-sm rounded-3xl border border-border/80 bg-card/98 shadow-2xl backdrop-blur-2xl"
      >
        {/* Top Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border/40 shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center" aria-label={brand.name}>
            <ImageWithFallback
              src={brand.logo}
              alt={brand.name}
              fallback={
                <span className="text-xl font-extrabold tracking-tight text-foreground">
                  Digi<span className="text-primary">Say</span>
                </span>
              }
              className="h-8 w-auto object-contain"
              width={100}
              height={32}
              loading="eager"
            />
          </Link>
          <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
        </SheetHeader>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-1.5">
            <MobileNavItem label="Home" to="/" />
            <MobileNavItem label="Companies" to="/about" />

            {/* Services Expandable Accordion Dropdown */}
            <MobileServicesAccordion />

            {topLinks
              .filter((n) => n.label !== "Home" && n.label !== "Companies")
              .map((n) => (
                <MobileNavItem key={n.label} label={n.label} to={n.to} />
              ))}
          </div>

          {/* Quick contact info strip */}
          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 text-primary" />
              <span>{brand.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-primary" />
              <span>{brand.phone}</span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Row */}
        <div className="shrink-0 border-t border-border/50 bg-card/95 px-5 py-4 backdrop-blur-md space-y-3">
          {/* Social Links Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Follow Us
            </span>
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-xl border border-border/70 bg-card p-1.5 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:scale-105"
                  aria-label={s.label}
                >
                  <SocialIcon name={s.label} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Theme Toggle + Let's Talk CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="shrink-0 size-11 rounded-2xl" />
            <SheetClose asChild>
              <PrimaryButton
                to="/contact"
                className="flex-1 justify-center h-11 rounded-2xl text-sm"
              >
                Let's Talk
              </PrimaryButton>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
