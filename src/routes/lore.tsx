import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/lore")({
  head: () => ({ meta: [{ title: "Lore — Prime RolePlay" }] }),
  component: LorePage,
});

const CHAPTERS = [
  { title: "Chapter I — Before the Fall", body: "Prime RolePlay was a quiet coastal hub. Trade flowed, neon lit the bay, and corruption festered beneath the chrome. The first strain emerged in district 4 — at first, just rumors of fevered dock workers." },
  { title: "Chapter II — The Outbreak", body: "Within seventy two hours the city was sealed. Convoys collapsed. The bridge fell. Survivors retreated inland and built walls from cars and scripture." },
  { title: "Chapter III — Rise of the Factions", body: "From the silence came new powers. The Black Hand. The Iron Wardens. The Ash Cult. Each promising salvation. Each demanding tribute." },
  { title: "Chapter IV — You", body: "You arrive on the last bus before the gates close forever. Will you serve, lead, or run?" },
];

function LorePage() {
  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3"><BookOpen className="h-8 w-8 text-primary" /><h1 className="font-display text-5xl font-black">Lore</h1></div>
        <div className="mt-10 space-y-8">
          {CHAPTERS.map(c => (
            <div key={c.title} className="rounded-2xl border-l-4 border-primary bg-card/50 p-6">
              <h2 className="font-display text-2xl text-primary">{c.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
