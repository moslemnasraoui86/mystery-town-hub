import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { appendRecord } from "@/lib/jsonbin.functions";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin/broadcast")({ component: AdminBroadcast });

function AdminBroadcast() {
  const fn = useServerFn(appendRecord);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const send = async () => {
    if (!subject || !body) return toast.error("Fill both fields");
    await fn({ data: { collection: "broadcasts", record: { subject, body } } });
    toast.success("Broadcast queued");
    setSubject(""); setBody("");
  };
  return (
    <div>
      <h1 className="font-display text-3xl font-black flex items-center gap-2"><Megaphone className="h-7 w-7 text-primary" /> Broadcast</h1>
      <p className="text-muted-foreground mt-2 text-sm">Push an announcement to every whitelisted survivor.</p>
      <div className="mt-8 max-w-2xl space-y-4 rounded-2xl border border-border bg-card/50 p-6">
        <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
        <div><Label>Message</Label><Textarea rows={6} value={body} onChange={e => setBody(e.target.value)} /></div>
        <Button onClick={send} className="bg-gradient-blood">Send broadcast</Button>
      </div>
    </div>
  );
}
