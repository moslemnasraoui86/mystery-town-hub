import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Lock, Trash2, ShieldAlert, KeyRound } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account Management — Prime RolePlay" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, profile, loading, refresh, signOut } = useAuth();
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatar(profile.avatar_url ?? "");
    }
    if (user?.email) setEmail(user.email);
    if (user) supabase.from("profiles").select("bio").eq("id", user.id).maybeSingle().then(({ data }) => setBio(data?.bio ?? ""));
  }, [profile, user]);

  if (loading || !user) return null;

  const saveProfile = async () => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName || null, avatar_url: avatar || null, bio: bio || null,
    }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    refresh();
  };

  const changeEmail = async () => {
    if (!email || email === user.email) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Confirmation sent to new email");
  };

  const changePw = async () => {
    if (pw.length < 8) return toast.error("Min 8 characters");
    if (pw !== pw2) return toast.error("Passwords don't match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setPw(""); setPw2("");
  };

  const requestDeletion = async () => {
    if (!confirm("Submit account deletion request? Staff will process within 7 days.")) return;
    setBusy(true);
    await supabase.from("contact_messages").insert({
      name: profile?.display_name ?? "User", email: user.email ?? "",
      subject: "ACCOUNT DELETION REQUEST",
      body: `User ID: ${user.id}\nEmail: ${user.email}\nRequested at: ${new Date().toISOString()}`,
    });
    setBusy(false);
    toast.success("Deletion request submitted");
  };

  return (
    <SiteLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <header>
          <h1 className="font-display text-5xl font-black">Account <span className="text-primary text-glow">Management</span></h1>
          <p className="text-muted-foreground mt-2">Manage your profile, security and preferences.</p>
        </header>

        <Card icon={User} title="Profile">
          <Field label="Display Name"><Input value={displayName} onChange={e => setDisplayName(e.target.value)} /></Field>
          <Field label="Avatar URL"><Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." /></Field>
          <Field label="Bio"><Textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} /></Field>
          <Button onClick={saveProfile} disabled={busy} className="bg-gradient-blood shadow-blood">Save Profile</Button>
        </Card>

        <Card icon={Mail} title="Email">
          <Field label="Email Address"><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>
          <Button onClick={changeEmail} disabled={busy} variant="outline">Update Email</Button>
        </Card>

        <Card icon={KeyRound} title="Password">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="New Password"><Input type="password" value={pw} onChange={e => setPw(e.target.value)} /></Field>
            <Field label="Confirm Password"><Input type="password" value={pw2} onChange={e => setPw2(e.target.value)} /></Field>
          </div>
          <Button onClick={changePw} disabled={busy} variant="outline"><Lock className="h-4 w-4 mr-2" />Change Password</Button>
        </Card>

        <Card icon={ShieldAlert} title="Sessions & Sign Out">
          <p className="text-sm text-muted-foreground">Sign out from this device. Other sessions will remain active.</p>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </Card>

        <Card icon={Trash2} title="Danger Zone" danger>
          <p className="text-sm text-muted-foreground">Account deletion is permanent. All your characters, applications and posts will be archived for 30 days then erased.</p>
          <Button onClick={requestDeletion} variant="destructive" disabled={busy}>
            <Trash2 className="h-4 w-4 mr-2" /> Request Account Deletion
          </Button>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Need help? <Link to="/contact" className="text-primary underline">Contact support</Link>
        </p>
      </section>
    </SiteLayout>
  );
}

function Card({ icon: Icon, title, children, danger }: any) {
  return (
    <div className={`rounded-2xl border p-6 space-y-4 backdrop-blur-sm ${danger ? "border-destructive/40 bg-destructive/5" : "border-border bg-card/50"}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }: any) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
