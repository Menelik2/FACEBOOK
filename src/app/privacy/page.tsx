import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-slate-400 mt-2">Last updated: 17 October 2026</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Zero data collection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-3">
          <p>
            FB Unfollow Studio is a 100% client-side application. We do not operate any backend
            servers that receive your data.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>No analytics, no telemetry, no tracking pixels</li>
            <li>No cookies set by us (beyond what your browser may store for localStorage)</li>
            <li>No accounts, no logins, no authentication</li>
            <li>No Facebook credentials are ever requested or stored</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Local storage only</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-3">
          <p>
            Your configuration (timing, limits, toggles) is saved exclusively in your browser’s{" "}
            <code className="bg-slate-800 px-1 rounded">localStorage</code> under the key{" "}
            <code className="bg-slate-800 px-1 rounded">fb-unfollow-config</code>.
          </p>
          <p>
            You can clear it at any time by resetting settings in the Configure page or by clearing
            site data in your browser.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Generated scripts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300 space-y-3">
          <p>
            The bookmarklet, userscript and any future extension run only inside the browser tabs
            you open. They interact solely with the Facebook DOM of the page you are viewing. They
            never phone home.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
