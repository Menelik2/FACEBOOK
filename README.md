# FB Unfollow Studio

**Desktop only** · Unfollow · Leave Groups · Unfriend

Configure and generate Facebook automation scripts (bookmarklet / userscript / raw JS). 100% client-side.

| Mode | Target page | Stop |
|------|-------------|------|
| **Unfollow** | `/you/following` | Progress panel Stop |
| **Leave Groups** | `/groups/joins` | `window.facebookAutoLeaveStop()` |
| **Unfriend** | `/you/friends` | `window.facebookUnfriendStop()` |

## Requirements

- **Desktop browser only** (Chrome, Edge, Firefox, Safari)
- Mobile / `m.facebook.com` is blocked by the scripts

## Disclaimer

Meta ToS prohibit automation. Use a secondary account. Start with Dry Run. Use at your own risk.

## Quick start

```bash
git clone https://github.com/Menelik2/FACEBOOK.git
cd FACEBOOK
npm install
npm run dev
```

See **Guide** in the app for full step-by-step instructions with visual walkthroughs.

## License

MIT — use responsibly.
