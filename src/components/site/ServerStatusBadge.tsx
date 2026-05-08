import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

export function ServerStatusBadge() {
  const { data } = useQuery({
    queryKey: ["server-status"],
    queryFn: async () => (await supabase.from("server_status").select("*").eq("id", 1).maybeSingle()).data,
    refetchInterval: 15000,
  });
  if (!data) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${data.online ? "bg-green-400 animate-pulse" : "bg-destructive"}`} />
      <Activity className="h-3 w-3 text-primary" />
      <span className="font-mono">{data.players}/{data.max_players}</span>
      <span className="text-muted-foreground hidden sm:inline">· {data.ip}</span>
    </div>
  );
}
