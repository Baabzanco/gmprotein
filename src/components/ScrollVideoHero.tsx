import React, { useEffect, useRef, useState, useCallback } from "react";
import { siteConfig } from "../config/siteConfig";
import { ChevronDown, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { landingService } from "../services/landingService";

interface ScrollVideoHeroProps {
  videoSrc?: string;
  scrollMultiplier?: number;
  onProgressChange?: (progress: number) => void;
}

export const ScrollVideoHero: React.FC<ScrollVideoHeroProps> = ({
  videoSrc,
  scrollMultiplier = siteConfig.heroScrollMultiplier,
  onProgressChange,
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(
    videoSrc || siteConfig.heroVideo
  );

  // Load server-configured hero video if available
  useEffect(() => {
    if (videoSrc) {
      setActiveVideoSrc(videoSrc);
      return;
    }

    landingService
      .getSettings()
      .then((settings) => {
        if (settings && settings.heroVideoUrl) {
          setActiveVideoSrc(settings.heroVideoUrl);
        }
      })
      .catch(() => {});
  }, [videoSrc]);

  // Scroll and scrubbing state stored in refs to prevent unnecessary React re-renders on each frame
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const currentDisplayTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const pendingSeekTimeRef = useRef<number | null>(null);

  // Component lifecycle state
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentProgressState, setCurrentProgressState] = useState<number>(0);

  // Calculate scroll progress from scroll position relative to container
  const updateScrollProgress = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollDistance = containerRef.current.offsetHeight - windowHeight;

    if (totalScrollDistance <= 0) return;

    // Scroll progress: 0 when container top is at viewport top, 1 when container bottom is at viewport bottom
    const scrolledAmount = -rect.top;
    const rawProgress = scrolledAmount / totalScrollDistance;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));

    targetProgressRef.current = clampedProgress;
    if (durationRef.current > 0) {
      targetTimeRef.current = clampedProgress * durationRef.current;
    }
  }, []);

  // Set up video seeking animation loop using requestAnimationFrame
  useEffect(() => {
    let lastReportedProgress = -1;

    const renderLoop = () => {
      const video = videoRef.current;
      const duration = durationRef.current;

      if (video && duration > 0 && isLoaded) {
        // Smoothly interpolate current visual progress towards target scroll progress
        const progressDiff = targetProgressRef.current - currentProgressRef.current;
        if (Math.abs(progressDiff) > 0.0005) {
          // Responsive interpolation factor (higher for snappier response, lerp for smoothness)
          currentProgressRef.current += progressDiff * 0.18;
        } else {
          currentProgressRef.current = targetProgressRef.current;
        }

        // Calculate interpolated target time
        const desiredTargetTime = currentProgressRef.current * duration;
        targetTimeRef.current = Math.max(0, Math.min(duration, desiredTargetTime));

        // Smooth time scrubbing with video seeking protection
        const timeDiff = targetTimeRef.current - currentDisplayTimeRef.current;
        if (Math.abs(timeDiff) > 0.01) {
          currentDisplayTimeRef.current += timeDiff * 0.22;
        } else {
          currentDisplayTimeRef.current = targetTimeRef.current;
        }

        // Apply to video element if not currently bottlenecked in seeking
        if (!isSeekingRef.current && !video.seeking) {
          const seekDifference = Math.abs(video.currentTime - currentDisplayTimeRef.current);
          if (seekDifference > 0.02) {
            try {
              isSeekingRef.current = true;
              video.currentTime = currentDisplayTimeRef.current;
            } catch (err) {
              console.warn("Video seek interrupted:", err);
              isSeekingRef.current = false;
            }
          }
        } else {
          // Store the latest desired time to apply immediately once 'seeked' fires
          pendingSeekTimeRef.current = currentDisplayTimeRef.current;
        }

        // Throttle progress state updates to React so overlay can react without 60fps re-rendering overhead
        const roundedProgress = Math.round(currentProgressRef.current * 100) / 100;
        if (Math.abs(roundedProgress - lastReportedProgress) >= 0.02) {
          lastReportedProgress = roundedProgress;
          setCurrentProgressState(roundedProgress);
          if (onProgressChange) {
            onProgressChange(roundedProgress);
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isLoaded, onProgressChange]);

  // Handle seeked event on video element to consume pending seeks
  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (video && pendingSeekTimeRef.current !== null) {
      const nextTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
      if (Math.abs(video.currentTime - nextTime) > 0.02) {
        try {
          isSeekingRef.current = true;
          video.currentTime = nextTime;
        } catch (err) {
          console.warn("Video next seek error:", err);
          isSeekingRef.current = false;
        }
      }
    }
  }, []);

  // Passive scroll and resize listeners
  useEffect(() => {
    const handleScroll = () => {
      updateScrollProgress();
    };

    const handleResize = () => {
      updateScrollProgress();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial check
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScrollProgress]);

  // Reset states on video source change
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setLoadProgress(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [activeVideoSrc]);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
      durationRef.current = video.duration;
      // Ensure video is strictly paused so only scroll controls time
      video.pause();
      video.currentTime = 0;
      currentDisplayTimeRef.current = 0;
      targetTimeRef.current = 0;
      setIsLoaded(true);
      setHasError(false);
      updateScrollProgress();
    }
  };

  // Video can play / buffered progress tracking
  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || !video.buffered.length || !video.duration) return;
    try {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const percent = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
      setLoadProgress(percent);
    } catch {
      // Ignore buffering access errors
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setErrorMessage("خطا در بارگذاری ویدیو سینمایی. لطفا اتصال اینترنت خود را بررسی نمایید.");
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoaded(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Calculate container height based on scroll multiplier (e.g., 4.5 = 450vh)
  const containerHeightStyle = {
    height: `${Math.max(2.5, scrollMultiplier) * 100}vh`,
  };

  return (
    <section
      id="hero-scroll-section"
      ref={containerRef}
      style={containerHeightStyle}
      className="relative w-full bg-[#0B1E24] text-white"
    >
      {/* Sticky Viewport container */}
      <div
        id="hero-sticky-viewport"
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#0B1E24]"
      >
        {/* Cinematic Video Element */}
        <video
          id="hero-cinematic-video"
          ref={videoRef}
          src={activeVideoSrc}
          muted
          playsInline
          autoPlay={false}
          loop={false}
          preload="auto"
          controls={false}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => {
            if (!isLoaded && videoRef.current?.duration) {
              handleLoadedMetadata();
            }
          }}
          onProgress={handleProgress}
          onSeeked={handleSeeked}
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-[1.04] brightness-[0.98] transition-opacity duration-700 ease-out"
          style={{
            opacity: isLoaded ? 1 : 0.05,
          }}
        />

        {/* Cinematic Vignette & Lighting Gradients (subtle, non-intrusive) */}
        <div
          id="hero-vignette-overlay"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-radial from-transparent transition-opacity duration-500 ${
            isDark
              ? "via-black/25 to-black/65 opacity-80"
              : "via-black/15 to-black/45 opacity-60"
          } mix-blend-multiply`}
        />

        {/* Minimal Hero Branding Overlay */}
        <div
          id="hero-overlay-content"
          className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 md:p-14 z-10"
        >
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            {/* Minimal Brand Monogram */}
            <div
              className={`flex items-center gap-3.5 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto shadow-lg transition-colors ${
                isDark
                  ? "bg-[#0B1E24]/60 border border-[#124A57]/60 shadow-black/20"
                  : "bg-white/85 border border-[rgba(18,74,87,0.2)] shadow-[rgba(18,74,87,0.12)]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#CD78B3] animate-pulse" />
              <div className="text-right">
                <span
                  className={`font-bold text-sm sm:text-base tracking-wide block ${
                    isDark ? "text-white" : "text-[#124A57]"
                  }`}
                >
                  {siteConfig.brandNameFa}
                </span>
                <span className="text-[10px] tracking-widest text-[#CD78B3] uppercase block -mt-0.5 font-light">
                  {siteConfig.brandName}
                </span>
              </div>
            </div>

            {/* Subtle Status Pill */}
            <div
              className={`hidden sm:flex items-center gap-2 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                isDark
                  ? "bg-[#124A57]/40 border border-[#124A57]/80 text-slate-200"
                  : "bg-white/80 border border-[rgba(18,74,87,0.18)] text-[#124A57]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#CD78B3]" />
              <span className="font-light text-[11px] tracking-wide">تجربه تعاملی سینمایی</span>
            </div>
          </div>

          {/* Center Minimal Persian Statement (Fades smoothly as user scrolls past 10%) */}
          <div
            className="w-full max-w-3xl mx-auto text-center transition-all duration-500 ease-out"
            style={{
              opacity: Math.max(0, 1 - currentProgressState * 3.5),
              transform: `translateY(${-currentProgressState * 40}px)`,
            }}
          >
            <span className="inline-block text-[#CD78B3] text-xs sm:text-sm font-medium tracking-widest px-3 py-1 rounded-full bg-[#124A57]/60 border border-[#CD78B3]/40 mb-3 backdrop-blur-md shadow-sm">
              {siteConfig.brandTaglineEn}
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight sm:leading-snug">
              {siteConfig.brandTaglineFa}
            </h1>
          </div>

          {/* Bottom Area: Scroll Indicator and Minimal Timeline Progress */}
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-4">
            {/* Scroll Indicator Prompt - Fades out completely as user begins scrolling (> 4%) */}
            <div
              id="hero-scroll-indicator"
              className="flex flex-col items-center gap-2 text-center transition-opacity duration-500 pointer-events-auto cursor-pointer"
              style={{
                opacity: Math.max(0, 1 - currentProgressState * 10),
                pointerEvents: currentProgressState > 0.08 ? "none" : "auto",
              }}
              onClick={() => {
                // Scroll down smoothly if clicked
                if (containerRef.current) {
                  window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
                }
              }}
            >
              <span
                className={`text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg transition-colors ${
                  isDark
                    ? "text-slate-200 bg-[#0B1E24]/70 border border-[#124A57]/60"
                    : "text-[#124A57] bg-white/90 border border-[rgba(18,74,87,0.2)]"
                }`}
              >
                {siteConfig.scrollPromptFa}
              </span>
              <div className="w-8 h-12 rounded-full border-2 border-[#CD78B3]/70 flex items-start justify-center p-1.5 shadow-md shadow-[#CD78B3]/20 bg-black/10 backdrop-blur-xs">
                <div className="w-1.5 h-3 bg-[#CD78B3] rounded-full animate-bounce" />
              </div>
            </div>

            {/* Hairline Timeline Scrub Progress Bar */}
            <div className="w-full max-w-md mx-auto flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/80 select-none drop-shadow">
                0%
              </span>
              <div
                className={`relative flex-1 h-1 rounded-full overflow-hidden backdrop-blur-sm ${
                  isDark ? "bg-white/10" : "bg-black/20"
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#124A57] to-[#CD78B3] rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, Math.max(0, currentProgressState * 100))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#CD78B3] select-none font-semibold drop-shadow">
                {Math.round(currentProgressState * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Premium Minimal Video Initializing State */}
        {!isLoaded && !hasError && (
          <div
            id="hero-video-loader"
            className={`absolute inset-0 flex flex-col items-center justify-center z-20 transition-opacity duration-700 ${
              isDark ? "bg-[#0B1E24]" : "bg-[#F7F5F2]"
            }`}
          >
            <div className="relative flex items-center justify-center mb-6">
              {/* Pulsing glow rings in brand colors */}
              <div className="w-20 h-20 rounded-full border border-[#124A57] animate-ping absolute opacity-40" />
              <div className="w-16 h-16 rounded-full border-2 border-t-[#CD78B3] border-r-[#124A57] border-b-transparent border-l-transparent animate-spin" />
              {/* Brand Monogram */}
              <div className="absolute text-xs font-bold tracking-widest text-[#CD78B3]">
                PG
              </div>
            </div>

            <p
              className={`text-sm font-light tracking-wide mb-2 ${
                isDark ? "text-slate-300" : "text-[#53656A]"
              }`}
            >
              در حال آماده‌سازی تجربه بصری...
            </p>
            {loadProgress > 0 && (
              <div className="w-40 h-1 bg-[#124A57]/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#CD78B3] transition-all duration-300 rounded-full"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error Fallback with Retry */}
        {hasError && (
          <div
            id="hero-video-error"
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1E24]/95 p-6 z-30 text-center"
          >
            <AlertCircle className="w-12 h-12 text-[#CD78B3] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">خطا در بارگذاری ویدیو</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#124A57] hover:bg-[#1a5b6a] text-white text-sm font-medium transition-colors shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              تلاش مجدد
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
