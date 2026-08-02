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
import { Pin, MessageCircle, MessageSquare, Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      { title: "Community Forum — Prime RolePlay" },
      { name: "description", content: "Discuss roleplay scenes, suggestions and server news with the Prime RolePlay community." },
      { property: "og:title", content: "Community Forum — Prime RolePlay" },
      { property: "og:description", content: "Discuss roleplay scenes, suggestions and server news with the Prime RolePlay community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForumPage,
});

const EMOJIS = ["🔥", "💀", "❤️", "👻", "🩸"];

function ForumPage() {
  const { user, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general" });
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const { data: posts, refetch } = useQuery({
    queryKey: ["forum"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username)")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
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

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["forum-comments", postIds.join(",")],
    enabled: postIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("post_comments")
        .select("*, profiles(username)")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel("forum-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "post_reactions" }, () => refetchReactions())
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => refetchComments())
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => refetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetchReactions, refetchComments, refetch]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in first");
    if (form.title.trim().length < 3) return toast.error("Title is too short");
    if (form.body.trim().length < 5) return toast.error("Write a bit more in the body");
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      title: form.title.trim(),
      body: form.body.trim(),
      category: form.category,
      user_id: user.id,
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    toast.success("Posted");
    setForm({ title: "", body: "", category: "general" });
    setOpen(false);
    refetch();
  };

  const addComment = async (postId: string) => {
    if (!user) return toast.error("Sign in to comment");
    const body = (draft[postId] ?? "").trim();
    if (body.length < 2) return toast.error("Comment is too short");
    const { error } = await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, body });
    if (error) return toast.error(error.message);
    setDraft((d) => ({ ...d, [postId]: "" }));
    refetchComments();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refetchComments();
  };

  const toggleReact = async (postId: string, emoji: string) => {
    if (!user) return toast.error("Sign in to react");
    const mine = (reactions ?? []).find((r: any) => r.post_id === postId && r.user_id === user.id && r.emoji === emoji);
    if (mine) {
      await supabase.from("post_reactions").delete().eq("id", mine.id);
    } else {
      await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, emoji });
    }
    refetchReactions();
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

  const commentsFor = (postId: string) => (comments ?? []).filter((c: any) => c.post_id === postId);

  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-display text-4xl sm:text-5xl font-black">
            <MessageCircle className="inline h-9 w-9 sm:h-10 sm:w-10 text-primary" /> Forum
          </h1>
          {user && (
            <Button className="bg-gradient-blood" onClick={() => setOpen(!open)}>
              {open ? "Cancel" : "New Post"}
            </Button>
          )}
        </div>

        {open && user && (
          <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 space-y-3 animate-scale-in">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="rp">Roleplay</option>
                <option value="suggestions">Suggestions</option>
                <option value="offtopic">Off-topic</option>
              </select>
            </div>
            <div>
              <Label>Body</Label>
              <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
            </div>
            <Button className="bg-gradient-blood" disabled={posting}>{posting ? "Publishing…" : "Publish"}</Button>
          </form>
        )}

        <div className="mt-10 space-y-3">
          {posts?.map((p: any) => {
            const counts = countsFor(p.id);
            const list = commentsFor(p.id);
            const showComments = openComments === p.id;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card/50 p-5 hover:border-primary/60 transition animate-fade-in">
                <div className="flex items-start gap-3">
                  {p.pinned && <Pin className="h-4 w-4 text-primary mt-1" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg">{p.title}</h3>
                    <div className="text-xs text-muted-foreground">
                      @{p.profiles?.username ?? "anon"} · {p.category} · {new Date(p.created_at).toLocaleString()}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{p.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
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
                      <button
                        onClick={() => setOpenComments(showComments ? null : p.id)}
                        className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-border bg-card hover:border-primary/50 hover:text-primary transition-all"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {list.length} {list.length === 1 ? "comment" : "comments"}
                      </button>
                    </div>

                    {showComments && (
                      <div className="mt-4 space-y-2 border-t border-border pt-4 animate-fade-in">
                        {list.length === 0 && <p className="text-xs text-muted-foreground">No comments yet — be the first.</p>}
                        {list.map((c: any) => (
                          <div key={c.id} className="rounded-lg border border-border/70 bg-background/40 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-primary">@{c.profiles?.username ?? "anon"}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(c.created_at).toLocaleString()}
                                {(user?.id === c.user_id || isStaff) && (
                                  <button
                                    onClick={() => deleteComment(c.id)}
                                    className="ml-2 inline-flex align-middle text-destructive hover:opacity-80"
                                    aria-label="Delete comment"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{c.body}</p>
                          </div>
                        ))}

                        {user ? (
                          <div className="flex items-start gap-2 pt-1">
                            <Textarea
                              rows={2}
                              placeholder="Write a comment…"
                              value={draft[p.id] ?? ""}
                              onChange={(e) => setDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                            />
                            <Button size="icon" className="bg-gradient-blood shrink-0" onClick={() => addComment(p.id)} aria-label="Send comment">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Sign in to leave a comment.</p>
                        )}
                      </div>
                    )}
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
