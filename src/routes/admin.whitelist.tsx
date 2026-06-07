import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { CheckCheck, XCircle, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/whitelist")({ component: AdminWhitelist });

function AdminWhitelist() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-whitelist"],
    queryFn: async () => {
      const { data } = await supabase.from("whitelist_applications").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return (data ?? []).filter((a: any) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (query && !a.character_name?.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, filter, query]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((a: any) => a.id)));
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("whitelist_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    refetch();
  };

  const bulk = async (status: "approved" | "rejected") => {
    if (selected.size === 0) return toast.error("Select applications first");
    const ids = Array.from(selected);
    const { error } = await supabase.from("whitelist_applications").update({ status, updated_at: new Date().toISOString() }).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} application(s) ${status}`);
    setSelected(new Set());
    refetch();
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return toast.error("Select applications first");
    if (!confirm(`Delete ${selected.size} application(s)?`)) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from("whitelist_applications").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`Deleted ${ids.length}`);
    setSelected(new Set());
    refetch();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-black">Whitelist Applications</h1>

      <div className="mt-6 flex flex-wrap items-center gap-2 sticky top-16 bg-background/80 backdrop-blur p-2 rounded-xl border border-border z-10">
        <input
          placeholder="Search by character…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-input border border-border rounded-md px-3 py-1.5 text-sm flex-1 min-w-[180px]"
        />
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition ${
              filter === f ? "bg-primary text-primary-foreground shadow-blood" : "bg-secondary hover:bg-primary/20"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="w-full flex flex-wrap gap-2 items-center pt-2 border-t border-border/40 mt-1">
          <Checkbox checked={selected.size > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          <Button size="sm" disabled={selected.size === 0} onClick={() => bulk("approved")} className="bg-green-600 hover:bg-green-700">
            <CheckCheck className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button size="sm" disabled={selected.size === 0} onClick={() => bulk("rejected")} variant="destructive">
            <XCircle className="h-4 w-4 mr-1" /> Reject
          </Button>
          <Button size="sm" disabled={selected.size === 0} onClick={bulkDelete} variant="outline">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {!isLoading && filtered.length === 0 && <p className="text-muted-foreground">No applications match.</p>}
        {filtered.map((a: any) => (
          <div key={a.id} className={`rounded-xl border bg-card/50 p-5 transition-all hover:border-primary/40 animate-fade-in ${selected.has(a.id) ? "border-primary shadow-blood" : "border-border"}`}>
            <div className="flex items-start gap-3">
              <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg">{a.character_name} <span className="text-muted-foreground text-sm">· age {a.age}</span></h3>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-widest ${
                    a.status === "approved" ? "bg-green-500/20 text-green-400" :
                    a.status === "rejected" ? "bg-destructive/20 text-destructive" :
                    "bg-primary/20 text-primary"
                  }`}>{a.status}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{a.backstory}</p>
                {a.rp_experience && <p className="mt-2 text-xs text-muted-foreground italic">Experience: {a.rp_experience}</p>}
                {a.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(a.id, "approved")} className="bg-green-600 hover:bg-green-700">Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, "rejected")}>Reject</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
