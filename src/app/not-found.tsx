import { LinkButton } from "@/components/ui";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <h1 className="font-display text-6xl uppercase text-accent">404</h1>
      <p className="text-muted">That page skipped leg day. It doesn&apos;t exist.</p>
      <LinkButton href="/">Go home</LinkButton>
    </div>
  );
}
