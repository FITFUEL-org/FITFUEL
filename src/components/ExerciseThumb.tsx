import { imageUrl } from "@/lib/exercises";

/**
 * Exercise photo that never crops the athlete: the full image is contained, over a blurred
 * copy of itself that fills the frame (photos mix landscape and portrait sizes).
 * Optional `hoverSrc` cross-fades to the finish position on hover.
 */
export function ExerciseThumb({ src, hoverSrc, alt = "", className = "aspect-[4/3]", eager = false }:
  { src?: string; hoverSrc?: string; alt?: string; className?: string; eager?: boolean }) {
  if (!src) return <div className={`flex items-center justify-center bg-surface-2 text-xs text-muted ${className}`}>No photo</div>;
  const loading = eager ? "eager" : "lazy";
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {/* eslint-disable @next/next/no-img-element -- remote CDN images in a static export */}
      <img src={imageUrl(src)} alt="" aria-hidden loading={loading} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl" />
      <img src={imageUrl(src)} alt={alt} loading={loading}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${hoverSrc ? "group-hover:opacity-0" : ""}`} />
      {hoverSrc && <img src={imageUrl(hoverSrc)} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
