import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";

import { mainNav, servicesMenu } from "@/data/navigation";
import { brand } from "@/data/site";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function MobileNavItem({ label, to }: { label: string; to: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <SheetClose asChild>
      <Link
        to={to as never}
        className="rounded-md px-3 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted"
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    </SheetClose>
  );
}

export function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const topLinks = mainNav.filter((n) => n.label !== "Let's Talk");
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-sm gap-4">
        <SheetHeader>
          <img src={brand.logo} alt="DigiSay" className="h-8 w-auto" />
          <SheetTitle className="sr-only">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-1">
          {topLinks.map((n) => (
            <MobileNavItem key={n.label} label={n.label} to={n.to} />
          ))}
          {servicesMenu.map((s) => (
            <MobileNavItem key={s.label} label={s.label} to={s.to} />
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
