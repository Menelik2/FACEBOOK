import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";

export function generateScript(config: UnfollowConfig): string {
  const {
    INTERVAL_BETWEEN_ACTIONS,
    SHORT_FIXED_PAUSE,
    HOVER_WAIT_TIMEOUT,
    MAX_SCROLL_ATTEMPTS,
    ALSO_UNLIKE_PAGES,
    DRY_RUN,
    RANDOM_JITTER,
    DAILY_CAP,
    COOLDOWN_EVERY_N,
    COOLDOWN_SECONDS,
    TARGET,
    THEME,
  } = config;

  const themeColors: Record<string, { primary: string; success: string; warn: string; info: string }> = {
    neon: { primary: "#00FF7F", success: "#00FF7F", warn: "#FFCC00", info: "#00B0FF" },
    minimal: { primary: "#1877F2", success: "#4CAF50", warn: "#FF9800", info: "#2196F3" },
    retro: { primary: "#FF6B6B", success: "#4ECDC4", warn: "#FFE66D", info: "#95E1D3" },
  };
  const colors = themeColors[THEME] || themeColors.neon;
  const progressCode = getProgressUICode("FB Auto Unfollow", colors.primary);

  return `javascript:(function(){
if (window.__FB_UNFOLLOW_RUNNING__) { alert('FB Unfollow Studio is already running'); return; }
window.__FB_UNFOLLOW_RUNNING__ = true;

${progressCode}

(async function () {
  'use strict';
  console.log('%c[Facebook Auto Unfollow Script Started]', 'color:#1877F2;font-weight:bold;');

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
  let successCount = 0;
  let failCount = 0;
  let scrollAttemptsWithoutNew = 0;
  let processActive = true;
  let actionsThisSession = 0;

  function syncProgress(status) {
    if (window.__FB_PROGRESS__) {
      window.__FB_PROGRESS__.update({
        success: successCount, fail: failCount,
        total: successCount + failCount, status: status
      });
    }
  }

  if (window.__FB_PROGRESS__) {
    window.__FB_PROGRESS__.cap = DAILY_CAP;
    window.__FB_PROGRESS__.onStop(function() { processActive = false; syncProgress('Stopping…'); });
    window.__FB_PROGRESS__.update({ status: DRY_RUN ? 'Dry run mode' : 'Running…', cap: DAILY_CAP });
  }

  const isMobile = (function() {
    var ua = navigator.userAgent || '';
    var host = window.location.hostname || '';
    return host.startsWith('m.') || host.indexOf('m.facebook') !== -1 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
      ('ontouchstart' in window && window.innerWidth < 900);
  })();

  const wait = function(ms) {
    var actual = ms;
    if (RANDOM_JITTER) {
      var jitter = ms * 0.2 * (Math.random() * 2 - 1);
      actual = Math.max(100, Math.round(ms + jitter));
    }
    return new Promise(function(resolve) { setTimeout(resolve, actual); });
  };

  async function waitForElement(selector, timeout) {
    timeout = timeout || HOVER_WAIT_TIMEOUT;
    var start = Date.now();
    while (Date.now() - start < timeout) {
      var el = document.querySelector(selector);
      if (el) return el;
      await wait(100);
    }
    return null;
  }

  function isTargetMatch(profileUrl) {
    if (TARGET === 'all') return true;
    if (TARGET === 'pages') return /\\/pages\\/|\\/pg\\//.test(profileUrl);
    if (TARGET === 'profiles') return !/\\/pages\\/|\\/pg\\//.test(profileUrl);
    return true;
  }

  function simulateTap(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    } catch (e) { el.click(); }
  }

  function getVisibleUnfollowControl(container) {
    var candidates = Array.from(container.querySelectorAll('button, [role="button"], [role="menuitem"]'));
    return candidates.find(function(el) {
      if (!el || !el.isConnected || el.getAttribute('aria-disabled') === 'true') return false;
      var label = ((el.getAttribute('aria-label') || '') + ' ' + (el.innerText || el.textContent || '')).trim();
      return /^(Following|Followed|Liked|Subscribed|Following,.*|Liked,.*)$/i.test(label) ||
        /^(Unfollow|Unfollow Page|Unlike)$/i.test(label);
    });
  }

  async function tryUnfollowMobile(profileEl, profileUrl) {
    return tryUnfollowCard(profileEl, profileUrl);
  }

  async function tryUnfollowDesktop(profileEl, profileUrl) {
    return tryUnfollowCard(profileEl, profileUrl);
  }

  async function tryUnfollowCard(profileEl, profileUrl) {
    if (DRY_RUN) return true;
    var control = getVisibleUnfollowControl(profileEl);
    if (!control) return false;

    var beforeLabel = ((control.getAttribute('aria-label') || '') + ' ' + (control.innerText || control.textContent || '')).trim();
    if (/^(Unfollow|Unfollow Page|Unlike)$/i.test(beforeLabel)) {
      control.click();
      await wait(SHORT_FIXED_PAUSE);
    } else {
      control.click();
      await wait(SHORT_FIXED_PAUSE);

      var menuItems = Array.from(document.querySelectorAll('[role="menuitem"], [role="button"], button, [role="dialog"] *'))
        .filter(function(el) {
          if (!el || !el.isConnected) return false;
          var label = ((el.getAttribute('aria-label') || '') + ' ' + (el.innerText || el.textContent || '')).trim();
          return /^(Unfollow|Unfollow Page|Unlike)$/i.test(label);
        });
      var action = menuItems.find(function(el) {
        return el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null;
      });
      if (!action) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return false;
      }
      action.click();
      await wait(SHORT_FIXED_PAUSE);

      var confirm = Array.from(document.querySelectorAll('[role="dialog"] button, [role="dialog"] [role="button"], button, [role="button"]'))
        .find(function(el) {
          var label = ((el.getAttribute('aria-label') || '') + ' ' + (el.innerText || el.textContent || '')).trim();
          return /^(Unfollow|Confirm|Remove|Update)$/i.test(label) &&
            el.getAttribute('aria-disabled') !== 'true' && el.offsetParent !== null;
        });
      if (confirm) {
        confirm.click();
        await wait(SHORT_FIXED_PAUSE);
      }
    }

    await wait(500);
    var after = getVisibleUnfollowControl(profileEl);
    var afterLabel = after ? ((after.getAttribute('aria-label') || '') + ' ' + (after.innerText || after.textContent || '')).trim() : '';
    var stateChanged = !after || /^(Follow|Follow Page|Like|Subscribe)$/i.test(afterLabel) ||
      (/^(Unfollow|Unfollow Page|Unlike)$/i.test(beforeLabel) && !after);
    if (stateChanged) return true;

    console.warn('[FB Unfollow] Could not verify state change for:', profileUrl);
    return false;
  }

  async function processOneProfile() {
    var selectors = isMobile
      ? ['div[role="article"]', 'div[role="listitem"]']
      : ['div.x78zum5.x1q0g3np.x1a02dak.x1qughib > div', 'div[data-pagelet="ProfileAppSection_0"] div[role="article"]', 'div.x1n2onr6 > div'];
    var profileContainers = [];
    for (var s = 0; s < selectors.length; s++) {
      var found = document.querySelectorAll(selectors[s]);
      if (found.length > 0) { profileContainers = Array.from(found); break; }
    }
    if (profileContainers.length === 0) {
      var profileLinks = Array.from(document.querySelectorAll('a[href*="facebook.com/"]')).filter(function(a) {
        var href = a.href || '';
        return href.indexOf('facebook.com/') !== -1 &&
          href.indexOf('/photo') === -1 &&
          href.indexOf('/help') === -1 &&
          href.indexOf('/settings') === -1;
      });
      var seenContainers = new Set();
      profileContainers = profileLinks.map(function(link) {
        return link.closest('div[role="article"], div[role="listitem"]') ||
          link.parentElement && (link.parentElement.parentElement || link.parentElement) || link;
      }).filter(function(container) {
        if (seenContainers.has(container)) return false;
        seenContainers.add(container);
        return true;
      });
    }
    var foundProfile = false;
    for (var i = 0; i < profileContainers.length; i++) {
      var profile = profileContainers[i];
      var link = profile.tagName === 'A' ? profile : profile.querySelector('a[href*="facebook.com/"]');
      if (!link) continue;
      var href = link.href;
      if (processedProfiles.has(href) || !isTargetMatch(href)) continue;
      foundProfile = true;
      scrollAttemptsWithoutNew = 0;
      syncProgress('Processing…');
      profile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(isMobile ? 700 : 500);
      var success = false;
      if (isMobile) {
        success = await tryUnfollowMobile(profile, href);
      } else {
        link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
        var hoverContainer = await waitForElement('div[aria-label="Link preview"], div[role="dialog"]', HOVER_WAIT_TIMEOUT);
        if (hoverContainer) {
          success = await tryUnfollowDesktop(hoverContainer, href);
          var closeBtn = document.querySelector('div[role="button"][aria-label="Close"]');
          if (closeBtn) closeBtn.click();
        } else {
          success = await tryUnfollowDesktop(profile, href);
        }
      }
      if (success) { successCount++; actionsThisSession++; syncProgress('Unfollowed ' + successCount); }
      else { failCount++; syncProgress('Failed'); }
      processedProfiles.add(href);
      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        syncProgress('Cooldown ' + COOLDOWN_SECONDS + 's…');
        await wait(COOLDOWN_SECONDS * 1000);
      }
      if (successCount >= DAILY_CAP) { processActive = false; syncProgress('Daily cap reached'); }
      break;
    }
    if (!foundProfile) {
      scrollAttemptsWithoutNew++;
      syncProgress('Scrolling… (' + scrollAttemptsWithoutNew + '/' + MAX_SCROLL_ATTEMPTS + ')');
      if (scrollAttemptsWithoutNew >= MAX_SCROLL_ATTEMPTS) processActive = false;
      else { window.scrollTo(0, document.body.scrollHeight); await wait(isMobile ? 2000 : 1500); }
    }
  }

  while (processActive) {
    await processOneProfile();
    if (processActive) await wait(INTERVAL_BETWEEN_ACTIONS);
  }

  window.__FB_UNFOLLOW_RUNNING__ = false;
  var summary = '✅ ' + successCount + ' success | ❌ ' + failCount + ' failed';
  console.log('%c[Summary] ' + summary, 'color:#FFD700;font-weight:bold;');
  if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.done(summary);
  else alert('FB Unfollow Studio finished.\\n' + summary);
})();
})();`;
}

export function generateUserscript(config: UnfollowConfig): string {
  const scriptBody = generateScript(config)
    .replace(/^javascript:/, "")
    .replace(/^\(function\(\)\{/, "")
    .replace(/\}\)\(\);$/, "");
  return `// ==UserScript==
// @name         FB Unfollow Studio
// @namespace    https://github.com/Menelik2/FACEBOOK
// @version      1.4.0
// @description  Auto-unfollow with live progress bar
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @match        https://m.facebook.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${scriptBody}
`;
}

export function generateRawScript(config: UnfollowConfig): string {
  return generateScript(config).replace(/^javascript:/, "");
}
