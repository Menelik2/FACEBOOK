/**
 * Shared progress overlay HTML/JS injected into generated Facebook scripts.
 * Returns a string of JS that creates window.__FB_PROGRESS__ API.
 */
export function getProgressUICode(title: string, accentColor: string): string {
  return `
  // ===== Progress Overlay =====
  (function createProgressUI() {
    if (document.getElementById('fb-studio-progress')) return;

    const style = document.createElement('style');
    style.textContent = \
#fb-studio-progress {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999999;
  width: 320px;
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
  animation: fbSlideIn 0.3s ease;
}
@keyframes fbSlideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
#fb-studio-progress .fb-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}
#fb-studio-progress .fb-title {
  font-weight: 600;
  font-size: 14px;
  color: ${accentColor};
}
#fb-studio-progress .fb-body {
  padding: 14px 16px;
}
#fb-studio-progress .fb-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
}
#fb-studio-progress .fb-stat strong {
  color: #fff;
}
#fb-studio-progress .fb-bar-bg {
  height: 8px;
  background: #1e293b;
  border-radius: 99px;
  overflow: hidden;
}
#fb-studio-progress .fb-bar-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, ${accentColor}, #38bdf8);
  border-radius: 99px;
  transition: width 0.35s ease;
}
#fb-studio-progress .fb-status {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#fb-studio-progress .fb-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 14px;
}
#fb-studio-progress button {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
#fb-studio-progress .fb-stop {
  background: #dc2626;
  color: #fff;
}
#fb-studio-progress .fb-stop:hover { background: #b91c1c; }
#fb-studio-progress .fb-min {
  background: #334155;
  color: #e2e8f0;
}
\
;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'fb-studio-progress';
    root.innerHTML = \
      <div class="fb-hdr">
        <span class="fb-title">${title}</span>
        <span style="font-size:11px;color:#64748b">live</span>
      </div>
      <div class="fb-body">
        <div class="fb-stats">
          <div class="fb-stat">✅ <strong id="fb-ok">0</strong></div>
          <div class="fb-stat">❌ <strong id="fb-fail">0</strong></div>
          <div class="fb-stat">Σ <strong id="fb-total">0</strong></div>
        </div>
        <div class="fb-bar-bg"><div class="fb-bar-fill" id="fb-bar"></div></div>
        <div class="fb-status" id="fb-status">Starting…</div>
      </div>
      <div class="fb-actions">
        <button class="fb-stop" id="fb-stop-btn">Stop</button>
        <button class="fb-min" id="fb-min-btn">Hide</button>
      </div>
    \
;
    document.body.appendChild(root);

    let hidden = false;
    document.getElementById('fb-min-btn').onclick = () => {
      hidden = !hidden;
      root.querySelector('.fb-body').style.display = hidden ? 'none' : 'block';
      root.querySelector('.fb-actions').style.display = hidden ? 'none' : 'flex';
      document.getElementById('fb-min-btn').textContent = hidden ? 'Show' : 'Hide';
    };

    window.__FB_PROGRESS__ = {
      success: 0,
      fail: 0,
      total: 0,
      cap: 0,
      update(opts) {
        if (opts.success != null) this.success = opts.success;
        if (opts.fail != null) this.fail = opts.fail;
        if (opts.total != null) this.total = opts.total;
        if (opts.cap != null) this.cap = opts.cap;
        if (opts.status) {
          const el = document.getElementById('fb-status');
          if (el) el.textContent = opts.status;
        }
        const ok = document.getElementById('fb-ok');
        const fail = document.getElementById('fb-fail');
        const total = document.getElementById('fb-total');
        const bar = document.getElementById('fb-bar');
        if (ok) ok.textContent = this.success;
        if (fail) fail.textContent = this.fail;
        if (total) total.textContent = this.total || (this.success + this.fail);
        if (bar) {
          const denom = this.cap > 0 ? this.cap : Math.max(this.success + this.fail, 1);
          const pct = Math.min(100, Math.round(((this.success + this.fail) / denom) * 100));
          bar.style.width = pct + '%';
        }
      },
      done(msg) {
        this.update({ status: msg || 'Finished' });
        const btn = document.getElementById('fb-stop-btn');
        if (btn) { btn.textContent = 'Close'; btn.onclick = () => root.remove(); }
      },
      onStop(fn) {
        const btn = document.getElementById('fb-stop-btn');
        if (btn) btn.onclick = fn;
      }
    };
  })();
  `;
}
