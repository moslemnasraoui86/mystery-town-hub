import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/donations")({ component: AdminDonations });

function AdminDonations() {
  const { data } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => (await supabase.from("donations").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const total = (data ?? []).reduce((s: number, d: any) => s + Number(d.amount), 0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl font-black">Donations</h1>
        <div className="font-display text-2xl text-primary">${total.toFixed(2)}</div>
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Message</th></tr>
          </thead>
          <tbody>
            {data?.map((d: any) => (
              <tr key={d.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">{d.tier}</td>
                <td className="px-4 py-3 text-primary font-bold">${Number(d.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs uppercase tracking-widest">{d.status}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{d.message ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
