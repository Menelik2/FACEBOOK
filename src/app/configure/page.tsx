"use client";

import { useState, useEffect } from "react";
import { useConfigStore } from "@/store/config-store";
import { generateScript, generateUserscript, generateRawScript } from "@/lib/generate-script";
import {
  generateLeaveGroupsScript,
  generateLeaveGroupsUserscript,
  generateLeaveGroupsRaw,
} from "@/lib/generate-leave-groups";
import {
  generateUnfriendScript,
  generateUnfriendUserscript,
  generateUnfriendRaw,
} from "@/lib/generate-unfriend";
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
import { PresetsBar, AdvancedSettings } from "@/components/advanced-settings";

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

  const mode = config.MODE;
  const isLeave = mode === "leave-groups";
  const isUnfriend = mode === "unfriend";

  let bookmarklet: string;
  let userscript: string;
  let rawScript: string;

  if (isLeave) {
    bookmarklet = generateLeaveGroupsScript(config);
    userscript = generateLeaveGroupsUserscript(config);
    rawScript = generateLeaveGroupsRaw(config);
  } else if (isUnfriend) {
    bookmarklet = generateUnfriendScript(config);
    userscript = generateUnfriendUserscript(config);
    rawScript = generateUnfriendRaw(config);
  } else {
    bookmarklet = generateScript(config);
    userscript = generateUserscript(config);
    rawScript = generateRawScript(config);
  }

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
    a.download = isLeave
      ? "fb-leave-groups-bookmarklet.txt"
      : isUnfriend
      ? "fb-unfriend-bookmarklet.txt"
      : "fb-unfollow-bookmarklet.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const modeColor =
    isLeave ? "bg-purple-600 hover:bg-purple-700" :
    isUnfriend ? "bg-rose-600 hover:bg-rose-700" :
    "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configure & Generate</h1>
        <p className="text-slate-400 mt-2">
          Presets, filters, and advanced safety — then generate your desktop script.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Mode</CardTitle>
          <CardDescription>What do you want the script to do?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setConfig({ MODE: "unfollow" })}
              className={`p-4 rounded-xl border text-left transition ${
                mode === "unfollow" ? "border-blue-500 bg-blue-950/40" : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="font-semibold">Unfollow</div>
              <div className="text-sm text-slate-400 mt-1">People & pages you follow</div>
            </button>
            <button
              onClick={() => setConfig({ MODE: "leave-groups" })}
              className={`p-4 rounded-xl border text-left transition ${
                mode === "leave-groups" ? "border-purple-500 bg-purple-950/40" : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="font-semibold">Leave Groups</div>
              <div className="text-sm text-slate-400 mt-1">facebook.com/groups/joins</div>
            </button>
            <button
              onClick={() => setConfig({ MODE: "unfriend" })}
              className={`p-4 rounded-xl border text-left transition ${
                mode === "unfriend" ? "border-rose-500 bg-rose-950/40" : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="font-semibold">Unfriend</div>
              <div className="text-sm text-slate-400 mt-1">facebook.com/you/friends</div>
            </button>
          </div>
        </CardContent>
      </Card>

      <PresetsBar />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <AdvancedSettings />

          {isUnfriend && (
            <>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle>Unfriend – Timing</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Delay between unfriends (ms)</Label>
                      <span className="text-sm text-slate-400">{config.UNFRIEND_DELAY}</span>
                    </div>
                    <Slider value={[config.UNFRIEND_DELAY]} min={400} max={3000} step={50} onValueChange={([v]) => setConfig({ UNFRIEND_DELAY: v })} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Short pause</Label>
                      <span className="text-sm text-slate-400">{config.SHORT_FIXED_PAUSE} ms</span>
                    </div>
                    <Slider value={[config.SHORT_FIXED_PAUSE]} min={200} max={1500} step={50} onValueChange={([v]) => setConfig({ SHORT_FIXED_PAUSE: v })} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle>Limits</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Dry run</Label>
                    <Switch checked={config.DRY_RUN} onCheckedChange={(v) => setConfig({ DRY_RUN: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Random jitter</Label>
                    <Switch checked={config.RANDOM_JITTER} onCheckedChange={(v) => setConfig({ RANDOM_JITTER: v })} />
                  </div>
                  <div>
                    <Label>Daily cap</Label>
                    <Input type="number" min={20} max={2000} value={config.DAILY_CAP} onChange={(e) => setConfig({ DAILY_CAP: Number(e.target.value) || 500 })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Cooldown every N / seconds</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input type="number" value={config.COOLDOWN_EVERY_N} onChange={(e) => setConfig({ COOLDOWN_EVERY_N: Number(e.target.value) || 20 })} />
                      <Input type="number" value={config.COOLDOWN_SECONDS} onChange={(e) => setConfig({ COOLDOWN_SECONDS: Number(e.target.value) || 20 })} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isLeave && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle>Leave Groups – Timing</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2"><Label>Max per minute</Label><span className="text-sm text-slate-400">{config.MAX_PER_MINUTE}</span></div>
                  <Slider value={[config.MAX_PER_MINUTE]} min={5} max={40} step={1} onValueChange={([v]) => setConfig({ MAX_PER_MINUTE: v })} />
                </div>
                <div>
                  <div className="flex justify-between mb-2"><Label>Base delay (ms)</Label><span className="text-sm text-slate-400">{config.BASE_DELAY}</span></div>
                  <Slider value={[config.BASE_DELAY]} min={400} max={3000} step={50} onValueChange={([v]) => setConfig({ BASE_DELAY: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Dry run</Label>
                  <Switch checked={config.DRY_RUN} onCheckedChange={(v) => setConfig({ DRY_RUN: v })} />
                </div>
              </CardContent>
            </Card>
          )}

          {!isLeave && !isUnfriend && (
            <>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle>Timing</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2"><Label>Interval (ms)</Label><span className="text-sm text-slate-400">{config.INTERVAL_BETWEEN_ACTIONS}</span></div>
                    <Slider value={[config.INTERVAL_BETWEEN_ACTIONS]} min={1000} max={10000} step={100} onValueChange={([v]) => setConfig({ INTERVAL_BETWEEN_ACTIONS: v })} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2"><Label>Short pause</Label><span className="text-sm text-slate-400">{config.SHORT_FIXED_PAUSE}</span></div>
                    <Slider value={[config.SHORT_FIXED_PAUSE]} min={300} max={2000} step={50} onValueChange={([v]) => setConfig({ SHORT_FIXED_PAUSE: v })} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle>Behavior</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label>Also unlike pages</Label><Switch checked={config.ALSO_UNLIKE_PAGES} onCheckedChange={(v) => setConfig({ ALSO_UNLIKE_PAGES: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Dry run</Label><Switch checked={config.DRY_RUN} onCheckedChange={(v) => setConfig({ DRY_RUN: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Random jitter</Label><Switch checked={config.RANDOM_JITTER} onCheckedChange={(v) => setConfig({ RANDOM_JITTER: v })} /></div>
                  <div>
                    <Label>Target</Label>
                    <Select value={config.TARGET} onValueChange={(v: "all" | "profiles" | "pages") => setConfig({ TARGET: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="profiles">Profiles only</SelectItem>
                        <SelectItem value="pages">Pages only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Daily cap</Label>
                    <Input type="number" value={config.DAILY_CAP} onChange={(e) => setConfig({ DAILY_CAP: Number(e.target.value) || 500 })} className="mt-1.5" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex gap-3">
            <Button className={`flex-1 ${modeColor}`}><Save className="mr-2 h-4 w-4" /> Settings auto-saved</Button>
            <Button variant="outline" onClick={resetConfig}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle>Live config JSON</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-950 rounded-lg p-4 overflow-auto max-h-64 text-green-400 font-mono">{jsonPreview}</pre>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Generate</CardTitle>
              <CardDescription>
                {isLeave && "Run on facebook.com/groups/joins"}
                {isUnfriend && "Run on facebook.com/YOU/friends"}
                {!isLeave && !isUnfriend && "Run on your Following list"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <a href={bookmarklet} className={`flex-1 inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium ${modeColor}`} onClick={(e) => e.preventDefault()} draggable>
                  ▶ Drag me to bookmarks bar
                </a>
                <Button variant="outline" size="icon" onClick={downloadBookmarklet}><Download className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => copy(userscript, "userscript")}>
                {copied === "userscript" ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy Userscript
              </Button>
              <Button variant="outline" className="w-full" onClick={() => copy(rawScript, "raw")}>
                {copied === "raw" ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy JS Script
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-amber-950/30 border-amber-800/50">
            <CardContent className="pt-6 text-sm text-amber-200">
              <strong>Advanced:</strong> whitelist protects people; auto-stop halts on CAPTCHA; progress panel has Pause + Log export.
              Desktop only.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
