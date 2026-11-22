import { Sparkles } from "lucide-react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export function ServiceHeroSection({ page }: { page: ServicePageType }) {
  return (
    <PageHeader
      badge={page.name}
      icon={Sparkles}
      title={page.heroTitle}
      titleAccent={page.heroAccent}
      description={page.summary}
    >
      <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
    </PageHeader>
  );
}
