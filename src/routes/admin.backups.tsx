import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { exportBin } from "@/lib/jsonbin.functions";
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/backups")({ component: AdminBackups });

function AdminBackups() {
  const exp = useServerFn(exportBin);
  const run = async () => {
    try {
      const data = await exp({});
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      toast.success("Backup downloaded");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black flex items-center gap-2"><Save className="h-7 w-7 text-primary" /> Backups</h1>
      <p className="text-muted-foreground mt-2 text-sm">Snapshot the entire JSON database to a downloadable file.</p>
      <div className="mt-8 rounded-2xl border border-border bg-card/50 p-8 text-center">
        <Save className="h-12 w-12 text-primary mx-auto" />
        <h2 className="mt-4 font-display text-2xl">Manual snapshot</h2>
        <p className="text-sm text-muted-foreground mt-2">Pulls the live JSONBin and exports it as JSON.</p>
        <Button onClick={run} className="mt-6 bg-gradient-blood"><Download className="h-4 w-4 mr-2" /> Run backup now</Button>
      </div>
    </div>
  );
}
