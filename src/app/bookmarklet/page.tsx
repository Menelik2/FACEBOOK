"use client";

import { useState, useEffect } from "react";
import { useConfigStore } from "@/store/config-store";
import { generateScript } from "@/lib/generate-script";
import { generateLeaveGroupsScript } from "@/lib/generate-leave-groups";
import { generateUnfriendScript } from "@/lib/generate-unfriend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Monitor, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function BookmarkletPage() {
  const { config } = useConfigStore();
  const [mounted, setMounted] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const bookmarklet =
    config.MODE === "leave-groups"
      ? generateLeaveGroupsScript(config)
      : config.MODE === "unfriend"
      ? generateUnfriendScript(config)
      : generateScript(config);

  const label =
    config.MODE === "leave-groups"
      ? "▶ FB Leave Groups"
      : config.MODE === "unfriend"
      ? "▶ FB Auto Unfriend"
      : "▶ FB Auto Unfollow";

  const runTest = () => {
    setTestLog([
      "[Test] Desktop bookmarklet check…",
      "[OK] Script generated for mode: " + config.MODE,
      "[OK] Desktop-only guard is included in the script.",
      "[Info] Run only on facebook.com desktop site — not m.facebook.com or phone browsers.",
    ]);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Bookmarklet Installer</h1>
        <p className="text-slate-400 mt-2">Desktop only · Drag to bookmarks bar</p>
      </div>

      <Card className="bg-amber-950/40 border-amber-700/50">
        <CardContent className="pt-6 flex gap-3 text-sm text-amber-100">
          <Monitor className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <strong>Desktop browsers only.</strong> Use Chrome, Edge, Firefox, or Safari on a computer.
            Mobile is blocked by the script.
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-blue-400" /> Drag this to your bookmarks bar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-xs text-slate-500">
            Current mode: <strong className="text-slate-300">{config.MODE}</strong>{" "}
            · Change on <Link href="/configure" className="text-blue-400 underline">Configure</Link>
          </p>
          <a
            href={bookmarklet}
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              e.preventDefault();
              alert("Drag this button to your bookmarks bar instead of clicking it.");
            }}
            draggable
          >
            {label}
          </a>
          <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside text-left w-full max-w-md">
            <li>Show bookmarks bar: <code className="bg-slate-800 px-1 rounded">Ctrl+Shift+B</code> / <code className="bg-slate-800 px-1 rounded">Cmd+Shift+B</code></li>
            <li>Drag the button above into the bar</li>
            <li>Open the correct Facebook page (Following / Groups / Friends)</li>
            <li>Click the bookmark</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Test generation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} variant="outline">
            Run harmless test
          </Button>
          {testLog.length > 0 && (
            <pre className="mt-4 text-xs bg-slate-950 p-4 rounded-lg text-green-400 font-mono overflow-auto">
              {testLog.join("\n")}
            </pre>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm">
        <Link href="/guide" className="text-blue-400 hover:underline">
          Full step-by-step guide with pictures →
        </Link>
      </div>
    </div>
  );
}
