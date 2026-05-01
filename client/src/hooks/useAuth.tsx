import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "owner" | "admin" | "operator" | "viewer";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: Role[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, roles: [], loading: true, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // BYPASS AUTH: No auth checks, no API calls
    // App runs without authentication
    setLoading(false);
  }, []);

  async function fetchRoles(uid: string) {
    // Bypass role fetching
    setRoles([]);
  }

  async function signOut() {
    // Bypass sign out
  }

  return <Ctx.Provider value={{ user, session, roles, loading, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export function useHasMinRole(min: Role): boolean {
  const { roles } = useAuth();
  const order: Role[] = ["viewer", "operator", "admin", "owner"];
  const minIdx = order.indexOf(min);
  return roles.some((r) => order.indexOf(r) >= minIdx);
}