import { UnfollowConfig } from "./types";
import { getProgressUICode } from "./progress-ui";
import { getDesktopOnlyGuard } from "./desktop-guard";
import { getAdvancedRuntimeCode } from "./advanced-runtime";

export function generateLeaveGroupsScript(config: UnfollowConfig): string {
  const {
    MAX_PER_MINUTE,
    BASE_DELAY,
    JITTER,
    SCROLL_DISTANCE,
    SCROLL_DELAY_ON_EMPTY,
    DRY_RUN,
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
  const progressCode = getProgressUICode("FB Leave Groups", primary);
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
if (window._facebookAutoLeaveRunning) {
  alert('Facebook Auto Leave Groups is already running');
  return;
}
window._facebookAutoLeaveRunning = true;

${desktopGuard}
${progressCode}
${advancedCode}

(function facebookAutoLeave(defaults) {
  defaults = defaults || {};
  var options = Object.assign({
    maxPerMinute: ${MAX_PER_MINUTE},
    baseDelay: ${BASE_DELAY},
    jitter: ${JITTER},
    scrollDistance: ${SCROLL_DISTANCE},
    scrollDelayOnEmpty: ${SCROLL_DELAY_ON_EMPTY},
    dryRun: ${DRY_RUN},
    verbose: true
  }, defaults);

  var stopRequested = false;
  window.facebookAutoLeaveStop = function() {
    stopRequested = true;
    if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.update({ status: 'Stopping…' });
  };

  if (window.__FB_PROGRESS__) {
    window.__FB_PROGRESS__.onStop(function() { window.facebookAutoLeaveStop(); });
    window.__FB_PROGRESS__.update({ status: options.dryRun ? 'Dry run mode' : 'Running…', cap: options.maxPerMinute * 5 });
  }
  if (window.__FB_ADV__) window.__FB_ADV__.wirePauseButton();

  console.log('%c[Facebook Auto Leave Groups — Advanced]', 'color:${primary};font-weight:bold;');

  var delay = function(ms) { return new Promise(function(res) { setTimeout(res, ms); }); };
  var rand = function(n) { return Math.floor(Math.random() * n); };
  var humanDelay = async function() {
    var jitter = Math.floor((Math.random() * 2 - 1) * options.jitter);
    await delay(Math.max(250, options.baseDelay + jitter));
  };

  var actionTimestamps = [];
  function canDoAction() {
    var now = Date.now();
    while (actionTimestamps.length && now - actionTimestamps[0] > 60000) actionTimestamps.shift();
    return actionTimestamps.length < options.maxPerMinute;
  }
  function recordAction() { actionTimestamps.push(Date.now()); }

  var processed = new WeakSet();
  var successCount = 0;
  var failCount = 0;

  function syncProgress(status) {
    if (window.__FB_PROGRESS__) {
      window.__FB_PROGRESS__.update({
        success: successCount, fail: failCount,
        total: successCount + failCount, status: status
      });
    }
  }

  function findMoreButtons() {
    var byAria = [].slice.call(document.querySelectorAll('[aria-label="More"], [aria-label="More options"], div[aria-label*="More"]'));
    var byRoleBtn = [].slice.call(document.querySelectorAll('div[role="button"], a[role="button"]'));
    return Array.from(new Set(byAria.concat(byRoleBtn).filter(function(el) {
      return !!el.closest('[role="listitem"], [role="article"], [data-visualcompletion]');
    })));
  }

  async function openMenuFor(btn) {
    try {
      btn.scrollIntoView({ block: 'center' });
      await delay(200 + rand(300));
      btn.click();
      await delay(350 + rand(400));
      return true;
    } catch (e) { return false; }
  }

  function findLeaveButtonsInMenu() {
    return [].slice.call(document.querySelectorAll('button, [role="menuitem"], [role="button"], a')).filter(function(n) {
      return (n.textContent || '').toLowerCase().trim().indexOf('leave group') !== -1;
    });
  }

  async function clickIfVisible(el) {
    if (!el) return false;
    try {
      el.scrollIntoView({ block: 'center' });
      await delay(120 + rand(250));
      el.click();
      return true;
    } catch (e) {
      try { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); return true; }
      catch (_) { return false; }
    }
  }

  async function processOne(btn) {
    if (processed.has(btn)) return false;
    processed.add(btn);

    if (window.__FB_ADV__) await window.__FB_ADV__.waitWhilePaused();
    if (window.__FB_ADV__ && window.__FB_ADV__.detectRateLimit()) {
      stopRequested = true;
      syncProgress('Rate limit — stopped');
      return true;
    }

    var rowText = (btn.closest('[role="listitem"], [role="article"]') || btn).textContent || '';
    if (window.__FB_ADV__ && window.__FB_ADV__.shouldSkipTarget(rowText)) {
      if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'skip', target: rowText.slice(0, 40), ok: true });
      syncProgress('Skipped (filter)');
      return false;
    }

    if (!canDoAction()) {
      var waitMs = 8000 + rand(6000);
      syncProgress('Rate limit — waiting');
      await delay(waitMs);
    }
    if (stopRequested) return true;
    if (options.dryRun) {
      successCount++; recordAction();
      if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'dry-leave', target: rowText.slice(0, 40), ok: true });
      syncProgress('Dry run leave');
      return true;
    }
    if (!(await openMenuFor(btn))) { failCount++; syncProgress('Menu failed'); return false; }
    await delay(250 + rand(300));
    var leaveCandidates = findLeaveButtonsInMenu();
    if (!leaveCandidates.length) {
      failCount++; syncProgress('No Leave Group button');
      return false;
    }
    await clickIfVisible(leaveCandidates[0]);
    await delay(500 + rand(500));
    var dialog = await new Promise(function(res) {
      var start = Date.now();
      (function check() {
        var d = document.querySelector('div[role="dialog"]');
        if (d) res(d);
        else if (Date.now() - start > 5000) res(null);
        else requestAnimationFrame(check);
      })();
    });
    if (dialog) {
      var leaveDialogBtn = [].slice.call(dialog.querySelectorAll('div[role="button"], button')).find(function(b) {
        return /leave group/i.test(b.innerText || b.textContent || '');
      });
      if (leaveDialogBtn) {
        await clickIfVisible(leaveDialogBtn);
        await delay(800 + rand(500));
      }
    }
    recordAction();
    successCount++;
    if (window.__FB_ADV__) window.__FB_ADV__.logAction({ action: 'leave', target: rowText.slice(0, 40), ok: true });
    syncProgress('Left group #' + successCount);
    await delay(900 + rand(900));
    return true;
  }

  async function mainLoop() {
    try {
      while (!stopRequested) {
        if (window.__FB_ADV__) await window.__FB_ADV__.waitWhilePaused();
        var candidates = findMoreButtons().filter(function(b) { return !processed.has(b); });
        if (!candidates.length) {
          window.scrollBy({ top: options.scrollDistance, behavior: 'smooth' });
          syncProgress('Scrolling…');
          await delay(options.scrollDelayOnEmpty + rand(2000));
          candidates = findMoreButtons().filter(function(b) { return !processed.has(b); });
          if (!candidates.length && !findMoreButtons().length) break;
        }
        var batch = candidates.slice(0, Math.max(1, Math.floor(options.maxPerMinute / 3)));
        for (var i = 0; i < batch.length; i++) {
          if (stopRequested) break;
          try { await processOne(batch[i]); } catch (err) { failCount++; }
          await humanDelay();
        }
        await delay(600 + rand(900));
      }
    } finally {
      window._facebookAutoLeaveRunning = false;
      var summary = '✅ ' + successCount + ' left | ❌ ' + failCount + ' failed';
      if (window.__FB_PROGRESS__) window.__FB_PROGRESS__.done(summary);
      else alert('Facebook Auto Leave Groups finished.\\n' + summary);
    }
  }

  mainLoop().catch(function(err) {
    console.error(err);
    window._facebookAutoLeaveRunning = false;
  });
})();
})();`;
}

export function generateLeaveGroupsUserscript(config: UnfollowConfig): string {
  const body = generateLeaveGroupsScript(config)
    .replace(/^javascript:/, "")
    .replace(/^\(function\(\)\{/, "")
    .replace(/\}\)\(\);$/, "");
  return `// ==UserScript==
// @name         FB Auto Leave Groups
// @namespace    https://github.com/Menelik2/FACEBOOK
// @version      1.6.0
// @description  Advanced desktop leave groups
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/groups/joins/*
// @match        https://facebook.com/groups/joins/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${body}
`;
}

export function generateLeaveGroupsRaw(config: UnfollowConfig): string {
  return generateLeaveGroupsScript(config).replace(/^javascript:/, "");
}
