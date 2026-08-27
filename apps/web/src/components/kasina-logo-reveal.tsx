"use client";

import { useEffect, useRef, useState } from "react";
import { KasinaMark } from "@/components/kasina-logo";

const REVEAL_SRC = "/brand/kasina-logo-reveal.mp4";

/**
 * One-shot logo reveal for the marketing hero.
 * Falls back to the static mark when motion is reduced or playback fails.
 */
export function KasinaLogoReveal({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useStatic, setUseStatic] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      setUseStatic(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const play = video.play();
    if (play) {
      play.catch(() => setUseStatic(true));
    }
  }, []);

  if (useStatic) {
    return (
      <KasinaMark size="hero" priority className={`drop-shadow-lg ${className}`} />
    );
  }

  return (
    <div
      className={`relative w-full max-w-[min(100%,420px)] overflow-hidden rounded-xl sm:max-w-[480px] ${className}`}
      aria-hidden
    >
      <video
        ref={videoRef}
        src={REVEAL_SRC}
        muted
        playsInline
        preload="auto"
        className="aspect-video h-auto w-full rounded-xl object-contain"
        onError={() => setUseStatic(true)}
        onEnded={(e) => {
          e.currentTarget.pause();
        }}
      />
    </div>
  );
}
