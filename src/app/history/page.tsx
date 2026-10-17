"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";

export default function HistoryPage() {
  const { sessions, clearSessions } = useSessionStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-7 w-7 text-blue-400" /> Session history
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Last 50 runs stored in your browser only. Scripts can also export a CSV log from the progress panel.
          </p>
        </div>
        {sessions.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearSessions}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-sm text-slate-400">
            No sessions recorded yet. After you run a script, you can note results here, or use the
            <strong className="text-slate-200"> Log</strong> button on the Facebook progress panel to download a CSV.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="bg-slate-900 border-slate-800">
              <CardHeader className="py-3">
                <CardTitle className="text-base flex flex-wrap gap-2 items-center">
                  <span className="text-blue-400 capitalize">{s.mode}</span>
                  {s.dryRun && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-200">
                      dry-run
                    </span>
                  )}
                  <span className="text-xs font-normal text-slate-500 ml-auto">
                    {new Date(s.finishedAt).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-300">
                ✅ {s.success} &nbsp; · &nbsp; ❌ {s.fail}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
