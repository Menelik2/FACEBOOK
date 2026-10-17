"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionDiv, MotionH1, MotionP } from "@/components/motion";
import { Bookmark, Puzzle, FileCode, ArrowRight, Shield, Zap, Lock, Users } from "lucide-react";

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
          <span className="text-blue-500">Facebook</span>
        </MotionH1>
        <MotionP
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Unfollow people & pages or leave groups — safely, in one click. Configure, generate a
          bookmarklet or userscript, and run it entirely in your browser.
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
            <Link href="/guide">How it works</Link>
          </Button>
        </MotionDiv>
      </section>

      {/* Two modes */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" /> Unfollow
            </CardTitle>
            <CardDescription>
              Clean your Following list. Supports profiles, pages, dry-run, jitter, daily caps and
              mobile-friendly flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Configure Unfollow</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" /> Leave Groups
            </CardTitle>
            <CardDescription>
              Leave groups you no longer want. Runs on facebook.com/groups/joins with rate limits
              and human-like delays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Configure Leave Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Bookmark className="h-10 w-10 text-blue-400 mb-2" />
            <CardTitle>Bookmarklet</CardTitle>
            <CardDescription>
              Drag one button to your bookmarks bar. Works on desktop and (with setup) mobile.
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
              Install via Tampermonkey. Runs on the correct Facebook pages with your settings.
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
              Manifest V3 extension (coming soon). Load unpacked from a zip.
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
            Random jitter, rate limits, cooldowns and daily caps so you stay under the radar.
          </p>
        </div>
        <div>
          <Lock className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold">You control everything</h3>
          <p className="text-sm text-slate-400 mt-2">
            Dry-run mode, stop functions, and full visibility of every action in the console.
          </p>
        </div>
      </section>
    </div>
  );
}
