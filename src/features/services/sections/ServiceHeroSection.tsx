import type { ServicePage as ServicePageType } from "@/data/services";

import { PrimaryButton } from "@/components/common/PrimaryButton";

export function ServiceHeroSection({ page }: { page: ServicePageType }) {
  return (
    <section className="relative min-h-[65vh] bg-background">
      <div className="relative z-10 mx-auto flex min-h-[calc(65vh-5rem)] w-full max-w-[1300px] flex-col justify-center px-4 py-12 sm:px-6 xl:px-8 md:py-16">
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-6xl xl:text-7xl">
          {page.heroTitle}
          {page.heroAccent ? (
            <span className="mt-2 block text-xl font-normal text-primary">{page.heroAccent}</span>
          ) : null}
        </h1>
        <div className="mt-6">
          <PrimaryButton to="/contact">Let's Talk</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
