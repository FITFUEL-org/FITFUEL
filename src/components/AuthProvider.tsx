"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfile, type Profile } from "@/lib/data";

interface AuthState {
  ready: boolean;              // initial session check finished
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profileError: string | null;
  refreshProfile: () => Promise<Profile | null>;
  setProfile: (p: Profile) => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const load = useCallback(async (uid: string | undefined) => {
    if (!uid) { setProfile(null); return null; }
    try {
      const p = await getProfile(uid);
      setProfile(p);
      setProfileError(null);
      return p;
    } catch (e) {
      setProfileError((e as Error).message);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      await load(data.session?.user.id);
      if (alive) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      // Don't await other Supabase calls inside this callback (supabase-js deadlock warning).
      if (event === "SIGNED_IN" || event === "USER_UPDATED") setTimeout(() => load(s?.user.id), 0);
      if (event === "SIGNED_OUT") setProfile(null);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [load]);

  const refreshProfile = useCallback(() => load(session?.user.id), [load, session?.user.id]);

  return (
    <Ctx.Provider value={{ ready, session, user: session?.user ?? null, profile, profileError, refreshProfile, setProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
