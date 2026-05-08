import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  character_name: z.string().trim().min(2).max(60),
  age: z.coerce.number().int().min(16).max(120),
  backstory: z.string().trim().min(50).max(3000),
  rp_experience: z.string().trim().max(1000).optional(),
});

export const Route = createFileRoute("/whitelist")({
  head: () => ({ meta: [{ title: "Whitelist Application — Mystery Town" }] }),
  component: WhitelistPage,
});

function WhitelistPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ character_name: "", age: "", backstory: "", rp_experience: "" });
  const [loading, setLoading] = useState(false);

  const { data: existing, refetch } = useQuery({
    queryKey: ["myapps", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("whitelist_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  useEffect(() => {}, [user]);

  if (!user) {
    return (
      <SiteLayout>
        <section className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-4xl font-black">Whitelist <span className="text-primary text-glow">Application</span></h1>
          <p className="text-muted-foreground mt-4">You need an account to apply.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button asChild className="bg-gradient-blood"><Link to="/register">Create Account</Link></Button>
            <Button asChild variant="outline"><Link to="/login">Sign In</Link></Button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.from("whitelist_applications").insert({ ...parsed.data, user_id: user.id });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted!");
    setForm({ character_name: "", age: "", backstory: "", rp_experience: "" });
    refetch();
  };

  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Whitelist <span className="text-primary text-glow">Application</span></h1>
        <p className="text-muted-foreground mt-3">Tell us who your survivor is. Be specific. Be human.</p>

        {existing && existing.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="font-display text-xl">Your Applications</h2>
            {existing.map((a: any) => (
              <div key={a.id} className="rounded-lg border border-border bg-card/50 p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.character_name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${
                  a.status === "approved" ? "bg-green-500/20 text-green-400" :
                  a.status === "rejected" ? "bg-destructive/20 text-destructive" :
                  "bg-primary/20 text-primary"
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-10 space-y-4 rounded-2xl border border-border bg-card/50 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Character Name</Label><Input value={form.character_name} onChange={e => setForm({ ...form, character_name: e.target.value })} required /></div>
            <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required min={16} max={120} /></div>
          </div>
          <div><Label>Backstory (min. 50 characters)</Label><Textarea rows={8} value={form.backstory} onChange={e => setForm({ ...form, backstory: e.target.value })} required /></div>
          <div><Label>Previous RP Experience (optional)</Label><Textarea rows={3} value={form.rp_experience} onChange={e => setForm({ ...form, rp_experience: e.target.value })} /></div>
          <Button type="submit" disabled={loading} className="bg-gradient-blood shadow-blood">{loading ? "Submitting..." : "Submit Application"}</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
