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
import { User, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/characters")({
  head: () => ({ meta: [{ title: "Characters — Prime RolePlay" }] }),
  component: CharsPage,
});

const NAME_RE = /^[A-Z][a-zA-Z]{1,30}_[A-Z][a-zA-Z]{1,30}$/;

function CharsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "" });

  const { data: roster } = useQuery({
    queryKey: ["characters-approved"],
    queryFn: async () => (await supabase.from("characters").select("*, profiles(username)").eq("status", "approved").order("level", { ascending: false }).limit(50)).data ?? [],
  });

  const { data: mine, refetch: refetchMine } = useQuery({
    queryKey: ["my-character", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("characters").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const create = async () => {
    if (!user) return;
    if (!NAME_RE.test(form.name.trim())) return toast.error("Name must be Firstname_Lastname (letters only, e.g. John_Doe)");
    const { error } = await supabase.from("characters").insert({
      user_id: user.id,
      name: form.name.trim(),
      bio: form.bio,
      status: "pending",
    });
    if (error) return toast.error(error.message);
    toast.success("Character submitted! Waiting for admin approval.");
    setForm({ name: "", bio: "" });
    refetchMine();
  };

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-4 py-20 animate-fade-in">
        <h1 className="font-display text-5xl font-black">Survivor <span className="text-primary text-glow">Roster</span></h1>
        <p className="text-muted-foreground mt-3">Approved survivors fighting for control of Prime RolePlay.</p>

        {user && !mine && (
          <div className="mt-10 rounded-2xl border border-primary/30 bg-card/50 p-5 shadow-blood animate-scale-in">
            <h3 className="font-display text-lg mb-1 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Create Character</h3>
            <p className="text-xs text-muted-foreground mb-4">You can register <strong>one character</strong>. Format: <code className="text-primary">Firstname_Lastname</code> (e.g. <code>John_Doe</code>). An admin must approve it.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name</Label><Input placeholder="John_Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Short bio (optional)</Label><Input value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
            </div>
            <Button onClick={create} className="mt-4 bg-gradient-blood hover:scale-[1.02] transition-transform">Submit for review</Button>
          </div>
        )}

        {user && mine && (
          <div className="mt-10 rounded-2xl border border-border bg-card/50 p-5 animate-fade-in">
            <h3 className="font-display text-lg mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Your Character</h3>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-display text-2xl">{mine.name}</div>
                {mine.bio && <p className="text-sm text-muted-foreground mt-1">{mine.bio}</p>}
                {mine.reviewer_notes && <p className="text-xs text-muted-foreground mt-2"><strong>Notes:</strong> {mine.reviewer_notes}</p>}
              </div>
              <StatusBadge status={mine.status} />
            </div>
            {mine.status === "rejected" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={async () => {
                  await supabase.from("characters").delete().eq("id", mine.id);
                  refetchMine();
                }}
              >
                Delete & try again
              </Button>
            )}
          </div>
        )}

        {!user && <p className="mt-6 text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Sign in</Link> to register a character.</p>}

        <h2 className="font-display text-2xl mt-14 mb-4">Approved Roster</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {roster?.map((c: any, i) => (
            <div key={c.id} className="rounded-xl border border-border bg-card/50 p-5 hover:border-primary/40 hover:-translate-y-0.5 transition-all animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-xl">{c.name}</h3>
                  <div className="text-xs text-muted-foreground">@{c.profiles?.username ?? "unknown"}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-primary">Lv {c.level}</div>
                  <span className={`text-[10px] uppercase tracking-widest ${c.alive ? "text-green-400" : "text-destructive"}`}>{c.alive ? "Alive" : "Dead"}</span>
                </div>
              </div>
              {c.bio && <p className="mt-3 text-sm text-muted-foreground">{c.bio}</p>}
            </div>
          ))}
          {roster?.length === 0 && <p className="text-muted-foreground">No approved characters yet.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: any; label: string }> = {
    pending: { cls: "bg-primary/15 text-primary border-primary/30", Icon: Clock, label: "Pending review" },
    approved: { cls: "bg-green-500/15 text-green-400 border-green-500/30", Icon: CheckCircle2, label: "Approved" },
    rejected: { cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: XCircle, label: "Rejected" },
  };
  const it = map[status] ?? map.pending;
  const I = it.Icon;
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${it.cls}`}><I className="h-3.5 w-3.5" />{it.label}</span>;
}
