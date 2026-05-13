import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to postgres_changes on the given tables and run `onChange` on any event.
 * Use to invalidate React Query caches or refetch.
 */
export function useRealtime(tables: string[], onChange: () => void) {
  useEffect(() => {
    const channel = supabase.channel(`admin-rt-${tables.join("-")}`);
    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => onChange(),
      );
    });
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join("|")]);
}
