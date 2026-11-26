import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { ServicePage as ServicePageType } from "@/data/services";

import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { PlayVideoButton } from "@/components/common/PlayVideoButton";
import { VideoModal } from "@/components/common/VideoModal";

export function ServiceHeroSection({ page }: { page: ServicePageType }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <PageHeader
        badge={page.name}
        icon={Sparkles}
        title={page.heroTitle}
        titleAccent={page.heroAccent}
        description={page.summary}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <PrimaryButton to="/contact" variant="hero" subtitle="Get In Touch">
            Let's Talk
          </PrimaryButton>
          <PlayVideoButton
            onClick={() => setIsVideoOpen(true)}
            label="Watch Showreel"
            variant="hero"
          />
        </div>
      </PageHeader>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="/assets/videos/showreel.mp4"
        title={`${page.name} • Media & Production Showreel`}
      />
    </>
  );
}
