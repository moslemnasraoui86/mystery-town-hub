import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listAllCollections, listRecords, deleteRecord, exportBin } from "@/lib/jsonbin.functions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Database, Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/jsonbin")({ component: AdminJsonBin });

function AdminJsonBin() {
  const summary = useServerFn(listAllCollections);
  const records = useServerFn(listRecords);
  const del = useServerFn(deleteRecord);
  const exp = useServerFn(exportBin);
  const [active, setActive] = useState<string | null>(null);

  const sumQ = useQuery({ queryKey: ["jb-sum"], queryFn: () => summary({}) });
  const recQ = useQuery({
    queryKey: ["jb-rec", active],
    queryFn: () => records({ data: { collection: active! } }),
    enabled: !!active,
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { collection: active!, id } }),
    onSuccess: () => { toast.success("Deleted"); recQ.refetch(); sumQ.refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const downloadAll = async () => {
    const data = await exp({});
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mystery-town-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-black flex items-center gap-2"><Database className="h-7 w-7 text-primary" /> JSON Database</h1>
          <p className="text-muted-foreground mt-1 text-sm">Live mirror of every form submission. Stored in JSONBin via secure backend proxy.</p>
        </div>
        <Button onClick={downloadAll} className="bg-gradient-blood"><Download className="h-4 w-4 mr-2" /> Export full bin</Button>
      </div>

      <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="rounded-2xl border border-border bg-card/50 p-3 h-fit">
          {sumQ.isLoading && <p className="p-3 text-muted-foreground text-sm">Loading...</p>}
          {sumQ.data?.summary.length === 0 && <p className="p-3 text-muted-foreground text-sm">No data yet. Submit a form to populate.</p>}
          {sumQ.data?.summary.map((c) => (
            <button key={c.name} onClick={() => setActive(c.name)}
              className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center transition ${active === c.name ? "bg-gradient-blood text-primary-foreground" : "hover:bg-muted"}`}>
              <span className="capitalize">{c.name}</span>
              <span className="text-xs opacity-70">{c.count}</span>
            </button>
          ))}
        </aside>

        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          {!active && <div className="p-10 text-center text-muted-foreground">Select a collection</div>}
          {active && recQ.isLoading && <div className="p-10 text-center text-muted-foreground">Loading...</div>}
          {active && recQ.data && recQ.data.records.length === 0 && <div className="p-10 text-center text-muted-foreground">Empty.</div>}
          {active && recQ.data && recQ.data.records.length > 0 && (
            <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
              {recQ.data.records.map((r: any) => (
                <div key={r.id} className="p-4 flex gap-4 items-start">
                  <pre className="flex-1 text-xs overflow-x-auto bg-muted/30 p-3 rounded">{JSON.stringify(r, null, 2)}</pre>
                  <Button size="icon" variant="destructive" onClick={() => confirm("Delete?") && delMut.mutate(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
