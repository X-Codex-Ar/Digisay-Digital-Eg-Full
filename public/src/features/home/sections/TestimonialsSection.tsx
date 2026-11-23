import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { testimonials } from "@/data/home";

export function TestimonialsSection() {
  const reduced = useReducedMotion();

  return (
    <AnimatedSection className="border-t border-border/40">
      <Container className="py-14 sm:py-20">
        <SectionHeading
          eyebrow="Testimonials"
          align="center"
          heading="We help to achieve mutual goals."
        />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                {/* Ambient hover glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

                <div>
                  <Quote className="h-8 w-8 text-primary/40 transition-colors duration-300 group-hover:text-primary/70 mb-4" />
                  <p className="text-sm leading-relaxed text-foreground/90 italic">"{t.quote}"</p>
                </div>

                <div className="mt-8 flex items-center gap-3 border-t border-border/50 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
