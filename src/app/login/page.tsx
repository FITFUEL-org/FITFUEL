"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, friendlyError } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { AuthCard } from "@/components/AuthCard";
import { Alert, Button, Field, inputCls } from "@/components/ui";

/** Only allow same-site relative redirects after login. */
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard/");

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else router.replace(next);
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to see today's workout."
      footer={<>New here? <Link href="/signup/" className="font-semibold text-accent">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {params.get("msg") && <Alert kind="info">{params.get("msg")}</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="Email">
          <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password/" className="text-sm font-medium text-muted hover:text-accent">Forgot password?</Link>
        </div>
        <Button type="submit" busy={busy} className="w-full" disabled={!email || !password}>Log in</Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
