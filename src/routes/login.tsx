import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Skull } from "lucide-react";
import { usernameToEmail } from "@/lib/username-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Mystery Town" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) nav({ to: "/dashboard" }); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return toast.error("Enter username and password");
    setLoading(true);
    // Try synthetic email first; fall back to literal (legacy email-based accounts)
    let { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    if (error && username.includes("@")) {
      ({ error } = await supabase.auth.signInWithPassword({ email: username.trim(), password }));
    }
    setLoading(false);
    if (error) return toast.error("Invalid username or password");
    toast.success("Welcome back, survivor.");
    nav({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <section className="max-w-md mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center">
          <Skull className="h-12 w-12 text-primary mx-auto animate-pulse-blood" />
          <h1 className="font-display text-4xl font-black mt-4">Welcome <span className="text-primary text-glow">Back</span></h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to enter Mystery Town.</p>
        </div>
        <form onSubmit={submit} className="mt-10 space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-deep animate-scale-in">
          <div><Label>Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} required autoFocus /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-blood shadow-blood hover:scale-[1.02] transition-transform">{loading ? "..." : "Sign In"}</Button>
          <p className="text-center text-sm text-muted-foreground">No account? <Link to="/register" className="text-primary hover:underline">Register</Link></p>
        </form>
      </section>
    </SiteLayout>
  );
}
