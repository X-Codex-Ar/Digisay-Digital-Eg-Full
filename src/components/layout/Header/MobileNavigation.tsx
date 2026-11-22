import { Link, useLocation } from "@tanstack/react-router";
import { mainNav, servicesMenu } from "@/data/navigation";
import { brand } from "@/data/site";
import { PrimaryButton } from "@/components/common/PrimaryButton";
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
        className={`rounded-xl px-4 py-2.5 text-base font-semibold text-foreground transition-colors hover:bg-muted ${
          active ? "bg-muted text-emerald-600 dark:text-emerald-400 font-bold" : ""
        } ${className || ""}`}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    </SheetClose>
  );
}

export function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topLinks = mainNav.filter((n) => n.label !== "Let's Talk" && n.label !== "Services");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="flex h-full w-full max-w-sm flex-col justify-between overflow-y-auto p-6">
        <div>
          <SheetHeader className="pb-6 border-b border-border/40">
            <Link to="/" onClick={onClose}>
              <img src={brand.logo} alt={brand.name} className="h-9 w-auto" />
            </Link>
            <SheetTitle className="sr-only">Main Menu</SheetTitle>
          </SheetHeader>

          {/* Navigation Links */}
          <div className="mt-6 flex flex-col gap-1">
            <MobileNavItem label="Home" to="/" />
            <MobileNavItem label="Companies" to="/about" />

            {/* Services Group */}
            <div className="my-2 rounded-2xl bg-muted/40 p-2">
              <Link
                to="/services"
                onClick={onClose}
                className="block px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
              >
                Services
              </Link>
              <div className="flex flex-col gap-0.5 pt-1">
                {servicesMenu.map((s) => (
                  <SheetClose key={s.label} asChild>
                    <Link
                      to={s.to as never}
                      className="rounded-lg px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-background/80 hover:text-emerald-500"
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

        {/* Bottom CTA */}
        <div className="mt-8 pt-4 border-t border-border/40">
          <PrimaryButton to="/contact" className="w-full justify-center">
            Let's Talk
          </PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
