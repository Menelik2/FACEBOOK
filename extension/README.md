# Facebook Unfollow Assistant (Chrome extension)

A user-controlled Chrome extension for reviewing visible account cards in Facebook's Following list. It does not log in for you, collect credentials, or run on a server.

## Install (Chrome desktop)
1. Download and extract the ZIP package.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the extracted `extension` folder (the folder containing `manifest.json`).
5. Open Facebook, navigate to the Following list, and wait for it to load.
6. Click the extension icon, choose **Find accounts**, review the count, tick the confirmation box, then choose **Start unfollowing**.

## Important notes
- Unofficial helper; not affiliated with or endorsed by Meta/Facebook.
- Starts only after user confirmation, processes at most 20 visible cards per run, and includes a delay between accounts.
- Facebook frequently changes its interface. If controls cannot be identified, stop and complete the action manually; do not assume every account was unfollowed.
- Keep the Facebook tab open. Do not use this to evade platform limits or automate activity against Facebook's rules.
- Chrome extensions cannot normally be installed from a ZIP directly in Android Chrome. This package targets desktop Chrome. A Chrome Web Store release requires a separate publisher account and review.

## Contents
- `manifest.json` — Manifest V3 metadata
- `popup.html`, `popup.css`, `popup.js` — popup and controls
- `content.js` — page detection and user-initiated actions

## Desktop Chrome and Android Chrome compatibility
Desktop Chrome supports this Manifest V3 extension through **Load unpacked**. Standard Google Chrome for Android does **not** install Chrome extensions; downloading the ZIP on Android does not enable it. For Android Chrome, use Facebook's own Following controls manually. The desktop extension cannot be injected into Android Chrome from the website.

## Verification and known limits
The extension counts a verified unfollow only when the same visible profile card displays a **Follow**, **Like**, or **Subscribe** control after the action. Missing cards, unavailable menus, and uncertain state changes are reported as needing review rather than success. Facebook may render a different layout or language, so detection can return zero accounts. Test on an account you control and review each change. Do not interpret a finished run as proof that every followed account was removed.
