import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { Container } from "@/components/common/Container";
import { brand, offices, socialLinks } from "@/data/site";
import { SocialIcon } from "@/components/common/SocialIcons";

export function ContactIntroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="px-4 sm:px-6 xl:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-card p-8 text-center shadow-xl md:p-14">
        {/* Ambient brand glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-primary/10 blur-3xl" />

        <motion.div
          className="relative z-10"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Get In Touch
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            How Can We Help You Out? Reach Out to Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Fill in the form below or reach us directly. Our regional and international teams in UAE
            and the U.S. are ready to accelerate your media roadmap.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function ContactDetailsSection() {
  const reduced = useReducedMotion();
  const cleanPhone = brand.phone.replace(/[^+\d]/g, "");

  return (
    <AnimatedSection className="py-12 md:py-16">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Offices Columns */}
          {offices.map((office, i) => (
            <motion.div
              key={office.name}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="h-full"
            >
              <div className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/40 text-primary transition-transform duration-300 group-hover:scale-105">
                    <MapPin className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                    {office.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {office.lines.join(" ")}
                  </p>
                </div>

                <div className="mt-6 border-t border-border/40 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Official Inquiries
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">{brand.email}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Direct Communications & Social Channels */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: offices.length * 0.08,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="h-full"
          >
            <div className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/40 text-primary transition-transform duration-300 group-hover:scale-105">
                  <Phone className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                  Direct Assistance
                </h3>

                <div className="mt-4 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone
                    </span>
                    <p className="mt-0.5">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="font-semibold text-foreground transition-colors hover:text-primary inline-flex items-center gap-1.5"
                      >
                        <span>{brand.phone}</span>
                        <ArrowUpRight className="size-3.5 text-primary" />
                      </a>
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </span>
                    <p className="mt-0.5">
                      <a
                        href={`mailto:${brand.email}`}
                        className="font-semibold text-foreground transition-colors hover:text-primary inline-flex items-center gap-1.5"
                      >
                        <span>{brand.email}</span>
                        <ArrowUpRight className="size-3.5 text-primary" />
                      </a>
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hours
                    </span>
                    <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>{brand.hours}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels with SVG Brand Icons */}
              <div className="mt-6 border-t border-border/40 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Follow DigiSay
                </span>
                <div className="mt-2.5 flex items-center gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-muted/30 p-2 text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-primary/10 hover:text-primary hover:scale-105"
                    >
                      <SocialIcon name={s.label} className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </AnimatedSection>
  );
}

export function ContactCtaSection() {
  return (
    <AnimatedSection className="border-t border-border/40 py-14 sm:py-16">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border bg-muted/20 p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Join us to create the best digital solutions.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn more about our creator networks, distribution pipelines, and intellectual
              property defense.
            </p>
          </div>
          <Link
            to="/services"
            className="shrink-0 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-[#bf0826] active:scale-[0.98]"
          >
            Explore Services
          </Link>
        </div>
      </Container>
    </AnimatedSection>
  );
}
