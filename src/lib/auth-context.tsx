import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "user" | "admin" | "ceo";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  profile: { username: string; display_name: string | null; avatar_url: string | null } | null;
  loading: boolean;
  isStaff: boolean;
  isCeo: boolean;
  permissions: string[];
  hasPerm: (p: string) => boolean;
  canAccessPage: (pageKey: string) => boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthCtx["profile"]>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExtras = async (uid: string) => {
    const [{ data: r }, { data: p }, { data: perms }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("username, display_name, avatar_url").eq("id", uid).maybeSingle(),
      supabase.rpc("user_permissions", { _user_id: uid }),
    ]);
    setRoles((r ?? []).map((x: any) => x.role as AppRole));
    setProfile(p as any);
    setPermissions(((perms ?? []) as any[]).map((x: any) => (typeof x === "string" ? x : x.user_permissions ?? x)));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        setTimeout(() => {
          loadExtras(s.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setRoles([]);
        setProfile(null);
        setPermissions([]);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) await loadExtras(s.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => { if (user) await loadExtras(user.id); };
  const signOut = async () => { await supabase.auth.signOut(); };

  const isStaff = roles.includes("admin") || roles.includes("ceo");
  const isCeo = roles.includes("ceo");
  const hasPerm = (p: string) => isCeo || isStaff || permissions.includes(p);
  const canAccessPage = (pageKey: string) => isStaff || permissions.includes(`page:${pageKey}`);

  return (
    <Ctx.Provider value={{ user, session, roles, profile, loading, isStaff, isCeo, permissions, hasPerm, canAccessPage, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
