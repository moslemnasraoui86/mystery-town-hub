import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Skull } from "lucide-react";

const schema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscore only"),
  email: z.string().trim().email(),
  password: z.string().min(6).max(100),
});

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Mystery Town" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { username: parsed.data.username, display_name: parsed.data.username },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Welcome to Mystery Town.");
    nav({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <section className="max-w-md mx-auto px-4 py-20">
        <div className="text-center">
          <Skull className="h-12 w-12 text-primary mx-auto" />
          <h1 className="font-display text-4xl font-black mt-4">Join <span className="text-primary text-glow">Mystery Town</span></h1>
          <p className="text-muted-foreground mt-2 text-sm">Create your survivor account.</p>
        </div>
        <form onSubmit={submit} className="mt-10 space-y-4 rounded-2xl border border-border bg-card/50 p-6">
          <div><Label>Username</Label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-blood shadow-blood">{loading ? "..." : "Create Account"}</Button>
          <p className="text-center text-sm text-muted-foreground">Already have one? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
        </form>
      </section>
    </SiteLayout>
  );
}
