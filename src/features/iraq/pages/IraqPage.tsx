import { SiteFooter } from "@/components/layout/Footer";
import { SiteHeader } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Container } from "@/components/common/Container";

export default function IraqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background" dir="rtl" lang="ar">
      <SiteHeader />
      <Container className="flex-1 py-16">
        <div className="mx-auto max-w-4xl text-right">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            دجيساي الوكالة الإعلامية الرائدة في الشرق الأوسط
          </h1>
          <h2 className="mt-10 text-2xl font-bold md:text-3xl">
            خدمات تسويق شاملة في الشرق الأوسط
          </h2>
          <ul className="mt-8 space-y-4 text-lg font-medium text-foreground md:text-xl">
            <li>استراتيجية محتوى متكاملة</li>
            <li>زيادة الأرباح من خلال المحتوى المختار بعناية</li>
            <li>موارد التطوير والنمو</li>
            <li>بثوث تفاعلية</li>
            <li>تحسين محركات البحث على يوتيوب واحترافية</li>
            <li>حماية المحتوى</li>
            <li>توزيع شامل للمحتوى</li>
          </ul>
          <h2 className="mt-14 text-2xl font-bold md:text-3xl">
            انضم لأكبر شرك ليوتيوب في الشرق الأوسط وكن واحد من أهم الشركاء الذين وثقوا بنا في العراق
          </h2>
        </div>
      </Container>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
