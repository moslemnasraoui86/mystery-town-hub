import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

function AdminMessages() {
  const { data } = useQuery({
    queryKey: ["admin-msgs"],
    queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Contact Messages</h1>
      <div className="mt-8 space-y-3">
        {data?.length === 0 && <p className="text-muted-foreground">Inbox empty.</p>}
        {data?.map((m: any) => (
          <div key={m.id} className="rounded-xl border border-border bg-card/50 p-5">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="font-display">{m.subject}</h3>
                <div className="text-xs text-muted-foreground">{m.name} · {m.email}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
