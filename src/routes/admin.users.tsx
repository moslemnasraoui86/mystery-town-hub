import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Crown, Edit3, Search, Shield, Trash2, UserCog, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type Row = { id: string; username: string; display_name: string | null; avatar_url: string | null; bio: string | null; created_at: string; roles: string[] };

function AdminUsers() {
  const { isCeo, user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState({ username: "", display_name: "", avatar_url: "", bio: "" });
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<Row[]> => {
      const [{ data: profs }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const byUser: Record<string, string[]> = {};
      (roles ?? []).forEach((r: any) => {
        byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role];
      });
      return (profs ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] }));
    },
  });

  const setRole = async (userId: string, role: "user" | "admin" | "ceo", add: boolean) => {
    if (!isCeo) return toast.error("Only CEO can change roles");
    if (add) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated");
    refetch();
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setDraft({
      username: row.username,
      display_name: row.display_name ?? "",
      avatar_url: row.avatar_url ?? "",
      bio: row.bio ?? "",
    });
  };

  const saveProfile = async () => {
    if (!editing) return;
    if (!isCeo && editing.id !== me?.id) return toast.error("Only CEO can edit other users");
    const { error } = await supabase.from("profiles").update({
      username: draft.username.trim(),
      display_name: draft.display_name.trim() || null,
      avatar_url: draft.avatar_url.trim() || null,
      bio: draft.bio.trim() || null,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("User profile updated");
    setEditing(null);
    refetch();
  };

  const removeUser = async (userId: string, username: string) => {
    if (!isCeo) return toast.error("Only CEO can remove users");
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("User removed");
    refetch();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (data ?? []).filter((u) => !q || u.username.toLowerCase().includes(q) || (u.display_name ?? "").toLowerCase().includes(q) || u.roles.join(" ").includes(q));
  }, [data, search]);

  const stats = {
    total: data?.length ?? 0,
    ceo: data?.filter((u) => u.roles.includes("ceo")).length ?? 0,
    admin: data?.filter((u) => u.roles.includes("admin")).length ?? 0,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black flex items-center gap-2"><UserCog className="h-7 w-7 text-primary" /> Users & Roles</h1>
          <p className="text-muted-foreground mt-1 text-sm">{isCeo ? "CEO access — profile editing, role control, and user cleanup." : "View only — only CEO can edit roles and users."}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, names, roles..." className="pl-9 bg-card/60" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[{ label: "Total users", value: stats.total, icon: Users }, { label: "Admins", value: stats.admin, icon: Shield }, { label: "CEO", value: stats.ceo, icon: Crown }].map((s) => {
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
                    {u.roles.map(r => (
                      <span key={r} className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${
                        r === "ceo" ? "bg-gradient-blood text-primary-foreground" :
                        r === "admin" ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
                      }`}>{r}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)} disabled={!isCeo && u.id !== me?.id}><Edit3 className="h-3 w-3" /> Edit</Button>
                    {isCeo && u.id !== me?.id && (
                      <>
                        {(["admin", "ceo"] as const).map(r => (
                          <Button key={r} size="sm" variant={u.roles.includes(r) ? "destructive" : "outline"}
                            onClick={() => setRole(u.id, r, !u.roles.includes(r))}>
                            {u.roles.includes(r) ? `Revoke ${r}` : `Make ${r}`}
                          </Button>
                        ))}
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /> Delete</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete @{u.username}?</AlertDialogTitle><AlertDialogDescription>This removes the user profile and roles from the admin system. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => removeUser(u.id, u.username)}>Delete user</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users match your search.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="bg-card/95 border-border">
          <DialogHeader><DialogTitle className="font-display">Edit user profile</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} placeholder="Username" />
            <Input value={draft.display_name} onChange={(e) => setDraft({ ...draft, display_name: e.target.value })} placeholder="Display name" />
            <Input value={draft.avatar_url} onChange={(e) => setDraft({ ...draft, avatar_url: e.target.value })} placeholder="Avatar URL" />
            <Textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} placeholder="Bio" className="min-h-28" />
            <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveProfile} className="bg-gradient-blood">Save changes</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
