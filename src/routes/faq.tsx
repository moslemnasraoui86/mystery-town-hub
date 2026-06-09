import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "How do I join the server?", a: "Create an account on this site, fill out the whitelist application, wait for review (usually 24–48h), then connect via SA-MP." },
  { q: "Is it free?", a: "Yes. The server is fully free. Donations help us cover hosting and development." },
  { q: "What version of SA-MP?", a: "Prime RolePlay runs on heavily modified SA-MP 0.3.7 R5." },
  { q: "Can I change my character later?", a: "Major character changes (name, backstory) require staff approval via ticket." },
  { q: "Are mods allowed?", a: "Visual mods only. Anything providing gameplay advantage is bannable." },
  { q: "How active is the staff?", a: "We have admins online 24/7 across all timezones." },
  { q: "What happens when I die?", a: "Permadeath only applies after 3 staff-witnessed lethal events. Otherwise: respawn at hospital with consequences." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Prime RolePlay" },
      { name: "description", content: "Answers to common questions about joining Prime RolePlay: whitelist process, SA-MP version, character changes, mods policy, staff coverage and permadeath rules." },
      { property: "og:title", content: "FAQ — Prime RolePlay" },
      { property: "og:description", content: "Everything you need to know before joining Prime RolePlay — whitelist, rules, character, mods and staff coverage." },
      { property: "og:url", content: "https://prime-roleplay.lovable.app/faq" },
    ],
    links: [{ rel: "canonical", href: "https://prime-roleplay.lovable.app/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: () => (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-5xl font-black text-center">Frequently <span className="text-primary text-glow">Asked</span></h1>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="rounded-lg border border-border bg-card/50 px-5">
              <AccordionTrigger className="font-display text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  ),
});
