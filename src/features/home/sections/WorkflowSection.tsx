import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";
import {
  Search,
  Target,
  Wrench,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/common/Container";
import { processSteps } from "@/data/site";

const STEP_ICONS = [Search, Target, Wrench, BarChart3];

export function WorkflowSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Track vertical scroll across the sticky wrapper
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Smooth scroll progress for the progress line
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate horizontal translation for the 4 cards
  const x = useTransform(scrollYProgress, [0.05, 0.92], ["0%", "-62%"]);

  return (
    <section
      ref={targetRef}
      className="relative h-[280vh] border-t border-border/40 bg-muted/30"
    >
      {/* Sticky container that stops in place while scrolling */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden py-10 md:py-14">
        {/* Top Header */}
        <Container className="relative z-10 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d90a2c]">
                Proven Methodology
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                Transforming Your Media Workflow for Goal-Driven Success
              </h2>
            </div>
            <p className="hidden text-xs font-mono uppercase tracking-wider text-muted-foreground md:block">
              Scroll to explore 4-step framework →
            </p>
          </div>
        </Container>

        {/* Middle: Horizontal sliding cards track */}
        <div className="relative my-auto w-full overflow-hidden px-4 sm:px-8 xl:px-16">
          <motion.div
            style={reduced ? {} : { x }}
            className="flex gap-6 sm:gap-8 will-change-transform"
          >
            {processSteps.map((step, idx) => {
              const Icon = STEP_ICONS[idx] || CheckCircle2;
              return (
                <div
                  key={step.title}
                  className="flex h-[380px] w-[85vw] max-w-[460px] shrink-0 flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 sm:p-8 md:p-10 shadow-lg backdrop-blur-md transition-all hover:border-[#d90a2c]/40 hover:shadow-xl sm:w-[460px]"
                >
                  <div>
                    {/* Top step number and icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-4xl font-extrabold text-[#d90a2c]/40">
                        0{idx + 1}
                      </span>
                      <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/40">
                        <Icon className="size-6 text-[#d90a2c]" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {step.body}
                    </p>
                  </div>

                  {/* Step status label */}
                  <div className="flex items-center gap-2 border-t border-border/50 pt-4 text-xs font-semibold text-[#d90a2c] uppercase tracking-wider">
                    <CheckCircle2 className="size-4" />
                    <span>Phase 0{idx + 1} Milestone</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom: Interactive Progress Bar & Step Numbers */}
        <Container className="relative z-10 shrink-0">
          <div className="flex flex-col gap-3">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
                className="h-full bg-gradient-to-r from-[#d90a2c] via-[#ff3b56] to-[#d90a2c] shadow-[0_0_12px_rgba(217,10,44,0.8)]"
              />
            </div>
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              {processSteps.map((_, i) => (
                <span key={i} className="flex items-center gap-1 font-semibold">
                  Step 0{i + 1}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
