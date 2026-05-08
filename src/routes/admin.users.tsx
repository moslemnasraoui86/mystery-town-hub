import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type Row = { id: string; username: string; display_name: string | null; created_at: string; roles: string[] };

function AdminUsers() {
  const { isCeo, user: me } = useAuth();
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

  const removeUser = async (userId: string, username: string) => {
    if (!isCeo) return toast.error("Only CEO can remove users");
    if (!confirm(`Permanently delete @${username}? Their account profile will be removed.`)) return;
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success("User removed");
    refetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Users & Roles</h1>
      <p className="text-muted-foreground mt-1 text-sm">{isCeo ? "CEO access — full role control" : "View only — only CEO can edit roles"}</p>

      <div className="mt-8 rounded-xl border border-border bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">Loading...</td></tr>}
            {data?.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.display_name ?? u.username}</div>
                  <div className="text-xs text-muted-foreground">@{u.username}</div>
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
                <td className="px-4 py-3 text-right">
                  {isCeo && u.id !== me?.id && (
                    <div className="flex gap-1 justify-end flex-wrap">
                      {(["admin", "ceo"] as const).map(r => (
                        <Button key={r} size="sm" variant={u.roles.includes(r) ? "destructive" : "outline"}
                          onClick={() => setRole(u.id, r, !u.roles.includes(r))}>
                          {u.roles.includes(r) ? `Revoke ${r}` : `Make ${r}`}
                        </Button>
                      ))}
                      <Button size="sm" variant="destructive" onClick={() => removeUser(u.id, u.username)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
