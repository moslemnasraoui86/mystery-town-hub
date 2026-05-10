import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";

export const Route = createFileRoute("/admin/roadmap")({ component: () => (
  <div>
    <h1 className="font-display text-3xl font-black flex items-center gap-2"><Map className="h-7 w-7 text-primary" /> Roadmap Editor</h1>
    <p className="text-muted-foreground text-sm mt-2">Manage the public roadmap content.</p>
    <div className="mt-8 rounded-2xl border border-border bg-card/50 p-8 text-center text-muted-foreground">
      Coming soon — connect to JSON DB collection <code className="text-primary">roadmap</code>.
    </div>
  </div>
)});
