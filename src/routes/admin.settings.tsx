import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black">Settings</h1>
      <p className="text-muted-foreground mt-2 text-sm">Server-wide configuration. (Coming soon — request the controls you need.)</p>
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {["Server IP", "Discord URL", "Max players", "Maintenance mode", "Default whitelist auto-message", "Donation goal"].map(label => (
          <div key={label} className="rounded-xl border border-border bg-card/50 p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="mt-1 font-display text-lg text-muted-foreground">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
