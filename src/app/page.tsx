"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionDiv, MotionH1, MotionP } from "@/components/motion";
import { Bookmark, Puzzle, FileCode, ArrowRight, Shield, Zap, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="text-center pt-12 pb-8">
        <MotionH1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          Take back control of your
          <br />
          <span className="text-blue-500">Facebook feed</span>
        </MotionH1>
        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Safely, in one click. Configure timing, limits and behavior, then generate a
          bookmarklet, userscript or Chrome extension that runs entirely in your browser.
        </MotionP>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/configure">
              Configure & Generate <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/extension">Download Extension</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/guide">How it works</Link>
          </Button>
        </MotionDiv>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Bookmark className="h-10 w-10 text-blue-400 mb-2" />
            <CardTitle>Bookmarklet</CardTitle>
            <CardDescription>
              Drag one button to your bookmarks bar. Open your following list and click. Works on
              desktop and (with a bit of setup) mobile browsers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/bookmarklet">Get Bookmarklet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <FileCode className="h-10 w-10 text-green-400 mb-2" />
            <CardTitle>Userscript</CardTitle>
            <CardDescription>
              Install via Tampermonkey or Greasemonkey. Runs automatically on Facebook following
              pages with your saved settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Generate Userscript</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Puzzle className="h-10 w-10 text-purple-400 mb-2" />
            <CardTitle>Chrome Extension</CardTitle>
            <CardDescription>
              Manifest V3 extension. Load unpacked from a zip. Popup lets you start/stop and see
              live progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/extension">Download .zip</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <div>
          <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h3 className="font-semibold">Privacy first</h3>
          <p className="text-sm text-slate-400 mt-2">
            Zero servers. Zero analytics. All settings stay in your browser&apos;s localStorage.
          </p>
        </div>
        <div>
          <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="font-semibold">Anti-detection</h3>
          <p className="text-sm text-slate-400 mt-2">
            Random jitter, configurable delays, cooldowns and daily caps so you stay under the
            radar.
          </p>
        </div>
        <div>
          <Lock className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold">You control everything</h3>
          <p className="text-sm text-slate-400 mt-2">
            Dry-run mode, target filters (profiles / pages / all), and full visibility of every
            action in the console.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <h2 className="text-2xl font-bold text-center mb-8">3-tap unfollow flow</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
          <div className="flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <p className="mt-3 font-medium">Open following list</p>
            <p className="text-sm text-slate-400">facebook.com/you/following</p>
          </div>
          <ArrowRight className="hidden md:block text-slate-600" />
          <div className="flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <p className="mt-3 font-medium">Click the bookmark / extension</p>
            <p className="text-sm text-slate-400">Script starts processing</p>
          </div>
          <ArrowRight className="hidden md:block text-slate-600" />
          <div className="flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <p className="mt-3 font-medium">Watch the console</p>
            <p className="text-sm text-slate-400">Safe delays + cooldowns</p>
          </div>
        </div>
      </section>
    </div>
  );
}
