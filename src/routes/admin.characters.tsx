import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";

export const Route = createFileRoute("/admin/characters")({
  head: () => ({ meta: [{ title: "Character Approvals — Admin" }] }),
  component: AdminCharactersPage,
});

function AdminCharactersPage() {
  const { user, isStaff } = useAuth();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-characters", filter],
    queryFn: async () => {
      let q = supabase.from("characters").select("*, profiles(username)").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data } = await q;
      return data ?? [];
    },
  });

  if (!isStaff) return <div className="p-8 text-muted-foreground">Staff only.</div>;

  const review = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("characters").update({
      status,
      reviewer_notes: notes[id] ?? null,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Character ${status}`);
    refetch();
  };

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">Character <span className="text-primary text-glow">Approvals</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Review character names submitted by players.</p>
        </div>
        <div className="flex gap-2">
          {(["pending","approved","rejected","all"] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className={filter === f ? "bg-gradient-blood" : ""}>
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data?.length === 0 && <p className="text-muted-foreground">No characters in this filter.</p>}
        {data?.map((c: any) => (
          <div key={c.id} className="rounded-xl border border-border bg-card/50 p-4 animate-fade-in">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-display text-lg">{c.name}</span>
                  <StatusPill status={c.status} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  by @{c.profiles?.username ?? "unknown"} · {new Date(c.created_at).toLocaleString()}
                </div>
                {c.bio && <p className="text-sm mt-2">{c.bio}</p>}
                {c.reviewer_notes && <p className="text-xs mt-2 text-muted-foreground"><strong>Notes:</strong> {c.reviewer_notes}</p>}
              </div>
            </div>
            {c.status === "pending" && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Optional reviewer notes (visible to player)"
                  value={notes[c.id] ?? ""}
                  onChange={e => setNotes({ ...notes, [c.id]: e.target.value })}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => review(c.id, "approved")}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => review(c.id, "rejected")}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: any }> = {
    pending: { cls: "bg-primary/15 text-primary", Icon: Clock },
    approved: { cls: "bg-green-500/15 text-green-400", Icon: CheckCircle2 },
    rejected: { cls: "bg-destructive/15 text-destructive", Icon: XCircle },
  };
  const it = map[status] ?? map.pending;
  const I = it.Icon;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${it.cls}`}><I className="h-3 w-3" />{status}</span>;
}
