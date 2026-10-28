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
    const t = (a + " " + (el.innerText || "")).toLowerCase();
    if (t.includes("actions") || t.includes("more options")) return true;
    if (t === "more" || a === "More" || a === "…" || a === "..." || a === "•••") return true;
    return false;
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

  function getCards() {
    const cards = new Map();

    const tryAttach = (btn, kind) => {
      let node = btn;
      for (let i = 0; i < 12 && node && node !== document.body; i++, node = node.parentElement) {
        const link = node.querySelector?.('a[href*="facebook.com/"], a[href^="/"]');
        if (!link?.href) continue;
        const key = link.href.split("?")[0];
        if (cards.has(key)) return;
        if (/\/(photo|reel|watch|groups|marketplace)\b/i.test(key)) return;
        cards.set(key, {
          node,
          btn,
          kind,
          name: (link.innerText || link.getAttribute("aria-label") || key).trim(),
          url: key,
        });
        return;
      }
    };

    [...document.querySelectorAll('div[aria-label][role="button"], div[role="button"][aria-label], button[aria-label]')]
      .filter(isActions)
      .forEach((b) => tryAttach(b, "actions"));

    [...document.querySelectorAll('[role="button"], button')]
      .filter(isFollowing)
      .forEach((b) => tryAttach(b, "following"));

    if (cards.size === 0) {
      [...document.querySelectorAll('a[href*="facebook.com/"], a[href^="/"]')].forEach((link) => {
        if (!visible(link)) return;
        const key = link.href.split("?")[0];
        if (cards.has(key)) return;
        let node = link;
        for (let i = 0; i < 9 && node; i++, node = node.parentElement) {
          const btns = [...(node.querySelectorAll?.('[role="button"], button') || [])].filter(visible);
          if (!btns.length) continue;
          const prefer = btns.find(isFollowing) || btns.find(isActions) || btns[btns.length - 1];
          cards.set(key, {
            node,
            btn: prefer,
            kind: isFollowing(prefer) ? "following" : isActions(prefer) ? "actions" : "any",
            name: (link.innerText || "").trim(),
            url: key,
          });
          break;
        }
      });
    }

    return [...cards.values()];
  }

  async function clickUnfollow(card) {
    try {
      card.node.scrollIntoView({ block: "center", behavior: "instant" });
    } catch {
      try {
        card.node.scrollIntoView({ block: "center" });
      } catch {}
    }
    await sleep(400);

    let actionsBtn =
      card.kind === "actions"
        ? card.btn
        : [...card.node.querySelectorAll('[role="button"], button')].find(isActions);
    if (!actionsBtn && card.node.parentElement) {
      actionsBtn = [...card.node.parentElement.querySelectorAll('[role="button"], button')].find(isActions);
    }

    if (actionsBtn) {
      click(actionsBtn);
      await sleep(900);
      let unf = [...document.querySelectorAll('[role="menuitem"], [role="button"], button')].find(isUnfollow);
      if (!unf) {
        await sleep(500);
        unf = [...document.querySelectorAll('[role="menuitem"], [role="button"], button')].find(isUnfollow);
      }
      if (unf) {
        click(unf);
        await sleep(700);
        const conf = [...document.querySelectorAll('[role="dialog"] button, [role="dialog"] [role="button"], button')].find(
          isConfirm
        );
        if (conf) {
          click(conf);
          await sleep(500);
        }
        return "processed";
      }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await sleep(200);
    }

    const followBtn =
      isFollowing(card.btn) ? card.btn : [...card.node.querySelectorAll('[role="button"], button')].find(isFollowing);
    if (followBtn) {
      click(followBtn);
      await sleep(900);
      let unf = [...document.querySelectorAll('[role="menuitem"], [role="button"], button')].find(isUnfollow);
      if (!unf) {
        await sleep(500);
        unf = [...document.querySelectorAll('[role="menuitem"], [role="button"], button')].find(isUnfollow);
      }
      if (unf) {
        click(unf);
        await sleep(700);
        const conf = [...document.querySelectorAll('[role="dialog"] button, [role="dialog"] [role="button"], button')].find(
          isConfirm
        );
        if (conf) {
          click(conf);
          await sleep(500);
        }
        return "processed";
      }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return "needs-review";
    }

    return "skipped";
  }

  async function notify(done, total, status, message, finished = false) {
    try {
      await chrome.runtime.sendMessage({ type: "PROGRESS", done, total, status, message, finished });
    } catch {}
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === "SCAN") {
      const count = getCards().length;
      sendResponse({
        count,
        message: count
          ? "Found visible account cards. Scroll the Following list to load more if needed."
          : "No visible account cards found. Open the Following list and wait for it to load.",
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
      running = true;
      stopRequested = false;
      paused = false;
      const limit = Math.max(1, Math.min(20, Number(msg.limit) || 10));
      const cards = getCards().slice(0, limit);
      sendResponse({ ok: true, count: cards.length });
      (async () => {
        let done = 0;
        let processed = 0;
        let uncertain = 0;
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
          } catch {
            uncertain++;
          }
          done++;
          await notify(
            done,
            cards.length,
            "Running",
            `Checked ${done} of ${cards.length}. Processed: ${processed}; needs review: ${uncertain}.`
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
          `${stopped ? "Stopped early. " : "Run complete. "}Processed: ${processed}; needs review: ${uncertain}. Verify on Facebook.`,
          true
        );
      })();
      return true;
    }
  });
})();
