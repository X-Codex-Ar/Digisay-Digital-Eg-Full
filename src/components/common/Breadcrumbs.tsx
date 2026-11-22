import { Home, MoveRight } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; to?: string; active?: boolean };

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="breadcrumb" className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const inner = (
          <span className={cn("flex items-center gap-2", item.active && "font-semibold text-foreground")}>
            {item.label}
          </span>
        );
        return (
          <div key={item.label} className="flex items-center gap-2">
            {!isLast && item.to ? (
              <Link to={item.to as never} className="text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{item.label}</span>
            )}
            {!isLast && <MoveRight className="size-3 text-muted-foreground" />}
          </div>
        );
      })}
    </nav>
  );
}
