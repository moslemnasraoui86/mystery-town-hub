import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Pin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Community Forum — Mystery Town" }] }),
  component: ForumPage,
});

function ForumPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general" });
  const { data, refetch } = useQuery({
    queryKey: ["forum"],
    queryFn: async () => (await supabase.from("posts").select("*, profiles(username)").order("pinned", { ascending: false }).order("created_at", { ascending: false })).data ?? [],
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in first");
    const { error } = await supabase.from("posts").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Posted"); setForm({ title: "", body: "", category: "general" }); setOpen(false); refetch();
  };
  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-5xl font-black"><MessageCircle className="inline h-10 w-10 text-primary" /> Forum</h1>
          {user && <Button className="bg-gradient-blood" onClick={() => setOpen(!open)}>{open ? "Cancel" : "New Post"}</Button>}
        </div>
        {open && user && (
          <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div><Label>Category</Label>
              <select className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="general">General</option><option value="rp">Roleplay</option><option value="suggestions">Suggestions</option><option value="offtopic">Off-topic</option>
              </select></div>
            <div><Label>Body</Label><Textarea rows={5} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required /></div>
            <Button className="bg-gradient-blood">Publish</Button>
          </form>
        )}
        <div className="mt-10 space-y-3">
          {data?.map((p: any) => (
            <div key={p.id} className="rounded-xl border border-border bg-card/50 p-5 hover:border-primary/60 transition">
              <div className="flex items-start gap-3">
                {p.pinned && <Pin className="h-4 w-4 text-primary mt-1" />}
                <div className="flex-1">
                  <h3 className="font-display text-lg">{p.title}</h3>
                  <div className="text-xs text-muted-foreground">@{p.profiles?.username ?? "anon"} · {p.category} · {new Date(p.created_at).toLocaleString()}</div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
          {data?.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
