"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase, friendlyError } from "@/lib/supabase";
import { AuthCard } from "@/components/AuthCard";
import { Alert, Spinner } from "@/components/ui";

// Email links land here: /auth/confirm/?token_hash=…&type=email|signup|recovery|magiclink|email_change
// Verifying the hash works on any device (unlike the PKCE redirect, which needs the original browser).
function Confirm() {
  const params = useSearchParams();
  const router = useRouter();
  const token_hash = params.get("token_hash");
  const type = (params.get("type") || "email") as EmailOtpType;
  const linkError = params.get("error_description") || (token_hash ? "" : "This link is incomplete. Request a new one.");
  const [error, setError] = useState(linkError);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !token_hash || linkError) return; // token hashes are single-use; don't verify twice in dev StrictMode
    started.current = true;

    // Remove the one-time token from the address bar and history.
    history.replaceState(null, "", "/auth/confirm/");
    supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
      if (error) setError(type === "recovery" ? "That reset link has expired or was already used." : friendlyError(error));
      else router.replace(type === "recovery" ? "/reset-password/" : "/onboarding/");
    });
  }, [token_hash, type, linkError, router]);

  if (!error) return <Spinner label="Confirming" />;
  return (
    <AuthCard title="Link problem" footer={<Link href="/login/" className="font-semibold text-accent">Back to log in</Link>}>
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Link href="/forgot-password/" className="inline-block font-semibold text-accent">Send a new reset link</Link>
      </div>
    </AuthCard>
  );
}

export default function ConfirmPage() {
  return <Suspense fallback={<Spinner />}><Confirm /></Suspense>;
}
