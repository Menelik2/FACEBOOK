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
  console.log('%c[FB Unfollow v1.8] Started', 'color:#1877F2;font-weight:bold;');

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
  let running = true;
  let actionsThisSession = 0;

  function sync(status) {
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
      running = false;
      sync('Stopping…');
    });
    window.__FB_PROGRESS__.update({ status: DRY_RUN ? 'Dry run' : 'Running…', cap: DAILY_CAP });
  }

  function sleep(ms) {
    var t = ms;
    if (RANDOM_JITTER) t = Math.max(100, Math.round(ms + ms * 0.2 * (Math.random() * 2 - 1)));
    return new Promise(function (r) { setTimeout(r, t); });
  }

  function visible(el) {
    if (!el || !el.isConnected) return false;
    try {
      var r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight + 120;
    } catch (e) { return false; }
  }

  function label(el) {
    if (!el) return '';
    return String(
      (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) +
      ' ' +
      (el.innerText || el.textContent || '')
    ).replace(/\s+/g, ' ').trim();
  }

  function low(el) { return label(el).toLowerCase(); }

  function isFollowing(el) {
    if (!el || !visible(el)) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    var t = low(el);
    var r = label(el);
    if (t.indexOf('unfollow') !== -1 || t.indexOf('unlike') !== -1) return false;
    if (t.indexOf('following') !== -1 || t.indexOf('followed') !== -1) return true;
    if (t === 'liked' || t.indexOf('liked') === 0 || t.indexOf('subscribed') === 0) return true;
    if (r.indexOf('በመከተል') !== -1) return true;
    if ((r.indexOf('ተወዳጅ') !== -1 || r.indexOf('ወድጄ') !== -1) && r.indexOf('አት') === -1) return true;
    return false;
  }

  function isActions(el) {
    if (!el || !visible(el)) return false;
    var a = (el.getAttribute && el.getAttribute('aria-label')) || '';
    var t = (a + ' ' + (el.innerText || '')).toLowerCase();
    if (t.indexOf('actions') !== -1 || t.indexOf('more options') !== -1) return true;
    if (t === 'more' || a === 'More' || a === '…' || a === '...' || a === '•••') return true;
    if (/ተጨማሪ|አማራጮች|እርምጃዎች/.test(a + (el.innerText || ''))) return true;
    return false;
  }

  function isUnfollow(el) {
    if (!el || !visible(el)) return false;
    var t = low(el);
    var r = label(el);
    if (t.indexOf('unfollow') !== -1) return true;
    if (t === 'unlike' || t.indexOf('unlike') === 0) return true;
    if (t.indexOf('unsubscribe') !== -1) return true;
    if (/አትከተል|መከተልን አቁም|መከተል አቁም|አታስከተል|ከመከተል/.test(r)) return true;
    return false;
  }

  function isConfirm(el) {
    if (!el || !visible(el)) return false;
    var t = low(el);
    var r = label(el);
    if (t === 'unfollow' || t === 'confirm' || t === 'update' || t === 'remove' || t === 'yes' || t === 'ok') return true;
    if (t.indexOf('confirm') === 0 || t.indexOf('update') === 0) return true;
    if (/አረጋግጥ|እሺ|አዎ|አዘምን/.test(r)) return true;
    return false;
  }

  function click(el) {
    if (!el) return;
    try {
      el.focus && el.focus();
      ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(function (type) {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      });
    } catch (e) {
      try { el.click(); } catch (e2) {}
    }
  }

  function esc() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
  }

  function targetOk(url) {
    var p = String(url || '').toLowerCase();
    var page = p.indexOf('/pages/') !== -1 || p.indexOf('/pg/') !== -1;
    if (TARGET === 'pages') return page;
    if (TARGET === 'profiles') return !page;
    return true;
  }

  function findUnfollowInPage() {
    var nodes = document.querySelectorAll('[role="menuitem"], [role="button"], div[role="button"], button, span[role="button"]');
    for (var i = 0; i < nodes.length; i++) {
      if (isUnfollow(nodes[i])) return nodes[i];
    }
    return null;
  }

  function findConfirmInPage() {
    var nodes = document.querySelectorAll('[role="dialog"] button, [role="dialog"] [role="button"], [role="alertdialog"] button, button, [role="button"]');
    for (var i = 0; i < nodes.length; i++) {
      if (isConfirm(nodes[i])) return nodes[i];
    }
    return null;
  }

  // Collect unfollow targets — PRIMARY: Actions/More (current FB), SECONDARY: Following btn
  function getTargets() {
    var out = [];
    var seen = new Set();

    function attach(btn, kind) {
      var node = btn;
      for (var d = 0; d < 12 && node && node !== document.body; d++) {
        node = node.parentElement;
        if (!node) break;
        var link = node.querySelector('a[href*="facebook.com/"], a[href^="/"]');
        if (!link || !link.href) continue;
        var key = link.href.split('?')[0].split('#')[0];
        if (seen.has(key) || processed.has(key)) return;
        if (!targetOk(key)) return;
        if (/\/(photo|photos|reel|reels|watch|groups\/|marketplace|events|stories)\b/i.test(key)) return;
        seen.add(key);
        out.push({
          root: node,
          btn: btn,
          url: key,
          name: (link.innerText || link.getAttribute('aria-label') || '').trim().slice(0, 60),
          kind: kind
        });
        return;
      }
    }

    // A) 3-dot Actions / More — most reliable on 2025–2026 Following list
    Array.from(document.querySelectorAll('div[aria-label][role="button"], div[role="button"][aria-label], button[aria-label]'))
      .filter(isActions)
      .forEach(function (b) { attach(b, 'actions'); });

    // B) Following / Liked buttons
    Array.from(document.querySelectorAll('[role="button"], button'))
      .filter(isFollowing)
      .forEach(function (b) { attach(b, 'following'); });

    // C) Fallback: profile rows with any button
    if (out.length === 0) {
      Array.from(document.querySelectorAll('a[href*="facebook.com/"], a[href^="/"]')).forEach(function (link) {
        if (!visible(link)) return;
        var key = (link.href || '').split('?')[0];
        if (!key || seen.has(key) || processed.has(key) || !targetOk(key)) return;
        if (/\/(photo|reel|watch|groups|marketplace)\b/i.test(key)) return;
        var node = link;
        for (var d = 0; d < 9 && node; d++) {
          node = node.parentElement;
          if (!node) break;
          var btns = Array.from(node.querySelectorAll('[role="button"], button')).filter(visible);
          if (!btns.length) continue;
          var prefer = btns.find(isFollowing) || btns.find(isActions) || btns[btns.length - 1];
          seen.add(key);
          out.push({
            root: node,
            btn: prefer,
            url: key,
            name: (link.innerText || '').trim().slice(0, 60),
            kind: isFollowing(prefer) ? 'following' : (isActions(prefer) ? 'actions' : 'any')
          });
          break;
        }
      });
    }

    return out;
  }

  async function doUnfollow(card) {
    if (DRY_RUN) {
      console.log('%c[DRY RUN]', 'color:#FFCC00;', card.name || card.url);
      return true;
    }

    try {
      card.root.scrollIntoView({ block: 'center', behavior: 'instant' });
    } catch (e) {
      try { card.root.scrollIntoView({ block: 'center' }); } catch (e2) {}
    }
    await sleep(400);

    // --- Path: Actions / More first when available ---
    var actionsBtn = card.kind === 'actions' ? card.btn : null;
    if (!actionsBtn) {
      actionsBtn = Array.from(card.root.querySelectorAll('[role="button"], button')).find(isActions);
    }
    if (!actionsBtn && card.root.parentElement) {
      actionsBtn = Array.from(card.root.parentElement.querySelectorAll('[role="button"], button')).find(isActions);
    }

    if (actionsBtn) {
      console.log('[FB] Actions menu →', card.name || card.url);
      click(actionsBtn);
      await sleep(SHORT_FIXED_PAUSE + 500);

      var unf = findUnfollowInPage();
      if (!unf) { await sleep(600); unf = findUnfollowInPage(); }

      if (unf) {
        console.log('[FB] Unfollow →', label(unf));
        click(unf);
        await sleep(SHORT_FIXED_PAUSE + 350);
        var conf = findConfirmInPage();
        if (conf) { click(conf); await sleep(SHORT_FIXED_PAUSE); }
        await sleep(500);
        return true;
      }

      console.warn('[FB] No Unfollow in Actions menu. Items:',
        Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] [role="button"]'))
          .filter(visible).map(label).slice(0, 12));
      esc();
      await sleep(200);
    }

    // --- Path: Following / Liked button ---
    var followBtn = isFollowing(card.btn) ? card.btn : Array.from(card.root.querySelectorAll('[role="button"], button')).find(isFollowing);
    if (followBtn) {
      console.log('[FB] Following btn →', card.name || card.url, label(followBtn));
      click(followBtn);
      await sleep(SHORT_FIXED_PAUSE + 500);

      var unf2 = findUnfollowInPage();
      if (!unf2) { await sleep(600); unf2 = findUnfollowInPage(); }

      if (unf2) {
        console.log('[FB] Unfollow →', label(unf2));
        click(unf2);
        await sleep(SHORT_FIXED_PAUSE + 350);
        var conf2 = findConfirmInPage();
        if (conf2) { click(conf2); await sleep(SHORT_FIXED_PAUSE); }
        await sleep(500);
        return true;
      }

      console.warn('[FB] No Unfollow after Following click');
      esc();
      await sleep(200);
    }

    // --- Last resort: click card button ---
    if (card.btn) {
      console.log('[FB] Fallback click →', label(card.btn));
      click(card.btn);
      await sleep(SHORT_FIXED_PAUSE + 600);
      var unf3 = findUnfollowInPage();
      if (unf3) {
        click(unf3);
        await sleep(SHORT_FIXED_PAUSE + 350);
        var conf3 = findConfirmInPage();
        if (conf3) click(conf3);
        await sleep(500);
        return true;
      }
      esc();
    }

    return false;
  }

  // Startup diagnostics
  (function diag() {
    console.log('[FB] URL:', location.href);
    var sample = Array.from(document.querySelectorAll('[role="button"], button'))
      .filter(visible)
      .slice(0, 25)
      .map(function (el) { return label(el).slice(0, 50); })
      .filter(Boolean);
    console.log('[FB] Sample buttons:', sample);
    console.log('[FB] Actions-like:', sample.filter(function (s) {
      var x = s.toLowerCase();
      return x.indexOf('action') !== -1 || x.indexOf('more') !== -1;
    }));
    console.log('[FB] Following-like:', sample.filter(function (s) {
      var x = s.toLowerCase();
      return x.indexOf('following') !== -1 || x.indexOf('liked') !== -1 || s.indexOf('በመከተል') !== -1;
    }));
  })();

  if ((location.pathname || '').toLowerCase().indexOf('following') === -1 &&
      (location.pathname || '').toLowerCase().indexOf('friends') === -1) {
    console.warn('[FB] Open: https://www.facebook.com/me/following');
  }

  while (running) {
    var targets = getTargets();
    console.log('[FB] Targets:', targets.length);

    if (!targets.length) {
      emptyScrolls++;
      sync('Scrolling… ' + emptyScrolls + '/' + MAX_SCROLL_ATTEMPTS);
      if (emptyScrolls >= MAX_SCROLL_ATTEMPTS) break;
      window.scrollBy(0, Math.max(800, Math.floor(innerHeight * 0.9)));
      await sleep(2000);
      continue;
    }

    emptyScrolls = 0;

    // Process last visible first (bottom-up) — more stable when FB removes rows
    var card = targets[targets.length - 1];
    processed.add(card.url);
    sync('Working: ' + (card.name || 'account').slice(0, 22));

    var ok = false;
    try {
      ok = await doUnfollow(card);
    } catch (err) {
      console.error('[FB]', err);
      esc();
      ok = false;
    }

    if (ok) {
      successCount++;
      actionsThisSession++;
      sync('Unfollowed ' + successCount);
      console.log('%c✅ ' + successCount + ' ' + (card.name || card.url), 'color:#4CAF50');
    } else {
      failCount++;
      sync('Failed');
      console.warn('%c❌ ' + (card.name || card.url), 'color:#f44336');
    }

    if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
      sync('Cooldown ' + COOLDOWN_SECONDS + 's');
      await sleep(COOLDOWN_SECONDS * 1000);
    }
    if (successCount >= DAILY_CAP) {
      running = false;
      sync('Daily cap');
      break;
    }

    await sleep(INTERVAL_BETWEEN_ACTIONS);
  }

  window.__FB_UNFOLLOW_RUNNING__ = false;
  var summary = '✅ ' + successCount + ' success | ❌ ' + failCount + ' failed';
  console.log('%c[Done] ' + summary, 'color:#FFD700;font-weight:bold');
  if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.done(summary);
  else alert('FB Unfollow finished\n' + summary);
})();
})();`;
}

export function generateUserscript(config: UnfollowConfig): string {
  const body = generateScript(config)
    .replace(/^javascript:/, "")
    .replace(/^\(function\(\)\{/, "")
    .replace(/\}\)\(\);$/, "");
  return `// ==UserScript==
// @name         FB Unfollow Studio
// @namespace    https://github.com/Menelik2/FACEBOOK
// @version      1.8.0
// @description  Auto-unfollow (Actions menu + Following btn, EN/Amharic)
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @match        https://m.facebook.com/*
// @match        https://web.facebook.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${body}
`;
}

export function generateRawScript(config: UnfollowConfig): string {
  return generateScript(config).replace(/^javascript:/, "");
}
