import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const PERMS = [
  { role: "user", caps: ["Read public", "Submit forms", "Own tickets"] },
  { role: "admin", caps: ["All user caps", "Approve whitelist", "Manage news/events", "Ban users"] },
  { role: "ceo", caps: ["All admin caps", "Grant/revoke roles", "Delete users", "JSON DB access"] },
];

export const Route = createFileRoute("/admin/permissions")({ component: () => (
  <div>
    <h1 className="font-display text-3xl font-black flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> Permissions Matrix</h1>
    <p className="text-muted-foreground text-sm mt-2">Reference of what each role can do.</p>
    <div className="mt-8 grid md:grid-cols-3 gap-4">
      {PERMS.map(p => (
        <div key={p.role} className="rounded-2xl border border-border bg-card/50 p-5">
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{p.role}</span>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {p.caps.map(c => <li key={c} className="flex gap-2"><span className="text-primary">✓</span>{c}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </div>
)});
