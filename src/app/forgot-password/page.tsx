"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase, friendlyError } from "@/lib/supabase";
import { AuthCard } from "@/components/AuthCard";
import { Alert, Button, Field, inputCls } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${location.origin}/auth/confirm/`,
    });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else setSent(true);
  }

  return (
    <AuthCard title="Reset password" subtitle="We'll email you a link to choose a new password."
      footer={<Link href="/login/" className="font-semibold text-accent">Back to log in</Link>}>
      {sent ? (
        <Alert kind="success">If an account exists for that email, a reset link is on its way. It works once and expires in 1 hour.</Alert>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error && <Alert>{error}</Alert>}
          <Field label="Email">
            <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" busy={busy} className="w-full" disabled={!email}>Send reset link</Button>
        </form>
      )}
    </AuthCard>
  );
}
