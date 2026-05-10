import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Heart, FileText, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [u, w, d, c, t] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("whitelist_applications").select("*", { count: "exact", head: true }),
        supabase.from("donations").select("amount"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
      ]);
      const total = (d.data ?? []).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
      return { users: u.count, whitelist: w.count, donations: total, contact: c.count, tickets: t.count };
    },
  });

  const cards = [
    { icon: Users, label: "Total Users", val: data?.users ?? "—" },
    { icon: FileText, label: "Whitelist Apps", val: data?.whitelist ?? "—" },
    { icon: Heart, label: "Donations Total", val: data ? `$${data.donations}` : "—" },
    { icon: MessageSquare, label: "Contact Messages", val: data?.contact ?? "—" },
    { icon: BarChart3, label: "Open Tickets", val: data?.tickets ?? "—" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-black flex items-center gap-2"><BarChart3 className="h-7 w-7 text-primary" /> Analytics</h1>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card/50 p-5">
              <Icon className="h-5 w-5 text-primary" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-3">{c.label}</div>
              <div className="font-display text-3xl font-black mt-1">{c.val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
