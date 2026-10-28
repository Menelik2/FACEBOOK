import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";

export function generateScript(config: UnfollowConfig): string {
  const {
    INTERVAL_BETWEEN_ACTIONS,
    SHORT_FIXED_PAUSE,
    MAX_SCROLL_ATTEMPTS,
    DRY_RUN,
    RANDOM_JITTER,
    DAILY_CAP,
    COOLDOWN_EVERY_N,
    COOLDOWN_SECONDS,
    TARGET,
    THEME,
  } = config;

  const themeColors: Record<string, { primary: string }> = {
    neon: { primary: "#00FF7F" },
    minimal: { primary: "#1877F2" },
    retro: { primary: "#FF6B6B" },
  };
  const colors = themeColors[THEME] || themeColors.neon;
  const progressCode = getProgressUICode("FB Auto Unfollow", colors.primary);

  return `javascript:(function(){
if (window.__FB_UNFOLLOW_RUNNING__) { alert('FB Unfollow Studio is already running'); return; }
window.__FB_UNFOLLOW_RUNNING__ = true;

${progressCode}

(async function () {
  'use strict';
  console.log('%c[FB Unfollow v1.7] Started', 'color:#1877F2;font-weight:bold;');

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
        success: successCount, fail: failCount,
        total: successCount + failCount, status: status
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
    return new Promise(function (r) { setTimeout(r, actual); });
  };

  function norm(s) {
    return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function rawText(el) {
    if (!el) return '';
    var aria = el.getAttribute ? (el.getAttribute('aria-label') || el.getAttribute('title') || '') : '';
    return String(aria + ' ' + (el.innerText || el.textContent || '')).replace(/\s+/g, ' ').trim();
  }

  function textOf(el) { return norm(rawText(el)); }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    try {
      var r = el.getBoundingClientRect();
      return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < (window.innerHeight + 100);
    } catch (e) { return false; }
  }

  function isTargetMatch(url) {
    var path = String(url || '').toLowerCase();
    var isPage = /\/pages\/|\/pg\/|\/page\//.test(path);
    if (TARGET === 'pages') return isPage;
    if (TARGET === 'profiles') return !isPage;
    return true;
  }

  // EN + Amharic (and common variants). Amharic Facebook uses localized labels.
  function isFollowingBtn(el) {
    if (!el || !isVisible(el)) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    var t = textOf(el);
    var raw = rawText(el);
    // English
    if (/^(following|followed|liked|subscribed)\b/.test(t)) return true;
    if (/\bfollowing\b/.test(t) && !/unfollow|unlike/.test(t)) return true;
    if (/\bliked\b/.test(t) && !/unlike/.test(t)) return true;
    // Amharic — በመከተል ላይ (following), ተወዳጅ / ወድጄዋለሁ style likes
    if (/በመከተል/.test(raw)) return true;
    if (/ተወዳጅ|ወድጄ/.test(raw) && !/አትወድ|አታስወግድ/.test(raw)) return true;
    return false;
  }

  function isActionsBtn(el) {
    if (!el || !isVisible(el)) return false;
    var aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
    var t = norm(aria + ' ' + (el.innerText || ''));
    var raw = rawText(el);
    if (/\b(actions|more options|more)\b/.test(t)) return true;
    if (aria === '…' || aria === '...' || aria === '•••') return true;
    // Amharic "more" / options approximations
    if (/ተጨማሪ|አማራጮች|እርምጃዎች/.test(raw)) return true;
    // Icon-only three-dot often has empty/short label but contains svg circles
    if ((!aria || aria.length < 3) && el.querySelector && el.querySelector('svg circle, svg[viewBox]')) {
      var parentHasProfile = el.parentElement && el.parentElement.querySelector('a[href*="facebook.com"], a[href^="/"]');
      if (parentHasProfile) return true;
    }
    return false;
  }

  function isUnfollowItem(el) {
    if (!el || !isVisible(el)) return false;
    var t = textOf(el);
    var raw = rawText(el);
    if (/^(unfollow|unfollow page|unfollow person|unlike|unsubscribe)\b/.test(t)) return true;
    if (/^unfollow\b|^unlike\b/.test(t)) return true;
    // Amharic unfollow-ish
    if (/አትከተል|መከተልን አቁም|መከተል አቁም|አታስከተል|ከመከተል ውጣ/.test(raw)) return true;
    if (/unlike|አታስወድድ|አትውደድ/.test(raw)) return true;
    return false;
  }

  function isConfirmBtn(el) {
    if (!el || !isVisible(el)) return false;
    var t = textOf(el);
    var raw = rawText(el);
    if (/^(unfollow|confirm|remove|update|yes|ok)\b/.test(t)) return true;
    if (/አረጋግጥ|እሺ|አዎ|አዘምን|ሰርዝ/.test(raw)) return true;
    return false;
  }

  function clickEl(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } catch (e) {
      try { el.click(); } catch (e2) {}
    }
  }

  function closeMenus() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
  }

  // Diagnostic: log what the page actually shows
  function diagnose() {
    var btns = Array.from(document.querySelectorAll('[role="button"], button, [role="menuitem"]'))
      .filter(isVisible)
      .slice(0, 40)
      .map(function (el) {
        return {
          text: rawText(el).slice(0, 60),
          aria: (el.getAttribute && el.getAttribute('aria-label')) || '',
          tag: el.tagName
        };
      })
      .filter(function (b) { return b.text || b.aria; });
    console.log('%c[FB DIAG] URL: ' + location.href, 'color:#00B0FF');
    console.log('%c[FB DIAG] Visible controls (first 40):', 'color:#00B0FF', btns);
    var followCount = btns.filter(function (b) {
      var t = norm(b.text + ' ' + b.aria);
      return /follow|like|በመከተል|ተወዳጅ/.test(t);
    }).length;
    console.log('%c[FB DIAG] Possible follow-related: ' + followCount, 'color:#00B0FF');
    return btns;
  }

  function getCards() {
    var cards = [];
    var seen = new Set();

    function addCard(btn, viaActions) {
      var root = btn;
      for (var i = 0; i < 12 && root && root !== document.body; i++) {
        root = root.parentElement;
        if (!root) break;
        var link = root.querySelector('a[href*="facebook.com/"], a[href^="/"]');
        if (link && link.href) {
          var key = link.href.split('?')[0].split('#')[0];
          if (seen.has(key)) return;
          if (!isTargetMatch(key)) return;
          if (/\/(photo|photos|reel|reels|watch|groups|marketplace|events|stories)\b/i.test(key)) return;
          seen.add(key);
          cards.push({
            root: root,
            btn: btn,
            url: key,
            name: (link.innerText || link.getAttribute('aria-label') || key).trim().slice(0, 80),
            viaActions: !!viaActions
          });
          return;
        }
      }
    }

    Array.from(document.querySelectorAll('[role="button"], button, span[role="button"]'))
      .filter(isFollowingBtn)
      .forEach(function (btn) { addCard(btn, false); });

    if (cards.length === 0) {
      Array.from(document.querySelectorAll('div[aria-label][role="button"], div[role="button"][aria-label], button[aria-label]'))
        .filter(isActionsBtn)
        .forEach(function (btn) { addCard(btn, true); });
    }

    // Last resort: any row with a profile link + any button nearby
    if (cards.length === 0) {
      Array.from(document.querySelectorAll('a[href*="facebook.com/"], a[href^="/"]')).forEach(function (link) {
        if (!isVisible(link)) return;
        var key = (link.href || '').split('?')[0];
        if (!key || seen.has(key) || !isTargetMatch(key)) return;
        if (/\/(photo|reel|watch|groups|marketplace)\b/i.test(key)) return;
        var node = link;
        for (var d = 0; d < 8 && node; d++) {
          node = node.parentElement;
          if (!node) break;
          var btns = Array.from(node.querySelectorAll('[role="button"], button')).filter(isVisible);
          if (btns.length > 0) {
            seen.add(key);
            cards.push({
              root: node,
              btn: btns.find(isFollowingBtn) || btns.find(isActionsBtn) || btns[0],
              url: key,
              name: (link.innerText || '').trim().slice(0, 80),
              viaActions: !isFollowingBtn(btns[0])
            });
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
    await wait(450);

    // Path 1: Following / Liked
    if (card.btn && isFollowingBtn(card.btn)) {
      console.log('[FB] Click Following-type:', rawText(card.btn), '|', card.name);
      clickEl(card.btn);
      await wait(SHORT_FIXED_PAUSE + 500);

      var item = Array.from(document.querySelectorAll(
        '[role="menuitem"], [role="button"], div[role="button"], button, span[role="button"]'
      )).find(isUnfollowItem);

      if (!item) {
        await wait(700);
        item = Array.from(document.querySelectorAll(
          '[role="menuitem"], [role="button"], div[role="button"], button'
        )).find(isUnfollowItem);
      }

      if (item) {
        console.log('[FB] Click Unfollow item:', rawText(item));
        clickEl(item);
        await wait(SHORT_FIXED_PAUSE + 400);
        var conf = Array.from(document.querySelectorAll(
          '[role="dialog"] button, [role="dialog"] [role="button"], [role="alertdialog"] button, button'
        )).find(isConfirmBtn);
        if (conf) {
          console.log('[FB] Confirm:', rawText(conf));
          clickEl(conf);
          await wait(SHORT_FIXED_PAUSE);
        }
        await wait(600);
        return true;
      }
      console.warn('[FB] No Unfollow item after Following click. Menu texts:', 
        Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] [role="button"]'))
          .filter(isVisible).map(rawText).slice(0, 10));
      closeMenus();
      await wait(250);
    }

    // Path 2: Actions / More / ⋯
    var actionsBtn = (card.viaActions && card.btn) ? card.btn : null;
    if (!actionsBtn) {
      actionsBtn = Array.from(card.root.querySelectorAll(
        '[role="button"], button'
      )).find(isActionsBtn);
    }
    if (!actionsBtn && card.root.parentElement) {
      actionsBtn = Array.from(card.root.parentElement.querySelectorAll(
        '[role="button"], button'
      )).find(isActionsBtn);
    }

    if (actionsBtn) {
      console.log('[FB] Click Actions/More:', rawText(actionsBtn), '|', card.name);
      clickEl(actionsBtn);
      await wait(SHORT_FIXED_PAUSE + 600);

      var unf = Array.from(document.querySelectorAll(
        '[role="menuitem"], [role="button"], div[role="button"], button'
      )).find(isUnfollowItem);

      if (!unf) {
        await wait(700);
        unf = Array.from(document.querySelectorAll(
          '[role="menuitem"], [role="button"], div[role="button"], button'
        )).find(isUnfollowItem);
      }

      if (unf) {
        console.log('[FB] Click Unfollow from menu:', rawText(unf));
        clickEl(unf);
        await wait(SHORT_FIXED_PAUSE + 400);
        var conf2 = Array.from(document.querySelectorAll(
          '[role="dialog"] button, [role="dialog"] [role="button"], button'
        )).find(isConfirmBtn);
        if (conf2) {
          clickEl(conf2);
          await wait(SHORT_FIXED_PAUSE);
        }
        await wait(600);
        return true;
      }

      console.warn('[FB] Unfollow not in menu. Items:',
        Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] *'))
          .filter(isVisible).map(rawText).filter(Boolean).slice(0, 15));
      closeMenus();
      return false;
    }

    // Path 3: click whatever button is on the card and hope menu appears
    if (card.btn) {
      console.log('[FB] Fallback click card button:', rawText(card.btn));
      clickEl(card.btn);
      await wait(SHORT_FIXED_PAUSE + 600);
      var anyUnf = Array.from(document.querySelectorAll(
        '[role="menuitem"], [role="button"], button'
      )).find(isUnfollowItem);
      if (anyUnf) {
        clickEl(anyUnf);
        await wait(SHORT_FIXED_PAUSE + 400);
        return true;
      }
      closeMenus();
    }

    console.warn('[FB] Could not unfollow', card.name || card.url);
    return false;
  }

  // ---- Start ----
  diagnose();
  syncProgress('Scanning…');

  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('following') === -1 && path.indexOf('friends') === -1 && path.indexOf('likes') === -1) {
    console.warn('[FB] Tip: open Profile → Friends → Following (or /me/following)');
  }

  while (processActive) {
    var cards = getCards();
    console.log('[FB] Cards found:', cards.length);

    if (cards.length === 0) {
      emptyScrolls++;
      syncProgress('Scrolling… (' + emptyScrolls + '/' + MAX_SCROLL_ATTEMPTS + ')');
      if (emptyScrolls >= MAX_SCROLL_ATTEMPTS) {
        processActive = false;
        break;
      }
      window.scrollBy(0, Math.max(700, window.innerHeight * 0.9));
      await wait(2000);
      continue;
    }

    emptyScrolls = 0;
    var card = cards[0];
    processed.add(card.url);
    syncProgress('Processing: ' + (card.name || '').slice(0, 24));

    var ok = false;
    try {
      ok = await unfollowOne(card);
    } catch (err) {
      console.error('[FB] Error', err);
      closeMenus();
      ok = false;
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
// @version      1.7.0
// @description  Auto-unfollow EN+Amharic, diagnostic logs
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
