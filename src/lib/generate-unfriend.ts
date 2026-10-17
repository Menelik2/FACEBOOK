import { UnfollowConfig } from "./types";

export function generateUnfriendScript(config: UnfollowConfig): string {
  const {
    UNFRIEND_DELAY,
    UNFRIEND_SCROLL_AMOUNT,
    UNFRIEND_SCROLL_WAIT,
    SHORT_FIXED_PAUSE,
    DRY_RUN,
    RANDOM_JITTER,
    DAILY_CAP,
    COOLDOWN_EVERY_N,
    COOLDOWN_SECONDS,
    THEME,
  } = config;

  const themeColors: Record<string, string> = {
    neon: "#00FF7F",
    minimal: "#1877F2",
    retro: "#FF6B6B",
  };
  const primary = themeColors[THEME] || themeColors.neon;

  return `javascript:(function(){
if (window.__FB_UNFRIEND_RUNNING__) {
  alert('FB Auto Unfriend is already running');
  return;
}
window.__FB_UNFRIEND_RUNNING__ = true;

(async function smartUnfriendLoop() {
  'use strict';
  console.log('%c[Facebook Auto Unfriend Started]', 'color:${primary};font-weight:bold;');
  console.log('%cOpen facebook.com/YOU/friends first. Dry-run: ${DRY_RUN}', 'color:#888;');
  console.log('%cTo stop: window.facebookUnfriendStop()', 'color:#FF9800;');

  const UNFRIEND_DELAY = ${UNFRIEND_DELAY};
  const SCROLL_AMOUNT = ${UNFRIEND_SCROLL_AMOUNT};
  const SCROLL_WAIT = ${UNFRIEND_SCROLL_WAIT};
  const SHORT_PAUSE = ${SHORT_FIXED_PAUSE};
  const DRY_RUN = ${DRY_RUN};
  const RANDOM_JITTER = ${RANDOM_JITTER};
  const DAILY_CAP = ${DAILY_CAP};
  const COOLDOWN_EVERY_N = ${COOLDOWN_EVERY_N};
  const COOLDOWN_SECONDS = ${COOLDOWN_SECONDS};

  let stopRequested = false;
  window.facebookUnfriendStop = () => {
    stopRequested = true;
    console.log('%c[Stop requested]', 'color:#FF5722;font-weight:bold;');
  };

  const delay = (ms) => {
    let actual = ms;
    if (RANDOM_JITTER) {
      const jitter = ms * 0.2 * (Math.random() * 2 - 1);
      actual = Math.max(150, Math.round(ms + jitter));
    }
    return new Promise((res) => setTimeout(res, actual));
  };

  // Track by profile URL (stable across re-renders), not DOM nodes
  const processed = new Set();
  let successCount = 0;
  let failCount = 0;
  let actionsThisSession = 0;
  let emptyScrolls = 0;
  const MAX_EMPTY_SCROLLS = 5;

  function getProfileKey(btn) {
    // Prefer nearby profile link href as stable id
    const row = btn.closest('[role="listitem"], [role="article"], div') || btn.parentElement;
    const link = row && row.querySelector('a[href*="facebook.com/"]');
    if (link && link.href) return link.href.split('?')[0];
    // Fallback: use a hash of button position + nearby text
    const text = (row && row.textContent || '').slice(0, 40).trim();
    return text || ('btn-' + Math.random().toString(36).slice(2));
  }

  while (!stopRequested) {
    const buttons = [...document.querySelectorAll('div[aria-label="Friends"]')];

    // Filter to ones we haven't processed yet
    const fresh = buttons.filter((btn) => {
      const key = getProfileKey(btn);
      return key && !processed.has(key);
    });

    if (fresh.length === 0) {
      emptyScrolls++;
      window.scrollBy(0, SCROLL_AMOUNT);
      await delay(SCROLL_WAIT);

      // Re-check after scroll
      const still = document.querySelectorAll('div[aria-label="Friends"]').length;
      if (still === 0 || emptyScrolls >= MAX_EMPTY_SCROLLS) {
        console.log('%c✅ Finished — no more Friends buttons found (or max empty scrolls reached).', 'color:#4CAF50;font-weight:bold;');
        break;
      }
      continue;
    }

    emptyScrolls = 0; // reset when we find work

    for (const btn of fresh) {
      if (stopRequested) break;

      const key = getProfileKey(btn);
      processed.add(key);

      btn.scrollIntoView({ block: "center" });
      await delay(300);

      if (DRY_RUN) {
        console.log('%c[DRY RUN] Would unfriend: ' + key, 'color:#FFCC00;');
        successCount++;
        actionsThisSession++;
        continue;
      }

      // Open the Friends dropdown
      try {
        btn.click();
      } catch (e) {
        failCount++;
        console.warn('[❌] Click failed', e);
        continue;
      }
      await delay(SHORT_PAUSE);

      // Find “Unfriend” in the menu
      const unfriend = Array.from(document.querySelectorAll('[role="menuitem"]'))
        .find((e) => /unfriend/i.test(e.innerText || e.textContent || ''));

      if (!unfriend) {
        failCount++;
        console.warn('[❌] Unfriend option not found for', key);
        // Close any open menu by pressing Escape
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await delay(200);
        continue;
      }

      unfriend.click();
      await delay(SHORT_PAUSE);

      // Confirm dialog if present
      const confirm = Array.from(
        document.querySelectorAll('[aria-label="Confirm"], div[role="button"], button')
      ).find((e) => /confirm/i.test(
        e.innerText || e.textContent || e.getAttribute('aria-label') || ''
      ));

      if (confirm) {
        confirm.click();
        successCount++;
        actionsThisSession++;
        console.log('%c👋 Unfriended (' + successCount + ') — ' + key, 'color:#4CAF50;');
      } else {
        // Some UIs unfriend without a confirm step
        successCount++;
        actionsThisSession++;
        console.log('%c👋 Unfriended (no confirm) (' + successCount + ')', 'color:#4CAF50;');
      }

      // Cooldown
      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        console.log('%c[⏸ Cooldown] ' + COOLDOWN_SECONDS + 's', 'color:#FF9800;');
        await delay(COOLDOWN_SECONDS * 1000);
      }

      if (successCount >= DAILY_CAP) {
        console.log('%c[🛑 Daily cap reached]', 'color:#FF5722;font-weight:bold;');
        stopRequested = true;
        break;
      }

      await delay(UNFRIEND_DELAY);
    }
  }

  window.__FB_UNFRIEND_RUNNING__ = false;
  console.log('%c[Summary] ✅ ' + successCount + ' unfriended | ❌ ' + failCount + ' failed', 'color:#FFD700;font-weight:bold;');
  alert('FB Auto Unfriend finished.\\n✅ Unfriended: ' + successCount + '\\n❌ Failed: ' + failCount);
})();
})();`;
}

export function generateUnfriendUserscript(config: UnfollowConfig): string {
  const body = generateUnfriendScript(config)
    .replace(/^javascript:/, "")
    .replace(/^\(function\(\)\{/, "")
    .replace(/\}\)\(\);$/, "");

  return `// ==UserScript==
// @name         FB Auto Unfriend
// @namespace    https://github.com/Menelik2/FACEBOOK
// @version      1.3.1
// @description  Auto unfriend tool generated by FB Unfollow Studio
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/*/friends*
// @match        https://facebook.com/*/friends*
// @match        https://www.facebook.com/friends/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${body}
`;
}

export function generateUnfriendRaw(config: UnfollowConfig): string {
  return generateUnfriendScript(config).replace(/^javascript:/, "");
}
