import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJsonBinAppend } from "@/lib/jsonbin-client";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(150),
  body: z.string().trim().min(5).max(2000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mystery Town" },
      { name: "description", content: "Get in touch with the Mystery Town team about questions, suggestions, partnerships, press or support. We read every message." },
      { property: "og:title", content: "Contact — Mystery Town" },
      { property: "og:description", content: "Reach the Mystery Town team — questions, suggestions, partnerships and press." },
      { property: "og:url", content: "https://mystery-town-nexus.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://mystery-town-nexus.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const mirror = useJsonBinAppend();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    await mirror("contact", parsed.data);
    toast.success("Message sent. We'll be in touch.");
    setForm({ name: "", email: "", subject: "", body: "" });
  };

  return (
    <SiteLayout>
      <section className="max-w-2xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black">Contact <span className="text-primary text-glow">Us</span></h1>
        <p className="text-muted-foreground mt-3">Questions, suggestions, partnerships — we read everything.</p>
        <form onSubmit={submit} className="mt-10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
          <div><Label>Message</Label><Textarea rows={6} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required /></div>
          <Button type="submit" disabled={loading} className="bg-gradient-blood shadow-blood">{loading ? "Sending..." : "Send Message"}</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
