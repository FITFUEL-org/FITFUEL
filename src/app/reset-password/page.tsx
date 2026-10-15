"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, friendlyError } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { AuthCard } from "@/components/AuthCard";
import { Alert, Button, Field, Spinner, inputCls } from "@/components/ui";

export default function ResetPasswordPage() {
  const { ready, user } = useAuth();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <Spinner />;
  if (!user) {
    return (
      <AuthCard title="Link needed" footer={<Link href="/login/" className="font-semibold text-accent">Back to log in</Link>}>
        <p className="text-muted">Open the reset link from your email to set a new password, or <Link href="/forgot-password/" className="font-semibold text-accent">request a new one</Link>.</p>
      </AuthCard>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setError(friendlyError(error));
    else router.replace("/dashboard/");
  }

  return (
    <AuthCard title="New password" subtitle={<>For <b className="text-fg">{user.email}</b></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field label="New password" hint="At least 8 characters.">
          <input className={inputCls} type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </Field>
        <Field label="Confirm new password">
          <input className={inputCls} type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </Field>
        <Button type="submit" busy={busy} className="w-full">Save password</Button>
      </form>
    </AuthCard>
  );
}
