"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionDiv, MotionH1, MotionP } from "@/components/motion";
import { Bookmark, Puzzle, FileCode, ArrowRight, Shield, Zap, Lock, Users, UserMinus, LogOut } from "lucide-react";

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
          Unfollow · Leave Groups · Unfriend — safely, in one click. Configure, generate a
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

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Users className="h-8 w-8 text-blue-400 mb-2" />
            <CardTitle>Unfollow</CardTitle>
            <CardDescription>
              Clean your Following list. Profiles, pages, dry-run, jitter, daily caps, mobile support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Configure</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <LogOut className="h-8 w-8 text-purple-400 mb-2" />
            <CardTitle>Leave Groups</CardTitle>
            <CardDescription>
              Leave groups you no longer want. Rate limits + human-like delays on /groups/joins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Configure</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <UserMinus className="h-8 w-8 text-rose-400 mb-2" />
            <CardTitle>Unfriend</CardTitle>
            <CardDescription>
              Remove friends in bulk from your Friends list. Confirm dialogs handled automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Configure</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Bookmark className="h-10 w-10 text-blue-400 mb-2" />
            <CardTitle>Bookmarklet</CardTitle>
            <CardDescription>Drag to bookmarks bar. Desktop + mobile (with setup).</CardDescription>
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
            <CardDescription>Tampermonkey / Greasemonkey ready.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/configure">Generate</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <Puzzle className="h-10 w-10 text-purple-400 mb-2" />
            <CardTitle>Chrome Extension</CardTitle>
            <CardDescription>Manifest V3 (coming soon).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/extension">Download</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <div>
          <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h3 className="font-semibold">Privacy first</h3>
          <p className="text-sm text-slate-400 mt-2">Zero servers. Zero analytics. All state in your browser.</p>
        </div>
        <div>
          <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
          <h3 className="font-semibold">Anti-detection</h3>
          <p className="text-sm text-slate-400 mt-2">Jitter, rate limits, cooldowns and daily caps.</p>
        </div>
        <div>
          <Lock className="h-8 w-8 text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold">Full control</h3>
          <p className="text-sm text-slate-400 mt-2">Dry-run, stop functions, console visibility.</p>
        </div>
      </section>
    </div>
  );
}
