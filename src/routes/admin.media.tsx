import { createFileRoute } from "@tanstack/react-router";
import { Image } from "lucide-react";

export const Route = createFileRoute("/admin/media")({ component: () => (
  <div>
    <h1 className="font-display text-3xl font-black flex items-center gap-2"><Image className="h-7 w-7 text-primary" /> Media Library</h1>
    <p className="text-muted-foreground text-sm mt-2">Upload and curate screenshots, banners, and clips.</p>
    <div className="mt-8 grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">Slot #{i+1}</div>
      ))}
    </div>
  </div>
)});
