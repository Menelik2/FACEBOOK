"use client";

import { useState, useEffect } from "react";
import { useConfigStore } from "@/store/config-store";
import { generateScript, generateUserscript, generateRawScript } from "@/lib/generate-script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Copy, Save, RotateCcw, Check } from "lucide-react";

export default function ConfigurePage() {
  const { config, setConfig, resetConfig } = useConfigStore();
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-400">Loading settings…</p>
      </div>
    );
  }

  const bookmarklet = generateScript(config);
  const userscript = generateUserscript(config);
  const rawScript = generateRawScript(config);
  const jsonPreview = JSON.stringify(config, null, 2);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadBookmarklet = () => {
    const blob = new Blob([bookmarklet], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fb-unfollow-bookmarklet.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configure & Generate</h1>
        <p className="text-slate-400 mt-2">
          Tune the automation parameters. Everything is saved to your browser only.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Timing</CardTitle>
              <CardDescription>Delays between actions (higher = safer)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Interval between profiles</Label>
                  <span className="text-sm text-slate-400">{config.INTERVAL_BETWEEN_ACTIONS} ms</span>
                </div>
                <Slider
                  value={[config.INTERVAL_BETWEEN_ACTIONS]}
                  min={1000}
                  max={10000}
                  step={100}
                  onValueChange={([v]) => setConfig({ INTERVAL_BETWEEN_ACTIONS: v })}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Short pause (sub-actions)</Label>
                  <span className="text-sm text-slate-400">{config.SHORT_FIXED_PAUSE} ms</span>
                </div>
                <Slider
                  value={[config.SHORT_FIXED_PAUSE]}
                  min={300}
                  max={2000}
                  step={50}
                  onValueChange={([v]) => setConfig({ SHORT_FIXED_PAUSE: v })}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Hover card wait timeout</Label>
                  <span className="text-sm text-slate-400">{config.HOVER_WAIT_TIMEOUT} ms</span>
                </div>
                <Slider
                  value={[config.HOVER_WAIT_TIMEOUT]}
                  min={2000}
                  max={10000}
                  step={100}
                  onValueChange={([v]) => setConfig({ HOVER_WAIT_TIMEOUT: v })}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Max scroll attempts</Label>
                  <span className="text-sm text-slate-400">{config.MAX_SCROLL_ATTEMPTS}</span>
                </div>
                <Slider
                  value={[config.MAX_SCROLL_ATTEMPTS]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([v]) => setConfig({ MAX_SCROLL_ATTEMPTS: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="unlike">Also unlike pages</Label>
                <Switch
                  id="unlike"
                  checked={config.ALSO_UNLIKE_PAGES}
                  onCheckedChange={(v) => setConfig({ ALSO_UNLIKE_PAGES: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dry">Dry run (log only, no clicks)</Label>
                <Switch
                  id="dry"
                  checked={config.DRY_RUN}
                  onCheckedChange={(v) => setConfig({ DRY_RUN: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="jitter">Random jitter (±20%)</Label>
                <Switch
                  id="jitter"
                  checked={config.RANDOM_JITTER}
                  onCheckedChange={(v) => setConfig({ RANDOM_JITTER: v })}
                />
              </div>
              <div>
                <Label>Target</Label>
                <Select
                  value={config.TARGET}
                  onValueChange={(v: "all" | "profiles" | "pages") => setConfig({ TARGET: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All (profiles + pages)</SelectItem>
                    <SelectItem value="profiles">Profiles only</SelectItem>
                    <SelectItem value="pages">Pages only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Log theme</Label>
                <Select
                  value={config.THEME}
                  onValueChange={(v: "neon" | "minimal" | "retro") => setConfig({ THEME: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neon">Neon</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="retro">Retro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Limits & Cooldowns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Daily cap (max unfollows)</Label>
                <Input
                  type="number"
                  min={50}
                  max={2000}
                  value={config.DAILY_CAP}
                  onChange={(e) => setConfig({ DAILY_CAP: Number(e.target.value) || 500 })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Cooldown every N actions</Label>
                <Input
                  type="number"
                  min={5}
                  max={100}
                  value={config.COOLDOWN_EVERY_N}
                  onChange={(e) => setConfig({ COOLDOWN_EVERY_N: Number(e.target.value) || 20 })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Cooldown length (seconds)</Label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={config.COOLDOWN_SECONDS}
                  onChange={(e) => setConfig({ COOLDOWN_SECONDS: Number(e.target.value) || 20 })}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" /> Settings auto-saved
            </Button>
            <Button variant="outline" onClick={resetConfig}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Live config JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-950 rounded-lg p-4 overflow-auto max-h-64 text-green-400 font-mono">
                {jsonPreview}
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Generate</CardTitle>
              <CardDescription>Pick your preferred install method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">Bookmarklet</p>
                <div className="flex gap-2">
                  <a
                    href={bookmarklet}
                    className="flex-1 inline-flex items-center justify-center h-10 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium"
                    onClick={(e) => e.preventDefault()}
                    draggable
                  >
                    ▶ Drag me to bookmarks bar
                  </a>
                  <Button variant="outline" size="icon" onClick={downloadBookmarklet}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => copy(userscript, "userscript")}
              >
                {copied === "userscript" ? (
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy Userscript (Tampermonkey)
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => copy(rawScript, "raw")}
              >
                {copied === "raw" ? (
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy JS Script (DevTools paste)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-950/30 border-amber-800/50">
            <CardContent className="pt-6 text-sm text-amber-200">
              <strong>Tip:</strong> Always start with <code className="bg-slate-900 px-1 rounded">DRY_RUN = true</code>{" "}
              and open the browser console (F12) to verify the script finds profiles before turning
              clicks on.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
