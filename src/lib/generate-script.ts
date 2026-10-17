import { UnfollowConfig } from "./types";

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

  return `javascript:(function(){
if (window.__FB_UNFOLLOW_RUNNING__) { alert('FB Unfollow Studio is already running'); return; }
window.__FB_UNFOLLOW_RUNNING__ = true;

(async function () {
  'use strict';
  console.log('%c[Facebook Auto Unfollow Script Started]', 'color:#1877F2;font-weight:bold;');
  console.log('%cConfig: interval=${INTERVAL_BETWEEN_ACTIONS}ms | dryRun=${DRY_RUN} | target=${TARGET}', 'color:#888;');

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

  // ===== Mobile detection =====
  const isMobile = (() => {
    const ua = navigator.userAgent || '';
    const host = window.location.hostname || '';
    return host.startsWith('m.') ||
           host.includes('m.facebook') ||
           /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
           ('ontouchstart' in window && window.innerWidth < 900);
  })();

  if (isMobile) {
    console.log('%c[📱 Mobile mode detected]', 'color:#9C27B0;font-weight:bold;', 'Using touch-based flow + mobile selectors');
  } else {
    console.log('%c[🖥️ Desktop mode]', 'color:#2196F3;');
  }

  const wait = (ms) => {
    let actual = ms;
    if (RANDOM_JITTER) {
      const jitter = ms * 0.2 * (Math.random() * 2 - 1);
      actual = Math.max(100, Math.round(ms + jitter));
    }
    return new Promise((resolve) => setTimeout(resolve, actual));
  };

  async function waitForElement(selector, timeout = HOVER_WAIT_TIMEOUT) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
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

  // Simulate a real user tap/click
  function simulateTap(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' }));
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'touch' }));
      el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    } catch (e) {
      // Fallback for older browsers
      el.click();
    }
  }

  async function tryUnfollowMobile(profileEl, profileUrl) {
    if (DRY_RUN) {
      console.log('%c[DRY RUN] Would unfollow (mobile): ' + profileUrl, 'color:#FFCC00;');
      return true;
    }

    // On mobile the "Following" button is often directly visible next to the name
    const followingBtn =
      profileEl.querySelector('[aria-label="Following"], [aria-label="Liked"], [aria-label="Favorites"]') ||
      Array.from(profileEl.querySelectorAll('div[role="button"], span, a')).find(el =>
        /^(Following|Liked|Favorites)$/i.test((el.textContent || '').trim())
      );

    if (followingBtn) {
      console.log('%c[📱 Mobile] Tapping Following button...', 'color:#9C27B0;');
      simulateTap(followingBtn);
      await wait(SHORT_FIXED_PAUSE + 400);

      // Look for Unfollow option in the bottom sheet / dialog
      const unfollowOption = await waitForElement(
        '[role="menuitem"], [role="button"], div[data-action-id]',
        4000
      );

      // Try to find any element that says Unfollow
      const candidates = Array.from(document.querySelectorAll('[role="menuitem"], [role="button"], div, span, a'));
      const unfollowEl = candidates.find(el => {
        const t = (el.textContent || '').trim();
        return t === 'Unfollow' || t === 'Unlike' || t.includes('Unfollow');
      });

      if (unfollowEl) {
        simulateTap(unfollowEl);
        console.log('%c[✅ Unfollowed (mobile)]%c ' + profileUrl, 'color:#4CAF50;', 'color:white;');
        await wait(600);

        // Confirm dialog if present
        const confirmBtn = Array.from(document.querySelectorAll('[role="button"], button')).find(el =>
          /^(Unfollow|Confirm|Update|OK)$/i.test((el.textContent || '').trim())
        );
        if (confirmBtn) {
          simulateTap(confirmBtn);
          await wait(500);
        }
        return true;
      }
    }

    // Fallback: look for 3-dot / more menu on the row
    const moreBtn = profileEl.querySelector('[aria-label*="More"], [aria-label*="Options"], [aria-label*="menu"]') ||
      Array.from(profileEl.querySelectorAll('div[role="button"]')).find(el =>
        el.innerHTML.includes('⋯') || el.querySelector('svg')
      );

    if (moreBtn) {
      simulateTap(moreBtn);
      await wait(700);
      const unfollowEl = Array.from(document.querySelectorAll('[role="menuitem"], [role="button"]')).find(el =>
        (el.textContent || '').includes('Unfollow') || (el.textContent || '').includes('Following')
      );
      if (unfollowEl) {
        simulateTap(unfollowEl);
        console.log('%c[✅ Unfollowed via menu (mobile)]%c ' + profileUrl, 'color:#4CAF50;', 'color:white;');
        await wait(600);
        return true;
      }
    }

    console.warn('[❌ Mobile] No unfollow control found for', profileUrl);
    return false;
  }

  async function tryUnfollowDesktop(hoverContainer, profileUrl) {
    if (DRY_RUN) {
      console.log('%c[DRY RUN] Would unfollow: ' + profileUrl, 'color:#FFCC00;');
      return true;
    }

    // 3-dot menu
    const threeDotBtn =
      !(hoverContainer.querySelector('div[role="button"][aria-label="Following"]') ||
        hoverContainer.querySelector('div[role="button"][aria-label="Liked"]')) &&
      Array.from(hoverContainer.querySelectorAll('div[role="none"], div[role="button"]')).find(
        (el) => el.querySelector('svg circle[cx="12"][cy="12"]') || el.innerHTML.includes('⋯')
      );

    if (threeDotBtn) {
      threeDotBtn.click();
      console.log('%c[🟡 3-dot menu]%c Opening...', 'color:${colors.warn};', 'color:white;');
      await wait(800);

      const unfollowMenu = Array.from(document.querySelectorAll('div[role="menuitem"], div[role="none"]')).find(
        (el) => el.textContent && el.textContent.includes('Following')
      );
      if (unfollowMenu) {
        unfollowMenu.click();
        await wait(700);
        const dialog = await waitForElement('div[role="dialog"]', 4000);
        if (dialog) {
          const unfollowRadio = Array.from(dialog.querySelectorAll('div[role="radio"]')).find((el) =>
            el.textContent && el.textContent.includes('Unfollow')
          );
          if (unfollowRadio) { unfollowRadio.click(); await wait(300); }

          if (ALSO_UNLIKE_PAGES) {
            const unlikeButton = Array.from(document.querySelectorAll('div[role="button"], input[role="switch"]')).find(
              (el) => (el.textContent && el.textContent.includes('Unlike this Page')) || el.getAttribute('aria-label') === 'Unlike'
            );
            if (unlikeButton) { unlikeButton.click(); await wait(400); }
          }

          const updateBtn = Array.from(dialog.querySelectorAll('div[role="button"], button')).find(
            (el) => el.textContent && el.textContent.trim() === 'Update'
          );
          if (updateBtn) {
            updateBtn.click();
            console.log('%c[💾 Updated]%c ' + profileUrl, 'color:${colors.success};', 'color:white;');
            await wait(800);
            return true;
          }
        }
      }
    }

    // Direct Unfollow
    const directBtn = hoverContainer.querySelector('div[role="button"][aria-label="Unfollow"]');
    if (directBtn) {
      directBtn.click();
      console.log('%c[✅ Unfollowed]%c Direct — ' + profileUrl, 'color:#4CAF50;', 'color:white;');
      return true;
    }

    // Following / Liked button → dialog
    const followingBtn =
      hoverContainer.querySelector('div[role="button"][aria-label="Following"]') ||
      hoverContainer.querySelector('div[role="button"][aria-label="Liked"]') ||
      hoverContainer.querySelector('div[role="button"][aria-label="Favorites"]');

    if (followingBtn) {
      followingBtn.click();
      await wait(SHORT_FIXED_PAUSE);
      const dialog = await waitForElement('div[role="dialog"]', 6000);
      if (!dialog) return false;

      const unfollowRadio = Array.from(dialog.querySelectorAll('div[role="radio"]')).find((el) =>
        el.textContent && el.textContent.includes('Unfollow')
      );
      if (unfollowRadio) { unfollowRadio.click(); await wait(400); }

      if (ALSO_UNLIKE_PAGES) {
        const unlikeButton = Array.from(document.querySelectorAll('div[role="button"], input[role="switch"]')).find(
          (el) => (el.textContent && el.textContent.includes('Unlike this Page')) || el.getAttribute('aria-label') === 'Unlike'
        );
        if (unlikeButton) { unlikeButton.click(); await wait(400); }
      }

      const updateBtn = Array.from(dialog.querySelectorAll('div[role="button"], button')).find(
        (el) => el.textContent && el.textContent.trim() === 'Update'
      );
      if (updateBtn) {
        updateBtn.click();
        console.log('%c[💾 Updated]%c ' + profileUrl, 'color:${colors.success};', 'color:white;');
        await wait(800);
        return true;
      }
    }

    // Options fallback
    const optionsBtn = hoverContainer.querySelector('div[role="button"][aria-label*="Options"]');
    if (optionsBtn) {
      optionsBtn.click();
      await wait(SHORT_FIXED_PAUSE);
      const unfollowMenu = Array.from(document.querySelectorAll('div[role="menuitem"]')).find((el) =>
        el.textContent && el.textContent.includes('Unfollow')
      );
      if (unfollowMenu) {
        unfollowMenu.click();
        console.log('%c[✅ Unfollowed]%c via Options — ' + profileUrl, 'color:#4CAF50;', 'color:white;');
        return true;
      }
    }

    return false;
  }

  async function processOneProfile() {
    // Desktop + mobile selectors for the following list
    const selectors = isMobile
      ? [
          'div[data-pagelet] a[href*="facebook.com/"]',
          'div[role="article"]',
          'div.x1n2onr6',
          'div[data-nt="NT:BOX_3"]',
          'div[style*="flex"] > div > a[href*="/"]'
        ]
      : [
          'div.x78zum5.x1q0g3np.x1a02dak.x1qughib > div',
          'div[data-pagelet="ProfileAppSection_0"] div[role="article"]',
          'div.x1n2onr6 > div'
        ];

    let profileContainers = [];
    for (const sel of selectors) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        profileContainers = Array.from(found);
        break;
      }
    }

    // Also collect direct links that look like profiles
    if (profileContainers.length === 0) {
      profileContainers = Array.from(document.querySelectorAll('a[href*="facebook.com/"]')).filter(a => {
        const href = a.href || '';
        return href.includes('facebook.com/') && !href.includes('/photo') && !href.includes('/video') && !href.includes('/posts/');
      });
    }

    let foundProfile = false;

    for (const profile of profileContainers) {
      const link = profile.tagName === 'A' ? profile : profile.querySelector('a[href*="facebook.com/"], a[href*="m.facebook.com/"]');
      if (!link) continue;

      const href = link.href;
      if (processedProfiles.has(href)) continue;
      if (!isTargetMatch(href)) continue;

      foundProfile = true;
      scrollAttemptsWithoutNew = 0;
      console.log('%c[⚙️ Processing]%c ' + href, 'color:cyan;', 'color:white;');

      profile.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await wait(isMobile ? 700 : 500);

      let success = false;

      if (isMobile) {
        success = await tryUnfollowMobile(profile, href);
      } else {
        // Desktop: trigger hover card
        link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
        link.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));

        const hoverContainer = await waitForElement(
          'div[aria-label="Link preview"], div[role="dialog"], div.x1n2onr6.x1ja2u2z',
          HOVER_WAIT_TIMEOUT
        );

        if (hoverContainer) {
          success = await tryUnfollowDesktop(hoverContainer, href);
          const closeBtn = document.querySelector('div[role="button"][aria-label="Close"], div[aria-label="Close"]');
          if (closeBtn) closeBtn.click();
        } else {
          console.warn('[❌] Hover card not found');
          // Fallback: try treating the row itself as the container
          success = await tryUnfollowDesktop(profile, href);
        }
      }

      if (success) {
        successCount++;
        actionsThisSession++;
      } else {
        failCount++;
      }

      processedProfiles.add(href);

      if (actionsThisSession > 0 && actionsThisSession % COOLDOWN_EVERY_N === 0) {
        console.log('%c[⏸ Cooldown] ' + COOLDOWN_SECONDS + 's', 'color:#FF9800;');
        await wait(COOLDOWN_SECONDS * 1000);
      }

      if (successCount >= DAILY_CAP) {
        processActive = false;
        console.log('%c[🛑 Daily cap reached]', 'color:#FF5722;font-weight:bold;');
      }

      break; // one per loop
    }

    if (!foundProfile) {
      scrollAttemptsWithoutNew++;
      console.log('[ℹ️ Scroll] ' + scrollAttemptsWithoutNew + '/' + MAX_SCROLL_ATTEMPTS);
      if (scrollAttemptsWithoutNew >= MAX_SCROLL_ATTEMPTS) {
        processActive = false;
        console.log('%c[🏁 Finished]', 'color:#4CAF50;font-weight:bold;');
      } else {
        window.scrollTo(0, document.body.scrollHeight);
        await wait(isMobile ? 2000 : 1500);
      }
    }
  }

  // Helpful tip for mobile users
  if (isMobile && window.location.hostname.startsWith('m.')) {
    console.log('%c[Tip] For better results open facebook.com and request Desktop site, then re-run.', 'color:#FF9800;');
  }

  while (processActive) {
    await processOneProfile();
    if (processActive) await wait(INTERVAL_BETWEEN_ACTIONS);
  }

  window.__FB_UNFOLLOW_RUNNING__ = false;
  console.log('%c[Summary] ✅ ' + successCount + ' success | ❌ ' + failCount + ' failed', 'color:#FFD700;font-weight:bold;');
  alert('FB Unfollow Studio finished.\\n✅ Success: ' + successCount + '\\n❌ Failed: ' + failCount);
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
// @version      1.1.0
// @description  Auto-unfollow tool with improved mobile support
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
