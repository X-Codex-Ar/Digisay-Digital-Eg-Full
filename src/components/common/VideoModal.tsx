import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title?: string;
}

const DEFAULT_VIDEO = "https://digisay.com/wp-content/uploads/2024/03/GFF-No-Logo-1.mp4";

export function VideoModal({
  isOpen,
  onClose,
  videoUrl = DEFAULT_VIDEO,
  title = "DigiSay Media Showreel",
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Determine if video is an iframe (e.g. Vimeo/YouTube) or direct video file
  const isVimeo = videoUrl.includes("vimeo.com");
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isIframe = isVimeo || isYouTube;

  // Format embed URL if necessary
  let embedUrl = videoUrl;
  if (isVimeo && !videoUrl.includes("player.vimeo.com")) {
    const vimeoId = videoUrl.split("/").filter(Boolean).pop();
    embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&controls=1`;
  } else if (isYouTube && !videoUrl.includes("embed")) {
    const ytId = videoUrl.includes("v=")
      ? new URL(videoUrl).searchParams.get("v")
      : videoUrl.split("/").pop();
    embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-card shadow-2xl shadow-primary/20"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-border/40 bg-card/90 px-4 py-3 sm:px-6 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close video dialog"
                className="group flex size-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary hover:text-white"
              >
                <X className="size-4 transition-transform group-hover:scale-110" />
              </button>
            </div>

            {/* Video player container 16:9 */}
            <div className="relative aspect-video w-full bg-black">
              {isIframe ? (
                <iframe
                  src={embedUrl}
                  title={title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Bottom branding footer */}
            <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground sm:px-6">
              <span className="font-semibold text-primary">DigiSay Media & Production Arm</span>
              <span>Press ESC to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
