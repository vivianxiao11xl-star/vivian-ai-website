// Welcome overlay — shown ONCE after successful login (not on refresh)
// Design basis: Vivian's "AI 经营家 · 启程者" certificate (Cohort 01)
// Called by: tryUnlock() after sessionStorage is set.

(function () {
  if (window.showWelcome) return; // idempotent

  function injectStyle() {
    if (document.getElementById('welcome-style')) return;
    const style = document.createElement('style');
    style.id = 'welcome-style';
    style.textContent = `
      #welcome-overlay {
        position: fixed; inset: 0; z-index: 200;
        background: radial-gradient(ellipse at center, #1B3A5C 0%, #0A1628 100%);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        animation: wcFadeIn 0.4s ease;
      }
      #welcome-overlay.fade-out { animation: wcFadeOut 0.5s ease forwards; }
      @keyframes wcFadeIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes wcFadeOut { to   { opacity: 0; } }
      .welcome-card {
        max-width: 540px; width: 88%;
        padding: 48px 44px 40px;
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
        border: 1px solid rgba(201,169,97,0.32);
        border-radius: 22px;
        text-align: center; color: #fff;
        box-shadow: 0 30px 80px rgba(0,0,0,0.55);
        position: relative;
        animation: wcCardIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .welcome-card::before {
        content: ""; position: absolute;
        top: -1px; left: 22%; right: 22%; height: 1px;
        background: linear-gradient(90deg, transparent, #C9A961 50%, transparent);
      }
      @keyframes wcCardIn {
        from { opacity: 0; transform: translateY(14px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
      }
      .welcome-eyebrow {
        font-size: 11px; letter-spacing: 3px;
        color: #C9A961; font-weight: 700;
        margin-bottom: 26px;
        opacity: 0; animation: wcUp 0.5s 0.3s ease forwards;
      }
      .welcome-name {
        font-family: 'Noto Serif SC', 'Songti SC', serif;
        font-size: 36px; font-weight: 700;
        color: #fff; letter-spacing: 2px;
        margin-bottom: 8px;
        opacity: 0; animation: wcUp 0.5s 0.5s ease forwards;
      }
      .welcome-subtitle {
        font-size: 12px; color: rgba(255,255,255,0.55);
        letter-spacing: 3px; margin-bottom: 26px;
        opacity: 0; animation: wcUp 0.5s 0.7s ease forwards;
      }
      .welcome-divider {
        width: 44px; height: 1px;
        background: rgba(201,169,97,0.55);
        margin: 0 auto 22px;
        opacity: 0; animation: wcFadeIn 0.4s 0.9s ease forwards;
      }
      .welcome-path {
        font-size: 13px; color: rgba(255,255,255,0.55);
        letter-spacing: 0.5px; margin-bottom: 4px;
        opacity: 0; animation: wcUp 0.5s 1.0s ease forwards;
      }
      .welcome-path strong {
        color: #C9A961; font-weight: 700;
      }
      .welcome-cta {
        font-size: 14px; color: rgba(255,255,255,0.92);
        font-weight: 500; margin-top: 18px; line-height: 1.6;
        opacity: 0; animation: wcUp 0.5s 1.3s ease forwards;
      }
      .welcome-cta strong { color: #C9A961; font-weight: 700; }
      .welcome-skip {
        position: absolute; bottom: -36px; left: 0; right: 0;
        font-size: 12px; color: rgba(255,255,255,0.42);
        letter-spacing: 1.5px;
        opacity: 0; animation: wcUp 0.5s 1.7s ease forwards;
      }
      @keyframes wcUp {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @media (max-width: 600px) {
        .welcome-card { padding: 38px 26px 32px; }
        .welcome-name { font-size: 28px; }
        .welcome-eyebrow { font-size: 10px; letter-spacing: 2px; }
      }
    `;
    document.head.appendChild(style);
  }

  window.showWelcome = function (name) {
    if (document.getElementById('welcome-overlay')) return;
    injectStyle();
    const safe = String(name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const wrap = document.createElement('div');
    wrap.id = 'welcome-overlay';
    wrap.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-eyebrow">AI 经营家 · 启程者 · COHORT 01</div>
        <div class="welcome-name">欢迎你，${safe}</div>
        <div class="welcome-subtitle">FOUNDING FELLOW</div>
        <div class="welcome-divider"></div>
        <div class="welcome-path">驾驭者 → <strong>启程者 ✦</strong> → 践行者 → AI-Native CEO</div>
        <div class="welcome-cta">你已走完 Lv.2 · 下一站：<strong>Lv.3 · 90 天组织落地</strong></div>
        <div class="welcome-skip">点击任意处继续 →</div>
      </div>
    `;
    document.body.appendChild(wrap);
    function dismiss() {
      if (wrap.classList.contains('fade-out')) return;
      wrap.classList.add('fade-out');
      setTimeout(() => wrap.remove(), 500);
    }
    wrap.addEventListener('click', dismiss);
    setTimeout(dismiss, 2800);
  };
})();
