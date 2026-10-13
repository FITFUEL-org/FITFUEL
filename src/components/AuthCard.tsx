import Link from "next/link";
import { Logo } from "./Logo";

/** Centered card used by every auth page. */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 inline-block" aria-label="FITFUEL home"><Logo /></Link>
        <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <h1 className="font-display text-3xl uppercase tracking-wide">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
