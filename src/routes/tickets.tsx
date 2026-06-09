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

export const Route = createFileRoute("/tickets")({
  head: () => ({ meta: [{ title: "Support Tickets — Prime RolePlay" }] }),
  component: TicketsPage,
});

function TicketsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", body: "", category: "general" });
  const { data, refetch } = useQuery({
    queryKey: ["tickets-mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return (await supabase.from("tickets").select("*").order("created_at", { ascending: false })).data ?? [];
    },
    enabled: !!user,
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.subject.trim() || !form.body.trim()) return toast.error("Fill all fields");
    const { error } = await supabase.from("tickets").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Ticket created"); setForm({ subject: "", body: "", category: "general" }); refetch();
  };
  if (!user) return <SiteLayout><div className="max-w-2xl mx-auto px-4 py-20 text-center"><h1 className="font-display text-4xl font-black">Support</h1><p className="mt-4 text-muted-foreground"><Link to="/login" className="text-primary">Sign in</Link> to open a ticket.</p></div></SiteLayout>;
  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Support <span className="text-primary text-glow">Tickets</span></h1>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card/50 p-6">
          <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
          <div><Label>Category</Label>
            <select className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option><option value="bug">Bug</option><option value="report">Player Report</option><option value="appeal">Ban Appeal</option>
            </select></div>
          <div><Label>Describe the issue</Label><Textarea rows={6} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
          <Button className="bg-gradient-blood">Submit Ticket</Button>
        </form>
        <h2 className="font-display text-2xl mt-12">Your Tickets</h2>
        <div className="mt-4 space-y-3">
          {data?.map(t => (
            <div key={t.id} className="rounded-xl border border-border bg-card/50 p-4 flex items-center justify-between">
              <div><div className="font-medium">{t.subject}</div><div className="text-xs text-muted-foreground">{t.category} · {new Date(t.created_at).toLocaleString()}</div></div>
              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest ${t.status === "open" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{t.status}</span>
            </div>
          ))}
          {data?.length === 0 && <p className="text-muted-foreground text-sm">No tickets yet.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
