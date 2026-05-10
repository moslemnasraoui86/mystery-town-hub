import { createFileRoute } from "@tanstack/react-router";
import { PageShell, FeatureGrid } from "@/components/site/PageShell";
import { HeartHandshake, Globe, Server, Headphones, Cpu, Megaphone } from "lucide-react";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [{ title: "Partners — Mystery Town" }, { name: "description", content: "The studios, hosts and creators powering Mystery Town." }]}),
  component: () => (
    <PageShell icon={HeartHandshake} title="Our" highlight="Partners" description="Without these folks, Mystery Town wouldn't exist.">
      <FeatureGrid items={[
        { icon: Server, title: "VoidHost", desc: "Bare-metal hosting across three continents." },
        { icon: Headphones, title: "Vox Audio", desc: "Custom ambient & combat soundscapes." },
        { icon: Cpu, title: "PolyForge", desc: "3D assets, vehicle skins, weapon mods." },
        { icon: Globe, title: "Map Cartel", desc: "Custom map regions and POIs." },
        { icon: Megaphone, title: "Pulse Marketing", desc: "Trailer cuts and campaign creative." },
        { icon: HeartHandshake, title: "Become a partner", desc: "Pitch us via the contact page." },
      ]} />
    </PageShell>
  ),
});
