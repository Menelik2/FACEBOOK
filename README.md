# FB Unfollow Studio

**Take back control of your Facebook feed — safely, in one click.**

A production-ready Next.js 14 configurator that generates personalized Facebook auto-unfollow scripts as:

- **Bookmarklet** (drag-to-bookmarks)
- **Userscript** (Tampermonkey / Greasemonkey)
- **Chrome Extension** (Manifest V3 – planned)

All processing happens **100% client-side**. No backend, no analytics, no Facebook API calls.

## ⚠️ Disclaimer

This tool automates clicks on Facebook. Meta’s Terms of Service prohibit automation.  
**Use a secondary / backup account. Use at your own risk.**

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Radix UI primitives
- Zustand (persisted to localStorage)
- Framer Motion
- Deployable to Vercel with zero config

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/configure` | Settings + script generator |
| `/bookmarklet` | Drag-to-bookmarks installer |
| `/extension` | Chrome extension download |
| `/guide` | Step-by-step + safety warnings |
| `/changelog` | Version history |
| `/privacy` | Privacy policy |

## License

MIT — use responsibly.
