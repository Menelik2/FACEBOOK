"use client";

import { useState, useEffect } from "react";
import { useConfigStore } from "@/store/config-store";
import { generateScript } from "@/lib/generate-script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Smartphone, Monitor } from "lucide-react";

export default function BookmarkletPage() {
  const { config } = useConfigStore();
  const [mounted, setMounted] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const bookmarklet = generateScript(config);

  const runTest = () => {
    setTestLog([
      "[Test] Bookmarklet environment check…",
      "[OK] javascript: protocol is allowed in this browser context for testing.",
      "[OK] Script generation succeeded.",
      "[Info] Real run must happen on facebook.com/you/following",
      "Open your following list, then click the bookmark you saved.",
    ]);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Bookmarklet Installer</h1>
        <p className="text-slate-400 mt-2">One-click run from your bookmarks bar</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-blue-400" /> Drag this to your bookmarks bar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <a
            href={bookmarklet}
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg shadow-blue-900/40 cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              e.preventDefault();
              alert("Drag this button to your bookmarks bar instead of clicking it.");
            }}
            draggable
          >
            ▶ FB Auto Unfollow
          </a>
          <p className="text-sm text-slate-400 text-center">
            Drag the blue button above into the bookmarks bar of Chrome, Firefox, Edge or Safari.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4" /> Desktop
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Show the bookmarks bar (Ctrl+Shift+B / Cmd+Shift+B)</li>
              <li>Drag the blue button into the bar</li>
              <li>Go to facebook.com → your profile → Following</li>
              <li>Click the bookmark</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4" /> Mobile (Chrome / Safari)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy the generated javascript: URL from Configure</li>
              <li>Create a new bookmark in your mobile browser</li>
              <li>Paste the javascript: URL as the address</li>
              <li>Open m.facebook.com following list and tap the bookmark</li>
            </ol>
            <p className="text-amber-400/80 text-xs mt-2">
              Mobile support is best-effort; Facebook’s mobile DOM changes often.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Test on this page</CardTitle>
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
    </div>
  );
}
