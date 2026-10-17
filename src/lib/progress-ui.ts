/** Shared progress overlay injected into generated Facebook scripts */
export function getProgressUICode(title: string, accentColor: string): string {
  return `
  (function createProgressUI() {
    if (document.getElementById('fb-studio-progress')) return;
    var style = document.createElement('style');
    style.textContent = '#fb-studio-progress{position:fixed;bottom:24px;right:24px;z-index:999999;width:340px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif;overflow:hidden}' +
      '#fb-studio-progress .fb-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#1e293b;border-bottom:1px solid #334155}' +
      '#fb-studio-progress .fb-title{font-weight:600;font-size:14px;color:${accentColor}}' +
      '#fb-studio-progress .fb-body{padding:14px 16px}' +
      '#fb-studio-progress .fb-stats{display:flex;gap:12px;margin-bottom:10px;font-size:13px}' +
      '#fb-studio-progress .fb-stat strong{color:#fff}' +
      '#fb-studio-progress .fb-bar-bg{height:8px;background:#1e293b;border-radius:99px;overflow:hidden}' +
      '#fb-studio-progress .fb-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,${accentColor},#38bdf8);border-radius:99px;transition:width .35s ease}' +
      '#fb-studio-progress .fb-status{margin-top:8px;font-size:12px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#fb-studio-progress .fb-actions{display:flex;gap:6px;padding:0 16px 14px;flex-wrap:wrap}' +
      '#fb-studio-progress button{flex:1;min-width:70px;border:none;border-radius:8px;padding:8px 0;font-size:12px;font-weight:600;cursor:pointer}' +
      '#fb-studio-progress .fb-stop{background:#dc2626;color:#fff}' +
      '#fb-studio-progress .fb-min{background:#334155;color:#e2e8f0}' +
      '#fb-studio-progress .fb-export{background:#0ea5e9;color:#fff}';
    document.head.appendChild(style);
    var root = document.createElement('div');
    root.id = 'fb-studio-progress';
    root.innerHTML = '<div class="fb-hdr"><span class="fb-title">${title}</span><span style="font-size:11px;color:#64748b">live</span></div>' +
      '<div class="fb-body"><div class="fb-stats">' +
      '<div class="fb-stat">✅ <strong id="fb-ok">0</strong></div>' +
      '<div class="fb-stat">❌ <strong id="fb-fail">0</strong></div>' +
      '<div class="fb-stat">Σ <strong id="fb-total">0</strong></div></div>' +
      '<div class="fb-bar-bg"><div class="fb-bar-fill" id="fb-bar"></div></div>' +
      '<div class="fb-status" id="fb-status">Starting…</div></div>' +
      '<div class="fb-actions">' +
      '<button class="fb-stop" id="fb-stop-btn">Stop</button>' +
      '<button class="fb-min" id="fb-min-btn">Hide</button>' +
      '<button class="fb-export" id="fb-export-btn">Log</button></div>';
    document.body.appendChild(root);
    var hidden = false;
    document.getElementById('fb-min-btn').onclick = function() {
      hidden = !hidden;
      root.querySelector('.fb-body').style.display = hidden ? 'none' : 'block';
      document.getElementById('fb-min-btn').textContent = hidden ? 'Show' : 'Hide';
    };
    document.getElementById('fb-export-btn').onclick = function() {
      if (window.__FB_ADV__ && window.__FB_ADV__.exportActionLog) window.__FB_ADV__.exportActionLog();
      else alert('No action log yet');
    };
    window.__FB_PROGRESS__ = {
      success: 0, fail: 0, total: 0, cap: 0,
      update: function(opts) {
        if (opts.success != null) this.success = opts.success;
        if (opts.fail != null) this.fail = opts.fail;
        if (opts.total != null) this.total = opts.total;
        if (opts.cap != null) this.cap = opts.cap;
        if (opts.status) {
          var el = document.getElementById('fb-status');
          if (el) el.textContent = opts.status;
        }
        var ok = document.getElementById('fb-ok');
        var failEl = document.getElementById('fb-fail');
        var totalEl = document.getElementById('fb-total');
        var bar = document.getElementById('fb-bar');
        if (ok) ok.textContent = this.success;
        if (failEl) failEl.textContent = this.fail;
        if (totalEl) totalEl.textContent = this.total || (this.success + this.fail);
        if (bar) {
          var denom = this.cap > 0 ? this.cap : Math.max(this.success + this.fail, 1);
          bar.style.width = Math.min(100, Math.round(((this.success + this.fail) / denom) * 100)) + '%';
        }
      },
      done: function(msg) {
        this.update({ status: msg || 'Finished' });
        var btn = document.getElementById('fb-stop-btn');
        if (btn) { btn.textContent = 'Close'; btn.onclick = function() { root.remove(); }; }
        if (window.__FB_ADV__ && window.__FB_ADV__.playFinishSound) window.__FB_ADV__.playFinishSound();
      },
      onStop: function(fn) {
        var btn = document.getElementById('fb-stop-btn');
        if (btn) btn.onclick = fn;
      }
    };
  })();
`;
}
