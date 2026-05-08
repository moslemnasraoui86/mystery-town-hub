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
import { User } from "lucide-react";

export const Route = createFileRoute("/characters")({
  head: () => ({ meta: [{ title: "Characters — Mystery Town" }] }),
  component: CharsPage,
});

function CharsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "" });
  const { data, refetch } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => (await supabase.from("characters").select("*, profiles(username)").order("level", { ascending: false }).limit(50)).data ?? [],
  });
  const create = async () => {
    if (!user) return;
    if (!form.name.trim()) return toast.error("Name required");
    const { error } = await supabase.from("characters").insert({ user_id: user.id, name: form.name, bio: form.bio });
    if (error) return toast.error(error.message);
    toast.success("Character created");
    setForm({ name: "", bio: "" }); refetch();
  };
  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Survivor <span className="text-primary text-glow">Roster</span></h1>
        <p className="text-muted-foreground mt-3">Top survivors fighting for control of Mystery Town.</p>

        {user && (
          <div className="mt-10 rounded-2xl border border-border bg-card/50 p-5">
            <h3 className="font-display text-lg mb-3 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Create Character</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Short bio</Label><Input value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
            </div>
            <Button onClick={create} className="mt-3 bg-gradient-blood">Create</Button>
          </div>
        )}
        {!user && <p className="mt-6 text-muted-foreground"><Link to="/login" className="text-primary">Sign in</Link> to register a character.</p>}

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {data?.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-border bg-card/50 p-5">
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
          {data?.length === 0 && <p className="text-muted-foreground">No characters yet. Be the first.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
