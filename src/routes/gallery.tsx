import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Prime RolePlay" }] }),
  component: () => (
    <SiteLayout>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black text-center">In-Game <span className="text-primary text-glow">Gallery</span></h1>
        <p className="text-center mt-4 text-muted-foreground">Snapshots from the survivors of Prime RolePlay.</p>
        <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl border border-border overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-background" />
              <div className="absolute inset-0 flex items-center justify-center font-display text-primary/70 text-2xl">#{i + 1}</div>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  ),
});
