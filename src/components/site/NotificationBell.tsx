import { Bell, Check, Trash2, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Notif = { id: string; title: string; body: string | null; link: string | null; kind: string; read: boolean; created_at: string };

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25);
    setItems((data ?? []) as Notif[]);
  };

  useEffect(() => {
    if (!user) { setItems([]); return; }
    load();
    const ch = supabase
      .channel(`notif:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        if (payload.eventType === "INSERT") {
          setItems((prev) => [payload.new as Notif, ...prev].slice(0, 25));
          toast.info(payload.new.title, { description: payload.new.body ?? undefined });
        } else if (payload.eventType === "UPDATE") {
          setItems((prev) => prev.map((n) => (n.id === payload.new.id ? (payload.new as Notif) : n)));
        } else if (payload.eventType === "DELETE") {
          setItems((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  if (!user) return null;
  const unread = items.filter((n) => !n.read).length;

  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Bell className={`h-5 w-5 ${unread > 0 ? "animate-float" : ""}`} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-blood animate-pulse-blood">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[92vw] max-w-[380px] p-0 bg-background/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-blood animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 font-display font-bold"><Inbox className="h-4 w-4 text-primary" />Inbox {unread > 0 && <span className="text-xs text-primary">({unread})</span>}</div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={markAll} className="h-7 text-xs"><Check className="h-3 w-3 mr-1" />Mark all</Button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
          )}
          {items.map((n) => (
            <div key={n.id} className={`group flex items-start gap-3 p-3 border-b border-border/50 hover:bg-primary/5 transition-colors ${!n.read ? "bg-primary/[0.04]" : ""}`}>
              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-primary animate-pulse-blood" : "bg-muted"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{n.title}</div>
                {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                <div className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20 hover:text-destructive" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
