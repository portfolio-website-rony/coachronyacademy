import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/lib/admin/use-realtime";
import { StatCard } from "@/components/admin/AdminShell";
import {
  Users,
  CalendarDays,
  Video,
  CreditCard,
  Clock,
  TrendingUp,
  Mail,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

type Stats = {
  leads: number;
  bookings: number;
  todayMeetings: number;
  revenue: number;
  pending: number;
  clients: number;
  subscribers: number;
};

type RecentLead = { id: string; name: string; email: string | null; phone: string | null; created_at: string; status: string };
type RecentBooking = { id: string; name: string; email: string; preferred_date: string; preferred_time: string; status: string };
type RecentSubscriber = { id: string; email: string; created_at: string };

const COLORS = ["oklch(0.7 0.2 290)", "oklch(0.72 0.18 220)", "oklch(0.75 0.18 152)", "oklch(0.78 0.18 60)"];

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<{ day: string; amount: number }[]>([]);
  const [sourcePie, setSourcePie] = useState<{ name: string; value: number }[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);

  useEffect(() => {
    void load();
  }, []);

  useRealtime(["leads", "bookings", "payments", "clients", "subscribers"], () => void load());

  async function load() {
    const today = startOfDay(new Date()).toISOString().split("T")[0];
    const [
      leads,
      bookings,
      todayBookings,
      payments,
      pendingPayments,
      clients,
      subscribers,
      paymentRows,
      leadRows,
      latestLeads,
      latestBookings,
      latestSubscribers,
    ] = await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("preferred_date", today),
      supabase.from("payments").select("amount").eq("status", "paid"),
      supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("subscribers").select("*", { count: "exact", head: true }),
      supabase
        .from("payments")
        .select("amount, paid_at, created_at, status")
        .eq("status", "paid"),
      supabase.from("leads").select("source, created_at"),
      supabase
        .from("leads")
        .select("id, name, email, phone, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("bookings")
        .select("id, name, email, preferred_date, preferred_time, status")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("subscribers")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const revenue = (payments.data ?? []).reduce(
      (a, r) => a + Number(r.amount ?? 0),
      0
    );

    setStats({
      leads: leads.count ?? 0,
      bookings: bookings.count ?? 0,
      todayMeetings: todayBookings.count ?? 0,
      revenue,
      pending: pendingPayments.count ?? 0,
      clients: clients.count ?? 0,
      subscribers: subscribers.count ?? 0,
    });

    setRecentLeads((latestLeads.data ?? []) as RecentLead[]);
    setRecentBookings((latestBookings.data ?? []) as RecentBooking[]);
    setRecentSubscribers((latestSubscribers.data ?? []) as RecentSubscriber[]);

    const days: { day: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      days.push({ day: format(d, "MMM d"), amount: 0 });
    }
    (paymentRows.data ?? []).forEach((p) => {
      const when = new Date((p.paid_at as string | null) ?? p.created_at);
      const idx = 29 - Math.floor((Date.now() - when.getTime()) / 86400000);
      if (idx >= 0 && idx < 30) days[idx].amount += Number(p.amount ?? 0);
    });
    setRevenueSeries(days);

    const counts = new Map<string, number>();
    (leadRows.data ?? []).forEach((l) => {
      const k = l.source || "website";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    });
    setSourcePie(Array.from(counts).map(([name, value]) => ({ name, value })));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back — here's how your business is doing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Leads" value={stats?.leads ?? "…"} icon={Users} />
        <StatCard label="Bookings" value={stats?.bookings ?? "…"} icon={CalendarDays} />
        <StatCard label="Subscribers" value={stats?.subscribers ?? "…"} icon={Mail} />
        <StatCard label="Today's meetings" value={stats?.todayMeetings ?? "…"} icon={Video} />
        <StatCard
          label="Revenue"
          value={stats ? `৳${stats.revenue.toLocaleString()}` : "…"}
          icon={TrendingUp}
        />
        <StatCard label="Pending" value={stats?.pending ?? "…"} icon={Clock} />
        <StatCard label="Clients" value={stats?.clients ?? "…"} icon={CreditCard} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-semibold">Revenue (last 30 days)</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,30,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="oklch(0.72 0.2 290)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold">Lead sources</h3>
          <div className="mt-4 h-72">
            {sourcePie.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No leads yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcePie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {sourcePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(20,20,30,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentPanel title="Recent leads" href="/admin/leads" empty="No leads yet">
          {recentLeads.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 border-b border-white/5 py-2.5 last:border-0">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{l.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {l.email || l.phone || "—"}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary-glow">
                  {l.status}
                </span>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                </div>
              </div>
            </li>
          ))}
        </RecentPanel>

        <RecentPanel title="Recent bookings" href="/admin/bookings" empty="No bookings yet">
          {recentBookings.map((b) => (
            <li key={b.id} className="flex items-start justify-between gap-3 border-b border-white/5 py-2.5 last:border-0">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{b.name}</div>
                <div className="truncate text-xs text-muted-foreground">{b.email}</div>
              </div>
              <div className="shrink-0 text-right text-xs">
                <div className="font-medium">{b.preferred_date}</div>
                <div className="text-[10px] text-muted-foreground">{b.preferred_time}</div>
              </div>
            </li>
          ))}
        </RecentPanel>

        <RecentPanel title="Recent subscribers" href="/admin/leads" empty="No subscribers yet">
          {recentSubscribers.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5 last:border-0">
              <div className="truncate text-sm">{s.email}</div>
              <div className="shrink-0 text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
              </div>
            </li>
          ))}
        </RecentPanel>
      </div>
    </div>
  );
}

function RecentPanel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.length === 0 || (items.length === 1 && !items[0]);
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {isEmpty ? (
        <div className="mt-4 grid place-items-center py-8 text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <ul className="mt-2">{children}</ul>
      )}
    </div>
  );
}
