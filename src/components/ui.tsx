import Link from "next/link";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline"; busy?: boolean };

const BTN = {
  primary: "bg-accent text-black hover:brightness-110",
  outline: "border border-line text-fg hover:border-accent hover:text-accent",
  ghost: "text-muted hover:text-fg",
};

export function Button({ variant = "primary", busy, className = "", children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition disabled:opacity-50 ${BTN[variant]} ${className}`}
    >
      {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

export function LinkButton({ href, variant = "primary", className = "", children }: { href: string; variant?: keyof typeof BTN; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${BTN[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

export function Alert({ kind = "error", children }: { kind?: "error" | "info" | "success"; children: React.ReactNode }) {
  const c = { error: "border-red-500/40 bg-red-500/10 text-red-200", info: "border-sky-500/40 bg-sky-500/10 text-sky-100", success: "border-lime/40 bg-lime/10 text-lime" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${c}`}>{children}</div>;
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-accent bg-accent text-black" : "border-line text-fg hover:border-accent/60"}`}
    >
      {children}
    </button>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageHeader({ kicker, title, children }: { kicker?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6 space-y-2">
      {kicker && <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{kicker}</p>}
      <h1 className="font-display text-3xl uppercase tracking-wide text-fg sm:text-4xl">{title}</h1>
      {children && <div className="text-muted">{children}</div>}
    </header>
  );
}
