"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, friendlyError } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { AuthCard } from "@/components/AuthCard";
import { Alert, Button, Field, inputCls } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/onboarding/");
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const mail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/confirm/` },
    });
    setBusy(false);
    if (error) return setError(friendlyError(error));
    // An existing address comes back with no identities (and no error) when confirmation is on.
    if (data.user && data.user.identities?.length === 0) return setError("That email already has an account. Try logging in.");
    if (data.session) router.replace("/onboarding/");
    else setSentTo(mail);
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox" subtitle={<>We sent a confirmation link to <b className="text-fg">{sentTo}</b>.</>}
        footer={<Link href="/login/" className="font-semibold text-accent">Back to log in</Link>}>
        <p className="text-muted">Open the email and tap <b className="text-fg">Confirm email</b>. Then you&apos;ll set up your profile and get your plan. Don&apos;t see it? Check spam.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create account" subtitle="Your personal muscle-building plan is two minutes away."
      footer={<>Already have an account? <Link href="/login/" className="font-semibold text-accent">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field label="Email">
          <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input className={inputCls} type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirm password">
          <input className={inputCls} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <Button type="submit" busy={busy} className="w-full">Create account</Button>
        <p className="text-xs text-muted">By signing up you agree that FITFUEL gives general fitness guidance, not medical advice.</p>
      </form>
    </AuthCard>
  );
}
