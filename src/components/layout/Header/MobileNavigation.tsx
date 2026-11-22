import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { mainNav, servicesMenu } from "@/data/navigation";
import { brand } from "@/data/site";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
          active
            ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-sm"
            : "text-foreground hover:bg-muted/60 hover:text-primary"
        } ${className || ""}`}
        aria-current={active ? "page" : undefined}
      >
        <span>{label}</span>
        <ChevronRight
          className={`size-4 transition-transform ${
            active ? "text-primary" : "text-muted-foreground/60"
          }`}
        />
      </Link>
    </SheetClose>
  );
}

export function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topLinks = mainNav.filter((n) => n.label !== "Let's Talk" && n.label !== "Services");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex h-full w-[88vw] max-w-sm flex-col justify-between overflow-hidden p-0 border-l border-border/60 bg-card rounded-l-3xl shadow-2xl"
      >
        {/* Top Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-border/40 shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img src={brand.logo} alt={brand.name} className="h-8 w-auto object-contain" />
          </Link>
          <SheetTitle className="sr-only">Main Menu</SheetTitle>
        </SheetHeader>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex flex-col gap-1.5">
            <MobileNavItem label="Home" to="/" />
            <MobileNavItem label="Companies" to="/about" />

            {/* Services Group Card */}
            <div className="my-2 rounded-2xl border border-border/60 bg-muted/30 p-2.5">
              <SheetClose asChild>
                <Link
                  to="/services"
                  className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  <span>Services Verticals</span>
                  <ChevronRight className="size-3.5 text-primary" />
                </Link>
              </SheetClose>

              <div className="flex flex-col gap-1 pt-1.5 border-t border-border/40">
                {servicesMenu.map((s) => (
                  <SheetClose key={s.label} asChild>
                    <Link
                      to={s.to as never}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition-all hover:bg-background hover:text-primary hover:translate-x-1"
                    >
                      {s.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>

            {topLinks
              .filter((n) => n.label !== "Home" && n.label !== "Companies")
              .map((n) => (
                <MobileNavItem key={n.label} label={n.label} to={n.to} />
              ))}
          </div>
        </div>

        {/* Fixed Bottom Row: Options (Theme Toggle) & CTA Button */}
        <div className="shrink-0 border-t border-border/50 bg-card/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <ThemeToggle className="shrink-0 size-11 rounded-2xl" />
            <SheetClose asChild>
              <PrimaryButton
                to="/contact"
                className="flex-1 justify-center rounded-2xl text-sm py-3"
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
