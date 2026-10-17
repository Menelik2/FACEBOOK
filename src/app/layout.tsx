import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FB Unfollow Studio — Take back control of your Facebook feed",
  description:
    "Configure, generate and install a safe Facebook auto-unfollow script. Bookmarklet, Userscript or Chrome Extension. 100% client-side.",
  keywords: ["facebook", "unfollow", "automation", "bookmarklet", "userscript"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased`}>
        <DisclaimerBanner />
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">{children}</main>
        <footer className="border-t border-slate-800 mt-16 py-8 text-center text-sm text-slate-500">
          <p>FB Unfollow Studio · Client-side only · No data leaves your browser</p>
          <p className="mt-2">
            <a href="/privacy" className="hover:text-blue-400">Privacy</a>
            {" · "}
            <a href="/changelog" className="hover:text-blue-400">Changelog</a>
            {" · "}
            <a href="/guide" className="hover:text-blue-400">Guide</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
