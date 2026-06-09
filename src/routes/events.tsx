import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Prime RolePlay" }] }),
  component: EventsPage,
});

function EventsPage() {
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => (await supabase.from("events").select("*").order("starts_at", { ascending: true })).data ?? [],
  });
  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Upcoming <span className="text-primary text-glow">Events</span></h1>
        <p className="text-muted-foreground mt-3">Mark your calendar. Survival is optional.</p>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {data?.map(e => (
            <div key={e.id} className="rounded-2xl border border-border bg-card/50 p-6 hover:border-primary transition">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary"><Calendar className="h-3 w-3" /> {new Date(e.starts_at).toLocaleString()}</div>
              <h3 className="mt-3 font-display text-2xl">{e.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
              {e.location && <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {e.location}</div>}
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
