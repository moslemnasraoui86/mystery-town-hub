import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Image } from "lucide-react";

export const Route = createFileRoute("/screenshots")({
  head: () => ({ meta: [{ title: "Screenshots — Mystery Town" }, { name: "description", content: "Hi-res screenshots from across the apocalypse." }]}),
  component: () => (
    <PageShell icon={Image} title="Screenshot" highlight="Vault" description="Curated shots from players and staff. Submit yours via Discord.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-xl border border-border bg-gradient-to-br from-primary/5 to-card flex items-center justify-center text-muted-foreground text-sm">
            Shot #{i + 1}
          </div>
        ))}
      </div>
    </PageShell>
  ),
});
