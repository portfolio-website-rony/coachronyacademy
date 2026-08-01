import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AdminState = {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
};

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({
    loading: true,
    session: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    async function check(session: Session | null) {
      if (!session) {
        if (mounted) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) {
        setState({
          loading: false,
          session,
          isAdmin: !!data && !error,
        });
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // NEVER call supabase queries synchronously inside this callback —
      // the auth lock is held and the query deadlocks (page stuck loading).
      setTimeout(() => { void check(session); }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => check(data.session));


    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
