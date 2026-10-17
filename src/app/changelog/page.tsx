import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const entries = [
  {
    version: "1.5.0",
    date: "2026-10-17",
    changes: [
      "Desktop-only: scripts refuse to run on mobile / m.facebook.com",
      "Full visual step-by-step user guide for Unfollow, Leave Groups, Unfriend",
      "Mock browser illustrations + progress panel preview in the Guide",
      "Landing and Bookmarklet pages updated for desktop-only messaging",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-10-17",
    changes: ["Live progress overlay on Facebook for all modes"],
  },
  {
    version: "1.3.0",
    date: "2026-10-17",
    changes: ["Auto Unfriend mode"],
  },
  {
    version: "1.2.0",
    date: "2026-10-17",
    changes: ["Auto Leave Groups mode"],
  },
  {
    version: "1.0.0",
    date: "2026-10-17",
    changes: ["Initial release — Unfollow"],
  },
];

export default function ChangelogPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Changelog</h1>
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
