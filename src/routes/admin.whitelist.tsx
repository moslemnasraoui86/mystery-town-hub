import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/whitelist")({ component: AdminWhitelist });

function AdminWhitelist() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-whitelist"],
    queryFn: async () => {
      const { data } = await supabase.from("whitelist_applications").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("whitelist_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    refetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Whitelist Applications</h1>
      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {data?.length === 0 && <p className="text-muted-foreground">No applications yet.</p>}
        {data?.map((a: any) => (
          <div key={a.id} className="rounded-xl border border-border bg-card/50 p-5">
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
        ))}
      </div>
    </div>
  );
}
