import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";

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
  const progressCode = getProgressUICode("FB Auto Unfriend", primary);

  return `javascript:(function(){
if (window.__FB_UNFRIEND_RUNNING__) {
  alert('FB Auto Unfriend is already running');
  return;
}
window.__FB_UNFRIEND_RUNNING__ = true;

${progressCode}

(async function smartUnfriendLoop() {
  'use strict';
  console.log('%c[Facebook Auto Unfriend Started]', 'color:${primary};font-weight:bold;');
  console.log('%cTo stop: window.facebookUnfriendStop() or click Stop on the progress bar', 'color:#FF9800;');

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
    if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.update({ status: 'Stopping…' });
  };

  if (window.__FB_PROGRESS__) {
    window.__FB_PROGRESS__.cap = DAILY_CAP;
    window.__FB_PROGRESS__.onStop(() => window.facebookUnfriendStop());
    window.__FB_PROGRESS__.update({ status: DRY_RUN ? 'Dry run mode' : 'Running…', cap: DAILY_CAP });
  }

  const delay = (ms) => {
    let actual = ms;
    if (RANDOM_JITTER) {
      const jitter = ms * 0.2 * (Math.random() * 2 - 1);
      actual = Math.max(150, Math.round(ms + jitter));
    }
    return new Promise((res) => setTimeout(res, actual));
  };

  const processed = new Set();
  let successCount = 0;
  let failCount = 0;
  let actionsThisSession = 0;
  let emptyScrolls = 0;
  const MAX_EMPTY_SCROLLS = 5;

  function getProfileKey(btn) {
    const row = btn.closest('[role="listitem"], [role="article"], div') || btn.parentElement;
    const link = row && row.querySelector('a[href*="facebook.com/"]');
    if (link && link.href) return link.href.split('?')[0];
    const text = (row && row.textContent || '').slice(0, 40).trim();
    return text || ('btn-' + Math.random().toString(36).slice(2));
  }

  function syncProgress(status) {
    if (window.__FB_PROGRESS__) {
      window.__FB_PROGRESS__.update({
        success: successCount,
        fail: failCount,
        total: successCount + failCount,
        status: status || undefined,
      });
    }
  }

  while (!stopRequested) {
    const buttons = [...document.querySelectorAll('div[aria-label="Friends"]')];
    const fresh = buttons.filter((btn) => {
      const key = getProfileKey(btn);
      return key && !processed.has(key);
    });

    if (fresh.length === 0) {
      emptyScrolls++;
      syncProgress('Scrolling for more… (' + emptyScrolls + '/' + MAX_EMPTY_SCROLLS + ')');
      window.scrollBy(0, SCROLL_AMOUNT);
      await delay(SCROLL_WAIT);
      const still = document.querySelectorAll('div[aria-label="Friends"]').length;
      if (still === 0 || emptyScrolls >= MAX_EMPTY_SCROLLS) {
        console.log('%c✅ Finished', 'color:#4CAF50;font-weight:bold;');
        break;
      }
      continue;
    }

    emptyScrolls = 0;

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
        syncProgress('Dry run: ' + key.slice(0, 40));
        continue;
      }

      try { btn.click(); } catch (e) {
        failCount++;
        syncProgress('Click failed');
        continue;
      }
      await delay(SHORT_PAUSE);

      const unfriend = Array.from(document.querySelectorAll('[role="menuitem"]'))
        .find((e) => /unfriend/i.test(e.innerText || e.textContent || ''));

      if (!unfriend) {
        failCount++;
        syncProgress('No Unfriend option');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await delay(200);
        continue;
      }

      unfriend.click();
      await delay(SHORT_PAUSE);

      const confirm = Array.from(
        document.querySelectorAll('[aria-label="Confirm"], div[role="button"], button')
      ).find((e) => /confirm/i.test(
        e.innerText || e.textContent || e.getAttribute('aria-label') || ''
      ));

      if (confirm) confirm.click();
      successCount++;
      actionsThisSession++;
      console.log('%c👋 Unfriended (' + successCount + ')', 'color:#4CAF50;');
      syncProgress('Unfriended ' + successCount);

      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        syncProgress('Cooldown ' + COOLDOWN_SECONDS + 's…');
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
  const summary = '✅ ' + successCount + ' unfriended | ❌ ' + failCount + ' failed';
  console.log('%c[Summary] ' + summary, 'color:#FFD700;font-weight:bold;');
  if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.done(summary);
  else alert('FB Auto Unfriend finished.\\n' + summary);
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
// @version      1.4.0
// @description  Auto unfriend with live progress bar
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
