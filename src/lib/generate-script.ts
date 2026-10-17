import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";
import { getDesktopOnlyGuard } from "./desktop-guard";

export function generateScript(config: UnfollowConfig): string {
  const {
    INTERVAL_BETWEEN_ACTIONS, SHORT_FIXED_PAUSE, HOVER_WAIT_TIMEOUT, MAX_SCROLL_ATTEMPTS,
    ALSO_UNLIKE_PAGES, DRY_RUN, RANDOM_JITTER, DAILY_CAP, COOLDOWN_EVERY_N, COOLDOWN_SECONDS,
    TARGET, THEME,
  } = config;

  const themeColors: Record<string, { primary: string }> = {
    neon: { primary: "#00FF7F" },
    minimal: { primary: "#1877F2" },
    retro: { primary: "#FF6B6B" },
  };
  const colors = themeColors[THEME] || themeColors.neon;
  const progressCode = getProgressUICode("FB Auto Unfollow", colors.primary);
  const desktopGuard = getDesktopOnlyGuard();

  return `javascript:(function(){
if (window.__FB_UNFOLLOW_RUNNING__) { alert('Already running'); return; }
window.__FB_UNFOLLOW_RUNNING__ = true;
${desktopGuard}
${progressCode}
(async function () {
  'use strict';
  const INTERVAL_BETWEEN_ACTIONS = ${INTERVAL_BETWEEN_ACTIONS};
  const SHORT_FIXED_PAUSE = ${SHORT_FIXED_PAUSE};
  const HOVER_WAIT_TIMEOUT = ${HOVER_WAIT_TIMEOUT};
  const MAX_SCROLL_ATTEMPTS = ${MAX_SCROLL_ATTEMPTS};
  const ALSO_UNLIKE_PAGES = ${ALSO_UNLIKE_PAGES};
  const DRY_RUN = ${DRY_RUN};
  const RANDOM_JITTER = ${RANDOM_JITTER};
  const DAILY_CAP = ${DAILY_CAP};
  const COOLDOWN_EVERY_N = ${COOLDOWN_EVERY_N};
  const COOLDOWN_SECONDS = ${COOLDOWN_SECONDS};
  const TARGET = '${TARGET}';
  let processedProfiles = new Set();
  let successCount = 0, failCount = 0, scrollAttemptsWithoutNew = 0, processActive = true, actionsThisSession = 0;
  function syncProgress(status) {
    if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.update({ success: successCount, fail: failCount, total: successCount + failCount, status: status });
  }
  if (window.__FB_PROGRESS__) {
    window.__FB_PROGRESS__.cap = DAILY_CAP;
    window.__FB_PROGRESS__.onStop(function() { processActive = false; syncProgress('Stopping…'); });
    window.__FB_PROGRESS__.update({ status: DRY_RUN ? 'Dry run' : 'Running…', cap: DAILY_CAP });
  }
  const wait = function(ms) {
    var a = ms;
    if (RANDOM_JITTER) a = Math.max(100, Math.round(ms + ms * 0.2 * (Math.random() * 2 - 1)));
    return new Promise(function(r) { setTimeout(r, a); });
  };
  async function waitForElement(sel, timeout) {
    timeout = timeout || HOVER_WAIT_TIMEOUT;
    var start = Date.now();
    while (Date.now() - start < timeout) {
      var el = document.querySelector(sel);
      if (el) return el;
      await wait(100);
    }
    return null;
  }
  function isTargetMatch(url) {
    if (TARGET === 'all') return true;
    if (TARGET === 'pages') return /\\/pages\\/|\\/pg\\//.test(url);
    return !/\\/pages\\/|\\/pg\\//.test(url);
  }
  async function tryUnfollowDesktop(box, url) {
    if (DRY_RUN) return true;
    var following = box.querySelector('div[role="button"][aria-label="Following"], div[role="button"][aria-label="Liked"], div[role="button"][aria-label="Favorites"]');
    if (following) {
      following.click();
      await wait(SHORT_FIXED_PAUSE);
      var dialog = await waitForElement('div[role="dialog"]', 6000);
      if (!dialog) return false;
      var radio = Array.from(dialog.querySelectorAll('div[role="radio"]')).find(function(el) { return (el.textContent || '').indexOf('Unfollow') !== -1; });
      if (radio) { radio.click(); await wait(400); }
      if (ALSO_UNLIKE_PAGES) {
        var unlike = Array.from(document.querySelectorAll('div[role="button"], input[role="switch"]')).find(function(el) {
          return (el.textContent || '').indexOf('Unlike this Page') !== -1 || el.getAttribute('aria-label') === 'Unlike';
        });
        if (unlike) { unlike.click(); await wait(400); }
      }
      var update = Array.from(dialog.querySelectorAll('div[role="button"], button')).find(function(el) { return (el.textContent || '').trim() === 'Update'; });
      if (update) { update.click(); await wait(800); return true; }
    }
    var direct = box.querySelector('div[role="button"][aria-label="Unfollow"]');
    if (direct) { direct.click(); return true; }
    return false;
  }
  async function processOneProfile() {
    var containers = Array.from(document.querySelectorAll('div.x78zum5.x1q0g3np.x1a02dak.x1qughib > div, div[data-pagelet="ProfileAppSection_0"] div[role="article"], div.x1n2onr6 > div'));
    if (!containers.length) {
      containers = Array.from(document.querySelectorAll('a[href*="facebook.com/"]')).filter(function(a) {
        return (a.href || '').indexOf('/photo') === -1 && (a.href || '').indexOf('/video') === -1;
      });
    }
    var found = false;
    for (var i = 0; i < containers.length; i++) {
      var profile = containers[i];
      var link = profile.tagName === 'A' ? profile : profile.querySelector('a[href*="facebook.com/"]');
      if (!link || processedProfiles.has(link.href) || !isTargetMatch(link.href)) continue;
      found = true;
      scrollAttemptsWithoutNew = 0;
      syncProgress('Processing…');
      profile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(500);
      link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
      var hover = await waitForElement('div[aria-label="Link preview"], div[role="dialog"]', HOVER_WAIT_TIMEOUT);
      var ok = hover ? await tryUnfollowDesktop(hover, link.href) : await tryUnfollowDesktop(profile, link.href);
      if (hover) {
        var closeBtn = document.querySelector('div[role="button"][aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      }
      if (ok) { successCount++; actionsThisSession++; syncProgress('Unfollowed ' + successCount); }
      else { failCount++; syncProgress('Failed'); }
      processedProfiles.add(link.href);
      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        syncProgress('Cooldown…');
        await wait(COOLDOWN_SECONDS * 1000);
      }
      if (successCount >= DAILY_CAP) { processActive = false; syncProgress('Daily cap'); }
      break;
    }
    if (!found) {
      scrollAttemptsWithoutNew++;
      syncProgress('Scrolling… (' + scrollAttemptsWithoutNew + '/' + MAX_SCROLL_ATTEMPTS + ')');
      if (scrollAttemptsWithoutNew >= MAX_SCROLL_ATTEMPTS) processActive = false;
      else { window.scrollTo(0, document.body.scrollHeight); await wait(1500); }
    }
  }
  while (processActive) {
    await processOneProfile();
    if (processActive) await wait(INTERVAL_BETWEEN_ACTIONS);
  }
  window.__FB_UNFOLLOW_RUNNING__ = false;
  var summary = '✅ ' + successCount + ' | ❌ ' + failCount;
  if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.done(summary);
  else alert(summary);
})();
})();`;
}

export function generateUserscript(config: UnfollowConfig): string {
  const body = generateScript(config).replace(/^javascript:/, "").replace(/^\(function\(\)\{/, "").replace(/\}\)\(\);$/, "");
  return `// ==UserScript==
// @name         FB Unfollow Studio
// @namespace    https://github.com/Menelik2/FACEBOOK
// @version      1.5.0
// @description  Desktop-only unfollow with progress bar
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${body}
`;
}

export function generateRawScript(config: UnfollowConfig): string {
  return generateScript(config).replace(/^javascript:/, "");
}
