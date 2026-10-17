import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Step-by-step Guide</h1>
        <p className="text-slate-400 mt-2">How to use FB Unfollow Studio safely (desktop + mobile)</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>1. Open your following list</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 text-sm space-y-2">
          <p>
            <strong>Desktop:</strong>{" "}
            <code className="bg-slate-800 px-1 rounded">facebook.com/yourusername/following</code>
          </p>
          <p>
            <strong>Mobile (recommended):</strong> Open <code className="bg-slate-800 px-1 rounded">facebook.com</code> and request the <strong>Desktop site</strong>, then go to Following.
          </p>
          <p>
            <strong>Mobile (m.facebook.com):</strong> Works with the improved touch flow, but less reliable.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>2. Install the script</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 text-sm space-y-2">
          <p>
            <strong>Bookmarklet:</strong> Drag the button from the Bookmarklet page to your bookmarks bar (or save the javascript: URL on mobile).
          </p>
          <p>
            <strong>Userscript:</strong> Install Tampermonkey, then paste the generated script from Configure.
          </p>
          <p>
            <strong>Extension:</strong> Load the unpacked zip (when available).
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>3. Run it</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 text-sm space-y-2">
          <p>Open the following list, then click/tap the bookmark.</p>
          <p>Open the browser console (F12 on desktop) to see live progress.</p>
          <p>The script now automatically detects mobile and uses a touch-based flow.</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>4. What to expect</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 text-sm space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Roughly 1 unfollow every 2–4 seconds (depending on settings)</li>
            <li>Automatic cooldowns every N actions</li>
            <li>Stops after daily cap or when no more profiles are found</li>
            <li>Colored console logs so you can follow every step</li>
            <li>On mobile: touch events + mobile selectors are used automatically</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-red-950/40 border-red-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="h-5 w-5" /> Safety warnings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-100/90 text-sm space-y-2">
          <ul className="list-disc list-inside space-y-2">
            <li>Facebook / Meta Terms of Service prohibit automation. You may risk account restrictions or bans.</li>
            <li>Never run more than ~500 unfollows per day.</li>
            <li>Always test first with <strong>DRY_RUN = true</strong>.</li>
            <li>
              If you see “Try again later”, rate-limit messages, or a CAPTCHA —{" "}
              <strong>stop immediately</strong> and wait at least 24 hours.
            </li>
            <li>Strongly recommended: use a secondary / backup account.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
