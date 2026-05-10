import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Skull, Zap, Crown } from "lucide-react";
import { useJsonBinAppend } from "@/lib/jsonbin-client";

const TIERS = [
  { name: "Survivor", price: 5, icon: Skull, perks: ["Custom name color", "Discord supporter role", "VIP queue"] },
  { name: "Warden", price: 15, icon: Zap, perks: ["All Survivor perks", "Custom skin slot", "+1 character slot", "Vehicle paint codes"] },
  { name: "Sovereign", price: 50, icon: Crown, perks: ["All Warden perks", "Private safehouse", "Faction emblem", "Direct line to staff"], featured: true },
];

export const Route = createFileRoute("/donate")({
  head: () => ({ meta: [{ title: "Donate — Mystery Town" }] }),
  component: DonatePage,
});

function DonatePage() {
  const { user } = useAuth();
  const mirror = useJsonBinAppend();
  const [selected, setSelected] = useState<typeof TIERS[number] | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const donate = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!selected) return;
    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      user_id: user.id, tier: selected.name, amount: selected.price, message: message || null, status: "pending",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    await mirror("donations", { user_id: user.id, tier: selected.name, amount: selected.price, message: message || null });
    toast.success("Donation recorded! Staff will activate perks within 24h.");
    setSelected(null); setMessage("");
  };

  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black text-center">Support <span className="text-primary text-glow">Mystery Town</span></h1>
        <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto">100% of donations go to server hosting and development. Pick a tier:</p>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {TIERS.map((t) => {
            const Icon = t.icon;
            const isSel = selected?.name === t.name;
            return (
              <button key={t.name} onClick={() => setSelected(t)}
                className={`text-left rounded-2xl border-2 p-6 transition ${
                  isSel ? "border-primary shadow-blood bg-card" :
                  t.featured ? "border-primary/40 bg-card/70 hover:border-primary" : "border-border bg-card/50 hover:border-primary/60"
                }`}>
                {t.featured && <div className="text-xs uppercase tracking-widest text-primary mb-2 font-bold">Most popular</div>}
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="mt-3 font-display text-2xl">{t.name}</h3>
                <div className="mt-2 font-display text-4xl font-black">${t.price}<span className="text-base text-muted-foreground">/mo</span></div>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {t.perks.map(p => <li key={p} className="flex gap-2"><span className="text-primary">✦</span>{p}</li>)}
                </ul>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-10 max-w-xl mx-auto rounded-2xl border border-primary/40 bg-card/80 p-6">
            <h3 className="font-display text-xl">Donate as {selected.name} — ${selected.price}</h3>
            <Textarea className="mt-4" placeholder="Optional message to staff..." rows={3} value={message} onChange={e => setMessage(e.target.value)} maxLength={500} />
            <Button onClick={donate} disabled={loading} className="mt-4 w-full bg-gradient-blood shadow-blood">
              {loading ? "Processing..." : `Confirm $${selected.price} donation`}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">Payment integration coming soon. For now, this records your intent and staff will reach out.</p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
