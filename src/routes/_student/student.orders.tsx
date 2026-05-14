import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export const Route = createFileRoute("/_student/student/orders")({
  head: () => ({ meta: [{ title: "My Orders — CoachRony" }] }),
  component: OrdersPage,
});

type Order = {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  created_at: string;
  course: { title: string | null } | null;
};

function OrdersPage() {
  const { session } = useAuthUser();
  const [items, setItems] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!session) return;
    void supabase
      .from("payments")
      .select("id,amount,currency,method,status,created_at,course:courses(title)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as any) ?? []));
  }, [session]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My Orders</h1>
      {items === null ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : items.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{o.course?.title ?? "—"}</td>
                  <td className="px-4 py-3">{o.amount} {o.currency}</td>
                  <td className="px-4 py-3 capitalize">{o.method}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      o.status === "verified" || o.status === "paid" || o.status === "succeeded"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : o.status === "pending"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
