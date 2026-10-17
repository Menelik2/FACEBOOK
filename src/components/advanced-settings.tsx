"use client";

import { useConfigStore } from "@/store/config-store";
import { PRESETS } from "@/lib/presets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PresetId } from "@/lib/types";

export function PresetsBar() {
  const { config, applyPreset } = useConfigStore();

  const items: { id: PresetId; label: string; desc: string }[] = [
    { id: "safe", label: PRESETS.safe.label, desc: PRESETS.safe.description },
    { id: "balanced", label: PRESETS.balanced.label, desc: PRESETS.balanced.description },
    { id: "aggressive", label: PRESETS.aggressive.label, desc: PRESETS.aggressive.description },
  ];

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle>Speed preset</CardTitle>
        <CardDescription>One-click timing profiles (you can still tweak below)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-3">
          {items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`p-3 rounded-xl border text-left transition ${
                config.PRESET === p.id
                  ? "border-blue-500 bg-blue-950/40"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <div className="font-semibold text-sm">{p.label}</div>
              <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
        {config.PRESET === "custom" && (
          <p className="text-xs text-slate-500 mt-2">Custom — you changed individual settings</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AdvancedSettings() {
  const { config, setConfig } = useConfigStore();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle>Advanced</CardTitle>
        <CardDescription>Filters, safety, and session options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="wl">Whitelist (never touch — comma-separated names/keywords)</Label>
          <Input
            id="wl"
            className="mt-1.5"
            placeholder="mom, best friend, work page"
            value={config.WHITELIST || ""}
            onChange={(e) => setConfig({ WHITELIST: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bl">Blacklist keywords (optional)</Label>
          <Input
            id="bl"
            className="mt-1.5"
            placeholder="spam, news, brand"
            value={config.BLACKLIST || ""}
            onChange={(e) => setConfig({ BLACKLIST: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="blonly">Only process blacklist matches</Label>
          <Switch
            id="blonly"
            checked={!!config.USE_BLACKLIST_ONLY}
            onCheckedChange={(v) => setConfig({ USE_BLACKLIST_ONLY: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="rl">Auto-stop on rate limit / CAPTCHA</Label>
          <Switch
            id="rl"
            checked={config.AUTO_STOP_ON_RATE_LIMIT !== false}
            onCheckedChange={(v) => setConfig({ AUTO_STOP_ON_RATE_LIMIT: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ver">Skip verified (heuristic)</Label>
          <Switch
            id="ver"
            checked={!!config.SKIP_VERIFIED}
            onCheckedChange={(v) => setConfig({ SKIP_VERIFIED: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sound">Sound when finished</Label>
          <Switch
            id="sound"
            checked={!!config.SOUND_ON_FINISH}
            onCheckedChange={(v) => setConfig({ SOUND_ON_FINISH: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="log">Keep action log (CSV export)</Label>
          <Switch
            id="log"
            checked={config.LOG_ACTIONS !== false}
            onCheckedChange={(v) => setConfig({ LOG_ACTIONS: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
