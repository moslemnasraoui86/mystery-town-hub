import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Mystery Town" }] }),
  component: () => (
    <SiteLayout><section className="max-w-3xl mx-auto px-4 py-20 prose prose-invert">
      <h1 className="font-display text-5xl font-black">Privacy Policy</h1>
      <p className="mt-6 text-muted-foreground">We store your email, username and submitted forms to operate the server and your account. We never sell data. Contact us via the support tickets to delete your account.</p>
      <h2 className="font-display text-2xl mt-8">Data we collect</h2>
      <ul className="text-muted-foreground"><li>Account email & username</li><li>Whitelist applications and donations</li><li>In-game character data</li></ul>
      <h2 className="font-display text-2xl mt-8">Cookies</h2>
      <p className="text-muted-foreground">We use only essential session cookies for login.</p>
    </section></SiteLayout>
  ),
});
