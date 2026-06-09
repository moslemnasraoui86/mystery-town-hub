import { createFileRoute } from "@tanstack/react-router";
import { PageShell, FeatureGrid } from "@/components/site/PageShell";
import { Camera, Video, Mic, Image, Film, Newspaper } from "lucide-react";

export const Route = createFileRoute("/media")({
  head: () => ({ meta: [{ title: "Media Hub — Prime RolePlay" }, { name: "description", content: "Trailers, screenshots, podcasts and press from Prime RolePlay." }]}),
  component: () => (
    <PageShell icon={Camera} title="Media" highlight="Hub" description="Everything visual, audible, and quotable about Prime RolePlay.">
      <FeatureGrid items={[
        { icon: Video, title: "Trailers", desc: "Cinematic teasers and gameplay reveals." },
        { icon: Image, title: "Screenshot vault", desc: "Hi-res shots from every region of the map." },
        { icon: Mic, title: "Podcast", desc: "Weekly chat with staff, factions and survivors." },
        { icon: Film, title: "Player clips", desc: "Submitted by the community, curated by staff." },
        { icon: Newspaper, title: "Press kit", desc: "Logos, fonts, factsheet — everything press needs." },
        { icon: Camera, title: "Behind the scenes", desc: "How a hardcore RP server actually gets built." },
      ]} />
    </PageShell>
  ),
});
