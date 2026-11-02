(() => {
  if (window.__unfollowAssistantLoaded) return;
  window.__unfollowAssistantLoaded = true;

  let stopRequested = false;
  let paused = false;
  let running = false;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => {
    if (!el) return false;
    try {
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight + 80;
    } catch {
      return false;
    }
  };
  const label = (el) =>
    String(
      (el?.getAttribute?.("aria-label") || el?.getAttribute?.("title") || "") +
        " " +
        (el?.innerText || el?.textContent || "")
    )
      .replace(/\s+/g, " ")
      .trim();
  const low = (el) => label(el).toLowerCase();

  function isFollowing(el) {
    if (!el || !visible(el)) return false;
    if (el.getAttribute?.("aria-disabled") === "true") return false;
    const t = low(el);
    const r = label(el);
    if (t.includes("unfollow") || t.includes("unlike")) return false;
    if (t.includes("following") || t.includes("followed")) return true;
    if (t === "liked" || t.startsWith("liked") || t.startsWith("subscribed")) return true;
    if (r.includes("በመከተል")) return true;
    return false;
  }

  function isActions(el) {
    if (!el || !visible(el)) return false;
    const a = el.getAttribute?.("aria-label") || "";
    const t = (a + " " + (el.innerText || "")).trim().toLowerCase();
    if (t.includes("actions") || t.includes("more options")) return true;
    if (/^(more|…|\.\.\.|•••)$/.test(t)) return true;
    const svg = el.querySelector?.("svg");
    return Boolean(svg && /more|options|menu/i.test(
      (svg.getAttribute("aria-label") || "") + " " + (el.getAttribute("title") || "")
    ));
  }

  function isUnfollow(el) {
    if (!el || !visible(el)) return false;
    const t = low(el);
    const r = label(el);
    if (t.includes("unfollow")) return true;
    if (t === "unlike" || t.startsWith("unlike")) return true;
    if (/አትከተል|መከተልን አቁም|መከተል አቁም|አታስከተል/.test(r)) return true;
    return false;
  }

  function isConfirm(el) {
    if (!el || !visible(el)) return false;
    const t = low(el);
    if (["unfollow", "confirm", "update", "remove", "yes", "ok"].includes(t)) return true;
    if (t.startsWith("confirm") || t.startsWith("update")) return true;
    if (/አረጋግጥ|እሺ|አዎ|አዘምን/.test(label(el))) return true;
    return false;
  }

  function click(el) {
    if (!el) return;
    try {
      el.focus?.();
      ["pointerdown", "mousedown", "mouseup", "click"].forEach((type) => {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      });
    } catch {
      try {
        el.click();
      } catch {}
    }
  }

  function isFollowingPage() {
    const route = location.pathname + location.search;
    if (/\/(?:friends\/following|following)(?:\/|$|\?)/i.test(route)) return true;
    if (/[?&]sk=following(?:&|$)/i.test(location.search)) return true;
    return [...document.querySelectorAll('a,[role="tab"]')].some((el) => {
      if (!visible(el)) return false;
      const t = low(el);
      const href = el.getAttribute('href') || '';
      return /^following(?:\s|$)/i.test(t) &&
        (el.getAttribute('aria-selected') === 'true' ||
         el.getAttribute('aria-current') === 'page' ||
         /(?:\/following|[?&]sk=following)/i.test(href) &&
         el.querySelector('[aria-selected="true"]'));
    });
  }

  function profileUrl(link) {
    try {
      const url = new URL(link.href, location.href);
      if (!['www.facebook.com', 'web.facebook.com'].includes(url.hostname)) return null;
      if (!/^\/(?:profile\.php|[a-z0-9._-]+)\/?$/i.test(url.pathname)) return null;
      if (/^\/(?:friends|following|pages|groups|watch|marketplace|reels|events|gaming|settings|help|notifications|messages|me|home)\/?$/i.test(url.pathname)) return null;
      return url.origin + url.pathname + (url.pathname === '/profile.php' ? '?id=' + (url.searchParams.get('id') || '') : '');
    } catch { return null; }
  }

  function getCards() {
    if (!isFollowingPage()) return [];
    const cards = new Map();
    for (const link of document.querySelectorAll('a[href]')) {
      if (!visible(link)) continue;
      const url = profileUrl(link);
      if (!url || cards.has(url)) continue;
      let node = link;
      for (let depth = 0; depth < 7 && node && node !== document.body; depth++, node = node.parentElement) {
        const buttons = [...node.querySelectorAll('button,[role="button"]')].filter(visible);
        const following = buttons.find(isFollowing);
        const actions = buttons.find(isActions);
        if (!following && !actions) continue;
        // Never attach a generic page-level menu to a profile.
        if (node.querySelectorAll('a[href]').length > 12) break;
        cards.set(url, { node, btn: following || actions, kind: following ? 'following' : 'actions',
          name: (link.innerText || link.getAttribute('aria-label') || url).trim(), url });
        break;
      }
    }
    return [...cards.values()];
  }

  function visibleButtons(root) {
    return [...root.querySelectorAll('button,[role="button"],[role="menuitem"]')].filter(visible);
  }

  function confirmedUnfollow(card) {
    // Disappearance alone is not evidence of success: Facebook may rerender or virtualize a row.
    const follow = visibleButtons(card.node).find((el) => {
      const t = low(el);
      return /^(follow|follow back|like|subscribe)$/.test(t);
    });
    return Boolean(follow);
  }

  async function clickUnfollow(card) {
    if (!card.node.isConnected) return 'uncertain';
    try { card.node.scrollIntoView({block:'center'}); } catch {}
    await sleep(350);
    const control = visibleButtons(card.node).find(isFollowing) ||
      (card.kind === 'actions' && isActions(card.btn) ? card.btn : visibleButtons(card.node).find(isActions));
    if (!control) return 'needs-review';
    control.click();
    await sleep(650);
    const action = [...document.querySelectorAll('[role="menu"],[role="dialog"],[role="listbox"]')]
      .filter(visible).flatMap(visibleButtons).find(isUnfollow) ||
      [...document.querySelectorAll('[role="menuitem"]')].filter(visible).find(isUnfollow);
    if (!action) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return 'needs-review';
    }
    action.click();
    await sleep(600);
    const dialogs = [...document.querySelectorAll('[role="dialog"]')].filter(visible);
    if (dialogs.length) {
      const confirm = dialogs.flatMap(visibleButtons).find(isConfirm);
      if (!confirm) return 'needs-review';
      confirm.click();
      await sleep(650);
    }
    for (let i=0;i<4;i++) {
      if (confirmedUnfollow(card)) return 'processed';
      await sleep(400);
    }
    return 'uncertain';
  }

  async function notify(done, total, status, message, finished = false) {
    try {
      await chrome.runtime.sendMessage({ type: "PROGRESS", done, total, status, message, finished });
    } catch {}
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === "STATUS") {
      sendResponse({running, paused, stopped:stopRequested, count:getCards().length});
      return true;
    }
    if (msg.action === "SCAN") {
      const count = getCards().length;
      sendResponse({
        count,
        message: count
          ? "Found visible account cards. Scroll the Following list to load more if needed."
          : "No matching cards found. Open your Following list, wait for it to load, and check your browser language.",
      });
      return true;
    }
    if (msg.action === "PAUSE") {
      paused = true;
      sendResponse({ ok: true });
      return true;
    }
    if (msg.action === "RESUME") {
      paused = false;
      sendResponse({ ok: true });
      return true;
    }
    if (msg.action === "STOP") {
      stopRequested = true;
      paused = false;
      sendResponse({ ok: true });
      return true;
    }
    if (msg.action === "START") {
      if (running) {
        sendResponse({ ok: false, message: "A run is already active." });
        return true;
      }
      const limit = Math.max(1, Math.min(20, Number(msg.limit) || 10));
      const cards = getCards().slice(0, limit);
      if (!cards.length) {
        sendResponse({ok:false,message:'No matching account cards found. Open Friends → Following and try Scan again.'});
        return true;
      }
      running = true;
      stopRequested = false;
      paused = false;
      sendResponse({ ok: true, count: cards.length });
      (async () => {
        let done = 0;
        let processed = 0;
        let uncertain = 0;
        let skipped = 0;
        await notify(done, cards.length, "Running", `Starting with ${cards.length} visible accounts. Keep this tab open.`);
        for (const card of cards) {
          if (stopRequested) break;
          while (paused && !stopRequested) await sleep(300);
          if (stopRequested) break;
          await notify(done, cards.length, "Running", `Checking ${card.name || card.url}`);
          try {
            const result = await clickUnfollow(card);
            if (result === "processed") processed++;
            if (result === "uncertain" || result === "needs-review") uncertain++;
            if (result === "skipped") skipped++;
          } catch {
            uncertain++;
          }
          done++;
          await notify(
            done,
            cards.length,
            "Running",
            `Checked ${done} of ${cards.length}. Verified: ${processed}; needs review: ${uncertain}; skipped: ${skipped}.`
          );
          await sleep(1800 + Math.floor(Math.random() * 700));
        }
        running = false;
        paused = false;
        const stopped = stopRequested;
        await notify(
          done,
          cards.length,
          stopped ? "Stopped" : "Finished",
          `${stopped ? "Stopped early. " : "Run complete. "}Verified: ${processed}; needs review: ${uncertain}; skipped: ${skipped}. Verify on Facebook.`,
          true
        );
      })();
      return true;
    }
  });
})();
