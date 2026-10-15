export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-accent" />
        <path d="M7 13v6M25 13v6M10 10v12M22 10v12M10 16h12" stroke="#0b0b0d" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl uppercase tracking-wider text-fg">
        Fit<span className="text-accent">Fuel</span>
      </span>
    </span>
  );
}
