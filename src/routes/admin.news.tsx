import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/news")({ component: AdminNews });

function AdminNews() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", excerpt: "", body: "" });
  const { data, refetch } = useQuery({ queryKey: ["adm-news"], queryFn: async () => (await supabase.from("news").select("*").order("created_at", { ascending: false })).data ?? [] });
  const create = async () => {
    if (!form.title || !form.body) return toast.error("Title and body required");
    const { error } = await supabase.from("news").insert({ ...form, author_id: user?.id });
    if (error) return toast.error(error.message);
    toast.success("Posted"); setForm({ title: "", excerpt: "", body: "" }); refetch();
  };
  const del = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); refetch();
  };
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Manage News</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3">
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Excerpt</Label><Input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></div>
        <div><Label>Body</Label><Textarea rows={6} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
        <Button onClick={create} className="bg-gradient-blood">Publish</Button>
      </div>
      <div className="mt-8 space-y-2">
        {data?.map(n => (
          <div key={n.id} className="rounded-xl border border-border bg-card/50 p-4 flex justify-between items-center">
            <div><div className="font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div></div>
            <Button size="sm" variant="destructive" onClick={() => del(n.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
