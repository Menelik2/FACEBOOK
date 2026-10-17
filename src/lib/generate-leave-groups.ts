import { UnfollowConfig } from "./types";

export function generateLeaveGroupsScript(config: UnfollowConfig): string {
  const {
    MAX_PER_MINUTE,
    BASE_DELAY,
    JITTER,
    SCROLL_DISTANCE,
    SCROLL_DELAY_ON_EMPTY,
    DRY_RUN,
    THEME,
  } = config;

  const themeColors: Record<string, string> = {
    neon: "#00FF7F",
    minimal: "#1877F2",
    retro: "#FF6B6B",
  };
  const primary = themeColors[THEME] || themeColors.neon;

  return `javascript:(function(){
if (window._facebookAutoLeaveRunning) {
  alert('Facebook Auto Leave Groups is already running');
  return;
}
window._facebookAutoLeaveRunning = true;

(function facebookAutoLeave(defaults = {}) {
  const options = Object.assign({
    maxPerMinute: ${MAX_PER_MINUTE},
    baseDelay: ${BASE_DELAY},
    jitter: ${JITTER},
    scrollDistance: ${SCROLL_DISTANCE},
    scrollDelayOnEmpty: ${SCROLL_DELAY_ON_EMPTY},
    dryRun: ${DRY_RUN},
    verbose: true
  }, defaults);

  let stopRequested = false;
  window.facebookAutoLeaveStop = () => {
    stopRequested = true;
    console.log('%c[Stop requested]', 'color:#FF5722;font-weight:bold;');
  };

  console.log('%c[Facebook Auto Leave Groups Started]', 'color:${primary};font-weight:bold;');
  console.log('%cTarget page: facebook.com/groups/joins/  |  dryRun=' + options.dryRun, 'color:#888;');
  console.log('%cTo stop: window.facebookAutoLeaveStop()', 'color:#FF9800;');

  const delay = (ms) => new Promise(res => setTimeout(res, ms));
  const rand = (n) => Math.floor(Math.random() * n);
  const humanDelay = async () => {
    const jitter = Math.floor((Math.random() * 2 - 1) * options.jitter);
    const d = Math.max(250, options.baseDelay + jitter);
    if (options.verbose) console.debug('— waiting ' + d + 'ms');
    await delay(d);
  };

  const actionTimestamps = [];
  function canDoAction() {
    const now = Date.now();
    while (actionTimestamps.length && now - actionTimestamps[0] > 60000) actionTimestamps.shift();
    return actionTimestamps.length < options.maxPerMinute;
  }
  function recordAction() { actionTimestamps.push(Date.now()); }

  const processed = new WeakSet();
  let successCount = 0;
  let failCount = 0;

  function findMoreButtons() {
    const byAria = [...document.querySelectorAll('[aria-label="More"], [aria-label="More options"], div[aria-label*="More"]')];
    const byRoleBtn = [...document.querySelectorAll('div[role="button"], a[role="button"], [role="menuitem"]')];
    const candidates = (byAria.concat(byRoleBtn)).filter(el => {
      const listItem = el.closest('[role="listitem"], [role="article"], [data-visualcompletion]');
      return !!listItem;
    });
    return Array.from(new Set(candidates));
  }

  async function openMenuFor(btn) {
    try {
      btn.scrollIntoView({ block: "center" });
      await delay(200 + rand(300));
      btn.click();
      await delay(350 + rand(400));
      return true;
    } catch (e) {
      console.warn("openMenuFor failed", e);
      return false;
    }
  }

  function findLeaveButtonsInMenu() {
    const nodes = [...document.querySelectorAll('button, [role="menuitem"], [role="button"], a')];
    return nodes.filter(n => {
      const txt = (n.textContent || "").toLowerCase().trim();
      return txt.includes("leave group");
    });
  }

  async function clickIfVisible(el) {
    if (!el) return false;
    try {
      el.scrollIntoView({ block: "center" });
      await delay(120 + rand(250));
      el.click();
      return true;
    } catch (e) {
      try {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      } catch (_) { return false; }
    }
  }

  async function processOne(btn) {
    if (processed.has(btn)) return false;
    processed.add(btn);

    if (!canDoAction()) {
      const waitMs = 8000 + rand(6000);
      if (options.verbose) console.warn('Rate cap reached, waiting ' + waitMs + 'ms');
      await delay(waitMs);
    }

    if (stopRequested) return true;

    if (options.dryRun) {
      console.log('%c[DRY RUN] Would leave a group', 'color:#FFCC00;');
      successCount++;
      recordAction();
      return true;
    }

    const opened = await openMenuFor(btn);
    if (!opened) { failCount++; return false; }

    await delay(250 + rand(300));
    let leaveCandidates = findLeaveButtonsInMenu();
    if (leaveCandidates.length === 0) {
      const alt = [...document.querySelectorAll('[aria-label]')].filter(n =>
        /leave\\s*group/i.test(n.getAttribute('aria-label') || "")
      );
      if (alt.length) leaveCandidates.push(...alt);
    }

    if (leaveCandidates.length === 0) {
      console.warn("No 'Leave Group' button found — maybe FB changed UI.");
      failCount++;
      return false;
    }

    const leaveBtn = leaveCandidates[0];
    await clickIfVisible(leaveBtn);
    await delay(500 + rand(500));

    const dialog = await new Promise(res => {
      const start = Date.now();
      const check = () => {
        const d = document.querySelector('div[role="dialog"]');
        if (d) res(d);
        else if (Date.now() - start > 5000) res(null);
        else requestAnimationFrame(check);
      };
      check();
    });

    if (dialog) {
      const leaveDialogBtn = [...dialog.querySelectorAll('div[role="button"], button')]
        .find(b => /leave group/i.test(b.innerText || b.textContent || ""));
      if (leaveDialogBtn) {
        await clickIfVisible(leaveDialogBtn);
        await delay(800 + rand(500));
      }
    } else if (options.verbose) {
      console.warn("Dialog did not appear, skipping modal actions");
    }

    recordAction();
    successCount++;
    if (options.verbose) console.log('%c✅ Left a group. Actions this minute: ' + actionTimestamps.length, 'color:#4CAF50;');

    await delay(900 + rand(900));
    return true;
  }

  async function mainLoop() {
    try {
      if (options.verbose) console.log("facebookAutoLeave: starting loop. To stop call window.facebookAutoLeaveStop()");

      while (!stopRequested) {
        let candidates = findMoreButtons().filter(b => !processed.has(b));
        if (candidates.length === 0) {
          window.scrollBy({ top: options.scrollDistance, behavior: 'smooth' });
          if (options.verbose) console.debug("Scrolled to load more groups...");
          await delay(options.scrollDelayOnEmpty + rand(2000));
          candidates = findMoreButtons().filter(b => !processed.has(b));
          if (candidates.length === 0) {
            const any = findMoreButtons().length;
            if (!any) {
              console.log("%c✅ Done — no more 'More' buttons found.", "color:#4CAF50;font-weight:bold;");
              break;
            }
          }
        }

        const batch = candidates.slice(0, Math.max(1, Math.floor(options.maxPerMinute / 3)));

        for (const btn of batch) {
          if (stopRequested) break;
          try {
            await processOne(btn);
          } catch (err) {
            console.error("Error processing item:", err);
            failCount++;
          }
          await humanDelay();
        }

        await delay(600 + rand(900));
      }
    } finally {
      window._facebookAutoLeaveRunning = false;
      console.log('%c[Summary] ✅ ' + successCount + ' left | ❌ ' + failCount + ' failed', 'color:#FFD700;font-weight:bold;');
      alert('Facebook Auto Leave Groups finished.\\n✅ Left: ' + successCount + '\\n❌ Failed: ' + failCount);
      if (options.verbose) console.log("facebookAutoLeave: stopped.");
    }
  }

  mainLoop().catch(err => {
    console.error("facebookAutoLeave fatal:", err);
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
// @version      1.2.0
// @description  Auto leave Facebook groups – generated by FB Unfollow Studio
// @author       FB Unfollow Studio
// @match        https://www.facebook.com/groups/joins/*
// @match        https://facebook.com/groups/joins/*
// @match        https://www.facebook.com/groups/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

${body}
`;
}

export function generateLeaveGroupsRaw(config: UnfollowConfig): string {
  return generateLeaveGroupsScript(config).replace(/^javascript:/, "");
}
