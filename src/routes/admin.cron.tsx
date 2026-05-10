import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";

const JOBS = [
  { name: "Refresh server status", schedule: "*/2 * * * *", last: "2m ago", status: "ok" },
  { name: "Daily JSONBin backup", schedule: "0 3 * * *", last: "9h ago", status: "ok" },
  { name: "Purge expired bans", schedule: "0 * * * *", last: "12m ago", status: "ok" },
  { name: "Email digest", schedule: "0 9 * * 1", last: "5d ago", status: "warn" },
];

export const Route = createFileRoute("/admin/cron")({ component: () => (
  <div>
    <h1 className="font-display text-3xl font-black flex items-center gap-2"><Clock className="h-7 w-7 text-primary" /> Scheduled Jobs</h1>
    <div className="mt-8 rounded-2xl border border-border bg-card/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Schedule</th><th className="px-4 py-3">Last run</th><th className="px-4 py-3">Status</th></tr>
        </thead>
        <tbody>
          {JOBS.map(j => (
            <tr key={j.name} className="border-t border-border">
              <td className="px-4 py-3 font-medium">{j.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{j.schedule}</td>
              <td className="px-4 py-3 text-muted-foreground">{j.last}</td>
              <td className="px-4 py-3"><span className={`text-[10px] uppercase tracking-widest font-bold ${j.status==="ok"?"text-green-400":"text-yellow-400"}`}>{j.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)});
