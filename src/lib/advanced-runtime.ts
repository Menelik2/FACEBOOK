/**
 * Shared advanced runtime helpers injected into generated scripts.
 * Returns plain JS source (string) for template interpolation.
 */
export function getAdvancedRuntimeCode(opts: {
  whitelist: string;
  blacklist: string;
  useBlacklistOnly: boolean;
  autoStopOnRateLimit: boolean;
  soundOnFinish: boolean;
  skipVerified: boolean;
  logActions: boolean;
}): string {
  const wl = JSON.stringify(
    opts.whitelist
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  const bl = JSON.stringify(
    opts.blacklist
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

  return `
  // ===== Advanced runtime =====
  var __WL = ${wl};
  var __BL = ${bl};
  var __BL_ONLY = ${opts.useBlacklistOnly ? "true" : "false"};
  var __AUTO_STOP_RL = ${opts.autoStopOnRateLimit ? "true" : "false"};
  var __SOUND = ${opts.soundOnFinish ? "true" : "false"};
  var __SKIP_VERIFIED = ${opts.skipVerified ? "true" : "false"};
  var __LOG = ${opts.logActions ? "true" : "false"};
  var __ACTION_LOG = [];
  var __PAUSED = false;

  function __norm(s) {
    return (s || "").toLowerCase().trim();
  }

  function __textMatchesList(text, list) {
    if (!list || !list.length) return false;
    var t = __norm(text);
    for (var i = 0; i < list.length; i++) {
      if (list[i] && t.indexOf(list[i]) !== -1) return true;
    }
    return false;
  }

  function shouldSkipTarget(nameOrUrl) {
    var t = __norm(nameOrUrl);
    if (__textMatchesList(t, __WL)) return true; // always skip whitelist
    if (__BL_ONLY && __BL.length && !__textMatchesList(t, __BL)) return true;
    return false;
  }

  function looksVerified(el) {
    if (!__SKIP_VERIFIED || !el) return false;
    // heuristic: aria-label Verified, or svg title, or common badge markup
    if (el.querySelector('[aria-label*="Verified"], [aria-label*="verified"]')) return true;
    if (el.querySelector('svg[aria-label*="Verified"]')) return true;
    var html = el.innerHTML || "";
    if (/verified/i.test(html) && /badge|check/i.test(html)) return true;
    return false;
  }

  function detectRateLimit() {
    if (!__AUTO_STOP_RL) return false;
    var body = (document.body && document.body.innerText) || "";
    var patterns = [
      /try again later/i,
      /we limit how often/i,
      /temporarily blocked/i,
      /unusual activity/i,
      /confirm you.?re human/i,
      /security check/i,
      /checkpoint/i,
      /captcha/i
    ];
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(body)) return true;
    }
    // dialogs
    var dialogs = document.querySelectorAll('[role="dialog"]');
    for (var d = 0; d < dialogs.length; d++) {
      var dt = dialogs[d].innerText || "";
      for (var j = 0; j < patterns.length; j++) {
        if (patterns[j].test(dt)) return true;
      }
    }
    return false;
  }

  function logAction(entry) {
    if (!__LOG) return;
    __ACTION_LOG.push(Object.assign({ ts: new Date().toISOString() }, entry));
  }

  function playFinishSound() {
    if (!__SOUND) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.start();
      setTimeout(function() { o.stop(); ctx.close(); }, 180);
    } catch (e) {}
  }

  async function waitWhilePaused() {
    while (__PAUSED) {
      await new Promise(function(r) { setTimeout(r, 400); });
    }
  }

  // Wire pause into progress UI when available
  function wirePauseButton() {
    var root = document.getElementById('fb-studio-progress');
    if (!root) return;
    var actions = root.querySelector('.fb-actions');
    if (!actions || document.getElementById('fb-pause-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'fb-pause-btn';
    btn.textContent = 'Pause';
    btn.style.cssText = 'flex:1;border:none;border-radius:8px;padding:8px 0;font-size:13px;font-weight:600;cursor:pointer;background:#f59e0b;color:#111';
    btn.onclick = function() {
      __PAUSED = !__PAUSED;
      btn.textContent = __PAUSED ? 'Resume' : 'Pause';
      if (window.__FB_PROGRESS__) {
        window.__FB_PROGRESS__.update({ status: __PAUSED ? 'Paused' : 'Running…' });
      }
    };
    actions.insertBefore(btn, actions.firstChild);
  }

  function exportActionLog() {
    if (!__ACTION_LOG.length) return;
    try {
      var lines = __ACTION_LOG.map(function(e) {
        return [e.ts, e.action || '', e.target || '', e.ok ? 'ok' : 'fail'].join(',');
      });
      var blob = new Blob(['ts,action,target,result\\n' + lines.join('\\n')], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'fb-studio-log-' + Date.now() + '.csv';
      a.click();
    } catch (e) {}
  }

  // Expose for progress panel Close handler
  window.__FB_ADV__ = {
    shouldSkipTarget: shouldSkipTarget,
    looksVerified: looksVerified,
    detectRateLimit: detectRateLimit,
    logAction: logAction,
    playFinishSound: playFinishSound,
    waitWhilePaused: waitWhilePaused,
    wirePauseButton: wirePauseButton,
    exportActionLog: exportActionLog,
    getLog: function() { return __ACTION_LOG.slice(); }
  };
`;
}
