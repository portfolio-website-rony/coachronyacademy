import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type Role = "admin" | "student" | "client" | "moderator" | "user";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  account_type: "student" | "client";
  onboarded: boolean;
};

export type AuthUserState = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  roles: Role[];
  isAdmin: boolean;
  isStudent: boolean;
  isClient: boolean;
};

const initial: AuthUserState = {
  loading: true,
  session: null,
  profile: null,
  roles: [],
  isAdmin: false,
  isStudent: false,
  isClient: false,
};

export function useAuthUser(): AuthUserState {
  const [state, setState] = useState<AuthUserState>(initial);

  useEffect(() => {
    let mounted = true;

    async function load(session: Session | null) {
      if (!session) {
        if (mounted) setState({ ...initial, loading: false });
        return;
      }
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id,display_name,avatar_url,account_type,onboarded").eq("id", session.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
      ]);
      const roleList = (roles ?? []).map((r) => r.role as Role);
      if (mounted) {
        setState({
          loading: false,
          session,
          profile: (profile as Profile) ?? null,
          roles: roleList,
          isAdmin: roleList.includes("admin"),
          isStudent: roleList.includes("student"),
          isClient: roleList.includes("client"),
        });
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      void load(session);
    });
    void supabase.auth.getSession().then(({ data }) => load(data.session));

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
