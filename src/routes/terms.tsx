import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Mystery Town" }] }),
  component: () => (
    <SiteLayout><section className="max-w-3xl mx-auto px-4 py-20 prose prose-invert">
      <h1 className="font-display text-5xl font-black">Terms of Service</h1>
      <p className="mt-6 text-muted-foreground">By creating an account or playing on Mystery Town you agree to follow our <a href="/rules" className="text-primary">rules</a> and code of conduct. Violations may result in suspension or permanent ban without refund.</p>
      <h2 className="font-display text-2xl mt-8">Donations</h2>
      <p className="text-muted-foreground">Donations are non-refundable and grant cosmetic perks only. We reserve the right to revoke perks if cheating is detected.</p>
    </section></SiteLayout>
  ),
});
