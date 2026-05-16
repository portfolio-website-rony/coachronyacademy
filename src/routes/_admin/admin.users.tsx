import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllUsers, setUserRole, deleteUser, resetUserPassword } from "@/lib/admin/users.functions";
import { toast } from "sonner";
import { Loader2, Shield, ShieldOff, Trash2, Search, KeyRound } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: UsersPage,
});

type Row = Awaited<ReturnType<typeof listAllUsers>>[number];

function UsersPage() {
  const fetchUsers = useServerFn(listAllUsers);
  const setRole = useServerFn(setUserRole);
  const delUser = useServerFn(deleteUser);
  const resetPw = useServerFn(resetUserPassword);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setRows(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdmin(u: Row) {
    const isAdmin = u.roles.includes("admin");
    try {
      await setRole({ data: { userId: u.id, role: "admin", action: isAdmin ? "remove" : "add" } });
      toast.success(isAdmin ? "Admin removed" : "Admin granted");
      void load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function resetPassword(u: Row) {
    const pw = prompt(`Set a new password for ${u.email}\n(at least 8 characters):`);
    if (pw === null) return;
    if (pw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!confirm(`Reset password for ${u.email}? Share the new password with them securely.`)) return;
    try {
      await resetPw({ data: { userId: u.id, newPassword: pw } });
      toast.success(`Password reset for ${u.email}`);
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(u: Row) {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await delUser({ data: { userId: u.id } });
      toast.success("User deleted");
      setRows((r) => r.filter((x) => x.id !== u.id));
    } catch (e: any) { toast.error(e.message); }
  }

  const filtered = rows.filter((r) => {
    if (roleFilter !== "all" && !r.roles.includes(roleFilter)) return false;
    if (q && !(r.email?.toLowerCase().includes(q.toLowerCase()) || r.profile?.display_name?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const counts = {
    total: rows.length,
    admin: rows.filter((r) => r.roles.includes("admin")).length,
    student: rows.filter((r) => r.roles.includes("student")).length,
    client: rows.filter((r) => r.roles.includes("client")).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Users & Authentication</h1>
        <p className="text-sm text-muted-foreground">
          {counts.total} users • {counts.admin} admin • {counts.student} student • {counts.client} client
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="glass relative flex items-center rounded-xl px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email or name…" className="bg-transparent px-2 py-2 text-sm outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm">
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="student">Students</option>
          <option value="client">Clients</option>
        </select>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Last sign-in</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.profile?.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] ${r === "admin" ? "bg-primary/25 text-primary-glow" : "bg-white/10 text-muted-foreground"}`}>{r}</span>
                        ))}
                        {u.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}</td>
                    <td className="px-4 py-3 text-xs">{u.email_confirmed ? <span className="text-[oklch(0.85_0.15_152)]">Yes</span> : <span className="text-amber-300">No</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => toggleAdmin(u)} title={u.roles.includes("admin") ? "Remove admin" : "Make admin"} className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary-glow hover:bg-primary/25">
                          {u.roles.includes("admin") ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => resetPassword(u)} title="Reset password" className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25">
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(u)} title="Delete user" className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No users.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
