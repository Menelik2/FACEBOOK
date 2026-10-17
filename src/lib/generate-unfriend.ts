import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";
import { getDesktopOnlyGuard } from "./desktop-guard";
import { getAdvancedRuntimeCode } from "./advanced-runtime";

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
    WHITELIST,
    BLACKLIST,
    USE_BLACKLIST_ONLY,
    AUTO_STOP_ON_RATE_LIMIT,
    SOUND_ON_FINISH,
    SKIP_VERIFIED,
    LOG_ACTIONS,
  } = config;

  const themeColors: Record<string, string> = {
    neon: "#00FF7F",
    minimal: "#1877F2",
    retro: "#FF6B6B",
  };
  const primary = themeColors[THEME] || themeColors.neon;
  const progressCode = getProgressUICode("FB Auto Unfriend", primary);
  const desktopGuard = getDesktopOnlyGuard();
  const advancedCode = getAdvancedRuntimeCode({
    whitelist: WHITELIST || "",
    blacklist: BLACKLIST || "",
    useBlacklistOnly: !!USE_BLACKLIST_ONLY,
    autoStopOnRateLimit: AUTO_STOP_ON_RATE_LIMIT !== false,
    soundOnFinish: !!SOUND_ON_FINISH,
    skipVerified: !!SKIP_VERIFIED,
    logActions: LOG_ACTIONS !== false,
  });

  return `javascript:(function(){
if (window.__FB_UNFRIEND_RUNNING__) {
  alert('FB Auto Unfriend is already running');
  return;
}
window.__FB_UNFRIEND_RUNNING__ = true;

${desktopGuard}
${progressCode}
${advancedCode}

(async function smartUnfriendLoop() {
  'use strict';
  console.log('%c[Facebook Auto Unfriend — Advanced]', 'color:${primary};font-weight:bold;');

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
  if (window.__FB_ADV__) window.__FB_ADV__.wirePauseButton();

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

  function getRowText(btn) {
    var row = btn.closest('[role="listitem"], [role="article"], div') || btn.parentElement;
    return (row && row.textContent) || '';
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
    if (window.__FB_ADV__) await window.__FB_ADV__.waitWhilePaused();
    if (window.__FB_ADV__ && window.__FB_ADV__.detectRateLimit()) {
      console.warn('[🛑] Rate limit / security check detected — auto-stopping');
      syncProgress('Rate limit detected — stopped');
      stopRequested = true;
      break;
    }

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
      if (window.__FB_ADV__) await window.__FB_ADV__.waitWhilePaused();

      var btn = fresh[i];
      var key = getProfileKey(btn);
      var rowText = getRowText(btn);
      processed.add(key);

      if (window.__FB_ADV__ && window.__FB_ADV__.shouldSkipTarget(key + ' ' + rowText)) {
        if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'skip-whitelist', target: key, ok: true });
        syncProgress('Skipped (filter)');
        continue;
      }
      if (window.__FB_ADV__ && window.__FB_ADV__.looksVerified(btn.closest('[role="listitem"], [role="article"]') || btn.parentElement)) {
        if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'skip-verified', target: key, ok: true });
        syncProgress('Skipped verified');
        continue;
      }

      btn.scrollIntoView({ block: 'center' });
      await delay(300);

      if (DRY_RUN) {
        successCount++; actionsThisSession++;
        if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'dry-unfriend', target: key, ok: true });
        syncProgress('Dry run: ' + key.slice(0, 40));
        continue;
      }

      try { btn.click(); } catch (e) {
        failCount++;
        if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'unfriend', target: key, ok: false });
        syncProgress('Click failed');
        continue;
      }
      await delay(SHORT_PAUSE);

      var unfriend = Array.from(document.querySelectorAll('[role="menuitem"]'))
        .find(function(e) { return /unfriend/i.test(e.innerText || e.textContent || ''); });

      if (!unfriend) {
        failCount++;
        if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'unfriend', target: key, ok: false });
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
      if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'unfriend', target: key, ok: true });
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
// @version      1.6.0
// @description  Advanced desktop unfriend with filters & progress
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
