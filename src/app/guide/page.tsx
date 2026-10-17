import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Monitor, Users, LogOut, UserMinus, Bookmark, Terminal, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
        {n}
      </div>
      <div className="flex-1 pb-8 border-l border-slate-800 pl-6 -ml-5 ml-5">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="text-sm text-slate-300 space-y-2">{children}</div>
      </div>
    </div>
  );
}

function MockBrowser({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden my-3 bg-slate-950 shadow-lg">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center text-xs text-slate-500 truncate px-2">{title}</div>
      </div>
      <div className="p-4 text-sm">{children}</div>
    </div>
  );
}

function ProgressPreview() {
  return (
    <div className="inline-block w-64 rounded-xl border border-slate-600 bg-slate-900 shadow-xl overflow-hidden">
      <div className="flex justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-semibold text-blue-400">FB Auto Unfollow</span>
        <span className="text-[10px] text-slate-500">live</span>
      </div>
      <div className="p-3">
        <div className="flex gap-3 text-xs mb-2">
          <span>✅ <strong>12</strong></span>
          <span>❌ <strong>1</strong></span>
          <span>Σ <strong>13</strong></span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-green-400 to-sky-400 rounded-full" />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Unfollowed 12</p>
      </div>
      <div className="flex gap-2 px-3 pb-3">
        <div className="flex-1 text-center text-xs py-1.5 rounded-lg bg-red-600 font-semibold">Stop</div>
        <div className="flex-1 text-center text-xs py-1.5 rounded-lg bg-slate-700 font-semibold">Hide</div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">User Guide</h1>
        <p className="text-slate-400 mt-2">
          Full step-by-step instructions for every mode. <strong className="text-amber-300">Desktop only</strong>.
        </p>
      </div>

      {/* Desktop only banner */}
      <Card className="bg-amber-950/40 border-amber-700/50">
        <CardContent className="pt-6 flex gap-3">
          <Monitor className="h-6 w-6 text-amber-400 shrink-0" />
          <div className="text-sm text-amber-100 space-y-1">
            <p className="font-semibold">Desktop browsers only</p>
            <p>
              This tool is designed for <strong>Chrome, Edge, Firefox, or Safari on a computer</strong>.
              Mobile phones and tablets are not supported. Scripts will detect mobile and stop with a message.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-400" /> What this app does
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <Users className="h-6 w-6 text-blue-400 mb-1" />
              <CardTitle className="text-base">Unfollow</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400">
              Removes people/pages from your Following list without unfriending them.
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <LogOut className="h-6 w-6 text-purple-400 mb-1" />
              <CardTitle className="text-base">Leave Groups</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400">
              Leaves Facebook groups from your groups/joins page.
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <UserMinus className="h-6 w-6 text-rose-400 mb-1" />
              <CardTitle className="text-base">Unfriend</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400">
              Removes friends from your Friends list permanently.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== SETUP ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-bold">A. One-time setup (all modes)</h2>

        <Step n={1} title="Open this app on your computer">
          <p>Use Chrome, Edge, Firefox, or Safari on a desktop/laptop.</p>
          <MockBrowser title="your-app.vercel.app">
            <div className="text-center py-4">
              <p className="text-blue-400 font-bold text-lg">FB Unfollow Studio</p>
              <p className="text-slate-500 text-xs mt-1">Configure & Generate</p>
            </div>
          </MockBrowser>
        </Step>

        <Step n={2} title="Choose a mode and configure">
          <p>
            Go to <Link href="/configure" className="text-blue-400 underline">Configure</Link> and pick:
          </p>
          <ul className="list-disc list-inside text-slate-400">
            <li><strong className="text-blue-300">Unfollow</strong> — people & pages you follow</li>
            <li><strong className="text-purple-300">Leave Groups</strong> — groups you joined</li>
            <li><strong className="text-rose-300">Unfriend</strong> — friends list</li>
          </ul>
          <p className="mt-2">
            <strong>Always enable Dry Run first</strong> to test without making real changes.
          </p>
          <MockBrowser title="/configure">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-blue-500 bg-blue-950/40 p-2">Unfollow</div>
              <div className="rounded-lg border border-slate-700 p-2 text-slate-500">Leave Groups</div>
              <div className="rounded-lg border border-slate-700 p-2 text-slate-500">Unfriend</div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span>Dry run</span>
              <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px]">ON</span>
            </div>
          </MockBrowser>
        </Step>

        <Step n={3} title="Generate a bookmarklet">
          <p>Drag the blue/purple/rose button to your bookmarks bar.</p>
          <MockBrowser title="Bookmarks bar">
            <div className="flex gap-2 items-center text-xs">
              <span className="text-slate-500">☆ Bookmarks</span>
              <span className="px-2 py-1 rounded bg-blue-600 text-white font-medium">▶ FB Auto Unfollow</span>
              <span className="text-slate-600">← drag here</span>
            </div>
          </MockBrowser>
          <p className="text-slate-400">
            Tip: Show the bookmarks bar with <code className="bg-slate-800 px-1 rounded">Ctrl+Shift+B</code> (Windows) or{" "}
            <code className="bg-slate-800 px-1 rounded">Cmd+Shift+B</code> (Mac).
          </p>
          <p className="text-slate-400">
            Alternatives: Copy Userscript (Tampermonkey) or paste raw JS into the console (F12).
          </p>
        </Step>
      </section>

      {/* ===== UNFOLLOW ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" /> B. Unfollow — step by step
        </h2>

        <Step n={1} title="Open your Following list">
          <p>In Facebook (desktop site):</p>
          <ol className="list-decimal list-inside text-slate-400">
            <li>Click your profile</li>
            <li>Click <strong>Following</strong> (or go to <code className="bg-slate-800 px-1 rounded">facebook.com/YOUR_USERNAME/following</code>)</li>
          </ol>
          <MockBrowser title="facebook.com/you/following">
            <div className="space-y-2">
              <div className="text-xs text-slate-500">Following · 1,240</div>
              {["Alex Johnson", "News Page", "Sam Lee"].map((n) => (
                <div key={n} className="flex items-center justify-between py-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700" />
                    <span className="text-xs">{n}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800">Following</span>
                </div>
              ))}
            </div>
          </MockBrowser>
        </Step>

        <Step n={2} title="Run the bookmarklet">
          <p>Click the bookmark you saved. A progress panel appears in the bottom-right.</p>
          <div className="flex justify-center py-2">
            <ProgressPreview />
          </div>
        </Step>

        <Step n={3} title="Watch progress & stop if needed">
          <ul className="list-disc list-inside text-slate-400">
            <li>Green count = successful unfollows</li>
            <li>Red count = failures (UI changed or already unfollowed)</li>
            <li>Click <strong>Stop</strong> anytime to halt safely</li>
            <li>Open console (F12) for detailed logs</li>
          </ul>
        </Step>
      </section>

      {/* ===== LEAVE GROUPS ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LogOut className="h-5 w-5 text-purple-400" /> C. Leave Groups — step by step
        </h2>

        <Step n={1} title="Open your groups list">
          <p>
            Go to{" "}
            <code className="bg-slate-800 px-1 rounded">facebook.com/groups/joins</code>
          </p>
          <MockBrowser title="facebook.com/groups/joins">
            <div className="space-y-2">
              <div className="text-xs text-slate-500">Groups you&apos;ve joined</div>
              {["Local Events", "Tech News", "Book Club"].map((n) => (
                <div key={n} className="flex items-center justify-between py-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-700" />
                    <span className="text-xs">{n}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800">⋯ More</span>
                </div>
              ))}
            </div>
          </MockBrowser>
        </Step>

        <Step n={2} title="Run the Leave Groups bookmarklet">
          <p>
            Click your generated bookmark. To stop: click <strong>Stop</strong> on the panel or run{" "}
            <code className="bg-slate-800 px-1 rounded">window.facebookAutoLeaveStop()</code> in the console.
          </p>
        </Step>

        <Step n={3} title="Confirm dialogs">
          <p>
            The script opens each group menu → clicks “Leave Group” → confirms the dialog automatically.
          </p>
        </Step>
      </section>

      {/* ===== UNFRIEND ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserMinus className="h-5 w-5 text-rose-400" /> D. Unfriend — step by step
        </h2>

        <Step n={1} title="Open your Friends list">
          <p>
            Go to <code className="bg-slate-800 px-1 rounded">facebook.com/YOUR_USERNAME/friends</code>
          </p>
          <p className="text-amber-300/90 text-xs">
            ⚠️ Unfriending is permanent (until they accept a new request). Prefer Dry Run first.
          </p>
          <MockBrowser title="facebook.com/you/friends">
            <div className="space-y-2">
              <div className="text-xs text-slate-500">Friends · 856</div>
              {["Chris Park", "Jordan Miles", "Taylor Kim"].map((n) => (
                <div key={n} className="flex items-center justify-between py-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700" />
                    <span className="text-xs">{n}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800">Friends</span>
                </div>
              ))}
            </div>
          </MockBrowser>
        </Step>

        <Step n={2} title="Scroll a little, then run the script">
          <p>Scroll so some friends load, then click the Unfriend bookmarklet.</p>
        </Step>

        <Step n={3} title="Stop anytime">
          <p>
            Use the panel <strong>Stop</strong> button or{" "}
            <code className="bg-slate-800 px-1 rounded">window.facebookUnfriendStop()</code>.
          </p>
        </Step>
      </section>

      {/* Safety */}
      <Card className="bg-red-950/40 border-red-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="h-5 w-5" /> Safety rules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-100/90 text-sm space-y-2">
          <ul className="list-disc list-inside space-y-2">
            <li>Meta Terms of Service prohibit automation — risk of restrictions or bans.</li>
            <li>Use a <strong>secondary account</strong> when possible.</li>
            <li>Always start with <strong>Dry Run = ON</strong>.</li>
            <li>Stay under ~500 actions per day; use cooldowns.</li>
            <li>If you see CAPTCHA or “Try again later” — <strong>stop immediately</strong> for 24h+.</li>
            <li><strong>Desktop only</strong> — do not run on phone browsers.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          href="/configure"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          <Bookmark className="h-4 w-4" /> Go to Configure & Generate
        </Link>
      </div>
    </div>
  );
}
