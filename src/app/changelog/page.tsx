import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const entries = [
  {
    version: "1.2.0",
    date: "2026-10-17",
    changes: [
      "New mode: Auto Leave Groups",
      "Runs on facebook.com/groups/joins",
      "Dedicated settings: max/minute, base delay, jitter, scroll distance",
      "Stop function: window.facebookAutoLeaveStop()",
      "Dry-run support for leave groups",
      "Mode switcher on the Configure page",
      "Landing page and guide updated",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-17",
    changes: [
      "Improved mobile support",
      "Separate touch-based unfollow flow for mobile devices",
      "Better mobile detection (m.facebook.com + touch + user-agent)",
      "Mobile-specific selectors for the following list",
      "simulateTap helper (pointer + touch + mouse events)",
      "Clearer mobile tips in the bookmarklet page and console",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-17",
    changes: [
      "Initial public release of FB Unfollow Studio",
      "Configurator with all timing, behavior and limit settings",
      "Bookmarklet, Userscript and raw JS generators",
      "LocalStorage persistence via Zustand",
      "Desktop + best-effort mobile selectors",
      "Dry-run, random jitter, daily cap and cooldowns",
      "Legal disclaimer banner and full guide",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Changelog</h1>
        <p className="text-slate-400 mt-2">Version history & selector updates</p>
      </div>

      {entries.map((entry) => (
        <Card key={entry.version} className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-baseline gap-3">
              <span className="text-blue-400">v{entry.version}</span>
              <span className="text-sm font-normal text-slate-500">{entry.date}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              {entry.changes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <p className="text-sm text-slate-500">
        Facebook changes its DOM frequently. Future versions will document selector updates here.
      </p>
    </div>
  );
}
