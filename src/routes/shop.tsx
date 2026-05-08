import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — Mystery Town" }] }),
  component: ShopPage,
});

const ITEMS = [
  { name: "Custom Skin Slot", price: 8, desc: "Unlock one custom skin." },
  { name: "Vehicle Paint Code", price: 5, desc: "Paint your vehicle any RGB hex." },
  { name: "Faction Banner", price: 12, desc: "Banner displayed in your safehouse." },
  { name: "Premium Weapon Bundle", price: 20, desc: "Cosmetic skins for 5 weapons." },
  { name: "Extra Character Slot", price: 15, desc: "Additional character." },
  { name: "Custom Discord Role", price: 6, desc: "Pick name + color." },
];

function ShopPage() {
  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3"><ShoppingBag className="h-8 w-8 text-primary" /><h1 className="font-display text-5xl font-black">Shop</h1></div>
        <p className="text-muted-foreground mt-3">Cosmetic and quality-of-life items. <Link to="/donate" className="text-primary">Pay via donation</Link>; staff activate within 24h.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ITEMS.map(i => (
            <div key={i.name} className="rounded-2xl border border-border bg-card/50 p-5">
              <h3 className="font-display text-xl">{i.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{i.desc}</p>
              <div className="mt-4 font-display text-3xl text-primary">${i.price}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
