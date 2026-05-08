import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Heart, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [u, w, d, m] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("whitelist_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("donations").select("amount"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);
      const totalDon = (d.data ?? []).reduce((sum: number, r: any) => sum + Number(r.amount ?? 0), 0);
      return { users: u.count ?? 0, pending: w.count ?? 0, donations: totalDon, messages: m.count ?? 0 };
    },
  });

  const cards = [
    { l: "Total users", v: data?.users ?? "—", i: Users },
    { l: "Pending whitelist", v: data?.pending ?? "—", i: FileText },
    { l: "Donations ($)", v: data?.donations ?? "—", i: Heart },
    { l: "Messages", v: data?.messages ?? "—", i: MessageSquare },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-black">Overview</h1>
      <p className="text-muted-foreground mt-1 text-sm">Server health at a glance.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.i;
          return (
            <div key={c.l} className="rounded-xl border border-border bg-card/50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{c.l}</span>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 font-display text-3xl font-black">{c.v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
