"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";
import { Spinner } from "./ui";

const NAV = [
  { href: "/dashboard/", label: "Today", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
  { href: "/plan/", label: "Plan", icon: "M4 5h16M4 12h16M4 19h10" },
  { href: "/diet/", label: "Diet", icon: "M7 3v8a3 3 0 006 0V3M10 3v18M17 3c-1.7 0-3 2-3 5s1.3 4 3 4v9" },
  { href: "/exercises/", label: "Exercises", icon: "M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" },
  { href: "/progress/", label: "Progress", icon: "M4 19V9M10 19V5M16 19v-7M22 19H2" },
];
const PROFILE_ICON = "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Signed-in layout: top bar on desktop, bottom tab bar on phones. Redirects guests to /login. */
export function AppShell({ children, needsOnboarding = true, isPublic = false }: { children: React.ReactNode; needsOnboarding?: boolean; isPublic?: boolean }) {
  const { ready, user, profile } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!ready || isPublic) return;
    if (!user) router.replace(`/login/?next=${encodeURIComponent(path)}`);
    else if (needsOnboarding && profile && !profile.onboarded) router.replace("/onboarding/");
  }, [ready, user, profile, needsOnboarding, isPublic, router, path]);

  if (!isPublic && (!ready || !user || (needsOnboarding && !profile?.onboarded))) return <Spinner />;
  const guest = ready && !user;

  const active = (href: string) => path === href || path + "/" === href || (href !== "/dashboard/" && path.startsWith(href.slice(0, -1)));

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={guest ? "/" : "/dashboard/"} aria-label="FITFUEL home"><Logo /></Link>
          {guest ? (
            <div className="flex gap-2">
              <Link href="/login/" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:text-fg">Log in</Link>
              <Link href="/signup/" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black">Start free</Link>
            </div>
          ) : (
          <nav className="hidden gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active(n.href) ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"}`}>
                {n.label}
              </Link>
            ))}
            <Link href="/gym-guide/" className={`rounded-lg px-3 py-2 text-sm font-semibold ${path.startsWith("/gym-guide") ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"}`}>Gym guide</Link>
            <Link href="/profile/" className={`rounded-lg px-3 py-2 text-sm font-semibold ${path.startsWith("/profile") ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"}`}>Profile</Link>
          </nav>
          )}
          {!guest && (
            <Link href="/profile/" aria-label="Profile" className={`rounded-full border p-2 md:hidden ${path.startsWith("/profile") ? "border-accent text-accent" : "border-line text-muted"}`}>
              <Icon d={PROFILE_ICON} />
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      {!guest && <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur md:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active(n.href) ? "text-accent" : "text-muted"}`}>
              <Icon d={n.icon} />{n.label}
            </Link>
          ))}
        </div>
      </nav>}
    </div>
  );
}
