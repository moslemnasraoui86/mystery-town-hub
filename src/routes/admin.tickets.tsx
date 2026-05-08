import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tickets")({ component: AdminTickets });

function AdminTickets() {
  const { data, refetch } = useQuery({ queryKey: ["adm-tic"], queryFn: async () => (await supabase.from("tickets").select("*, profiles(username)").order("created_at", { ascending: false })).data ?? [] });
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    refetch();
  };
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Support Tickets</h1>
      <div className="mt-8 space-y-3">
        {data?.map((t: any) => (
          <div key={t.id} className="rounded-xl border border-border bg-card/50 p-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-display text-lg">{t.subject}</h3>
                <div className="text-xs text-muted-foreground">@{t.profiles?.username} · {t.category} · {new Date(t.created_at).toLocaleString()}</div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-widest ${t.status === "open" ? "bg-primary/20 text-primary" : "bg-muted"}`}>{t.status}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{t.body}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setStatus(t.id, "in_progress")}>In progress</Button>
              <Button size="sm" onClick={() => setStatus(t.id, "resolved")} className="bg-green-600 hover:bg-green-700">Resolve</Button>
              <Button size="sm" variant="destructive" onClick={() => setStatus(t.id, "closed")}>Close</Button>
            </div>
          </div>
        ))}
        {data?.length === 0 && <p className="text-muted-foreground">No tickets yet.</p>}
      </div>
    </div>
  );
}
