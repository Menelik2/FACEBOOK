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

  // NOTE: Inside the template we must emit valid JS regexes.
  // In a TS template literal, \\ becomes \ in the output string.
  return `javascript:(function(){
if (window.__FB_UNFOLLOW_RUNNING__) { alert('FB Unfollow Studio is already running'); return; }
window.__FB_UNFOLLOW_RUNNING__ = true;

${progressCode}

(async function () {
  'use strict';
  console.log('%c[Facebook Auto Unfollow v1.6] Started', 'color:#1877F2;font-weight:bold;');

  const INTERVAL_BETWEEN_ACTIONS = ${INTERVAL_BETWEEN_ACTIONS};
  const SHORT_FIXED_PAUSE = ${SHORT_FIXED_PAUSE};
  const MAX_SCROLL_ATTEMPTS = ${MAX_SCROLL_ATTEMPTS};
  const DRY_RUN = ${DRY_RUN};
  const RANDOM_JITTER = ${RANDOM_JITTER};
  const DAILY_CAP = ${DAILY_CAP};
  const COOLDOWN_EVERY_N = ${COOLDOWN_EVERY_N};
  const COOLDOWN_SECONDS = ${COOLDOWN_SECONDS};
  const TARGET = '${TARGET}';

  let processed = new Set();
  let successCount = 0;
  let failCount = 0;
  let emptyScrolls = 0;
  let processActive = true;
  let actionsThisSession = 0;

  function syncProgress(status) {
    if (window.__FB_PROGRESS__) {
      window.__FB_PROGRESS__.update({
        success: successCount,
        fail: failCount,
        total: successCount + failCount,
        status: status
      });
    }
  }

  if (window.__FB_PROGRESS__) {
    window.__FB_PROGRESS__.cap = DAILY_CAP;
    window.__FB_PROGRESS__.onStop(function () {
      processActive = false;
      syncProgress('Stopping…');
    });
    window.__FB_PROGRESS__.update({ status: DRY_RUN ? 'Dry run mode' : 'Running…', cap: DAILY_CAP });
  }

  const wait = function (ms) {
    var actual = ms;
    if (RANDOM_JITTER) {
      var jitter = ms * 0.25 * (Math.random() * 2 - 1);
      actual = Math.max(120, Math.round(ms + jitter));
    }
    return new Promise(function (resolve) { setTimeout(resolve, actual); });
  };

  function norm(s) {
    return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function textOf(el) {
    if (!el) return '';
    var aria = el.getAttribute ? (el.getAttribute('aria-label') || el.getAttribute('title') || '') : '';
    var txt = el.innerText || el.textContent || '';
    return norm(aria + ' ' + txt);
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    try {
      var r = el.getBoundingClientRect();
      return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < (window.innerHeight + 80);
    } catch (e) { return false; }
  }

  function isTargetMatch(url) {
    var path = String(url || '').toLowerCase();
    var isPage = /\/pages\/|\/pg\/|\/page\//.test(path);
    if (TARGET === 'pages') return isPage;
    if (TARGET === 'profiles') return !isPage;
    return true;
  }

  // ---- Button matchers (current Facebook wording) ----
  function isFollowingBtn(el) {
    if (!el || !isVisible(el)) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    var t = textOf(el);
    // "Following", "Liked", "Subscribed", "Following, …"
    if (/^(following|followed|liked|subscribed)\b/.test(t)) return true;
    if (/\bfollowing\b/.test(t) && !/unfollow|unlike/.test(t)) return true;
    if (/\bliked\b/.test(t) && !/unlike/.test(t)) return true;
    return false;
  }

  function isActionsBtn(el) {
    if (!el || !isVisible(el)) return false;
    var aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
    var t = norm(aria + ' ' + (el.innerText || ''));
    return /\b(actions|more options|more)\b/.test(t) || aria === '…' || aria === '...';
  }

  function isUnfollowItem(el) {
    if (!el || !isVisible(el)) return false;
    var t = textOf(el);
    return /^(unfollow|unfollow page|unfollow person|unlike|unsubscribe)\b/.test(t) ||
      /^unfollow\b/.test(t) || /^unlike\b/.test(t);
  }

  function isConfirmBtn(el) {
    if (!el || !isVisible(el)) return false;
    var t = textOf(el);
    return /^(unfollow|confirm|remove|update|yes|ok)\b/.test(t);
  }

  function clickEl(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } catch (e) {
      try { el.click(); } catch (e2) {}
    }
  }

  function closeMenus() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
  }

  // ---- Find cards on the Following list ----
  function getCards() {
    var cards = [];
    var seen = new Set();

    // Strategy A: buttons that say Following / Liked
    var followBtns = Array.from(document.querySelectorAll(
      'div[role="button"], button, span[role="button"], [role="button"]'
    )).filter(isFollowingBtn);

    followBtns.forEach(function (btn) {
      var root = btn;
      for (var i = 0; i < 10 && root && root !== document.body; i++) {
        root = root.parentElement;
        if (!root) break;
        var link = root.querySelector('a[href*="facebook.com/"], a[href^="/"]');
        if (link && link.href) {
          var key = link.href.split('?')[0];
          if (!seen.has(key) && isTargetMatch(key)) {
            seen.add(key);
            cards.push({ root: root, btn: btn, url: key, name: (link.innerText || link.getAttribute('aria-label') || key).trim() });
          }
          break;
        }
      }
    });

    // Strategy B: 3-dot / Actions menus (newer Facebook UI)
    if (cards.length === 0) {
      var actionBtns = Array.from(document.querySelectorAll(
        'div[aria-label][role="button"], div[role="button"][aria-label], button[aria-label]'
      )).filter(isActionsBtn);

      actionBtns.forEach(function (btn) {
        var root = btn;
        for (var i = 0; i < 10 && root && root !== document.body; i++) {
          root = root.parentElement;
          if (!root) break;
          var link = root.querySelector('a[href*="facebook.com/"], a[href^="/"]');
          if (link && link.href) {
            var key = link.href.split('?')[0];
            if (!seen.has(key) && isTargetMatch(key) &&
                !/\/(photo|reel|watch|groups|marketplace|events)\b/.test(key)) {
              seen.add(key);
              cards.push({ root: root, btn: btn, url: key, name: (link.innerText || '').trim(), viaActions: true });
            }
            break;
          }
        }
      });
    }

    return cards.filter(function (c) { return !processed.has(c.url); });
  }

  async function unfollowOne(card) {
    if (DRY_RUN) {
      console.log('%c[DRY RUN]', 'color:#FFCC00;', card.name || card.url);
      return true;
    }

    try {
      card.root.scrollIntoView({ block: 'center', behavior: 'instant' });
    } catch (e) {
      try { card.root.scrollIntoView({ block: 'center' }); } catch (e2) {}
    }
    await wait(400);

    // Path 1: direct Following / Liked button
    if (!card.viaActions && card.btn && isFollowingBtn(card.btn)) {
      console.log('[FB] Click Following/Liked:', card.name);
      clickEl(card.btn);
      await wait(SHORT_FIXED_PAUSE + 400);

      // Look for Unfollow in any open menu / dialog
      var item = Array.from(document.querySelectorAll(
        '[role="menuitem"], [role="button"], div[role="button"], span[role="button"], button'
      )).find(isUnfollowItem);

      if (!item) {
        await wait(500);
        item = Array.from(document.querySelectorAll(
          '[role="menuitem"], [role="button"], div[role="button"], button'
        )).find(isUnfollowItem);
      }

      if (item) {
        console.log('[FB] Click Unfollow item');
        clickEl(item);
        await wait(SHORT_FIXED_PAUSE + 300);

        var conf = Array.from(document.querySelectorAll(
          '[role="dialog"] button, [role="dialog"] [role="button"], [role="alertdialog"] button, button'
        )).find(isConfirmBtn);
        if (conf) {
          clickEl(conf);
          await wait(SHORT_FIXED_PAUSE);
        }
        await wait(500);
        return true;
      }

      // Menu did not open — try Escape and fall through to Actions path
      closeMenus();
      await wait(200);
    }

    // Path 2: 3-dot Actions / More menu (very common in 2025–2026 UI)
    var actionsBtn = card.viaActions ? card.btn : null;
    if (!actionsBtn) {
      actionsBtn = Array.from(card.root.querySelectorAll(
        'div[aria-label][role="button"], div[role="button"][aria-label], button[aria-label]'
      )).find(isActionsBtn);
    }
    // Also search slightly higher
    if (!actionsBtn && card.root.parentElement) {
      actionsBtn = Array.from(card.root.parentElement.querySelectorAll(
        'div[aria-label][role="button"], div[role="button"][aria-label]'
      )).find(isActionsBtn);
    }

    if (actionsBtn) {
      console.log('[FB] Click Actions/More:', card.name);
      clickEl(actionsBtn);
      await wait(SHORT_FIXED_PAUSE + 500);

      var unf = Array.from(document.querySelectorAll(
        '[role="menuitem"], div[role="menuitem"], [role="button"], div[role="button"]'
      )).find(isUnfollowItem);

      if (!unf) {
        await wait(600);
        unf = Array.from(document.querySelectorAll(
          '[role="menuitem"], [role="button"], div[role="button"]'
        )).find(isUnfollowItem);
      }

      if (unf) {
        console.log('[FB] Click Unfollow from menu');
        clickEl(unf);
        await wait(SHORT_FIXED_PAUSE + 300);

        var conf2 = Array.from(document.querySelectorAll(
          '[role="dialog"] button, [role="dialog"] [role="button"], button'
        )).find(isConfirmBtn);
        if (conf2) {
          clickEl(conf2);
          await wait(SHORT_FIXED_PAUSE);
        }
        await wait(500);
        return true;
      }

      console.warn('[FB] Unfollow option not in menu');
      closeMenus();
      return false;
    }

    console.warn('[FB] No Following button and no Actions menu for', card.name || card.url);
    return false;
  }

  // ---- Main loop ----
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('following') === -1 && path.indexOf('friends') === -1) {
    console.warn('[FB] Open your Following list: Profile → Friends → Following');
    syncProgress('Open Following list first');
  }

  while (processActive) {
    var cards = getCards();
    console.log('[FB] Visible cards:', cards.length);

    if (cards.length === 0) {
      emptyScrolls++;
      syncProgress('Scrolling… (' + emptyScrolls + '/' + MAX_SCROLL_ATTEMPTS + ')');
      if (emptyScrolls >= MAX_SCROLL_ATTEMPTS) {
        processActive = false;
        break;
      }
      window.scrollBy(0, Math.max(600, window.innerHeight * 0.85));
      await wait(1800);
      continue;
    }

    emptyScrolls = 0;
    var card = cards[0];
    processed.add(card.url);
    syncProgress('Processing: ' + (card.name || '').slice(0, 28));

    var ok = false;
    try {
      ok = await unfollowOne(card);
    } catch (err) {
      console.error('[FB] Error:', err);
      ok = false;
      closeMenus();
    }

    if (ok) {
      successCount++;
      actionsThisSession++;
      syncProgress('Unfollowed ' + successCount);
      console.log('%c✅ ' + successCount + ' — ' + (card.name || card.url), 'color:#4CAF50;');
    } else {
      failCount++;
      syncProgress('Failed');
      console.warn('%c❌ Failed — ' + (card.name || card.url), 'color:#f44336;');
    }

    if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
      syncProgress('Cooldown ' + COOLDOWN_SECONDS + 's…');
      await wait(COOLDOWN_SECONDS * 1000);
    }
    if (successCount >= DAILY_CAP) {
      processActive = false;
      syncProgress('Daily cap reached');
      break;
    }

    await wait(INTERVAL_BETWEEN_ACTIONS);
  }

  window.__FB_UNFOLLOW_RUNNING__ = false;
  var summary = '✅ ' + successCount + ' success | ❌ ' + failCount + ' failed';
  console.log('%c[Summary] ' + summary, 'color:#FFD700;font-weight:bold;');
  if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.done(summary);
  else alert('FB Unfollow Studio finished.\n' + summary);
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
// @version      1.6.0
// @description  Auto-unfollow with live progress bar (2026 Facebook UI)
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
