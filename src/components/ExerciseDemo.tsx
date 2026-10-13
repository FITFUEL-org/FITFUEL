"use client";

import { useEffect, useState } from "react";
import { imageUrl } from "@/lib/exercises";

/** Animated demo: flips between the start and end photos like a short loop. Tap to pause. */
export function ExerciseDemo({ images, name, size = "lg" }: { images: string[]; name: string; size?: "sm" | "lg" }) {
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % images.length), 1100);
    return () => clearInterval(t);
  }, [paused, images.length]);

  if (!images.length) {
    return <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-surface-2 text-muted">No demo</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setPaused((p) => !p)}
      className={`group relative block w-full overflow-hidden rounded-2xl bg-surface-2 ${size === "sm" ? "aspect-square" : "aspect-[4/3]"}`}
      aria-label={`${name} demo — ${paused ? "paused, tap to play" : "playing, tap to pause"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl(images[frame])} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl" />
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- remote CDN images in a static export
        <img
          key={src}
          src={imageUrl(src)}
          alt={i === 0 ? `${name}: start position` : `${name}: end position`}
          loading={size === "sm" ? "lazy" : "eager"}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${i === frame ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {size === "lg" && images.length > 1 && (
        <span className="absolute bottom-2 left-2 rounded-full bg-black/75 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {paused ? "Paused" : frame === 0 ? "Start" : "Finish"}
        </span>
      )}
    </button>
  );
}
