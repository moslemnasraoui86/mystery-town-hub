import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Swords } from "lucide-react";

export const Route = createFileRoute("/factions")({
  head: () => ({ meta: [{ title: "Factions — Mystery Town" }] }),
  component: FactionsPage,
});

function FactionsPage() {
  const { data } = useQuery({
    queryKey: ["factions"],
    queryFn: async () => (await supabase.from("factions").select("*").order("name")).data ?? [],
  });
  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3"><Swords className="h-8 w-8 text-primary" /><h1 className="font-display text-5xl font-black">Factions</h1></div>
        <p className="text-muted-foreground mt-3">Choose your side. Or die alone.</p>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.map(f => (
            <div key={f.id} className="rounded-2xl border-2 border-border bg-card/50 p-6 hover:border-primary transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono" style={{ color: f.color }}>[{f.tag}]</div>
                  <h3 className="font-display text-2xl mt-1">{f.name}</h3>
                </div>
                {f.recruiting && <span className="text-[10px] uppercase tracking-widest bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Recruiting</span>}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
