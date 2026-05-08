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

export const Route = createFileRoute("/admin/factions")({ component: AdminFactions });

function AdminFactions() {
  const [f, setF] = useState({ name: "", tag: "", description: "", color: "#dc2626" });
  const { data, refetch } = useQuery({ queryKey: ["adm-fac"], queryFn: async () => (await supabase.from("factions").select("*").order("name")).data ?? [] });
  const create = async () => {
    if (!f.name) return toast.error("Name required");
    const { error } = await supabase.from("factions").insert(f);
    if (error) return toast.error(error.message);
    toast.success("Created"); setF({ name: "", tag: "", description: "", color: "#dc2626" }); refetch();
  };
  const del = async (id: string) => { await supabase.from("factions").delete().eq("id", id); refetch(); };
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Manage Factions</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2"><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>Tag</Label><Input value={f.tag} onChange={e => setF({ ...f, tag: e.target.value })} /></div>
        </div>
        <div><Label>Color</Label><Input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea rows={3} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
        <Button onClick={create} className="bg-gradient-blood">Create</Button>
      </div>
      <div className="mt-8 space-y-2">
        {data?.map(x => (
          <div key={x.id} className="rounded-xl border border-border bg-card/50 p-4 flex justify-between items-center">
            <div className="font-medium" style={{ color: x.color ?? "#dc2626" }}>[{x.tag}] {x.name}</div>
            <Button size="sm" variant="destructive" onClick={() => del(x.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
