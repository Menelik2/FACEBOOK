import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";
import { getDesktopOnlyGuard } from "./desktop-guard";

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
  const desktopGuard = getDesktopOnlyGuard();

  return `javascript:(function(){
if (window.__FB_UNFRIEND_RUNNING__) {
  alert('FB Auto Unfriend is already running');
  return;
}
window.__FB_UNFRIEND_RUNNING__ = true;

${desktopGuard}
${progressCode}

(async function smartUnfriendLoop() {
  'use strict';
  console.log('%c[Facebook Auto Unfriend Started — Desktop]', 'color:${primary};font-weight:bold;');
  console.log('%cTo stop: window.facebookUnfriendStop() or progress panel Stop', 'color:#FF9800;');

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
  window.facebookUnfriendStop = function() {
    stopRequested = true;
    if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.update({ status: 'Stopping…' });
  };

  if (window.__FB_PROGRESS__) {
    window.__FB_PROGRESS__.cap = DAILY_CAP;
    window.__FB_PROGRESS__.onStop(function() { window.facebookUnfriendStop(); });
    window.__FB_PROGRESS__.update({ status: DRY_RUN ? 'Dry run mode' : 'Running…', cap: DAILY_CAP });
  }

  const delay = function(ms) {
    var actual = ms;
    if (RANDOM_JITTER) {
      var jitter = ms * 0.2 * (Math.random() * 2 - 1);
      actual = Math.max(150, Math.round(ms + jitter));
    }
    return new Promise(function(res) { setTimeout(res, actual); });
  };

  const processed = new Set();
  let successCount = 0;
  let failCount = 0;
  let actionsThisSession = 0;
  let emptyScrolls = 0;
  const MAX_EMPTY_SCROLLS = 5;

  function getProfileKey(btn) {
    var row = btn.closest('[role="listitem"], [role="article"], div') || btn.parentElement;
    var link = row && row.querySelector('a[href*="facebook.com/"]');
    if (link && link.href) return link.href.split('?')[0];
    var text = (row && row.textContent || '').slice(0, 40).trim();
    return text || ('btn-' + Math.random().toString(36).slice(2));
  }

  function syncProgress(status) {
    if (window.__FB_PROGRESS__) {
      window.__FB_PROGRESS__.update({
        success: successCount, fail: failCount,
        total: successCount + failCount, status: status
      });
    }
  }

  while (!stopRequested) {
    var buttons = [].slice.call(document.querySelectorAll('div[aria-label="Friends"]'));
    var fresh = buttons.filter(function(btn) {
      var key = getProfileKey(btn);
      return key && !processed.has(key);
    });

    if (fresh.length === 0) {
      emptyScrolls++;
      syncProgress('Scrolling… (' + emptyScrolls + '/' + MAX_EMPTY_SCROLLS + ')');
      window.scrollBy(0, SCROLL_AMOUNT);
      await delay(SCROLL_WAIT);
      if (document.querySelectorAll('div[aria-label="Friends"]').length === 0 || emptyScrolls >= MAX_EMPTY_SCROLLS) break;
      continue;
    }
    emptyScrolls = 0;

    for (var i = 0; i < fresh.length; i++) {
      if (stopRequested) break;
      var btn = fresh[i];
      var key = getProfileKey(btn);
      processed.add(key);
      btn.scrollIntoView({ block: 'center' });
      await delay(300);

      if (DRY_RUN) {
        successCount++; actionsThisSession++;
        syncProgress('Dry run: ' + key.slice(0, 40));
        continue;
      }

      try { btn.click(); } catch (e) { failCount++; syncProgress('Click failed'); continue; }
      await delay(SHORT_PAUSE);

      var unfriend = Array.from(document.querySelectorAll('[role="menuitem"]'))
        .find(function(e) { return /unfriend/i.test(e.innerText || e.textContent || ''); });

      if (!unfriend) {
        failCount++;
        syncProgress('No Unfriend option');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await delay(200);
        continue;
      }

      unfriend.click();
      await delay(SHORT_PAUSE);

      var confirm = Array.from(document.querySelectorAll('[aria-label="Confirm"], div[role="button"], button'))
        .find(function(e) {
          return /confirm/i.test(e.innerText || e.textContent || e.getAttribute('aria-label') || '');
        });
      if (confirm) confirm.click();
      successCount++; actionsThisSession++;
      syncProgress('Unfriended ' + successCount);

      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        syncProgress('Cooldown ' + COOLDOWN_SECONDS + 's…');
        await delay(COOLDOWN_SECONDS * 1000);
      }
      if (successCount >= DAILY_CAP) { stopRequested = true; break; }
      await delay(UNFRIEND_DELAY);
    }
  }

  window.__FB_UNFRIEND_RUNNING__ = false;
  var summary = '✅ ' + successCount + ' unfriended | ❌ ' + failCount + ' failed';
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
// @version      1.5.0
// @description  Desktop-only auto unfriend with progress bar
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/*/friends*
// @match        https://facebook.com/*/friends*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${body}
`;
}

export function generateUnfriendRaw(config: UnfollowConfig): string {
  return generateUnfriendScript(config).replace(/^javascript:/, "");
}
