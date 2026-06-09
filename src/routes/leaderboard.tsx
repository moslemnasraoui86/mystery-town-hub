import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Prime RolePlay" }] }),
  component: LB,
});

function LB() {
  const { data } = useQuery({
    queryKey: ["lb"],
    queryFn: async () => (await supabase.from("characters").select("*, profiles(username)").order("level", { ascending: false }).limit(100)).data ?? [],
  });
  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3"><Trophy className="h-8 w-8 text-primary" /><h1 className="font-display text-5xl font-black">Leaderboard</h1></div>
        <div className="mt-10 rounded-2xl border border-border bg-card/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="px-4 py-3 w-12">#</th><th className="px-4 py-3">Character</th><th className="px-4 py-3">Player</th><th className="px-4 py-3 text-right">Level</th></tr>
            </thead>
            <tbody>
              {data?.map((c: any, i) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-display text-lg text-primary">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">@{c.profiles?.username ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-display text-lg">{c.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteLayout>
  );
}
