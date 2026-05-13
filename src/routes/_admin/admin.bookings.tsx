import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Calendar, Link2, Download } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { BookingDrawer } from "@/components/admin/BookingDrawer";
import { format, isFuture, isPast, isToday, parseISO } from "date-fns";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings — Admin" }] }),
  component: BookingsPage,
});

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  meeting_link: string | null;
  meeting_provider: string | null;
  meeting_status: string;
  created_at: string;
};

type Tab = "all" | "today" | "upcoming" | "past" | "pending" | "cancelled";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Pending" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);
  useRealtime(["bookings"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("preferred_date", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setRows((data as Booking[]) ?? []);
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((b) => {
      if (needle) {
        const hay = `${b.name} ${b.email} ${b.phone ?? ""} ${b.topic ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      const date = parseISO(b.preferred_date);
      switch (tab) {
        case "today":
          return isToday(date) && b.status !== "cancelled";
        case "upcoming":
          return (isFuture(date) || isToday(date)) && b.status !== "cancelled";
        case "past":
          return isPast(date) && !isToday(date);
        case "pending":
          return b.status === "pending";
        case "cancelled":
          return b.status === "cancelled";
        default:
          return true;
      }
    });
  }, [rows, q, tab]);

  function exportCsv() {
    const header = ["Name", "Email", "Phone", "Date", "Time", "Topic", "Status", "Meeting"];
    const lines = [header.join(",")].concat(
      filtered.map((b) =>
        [b.name, b.email, b.phone ?? "", b.preferred_date, b.preferred_time, b.topic ?? "", b.status, b.meeting_link ?? ""]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Bookings</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {rows.length}</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="glass relative flex-1 min-w-[220px] rounded-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone, topic…"
            className="w-full bg-transparent px-10 py-2.5 text-sm outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                tab === t.id
                  ? "border-primary/60 bg-primary/20 text-foreground"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="p-4"><TableSkeleton rows={6} cols={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings"
            description={q ? "Try a different search." : "New bookings will appear here in realtime."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date / Time</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meeting</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setOpenId(b.id)}
                    className="cursor-pointer border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{format(parseISO(b.preferred_date), "PP")}</div>
                      <div className="text-muted-foreground">{b.preferred_time}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{b.topic ?? "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-xs">
                      {b.meeting_link ? (
                        <a
                          href={b.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-primary-glow hover:underline"
                        >
                          <Link2 className="h-3.5 w-3.5" /> {b.meeting_provider ?? "link"}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookingDrawer bookingId={openId} onClose={() => setOpenId(null)} onChanged={load} />
    </div>
  );
}
