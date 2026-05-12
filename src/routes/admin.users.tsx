import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Crown, Edit3, Search, Shield, Trash2, UserCog, Users, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type Row = { id: string; username: string; display_name: string | null; avatar_url: string | null; bio: string | null; created_at: string; legacyRoles: string[]; assignments: string[] };
type RoleLite = { id: string; name: string; slug: string; color: string; is_system: boolean };

function AdminUsers() {
  const { isCeo, hasPerm, user: me } = useAuth();
  const canEdit = isCeo || hasPerm("action:users.edit");
  const canDelete = isCeo || hasPerm("action:users.delete");
  const canManageRoles = isCeo || hasPerm("action:roles.manage");

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState({ username: "", display_name: "", avatar_url: "", bio: "" });
  const [assigning, setAssigning] = useState<Row | null>(null);
  const [assignDraft, setAssignDraft] = useState<Set<string>>(new Set());

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-users-v2"],
    queryFn: async (): Promise<{ users: Row[]; roles: RoleLite[] }> => {
      const [{ data: profs }, { data: roles }, { data: rolesAll }, { data: assignments }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("roles").select("id, name, slug, color, is_system").order("is_system", { ascending: false }).order("name"),
        supabase.from("user_role_assignments").select("user_id, role_id"),
      ]);
      const legacy: Record<string, string[]> = {};
      (roles ?? []).forEach((r: any) => { (legacy[r.user_id] ??= []).push(r.role); });
      const byUser: Record<string, string[]> = {};
      (assignments ?? []).forEach((a: any) => { (byUser[a.user_id] ??= []).push(a.role_id); });
      const users = (profs ?? []).map((p: any) => ({ ...p, legacyRoles: legacy[p.id] ?? [], assignments: byUser[p.id] ?? [] }));
      return { users, roles: (rolesAll ?? []) as RoleLite[] };
    },
  });

  const users = data?.users ?? [];
  const allRoles = data?.roles ?? [];
  const roleById = useMemo(() => Object.fromEntries(allRoles.map(r => [r.id, r])), [allRoles]);

  const openEdit = (row: Row) => {
    setEditing(row);
    setDraft({
      username: row.username, display_name: row.display_name ?? "",
      avatar_url: row.avatar_url ?? "", bio: row.bio ?? "",
    });
  };

  const saveProfile = async () => {
    if (!editing) return;
    if (!canEdit && editing.id !== me?.id) return toast.error("No permission");
    const { error } = await supabase.from("profiles").update({
      username: draft.username.trim(),
      display_name: draft.display_name.trim() || null,
      avatar_url: draft.avatar_url.trim() || null,
      bio: draft.bio.trim() || null,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("User updated");
    setEditing(null);
    refetch();
  };

  const removeUser = async (userId: string) => {
    if (!canDelete) return toast.error("No permission");
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_role_assignments").delete().eq("user_id", userId);
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("User removed");
    refetch();
  };

  const openAssign = (row: Row) => {
    setAssigning(row);
    setAssignDraft(new Set(row.assignments));
  };

  const toggleAssign = (id: string) => {
    const next = new Set(assignDraft);
    next.has(id) ? next.delete(id) : next.add(id);
    setAssignDraft(next);
  };

  const saveAssignments = async () => {
    if (!assigning) return;
    const current = new Set(assigning.assignments);
    const toAdd = [...assignDraft].filter(id => !current.has(id));
    const toRemove = [...current].filter(id => !assignDraft.has(id));

    if (toRemove.length) {
      const { error } = await supabase.from("user_role_assignments").delete()
        .eq("user_id", assigning.id).in("role_id", toRemove);
      if (error) return toast.error(error.message);
    }
    if (toAdd.length) {
      const rows = toAdd.map(role_id => ({ user_id: assigning.id, role_id, assigned_by: me?.id }));
      const { error } = await supabase.from("user_role_assignments").insert(rows);
      if (error) return toast.error(error.message);
    }

    // Sync legacy user_roles for system roles (ceo/admin/user) so existing RLS keeps working
    const slugs = new Set(allRoles.filter(r => assignDraft.has(r.id) && r.is_system).map(r => r.slug));
    const legacyTargets = ["ceo", "admin", "user"].filter(s => slugs.has(s));
    const currentLegacy = assigning.legacyRoles;
    const legacyAdd = legacyTargets.filter(s => !currentLegacy.includes(s));
    const legacyRemove = currentLegacy.filter(s => ["ceo", "admin", "user"].includes(s) && !slugs.has(s));
    if (legacyRemove.length) await supabase.from("user_roles").delete().eq("user_id", assigning.id).in("role", legacyRemove as any);
    if (legacyAdd.length) await supabase.from("user_roles").insert(legacyAdd.map(role => ({ user_id: assigning.id, role: role as any })));

    toast.success("Roles updated");
    setAssigning(null);
    refetch();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => !q || u.username.toLowerCase().includes(q) || (u.display_name ?? "").toLowerCase().includes(q));
  }, [users, search]);

  const stats = {
    total: users.length,
    staff: users.filter(u => u.legacyRoles.includes("admin") || u.legacyRoles.includes("ceo")).length,
    ceo: users.filter(u => u.legacyRoles.includes("ceo")).length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black flex items-center gap-2"><UserCog className="h-7 w-7 text-primary" /> Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">{canManageRoles ? "Manage profiles, assign roles, and remove accounts." : "View only."}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 bg-card/60" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[{ label: "Total", value: stats.total, icon: Users }, { label: "Staff", value: stats.staff, icon: Shield }, { label: "CEO", value: stats.ceo, icon: Crown }].map((s) => {
          const Icon = s.icon;
          return <div key={s.label} className="rounded-xl border border-border bg-card/50 p-4"><div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground"><span>{s.label}</span><Icon className="h-4 w-4 text-primary" /></div><div className="mt-2 font-display text-3xl font-black">{s.value}</div></div>;
        })}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>}
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-muted font-display text-xs text-primary">{(u.display_name ?? u.username).slice(0, 2).toUpperCase()}</div>
                    <div><div className="font-medium">{u.display_name ?? u.username}</div><div className="text-xs text-muted-foreground">@{u.username}</div></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {u.assignments.map(rid => {
                      const r = roleById[rid];
                      if (!r) return null;
                      return <span key={rid} className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest text-white" style={{ background: r.color }}>{r.name}</span>;
                    })}
                    {u.assignments.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    {canManageRoles && u.id !== me?.id && (
                      <Button size="sm" variant="outline" onClick={() => openAssign(u)}><KeyRound className="h-3 w-3" /> Roles</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)} disabled={!canEdit && u.id !== me?.id}><Edit3 className="h-3 w-3" /> Edit</Button>
                    {canDelete && u.id !== me?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Delete @{u.username}?</AlertDialogTitle><AlertDialogDescription>Removes profile, roles, and assignments. Cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => removeUser(u.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users match.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Edit profile */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="bg-card/95 border-border">
          <DialogHeader><DialogTitle className="font-display">Edit profile</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input value={draft.username} onChange={e => setDraft({ ...draft, username: e.target.value })} placeholder="Username" />
            <Input value={draft.display_name} onChange={e => setDraft({ ...draft, display_name: e.target.value })} placeholder="Display name" />
            <Input value={draft.avatar_url} onChange={e => setDraft({ ...draft, avatar_url: e.target.value })} placeholder="Avatar URL" />
            <Textarea value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} placeholder="Bio" className="min-h-28" />
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveProfile} className="bg-gradient-blood">Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign roles */}
      <Dialog open={!!assigning} onOpenChange={open => !open && setAssigning(null)}>
        <DialogContent className="bg-card/95 border-border">
          <DialogHeader><DialogTitle className="font-display">Manage roles for @{assigning?.username}</DialogTitle></DialogHeader>
          <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
            {allRoles.map(r => (
              <label key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:border-primary">
                <Checkbox checked={assignDraft.has(r.id)} onCheckedChange={() => toggleAssign(r.id)} />
                <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center gap-2">{r.name}{r.is_system && <span className="text-[9px] uppercase tracking-widest text-muted-foreground">system</span>}</div>
                  <div className="text-xs text-muted-foreground">@{r.slug}</div>
                </div>
              </label>
            ))}
            {allRoles.length === 0 && <div className="text-sm text-muted-foreground p-4 text-center">No roles defined yet. Create one in Roles Manager.</div>}
          </div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setAssigning(null)}>Cancel</Button><Button onClick={saveAssignments} className="bg-gradient-blood">Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
