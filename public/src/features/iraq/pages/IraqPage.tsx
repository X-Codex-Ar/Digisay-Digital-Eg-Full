import { motion, useReducedMotion } from "motion/react";
import {
  TrendingUp,
  DollarSign,
  Rocket,
  Radio,
  Search,
  ShieldCheck,
  Share2,
  Sparkles,
} from "lucide-react";

import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Container } from "@/components/common/Container";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryButton } from "@/components/common/PrimaryButton";

const IRAQ_SERVICES = [
  {
    title: "استراتيجية محتوى متكاملة",
    description:
      "تطوير خطط إنتاج وتوزيع مخصصة للجمهور العراقي والعربي لتحقيق أعلى معدلات المشاهدة والانتشار.",
    icon: TrendingUp,
  },
  {
    title: "زيادة الأرباح وتحقيق الدخل",
    description:
      "تحسين عوائد الإعلانات وحقوق الملكية من خلال إدارة محترفة للمحتوى المختار بعناية فائقة.",
    icon: DollarSign,
  },
  {
    title: "موارد التطوير والنمو",
    description:
      "أدوات تحليلية متقدمة ودعم فني متخصص لتنمية القنوات والمنصات وتسريع وصولها لجمهور مستهدف.",
    icon: Rocket,
  },
  {
    title: "البثوث التفاعلية والمباشرة",
    description:
      "إدارة جلسات البث المباشر وتفعيل أدوات التفاعل اللحظي لتحقيق أقصى درجات الارتباط مع المتابعين.",
    icon: Radio,
  },
  {
    title: "تحسين محركات البحث على يوتيوب (SEO)",
    description:
      "استراتيجيات تحسين ظهور الفيديوهات عبر الكلمات المفتاحية والعناوين الاحترافية وتصدر نتائج البحث.",
    icon: Search,
  },
  {
    title: "حماية المحتوى ومكافحة القرصنة",
    description:
      "رصد مستمر وإزالة سريعة لأي استخدام غير مصرح به أو إعادة رفع للمحتوى الرقمي عبر الإنترنت.",
    icon: ShieldCheck,
  },
  {
    title: "توزيع شامل ومتعدد المنصات",
    description:
      "نشر وتوزيع استراتيجي للمحتوى عبر مختلف المنصات الاجتماعية والرقمية لتعظيم العائد والوصول.",
    icon: Share2,
  },
];

export default function IraqPage() {
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl" lang="ar">
      <SiteHeader />

      {/* Unified Signature Page Header */}
      <PageHeader
        badge="ديجيساي - العراق"
        icon={Sparkles}
        title="ديجيساي الوكالة الإعلامية الرائدة في الشرق الأوسط"
        description="نمكن المبدعين وصناع المحتوى والشركات الإعلامية في العراق من حماية حقوقهم ومضاعفة أرباحهم عبر حلول تقنية وإعلامية متكاملة."
        align="center"
      >
        <PrimaryButton to="/contact">تواصل معنا الآن</PrimaryButton>
      </PageHeader>

      {/* Services Grid Section */}
      <AnimatedSection className="border-t border-border/40 bg-muted/20">
        <Container className="py-16 sm:py-24">
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              خدمات متكاملة
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              خدمات تسويق شاملة وإدارة محتوى في العراق
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              حزمة متكاملة من الخدمات المخصصة لدعم نمو القنوات والمنصات الإعلامية الرقمية.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IRAQ_SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
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
                  <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 text-right">
                    <div>
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {s.description}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-border/40 pt-4">
                      <div className="h-1.5 w-8 rounded-full bg-primary/70 transition-all duration-300 group-hover:w-14 group-hover:bg-primary" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </AnimatedSection>

      {/* Partnership CTA Banner */}
      <AnimatedSection className="border-t border-border/40 bg-background py-16 sm:py-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-8 sm:p-14 text-center shadow-lg">
            <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              شراكات النجاح
            </span>
            <h2 className="mx-auto mt-4 max-w-3xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              انضم لأكبر شبكة شركاء ليوتيوب في الشرق الأوسط وكن واحداً من أهم الشركاء الذين وثقوا بنا
              في العراق
            </h2>
            <div className="mt-8 flex justify-center">
              <PrimaryButton to="/contact">ابدأ رحلتك معنا</PrimaryButton>
            </div>
          </div>
        </Container>
      </AnimatedSection>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
