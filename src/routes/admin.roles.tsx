import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PAGES, ACTIONS, pagePerm, actionPerm } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { KeyRound, Plus, Edit3, Trash2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/admin/roles")({ component: RolesManager });

type Role = { id: string; name: string; slug: string; description: string | null; color: string; is_system: boolean };
type Draft = { id?: string; name: string; slug: string; description: string; color: string; perms: Set<string> };

const blank = (): Draft => ({ name: "", slug: "", description: "", color: "#dc2626", perms: new Set() });

function RolesManager() {
  const { isCeo, hasPerm, loading } = useAuth();
  const nav = useNavigate();
  const canManage = isCeo || hasPerm("action:roles.manage");

  useEffect(() => { if (!loading && !canManage) nav({ to: "/admin" }); }, [loading, canManage, nav]);

  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: roles, refetch } = useQuery({
    queryKey: ["roles-all"],
    queryFn: async () => {
      const [{ data: rs }, { data: rps }, { data: uras }] = await Promise.all([
        supabase.from("roles").select("*").order("is_system", { ascending: false }).order("name"),
        supabase.from("role_permissions").select("role_id, permission"),
        supabase.from("user_role_assignments").select("role_id"),
      ]);
      const perms: Record<string, string[]> = {};
      (rps ?? []).forEach((r: any) => { (perms[r.role_id] ??= []).push(r.permission); });
      const counts: Record<string, number> = {};
      (uras ?? []).forEach((u: any) => { counts[u.role_id] = (counts[u.role_id] ?? 0) + 1; });
      return (rs ?? []).map((r: any) => ({ ...r, perms: perms[r.id] ?? [], members: counts[r.id] ?? 0 })) as (Role & { perms: string[]; members: number })[];
    },
  });

  const openCreate = () => setDraft(blank());
  const openEdit = (r: Role & { perms: string[] }) => setDraft({
    id: r.id, name: r.name, slug: r.slug, description: r.description ?? "", color: r.color, perms: new Set(r.perms),
  });

  const togglePerm = (p: string) => setDraft(d => {
    if (!d) return d;
    const next = new Set(d.perms);
    next.has(p) ? next.delete(p) : next.add(p);
    return { ...d, perms: next };
  });

  const save = async () => {
    if (!draft) return;
    const name = draft.name.trim();
    const slug = draft.slug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
    if (!name || !slug) return toast.error("Name and slug are required");

    let roleId = draft.id;
    if (roleId) {
      const { error } = await supabase.from("roles").update({
        name, slug, description: draft.description || null, color: draft.color,
      }).eq("id", roleId);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("roles").insert({
        name, slug, description: draft.description || null, color: draft.color, is_system: false,
      }).select("id").single();
      if (error) return toast.error(error.message);
      roleId = data.id;
    }

    // Replace permissions
    await supabase.from("role_permissions").delete().eq("role_id", roleId);
    if (draft.perms.size > 0) {
      const rows = Array.from(draft.perms).map(permission => ({ role_id: roleId!, permission }));
      const { error } = await supabase.from("role_permissions").insert(rows);
      if (error) return toast.error(error.message);
    }
    toast.success("Role saved");
    setDraft(null);
    refetch();
  };

  const remove = async (r: Role) => {
    if (r.is_system) return toast.error("System roles can't be deleted");
    const { error } = await supabase.from("roles").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Role removed");
    refetch();
  };

  const allPerms = useMemo(() => [
    ...PAGES.map(p => ({ key: pagePerm(p.key), label: `Page · ${p.label}`, group: "Pages" })),
    ...ACTIONS.map(a => ({ key: actionPerm(a.key), label: `Action · ${a.label}`, group: "Actions" })),
  ], []);

  if (loading || !canManage) return null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-black flex items-center gap-2"><KeyRound className="h-7 w-7 text-primary" /> Roles Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">Create custom roles and pick which admin pages and actions they unlock.</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-blood"><Plus className="h-4 w-4" /> New Role</Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(roles ?? []).map(r => (
          <div key={r.id} className="rounded-2xl border border-border bg-card/50 p-5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: r.color }} />
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-black">{r.name}</span>
                  {r.is_system && <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div className="text-xs text-muted-foreground">@{r.slug}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-widest font-bold">{r.members} member{r.members === 1 ? "" : "s"}</span>
            </div>
            {r.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> {r.perms.length} permission{r.perms.length === 1 ? "" : "s"}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Edit3 className="h-3 w-3" /> Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={r.is_system}><Trash2 className="h-3 w-3" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Delete role "{r.name}"?</AlertDialogTitle><AlertDialogDescription>Removing this role unassigns it from all users. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => remove(r)}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!draft} onOpenChange={o => !o && setDraft(null)}>
        <DialogContent className="bg-card/95 border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{draft?.id ? "Edit role" : "Create role"}</DialogTitle></DialogHeader>
          {draft && (
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-") })} placeholder="Role name (e.g. Whitelister)" />
                <Input value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} placeholder="slug" />
              </div>
              <Textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
              <div className="flex items-center gap-3">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Color</label>
                <input type="color" value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} className="h-9 w-16 rounded border border-border bg-transparent" />
                <span className="text-xs text-muted-foreground">{draft.color}</span>
              </div>

              {(["Pages", "Actions"] as const).map(group => (
                <div key={group} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="text-xs uppercase tracking-widest text-primary font-bold mb-3">{group}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {allPerms.filter(p => p.group === group).map(p => (
                      <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                        <Checkbox checked={draft.perms.has(p.key)} onCheckedChange={() => togglePerm(p.key)} />
                        {p.label.replace(/^(Page|Action) · /, "")}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
                <Button onClick={save} className="bg-gradient-blood">{draft.id ? "Save changes" : "Create role"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
