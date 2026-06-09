import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — Prime RolePlay" },
      { name: "description", content: "Latest Prime RolePlay server news, patch announcements, in-game events and dispatches from the wasteland — updated as the world evolves." },
      { property: "og:title", content: "News — Prime RolePlay" },
      { property: "og:description", content: "Patches, events and dispatches from Prime RolePlay's hardcore RP wasteland." },
      { property: "og:url", content: "https://prime-roleplay.lovable.app/news" },
    ],
    links: [{ rel: "canonical", href: "https://prime-roleplay.lovable.app/news" }],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => (await supabase.from("news").select("*").eq("published", true).order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3"><Newspaper className="h-8 w-8 text-primary" /><h1 className="font-display text-5xl font-black">Latest <span className="text-primary text-glow">News</span></h1></div>
        <p className="text-muted-foreground mt-3 max-w-2xl">Patches, events and dispatches from the wasteland.</p>
        <div className="mt-12 grid gap-5">
          {isLoading && <p className="text-muted-foreground">Loading...</p>}
          {data?.map(n => (
            <Link key={n.id} to="/news/$id" params={{ id: n.id }} className="rounded-2xl border border-border bg-card/50 p-6 hover:border-primary transition group">
              <div className="text-xs uppercase tracking-widest text-primary">{new Date(n.created_at).toLocaleDateString()}</div>
              <h2 className="mt-2 font-display text-2xl group-hover:text-primary transition">{n.title}</h2>
              <p className="mt-2 text-muted-foreground">{n.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
