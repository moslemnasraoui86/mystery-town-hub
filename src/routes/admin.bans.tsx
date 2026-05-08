import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bans")({ component: AdminBans });

function AdminBans() {
  const { user } = useAuth();
  const [f, setF] = useState({ user_id: "", reason: "", expires_at: "" });
  const { data: bans, refetch } = useQuery({ queryKey: ["bans"], queryFn: async () => (await supabase.from("bans").select("*, profiles(username)").order("created_at", { ascending: false })).data ?? [] });
  const { data: profs } = useQuery({ queryKey: ["all-profs"], queryFn: async () => (await supabase.from("profiles").select("id, username").order("username")).data ?? [] });
  const create = async () => {
    if (!f.user_id || !f.reason) return toast.error("User + reason required");
    const { error } = await supabase.from("bans").insert({ user_id: f.user_id, reason: f.reason, expires_at: f.expires_at || null, created_by: user?.id, active: true });
    if (error) return toast.error(error.message);
    toast.success("Banned"); setF({ user_id: "", reason: "", expires_at: "" }); refetch();
  };
  const lift = async (id: string) => {
    const { error } = await supabase.from("bans").update({ active: false }).eq("id", id);
    if (error) return toast.error(error.message);
    refetch();
  };
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Bans</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3">
        <div><Label>User</Label>
          <select className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm" value={f.user_id} onChange={e => setF({ ...f, user_id: e.target.value })}>
            <option value="">Select user…</option>
            {profs?.map(p => <option key={p.id} value={p.id}>@{p.username}</option>)}
          </select>
        </div>
        <div><Label>Reason</Label><Input value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} /></div>
        <div><Label>Expires (optional)</Label><Input type="datetime-local" value={f.expires_at} onChange={e => setF({ ...f, expires_at: e.target.value })} /></div>
        <Button variant="destructive" onClick={create}>Issue Ban</Button>
      </div>
      <div className="mt-8 space-y-2">
        {bans?.map((b: any) => (
          <div key={b.id} className="rounded-xl border border-border bg-card/50 p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">@{b.profiles?.username ?? "unknown"} — <span className="text-destructive">{b.reason}</span></div>
              <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()} {b.expires_at && `· expires ${new Date(b.expires_at).toLocaleDateString()}`}</div>
            </div>
            {b.active ? <Button size="sm" onClick={() => lift(b.id)}>Lift</Button> : <span className="text-xs uppercase tracking-widest text-muted-foreground">Lifted</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
