import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const entries = [
  {
    version: "1.3.0",
    date: "2026-10-17",
    changes: [
      "New mode: Auto Unfriend",
      "Runs on facebook.com/YOU/friends",
      "Settings: delay, scroll amount, wait, daily cap, cooldowns",
      "Stop function: window.facebookUnfriendStop()",
      "Dry-run + random jitter support",
      "Three-mode switcher on Configure page",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-10-17",
    changes: [
      "New mode: Auto Leave Groups",
      "Runs on facebook.com/groups/joins",
      "Dedicated settings + stop function",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-17",
    changes: [
      "Improved mobile support for Unfollow",
      "Touch-based flow + mobile selectors",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-17",
    changes: [
      "Initial release – Unfollow mode",
      "Bookmarklet, Userscript, raw JS generators",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Changelog</h1>
        <p className="text-slate-400 mt-2">Version history</p>
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
    </div>
  );
}
