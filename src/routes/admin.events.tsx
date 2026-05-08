import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/events")({ component: AdminEvents });

function AdminEvents() {
  const [f, setF] = useState({ title: "", description: "", starts_at: "", location: "" });
  const { data, refetch } = useQuery({ queryKey: ["adm-evt"], queryFn: async () => (await supabase.from("events").select("*").order("starts_at")).data ?? [] });
  const create = async () => {
    if (!f.title || !f.starts_at) return toast.error("Title + date required");
    const { error } = await supabase.from("events").insert(f);
    if (error) return toast.error(error.message);
    toast.success("Created"); setF({ title: "", description: "", starts_at: "", location: "" }); refetch();
  };
  const del = async (id: string) => { await supabase.from("events").delete().eq("id", id); refetch(); };
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Manage Events</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Title</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Starts at</Label><Input type="datetime-local" value={f.starts_at} onChange={e => setF({ ...f, starts_at: e.target.value })} /></div>
        </div>
        <div><Label>Location</Label><Input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea rows={4} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
        <Button onClick={create} className="bg-gradient-blood">Create event</Button>
      </div>
      <div className="mt-8 space-y-2">
        {data?.map(e => (
          <div key={e.id} className="rounded-xl border border-border bg-card/50 p-4 flex justify-between items-center">
            <div><div className="font-medium">{e.title}</div><div className="text-xs text-muted-foreground">{new Date(e.starts_at).toLocaleString()}</div></div>
            <Button size="sm" variant="destructive" onClick={() => del(e.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
