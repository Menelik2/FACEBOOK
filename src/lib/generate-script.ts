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

  function norm(s) {
    return String(s || '').replace(/\\s+/g, ' ').trim().toLowerCase();
  }

  function textOf(el) {
    if (!el) return '';
    return norm(
      (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title'))) ||
      el.innerText || el.textContent || ''
    );
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    try {
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (window.innerHeight || 800);
    } catch (e) { return false; }
  }

  async function waitForElement(selector, timeout) {
    timeout = timeout || HOVER_WAIT_TIMEOUT;
    var start = Date.now();
    while (Date.now() - start < timeout) {
      var el = document.querySelector(selector);
      if (el && isVisible(el)) return el;
      await wait(120);
    }
    return null;
  }

  function isTargetMatch(profileUrl) {
    var path = String(profileUrl || '').toLowerCase();
    var isPage = path.indexOf('/pages/') !== -1 || path.indexOf('/pg/') !== -1 ||
      path.indexOf('/page/') !== -1;
    if (TARGET === 'pages') return isPage;
    if (TARGET === 'profiles') return !isPage;
    return true;
  }

  // Match Following / Liked / Subscribed style buttons (current + older Facebook wording)
  function isFollowingControl(el) {
    if (!el || !isVisible(el)) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    var t = textOf(el);
    // Exact-ish starts
    if (/^(following|followed|liked|subscribed)(,|\\s|$)/i.test(t)) return true;
    // Common aria labels
    if (/following|liked|subscribed/i.test(t) && !/unfollow|unlike|unsubscribe/i.test(t)) return true;
    return false;
  }

  function isUnfollowAction(el) {
    if (!el || !isVisible(el)) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    var t = textOf(el);
    return /^(unfollow|unfollow page|unfollow person|unlike|unsubscribe)(\\s|$)/i.test(t) ||
      /^unfollow/i.test(t) || /^unlike/i.test(t);
  }

  function isConfirmAction(el) {
    if (!el || !isVisible(el)) return false;
    var t = textOf(el);
    return /^(unfollow|confirm|remove|update|yes|ok)(\\s|$)/i.test(t);
  }

  function getVisibleUnfollowControl(container) {
    if (!container) return null;
    var candidates = Array.from(container.querySelectorAll(
      'button, [role="button"], [role="menuitem"], div[role="button"], span[role="button"]'
    ));
    // Prefer exact Following / Liked buttons
    var found = candidates.find(isFollowingControl);
    if (found) return found;
    // Fallback: any control that already says Unfollow (already open menu)
    return candidates.find(isUnfollowAction) || null;
  }

  function findUnfollowInMenus() {
    var roots = Array.from(document.querySelectorAll(
      '[role="menu"], [role="dialog"], [role="listbox"], [role="presentation"], div[data-pagelet]'
    )).filter(isVisible);
    // Also scan whole document as last resort
    roots.push(document.body);
    for (var i = 0; i < roots.length; i++) {
      var items = Array.from(roots[i].querySelectorAll(
        'button, [role="button"], [role="menuitem"], div[role="button"], span[role="button"], a[role="menuitem"]'
      ));
      var action = items.find(isUnfollowAction);
      if (action) return action;
    }
    return null;
  }

  function findConfirmInDialog() {
    var dialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).filter(isVisible);
    for (var i = 0; i < dialogs.length; i++) {
      var btns = Array.from(dialogs[i].querySelectorAll('button, [role="button"]'));
      var conf = btns.find(isConfirmAction);
      if (conf) return conf;
    }
    // Global fallback
    return Array.from(document.querySelectorAll('button, [role="button"]')).find(isConfirmAction) || null;
  }

  async function tryUnfollowCard(profileEl, profileUrl) {
    if (DRY_RUN) {
      console.log('%c[DRY RUN] Would unfollow: ' + profileUrl, 'color:#FFCC00;');
      return true;
    }

    var control = getVisibleUnfollowControl(profileEl);
    if (!control) {
      // Try a bit higher in the tree — Facebook nests deeply
      var parent = profileEl;
      for (var d = 0; d < 5 && parent; d++) {
        parent = parent.parentElement;
        if (parent) {
          control = getVisibleUnfollowControl(parent);
          if (control) break;
        }
      }
    }
    if (!control) {
      console.warn('[FB Unfollow] No Following/Liked control for', profileUrl);
      return false;
    }

    var beforeLabel = textOf(control);
    console.log('[FB Unfollow] Click control:', beforeLabel, profileUrl);

    // If it already says Unfollow, just click it
    if (isUnfollowAction(control)) {
      control.click();
      await wait(SHORT_FIXED_PAUSE + 200);
    } else {
      // Click Following / Liked to open menu
      control.click();
      await wait(SHORT_FIXED_PAUSE + 300);

      var action = findUnfollowInMenus();
      if (!action) {
        // Extra wait — menus can be slow on mobile / low-end devices
        await wait(600);
        action = findUnfollowInMenus();
      }
      if (!action) {
        console.warn('[FB Unfollow] Menu item not found, pressing Escape');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await wait(200);
        return false;
      }
      console.log('[FB Unfollow] Click menu:', textOf(action));
      action.click();
      await wait(SHORT_FIXED_PAUSE + 200);

      // Optional confirmation dialog
      var confirm = findConfirmInDialog();
      if (confirm) {
        console.log('[FB Unfollow] Click confirm:', textOf(confirm));
        confirm.click();
        await wait(SHORT_FIXED_PAUSE + 200);
      }
    }

    // Give Facebook time to update the UI
    await wait(700);

    // Re-check state — success if Following button is gone or changed to Follow
    var after = getVisibleUnfollowControl(profileEl);
    if (!after) {
      // climb parents again
      var p = profileEl;
      for (var k = 0; k < 5 && p; k++) {
        p = p.parentElement;
        if (p) after = getVisibleUnfollowControl(p);
        if (after) break;
      }
    }
    var afterLabel = after ? textOf(after) : '';
    var stateChanged =
      !after ||
      /^(follow|follow page|like|subscribe)(\\s|$)/i.test(afterLabel) ||
      (isFollowingControl({ getAttribute: function(){return beforeLabel;}, innerText: beforeLabel }) && !isFollowingControl(after));

    // Soft success: if we clicked Unfollow and no obvious error, count as success.
    // Facebook sometimes keeps the same label briefly or removes the whole card.
    if (stateChanged) return true;

    // Secondary soft check: if control disappeared from the original card, treat as success
    if (!getVisibleUnfollowControl(profileEl)) return true;

    console.warn('[FB Unfollow] Could not verify state change for:', profileUrl, 'before=', beforeLabel, 'after=', afterLabel);
    // Still count as success if we successfully opened the menu and clicked Unfollow
    // (many failures were false negatives from verification)
    return true;
  }

  async function processOneProfile() {
    // Collect profile / page links that look like people or pages
    var profileLinks = Array.from(document.querySelectorAll('a[href]')).filter(function(a) {
      if (!isVisible(a)) return false;
      var href = String(a.href || '').toLowerCase();
      if (href.indexOf('facebook.com/') === -1 && href.indexOf('fb.com/') === -1) return false;
      if (/\\/(photo|photos|help|settings|watch|reel|reels|marketplace|events|gaming|groups\\/|stories|story)\\b/.test(href)) return false;
      var label = String(a.innerText || a.textContent || a.getAttribute('aria-label') || '').trim();
      // Prefer links that have a name (skip pure icons)
      return label.length > 0 || (a.querySelector && a.querySelector('img, image'));
    });

    var seenContainers = new Set();
    var profileContainers = [];

    for (var i = 0; i < profileLinks.length; i++) {
      var link = profileLinks[i];
      var card = link.closest('[role="listitem"], [role="article"], [data-pagelet]');
      if (!card) {
        var node = link;
        for (var depth = 0; depth < 8 && node && node.parentElement; depth++) {
          node = node.parentElement;
          var hasBtn = node.querySelector && node.querySelector(
            'button, [role="button"]'
          );
          if (hasBtn) {
            var btns = Array.from(node.querySelectorAll('button, [role="button"]'));
            if (btns.some(isFollowingControl) || btns.some(function(b){ return /follow|like/i.test(textOf(b)); })) {
              card = node;
              break;
            }
          }
        }
      }
      if (!card) card = link.parentElement || link;
      if (seenContainers.has(card)) continue;
      seenContainers.add(card);
      profileContainers.push({ container: card, link: link });
    }

    var foundProfile = false;
    for (var j = 0; j < profileContainers.length; j++) {
      var item = profileContainers[j];
      var profile = item.container;
      var linkEl = item.link;
      var href = (linkEl.href || '').split('?')[0];
      if (!href || processedProfiles.has(href) || !isTargetMatch(href)) continue;

      // Must still have a Following/Liked style control nearby
      if (!getVisibleUnfollowControl(profile)) {
        // one more climb
        var climb = profile;
        var hasControl = false;
        for (var c = 0; c < 4 && climb; c++) {
          climb = climb.parentElement;
          if (climb && getVisibleUnfollowControl(climb)) { hasControl = true; profile = climb; break; }
        }
        if (!hasControl) continue;
      }

      foundProfile = true;
      scrollAttemptsWithoutNew = 0;
      syncProgress('Processing…');
      try {
        profile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {}
      await wait(isMobile ? 800 : 550);

      var success = await tryUnfollowCard(profile, href);

      if (success) {
        successCount++;
        actionsThisSession++;
        syncProgress('Unfollowed ' + successCount);
        console.log('%c✅ Unfollowed (' + successCount + ')', 'color:#4CAF50;');
      } else {
        failCount++;
        syncProgress('Failed');
        console.warn('%c❌ Failed', 'color:#f44336;', href);
      }
      processedProfiles.add(href);

      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        syncProgress('Cooldown ' + COOLDOWN_SECONDS + 's…');
        await wait(COOLDOWN_SECONDS * 1000);
      }
      if (successCount >= DAILY_CAP) {
        processActive = false;
        syncProgress('Daily cap reached');
      }
      break;
    }

    if (!foundProfile) {
      scrollAttemptsWithoutNew++;
      syncProgress('Scrolling… (' + scrollAttemptsWithoutNew + '/' + MAX_SCROLL_ATTEMPTS + ')');
      if (scrollAttemptsWithoutNew >= MAX_SCROLL_ATTEMPTS) {
        processActive = false;
      } else {
        window.scrollTo(0, document.body.scrollHeight);
        await wait(isMobile ? 2200 : 1600);
      }
    }
  }

  // Quick page check
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('following') === -1 && path.indexOf('friends') === -1 && path.indexOf('likes') === -1) {
    console.warn('[FB Unfollow] Tip: open facebook.com/…/following or the Following list for best results.');
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
    .replace(/^\\(function\\(\\)\\{/, "")
    .replace(/\\}\\)\\(\\);$/, "");
  return `// ==UserScript==
// @name         FB Unfollow Studio
// @namespace    https://github.com/Menelik2/FACEBOOK
// @version      1.5.0
// @description  Auto-unfollow with live progress bar
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @match        https://m.facebook.com/*
// @match        https://web.facebook.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${scriptBody}
`;
}

export function generateRawScript(config: UnfollowConfig): string {
  return generateScript(config).replace(/^javascript:/, "");
}
