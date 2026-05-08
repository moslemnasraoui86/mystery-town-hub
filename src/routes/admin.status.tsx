import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/status")({ component: AdminStatus });

function AdminStatus() {
  const { data, refetch } = useQuery({ queryKey: ["adm-status"], queryFn: async () => (await supabase.from("server_status").select("*").eq("id", 1).maybeSingle()).data });
  const [f, setF] = useState({ online: true, players: 0, max_players: 200, ip: "", message: "" });
  useEffect(() => { if (data) setF({ online: data.online, players: data.players, max_players: data.max_players, ip: data.ip ?? "", message: data.message ?? "" }); }, [data]);
  const save = async () => {
    const { error } = await supabase.from("server_status").update({ ...f, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Saved"); refetch();
  };
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Server Status</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3 max-w-xl">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.online} onChange={e => setF({ ...f, online: e.target.checked })} /> Online</label>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Players</Label><Input type="number" value={f.players} onChange={e => setF({ ...f, players: +e.target.value })} /></div>
          <div><Label>Max</Label><Input type="number" value={f.max_players} onChange={e => setF({ ...f, max_players: +e.target.value })} /></div>
        </div>
        <div><Label>IP</Label><Input value={f.ip} onChange={e => setF({ ...f, ip: e.target.value })} /></div>
        <div><Label>Message</Label><Textarea rows={3} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></div>
        <Button onClick={save} className="bg-gradient-blood">Save</Button>
      </div>
    </div>
  );
}
