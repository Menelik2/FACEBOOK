# FB Unfollow Studio

**Take back control of your Facebook — Unfollow · Leave Groups · Unfriend**

A production-ready Next.js 14 configurator that generates personalized Facebook automation scripts:

| Mode | Target page | Stop command |
|------|-------------|--------------|
| **Unfollow** | `/you/following` | — |
| **Leave Groups** | `/groups/joins` | `window.facebookAutoLeaveStop()` |
| **Unfriend** | `/you/friends` | `window.facebookUnfriendStop()` |

Output formats: **Bookmarklet**, **Userscript** (Tampermonkey), **raw JS** (DevTools paste).

100% client-side. No backend, no analytics, no Facebook API.

## ⚠️ Disclaimer

This tool automates clicks on Facebook. Meta’s Terms of Service prohibit automation.  
**Use a secondary / backup account. Use at your own risk. Start with Dry Run.**

## Quick start

```bash
git clone https://github.com/Menelik2/FACEBOOK.git
cd FACEBOOK
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Connect the repo to [Vercel](https://vercel.com) — zero config.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Radix UI
- Zustand (localStorage)
- Framer Motion

## License

MIT — use responsibly.
