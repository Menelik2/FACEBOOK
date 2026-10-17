"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Puzzle, Download, FolderOpen } from "lucide-react";

export default function ExtensionPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Chrome Extension</h1>
        <p className="text-slate-400 mt-2">Manifest V3 · Load unpacked</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <Puzzle className="h-10 w-10 text-purple-400 mb-2" />
          <CardTitle>FB Unfollow Studio Extension</CardTitle>
          <CardDescription>
            A lightweight Manifest V3 extension that injects the same automation script on your
            following list. Settings are stored in chrome.storage.local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
            <Download className="mr-2 h-4 w-4" /> Download .zip (coming soon)
          </Button>
          <p className="text-xs text-slate-500 text-center">
            For now, generate a Userscript or Bookmarklet from the Configure page. The full
            extension package will be added in a future release.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> How to load an unpacked extension
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open <code className="bg-slate-800 px-1 rounded">chrome://extensions</code></li>
            <li>Enable “Developer mode” (top right)</li>
            <li>Click “Load unpacked”</li>
            <li>Select the extracted folder from the zip</li>
            <li>Pin the extension and open your Facebook following list</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
