import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [{ title: "Community Forum — Prime RolePlay" }] }),
  component: ForumPage,
});

const EMOJIS = ["🔥", "💀", "❤️", "👻", "🩸"];

function ForumPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general" });

  const { data: posts, refetch } = useQuery({
    queryKey: ["forum"],
    queryFn: async () =>
      (await supabase
        .from("posts")
        .select("*, profiles(username)")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })).data ?? [],
  });

  const postIds = useMemo(() => (posts ?? []).map((p: any) => p.id), [posts]);

  const { data: reactions, refetch: refetchReactions } = useQuery({
    queryKey: ["forum-reactions", postIds.join(",")],
    enabled: postIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("post_reactions").select("*").in("post_id", postIds);
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("post-reactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "post_reactions" }, () => refetchReactions())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetchReactions]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in first");
    const { error } = await supabase.from("posts").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Posted");
    setForm({ title: "", body: "", category: "general" });
    setOpen(false);
    refetch();
  };

  const toggleReact = async (postId: string, emoji: string) => {
    if (!user) return toast.error("Sign in to react");
    const mine = (reactions ?? []).find((r: any) => r.post_id === postId && r.user_id === user.id && r.emoji === emoji);
    if (mine) {
      await supabase.from("post_reactions").delete().eq("id", mine.id);
    } else {
      await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, emoji });
    }
  };

  const countsFor = (postId: string) => {
    const out: Record<string, { count: number; mine: boolean }> = {};
    (reactions ?? []).forEach((r: any) => {
      if (r.post_id !== postId) return;
      out[r.emoji] = out[r.emoji] || { count: 0, mine: false };
      out[r.emoji].count++;
      if (user && r.user_id === user.id) out[r.emoji].mine = true;
    });
    return out;
  };

  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-5xl font-black"><MessageCircle className="inline h-10 w-10 text-primary" /> Forum</h1>
          {user && <Button className="bg-gradient-blood" onClick={() => setOpen(!open)}>{open ? "Cancel" : "New Post"}</Button>}
        </div>
        {open && user && (
          <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3 animate-scale-in">
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
          {posts?.map((p: any) => {
            const counts = countsFor(p.id);
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card/50 p-5 hover:border-primary/60 transition animate-fade-in">
                <div className="flex items-start gap-3">
                  {p.pinned && <Pin className="h-4 w-4 text-primary mt-1" />}
                  <div className="flex-1">
                    <h3 className="font-display text-lg">{p.title}</h3>
                    <div className="text-xs text-muted-foreground">@{p.profiles?.username ?? "anon"} · {p.category} · {new Date(p.created_at).toLocaleString()}</div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.body}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {EMOJIS.map((e) => {
                        const c = counts[e];
                        const active = c?.mine;
                        return (
                          <button
                            key={e}
                            onClick={() => toggleReact(p.id, e)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all hover:scale-110 ${
                              active ? "bg-primary/20 border-primary/60 text-primary" : "bg-card border-border hover:border-primary/40"
                            }`}
                          >
                            <span>{e}</span>
                            {c?.count ? <span className="font-bold">{c.count}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {posts?.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
