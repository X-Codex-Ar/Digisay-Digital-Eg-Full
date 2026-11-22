import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { mainNav, servicesMenu } from "@/data/navigation";
import { cn } from "@/lib/utils";

const navLinks = mainNav.filter((n) => n.label !== "Let's Talk");

function NavLinkItem({ label, to }: { label: string; to: string }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to as never}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function ServicesDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Services
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-border bg-background p-2 shadow-xl">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Services
          </p>
          {servicesMenu.map((s) => (
            <Link
              key={s.label}
              to={s.to as never}
              role="menuitem"
              className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DesktopNavigation() {
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
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
