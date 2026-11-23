import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "./Container";

export interface PageHeaderProps {
  badge?: string;
  icon?: LucideIcon;
  title: string;
  titleAccent?: string;
  description?: string;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
  align?: "center" | "left" | "right";
}

export function PageHeader({
  badge,
  icon: Icon,
  title,
  titleAccent,
  description,
  meta,
  children,
  className = "",
  align = "center",
}: PageHeaderProps) {
  const reduced = useReducedMotion();

  const alignClass =
    align === "center"
      ? "text-center mx-auto"
      : align === "right"
        ? "text-right mr-0 ml-auto"
        : "text-left ml-0 mr-auto";

  return (
    <section
      className={`relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16 bg-background ${className}`}
    >
      {/* Ambient background brand glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <Container className="relative z-10">
        <motion.div
          className={`max-w-3xl ${alignClass}`}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {badge && (
            <div
              className={`flex items-center ${
                align === "center"
                  ? "justify-center"
                  : align === "right"
                    ? "justify-end"
                    : "justify-start"
              } mb-6`}
            >
              <span className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {badge}
              </span>
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
            {titleAccent && (
              <span className="mt-3 block text-2xl font-semibold text-primary sm:text-3xl md:text-4xl">
                {titleAccent}
              </span>
            )}
          </h1>

          {description && (
            <p
              className={`mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg ${
                align === "center" ? "mx-auto" : ""
              }`}
            >
              {description}
            </p>
          )}

          {meta && (
            <div
              className={`mt-6 flex flex-wrap items-center ${
                align === "center"
                  ? "justify-center"
                  : align === "right"
                    ? "justify-end"
                    : "justify-start"
              } gap-3 text-xs text-muted-foreground`}
            >
              {meta}
            </div>
          )}

          {children && (
            <div
              className={`mt-8 flex flex-col sm:flex-row gap-4 ${
                align === "center"
                  ? "justify-center"
                  : align === "right"
                    ? "justify-end"
                    : "justify-start"
              }`}
            >
              {children}
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
