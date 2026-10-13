"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

/** Signed-in visitors skip the landing page. */
export function HomeRedirect() {
  const { ready, user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready && user) router.replace("/dashboard/");
  }, [ready, user, router]);
  return null;
}
