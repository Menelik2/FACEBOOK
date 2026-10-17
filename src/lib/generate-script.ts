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

  async function tryUnfollowMobile(profileEl, profileUrl) {
    if (DRY_RUN) return true;
    var followingBtn =
      profileEl.querySelector('[aria-label="Following"], [aria-label="Liked"]') ||
      Array.from(profileEl.querySelectorAll('div[role="button"]')).find(function(el) {
        return /^(Following|Liked)$/i.test((el.textContent || '').trim());
      });
    if (followingBtn) {
      simulateTap(followingBtn);
      await wait(SHORT_FIXED_PAUSE + 400);
      var unfollowEl = Array.from(document.querySelectorAll('[role="menuitem"], [role="button"]')).find(function(el) {
        return /unfollow/i.test(el.textContent || '');
      });
      if (unfollowEl) {
        simulateTap(unfollowEl);
        await wait(600);
        var confirmBtn = Array.from(document.querySelectorAll('[role="button"], button')).find(function(el) {
          return /^(Unfollow|Confirm|Update|OK)$/i.test((el.textContent || '').trim());
        });
        if (confirmBtn) { simulateTap(confirmBtn); await wait(500); }
        return true;
      }
    }
    return false;
  }

  async function tryUnfollowDesktop(hoverContainer, profileUrl) {
    if (DRY_RUN) return true;
    var threeDotBtn =
      !(hoverContainer.querySelector('div[role="button"][aria-label="Following"]') ||
        hoverContainer.querySelector('div[role="button"][aria-label="Liked"]')) &&
      Array.from(hoverContainer.querySelectorAll('div[role="none"], div[role="button"]')).find(function(el) {
        return el.querySelector('svg circle[cx="12"][cy="12"]') || (el.innerHTML || '').indexOf('⋯') !== -1;
      });
    if (threeDotBtn) {
      threeDotBtn.click();
      await wait(800);
      var unfollowMenu = Array.from(document.querySelectorAll('div[role="menuitem"], div[role="none"]')).find(function(el) {
        return el.textContent && el.textContent.indexOf('Following') !== -1;
      });
      if (unfollowMenu) {
        unfollowMenu.click();
        await wait(700);
        var dialog = await waitForElement('div[role="dialog"]', 4000);
        if (dialog) {
          var unfollowRadio = Array.from(dialog.querySelectorAll('div[role="radio"]')).find(function(el) {
            return el.textContent && el.textContent.indexOf('Unfollow') !== -1;
          });
          if (unfollowRadio) { unfollowRadio.click(); await wait(300); }
          if (ALSO_UNLIKE_PAGES) {
            var unlikeButton = Array.from(document.querySelectorAll('div[role="button"], input[role="switch"]')).find(function(el) {
              return (el.textContent && el.textContent.indexOf('Unlike this Page') !== -1) || el.getAttribute('aria-label') === 'Unlike';
            });
            if (unlikeButton) { unlikeButton.click(); await wait(400); }
          }
          var updateBtn = Array.from(dialog.querySelectorAll('div[role="button"], button')).find(function(el) {
            return el.textContent && el.textContent.trim() === 'Update';
          });
          if (updateBtn) { updateBtn.click(); await wait(800); return true; }
        }
      }
    }
    var directBtn = hoverContainer.querySelector('div[role="button"][aria-label="Unfollow"]');
    if (directBtn) { directBtn.click(); return true; }
    var followingBtn =
      hoverContainer.querySelector('div[role="button"][aria-label="Following"]') ||
      hoverContainer.querySelector('div[role="button"][aria-label="Liked"]') ||
      hoverContainer.querySelector('div[role="button"][aria-label="Favorites"]');
    if (followingBtn) {
      followingBtn.click();
      await wait(SHORT_FIXED_PAUSE);
      var dialog2 = await waitForElement('div[role="dialog"]', 6000);
      if (!dialog2) return false;
      var unfollowRadio2 = Array.from(dialog2.querySelectorAll('div[role="radio"]')).find(function(el) {
        return el.textContent && el.textContent.indexOf('Unfollow') !== -1;
      });
      if (unfollowRadio2) { unfollowRadio2.click(); await wait(400); }
      if (ALSO_UNLIKE_PAGES) {
        var unlikeButton2 = Array.from(document.querySelectorAll('div[role="button"], input[role="switch"]')).find(function(el) {
          return (el.textContent && el.textContent.indexOf('Unlike this Page') !== -1) || el.getAttribute('aria-label') === 'Unlike';
        });
        if (unlikeButton2) { unlikeButton2.click(); await wait(400); }
      }
      var updateBtn2 = Array.from(dialog2.querySelectorAll('div[role="button"], button')).find(function(el) {
        return el.textContent && el.textContent.trim() === 'Update';
      });
      if (updateBtn2) { updateBtn2.click(); await wait(800); return true; }
    }
    var optionsBtn = hoverContainer.querySelector('div[role="button"][aria-label*="Options"]');
    if (optionsBtn) {
      optionsBtn.click();
      await wait(SHORT_FIXED_PAUSE);
      var unfollowMenu2 = Array.from(document.querySelectorAll('div[role="menuitem"]')).find(function(el) {
        return el.textContent && el.textContent.indexOf('Unfollow') !== -1;
      });
      if (unfollowMenu2) { unfollowMenu2.click(); return true; }
    }
    return false;
  }

  async function processOneProfile() {
    var selectors = isMobile
      ? ['div[data-pagelet] a[href*="facebook.com/"]', 'div[role="article"]', 'div.x1n2onr6']
      : ['div.x78zum5.x1q0g3np.x1a02dak.x1qughib > div', 'div[data-pagelet="ProfileAppSection_0"] div[role="article"]', 'div.x1n2onr6 > div'];
    var profileContainers = [];
    for (var s = 0; s < selectors.length; s++) {
      var found = document.querySelectorAll(selectors[s]);
      if (found.length > 0) { profileContainers = Array.from(found); break; }
    }
    if (profileContainers.length === 0) {
      profileContainers = Array.from(document.querySelectorAll('a[href*="facebook.com/"]')).filter(function(a) {
        var href = a.href || '';
        return href.indexOf('facebook.com/') !== -1 && href.indexOf('/photo') === -1;
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
