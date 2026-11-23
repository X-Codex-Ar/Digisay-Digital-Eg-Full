import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
      if (e.code === "Space" && videoRef.current) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isOpen, onClose]);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setShowControls(true);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2400);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    videoRef.current.play().catch(() => {
      setIsPlaying(false);
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // Fallback
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8"
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

          {/* Modal Container with Responsive Max-Height Calculation across all screens */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseMove={handleMouseMove}
            className="relative z-10 flex flex-col w-full max-w-5xl max-h-[min(90dvh,840px)] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-2xl shadow-primary/20"
          >
            {/* Header bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/40 bg-card/95 px-4 py-3 sm:px-6 backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="size-2 shrink-0 rounded-full bg-primary animate-pulse" />
                <h3 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close video dialog"
                className="group ml-3 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary hover:text-white"
              >
                <X className="size-4 transition-transform group-hover:scale-110" />
              </button>
            </div>

            {/* Video player canvas with responsive aspect containment */}
            <div
              onClick={togglePlay}
              className="relative flex-1 min-h-[200px] sm:min-h-[300px] w-full bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none group"
            >
              {isIframe ? (
                <iframe
                  src={embedUrl}
                  title={title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0 aspect-video"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    autoPlay
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => setIsBuffering(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="max-h-[calc(90dvh-125px)] w-full h-auto aspect-video max-w-full object-contain"
                  >
                    <track kind="captions" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Buffering Indicator */}
                  {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                      <div className="size-12 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
                    </div>
                  )}

                  {/* Big Play/Pause Center Touch Feedback */}
                  <AnimatePresence>
                    {!isPlaying && !isBuffering && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      >
                        <div className="flex size-18 sm:size-20 items-center justify-center rounded-2xl sm:rounded-3xl border border-white/20 bg-primary/90 text-white shadow-2xl shadow-primary/50 backdrop-blur-md">
                          <Play className="ml-1 size-8 fill-white text-white sm:size-9" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Modern Glassmorphism Controls Overlay */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-4 z-20 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/80 p-3 sm:p-4 backdrop-blur-md shadow-2xl transition-all duration-300 ${
                      showControls || !isPlaying
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3 pointer-events-none"
                    }`}
                  >
                    {/* Modern Scrubbing Progress Bar */}
                    <div className="relative group/scrub flex items-center w-full h-4 cursor-pointer">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 z-10 w-full opacity-0 cursor-pointer h-full"
                        aria-label="Video seek scrubber"
                      />
                      {/* Track background */}
                      <div className="relative w-full h-1.5 sm:h-2 rounded-full bg-white/20 overflow-hidden transition-all group-hover/scrub:h-2.5">
                        <div
                          style={{ width: `${progressPercent}%` }}
                          className="h-full bg-primary relative transition-all duration-75"
                        />
                      </div>
                      {/* Scrubber thumb handle */}
                      <div
                        style={{ left: `${progressPercent}%` }}
                        className="absolute size-3.5 -translate-x-1/2 rounded-full bg-white border-2 border-primary shadow-md shadow-primary/50 pointer-events-none transition-transform scale-0 group-hover/scrub:scale-100"
                      />
                    </div>

                    {/* Bottom Control Actions */}
                    <div className="flex items-center justify-between gap-3 text-white">
                      {/* Left: Play/Pause, Rewind, Time */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          aria-label={isPlaying ? "Pause video" : "Play video"}
                          className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-primary hover:scale-105 active:scale-95"
                        >
                          {isPlaying ? (
                            <Pause className="size-4 fill-white" />
                          ) : (
                            <Play className="ml-0.5 size-4 fill-white" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                              setCurrentTime(0);
                            }
                          }}
                          aria-label="Replay video"
                          className="hidden sm:flex size-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105"
                        >
                          <RotateCcw className="size-3.5" />
                        </button>

                        <div className="text-xs font-semibold tabular-nums text-white/80">
                          <span>{formatTime(currentTime)}</span>
                          <span className="mx-1 text-white/40">/</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Right: Volume & Fullscreen */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Volume controls */}
                        <div className="flex items-center gap-1.5 group/vol">
                          <button
                            type="button"
                            onClick={toggleMute}
                            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                            className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="size-4 text-primary" />
                            ) : (
                              <Volume2 className="size-4" />
                            )}
                          </button>

                          <div className="hidden sm:flex items-center w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              aria-label="Volume slider"
                              className="w-16 accent-primary h-1.5 cursor-pointer bg-white/20 rounded-full"
                            />
                          </div>
                        </div>

                        {/* Fullscreen toggle */}
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                          className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                        >
                          {isFullscreen ? (
                            <Minimize2 className="size-4" />
                          ) : (
                            <Maximize2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom metadata footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground sm:px-6">
              <span className="font-semibold text-primary">DigiSay Media & Production Arm</span>
              <span className="hidden sm:inline">Space to play/pause • ESC to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
