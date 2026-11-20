// lorin-preloader.js
// شاشة تحميل بحركة رسم شعار Lorin خطاً بخط داخل مربع أبيض على خلفية بيضاء

(function () {
  const LOGO_SVG = `
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lorin">
      <!-- حرف L المنحني -->
      <path
        class="lorin-draw-path lorin-path-l"
        d="M52 178 C64 148, 72 105, 76 62 C78 40, 96 36, 102 52 C108 68, 96 108, 66 124 C46 134, 34 122, 42 104"
        stroke="#00313C"
        stroke-width="6.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- قاعدة حرف L والاتجاه نحو الزهرة -->
      <path
        class="lorin-draw-path lorin-path-base"
        d="M28 178 C62 162, 118 144, 178 134"
        stroke="#00313C"
        stroke-width="6.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- الساق والورقة الجانبية -->
      <path
        class="lorin-draw-path lorin-path-stem"
        d="M92 152 C116 132, 134 108, 144 84 M102 146 C126 134, 156 132, 178 140 C158 154, 128 156, 102 146 Z"
        stroke="#00313C"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- بتلات الزهرة -->
      <path
        class="lorin-draw-path lorin-path-petal-1"
        d="M144 84 C124 72, 122 44, 142 22 C158 34, 166 60, 158 84"
        stroke="#00313C"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="lorin-draw-path lorin-path-petal-2"
        d="M146 30 C162 20, 182 24, 186 46 M142 84 C164 88, 184 72, 196 50 C180 44, 158 50, 140 66"
        stroke="#00313C"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'lorin-preloader-style';
  styleEl.textContent = `
    #lorin-page-preloader {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      visibility: visible;
      transition: opacity 0.35s ease, visibility 0.35s ease;
    }

    #lorin-page-preloader.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .lorin-preloader-card {
      width: 96px;
      height: 96px;
      border-radius: 14px;
      background-color: #ffffff;
      border: 1px solid #f0f2f2;
      box-shadow: 0 8px 24px rgba(0, 49, 60, 0.07);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      box-sizing: border-box;
    }

    .lorin-preloader-card svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    .lorin-draw-path {
      stroke-dasharray: 420;
      stroke-dashoffset: 420;
      animation: lorinStrokeDraw 2.1s cubic-bezier(0.45, 0.05, 0.25, 0.95) infinite;
    }

    .lorin-path-base {
      animation-delay: 0.12s;
    }

    .lorin-path-stem {
      animation-delay: 0.24s;
    }

    .lorin-path-petal-1 {
      animation-delay: 0.36s;
    }

    .lorin-path-petal-2 {
      animation-delay: 0.48s;
    }

    @keyframes lorinStrokeDraw {
      0% {
        stroke-dashoffset: 420;
        opacity: 0.35;
      }
      55% {
        stroke-dashoffset: 0;
        opacity: 1;
      }
      82% {
        stroke-dashoffset: 0;
        opacity: 1;
      }
      100% {
        stroke-dashoffset: -420;
        opacity: 0.25;
      }
    }
  `;

  function createPreloader() {
    if (document.getElementById('lorin-page-preloader')) return;

    if (!document.getElementById('lorin-preloader-style')) {
      (document.head || document.documentElement).appendChild(styleEl);
    }

    const overlay = document.createElement('div');
    overlay.id = 'lorin-page-preloader';
    overlay.setAttribute('aria-hidden', 'true');

    const card = document.createElement('div');
    card.className = 'lorin-preloader-card';
    card.innerHTML = LOGO_SVG;

    overlay.appendChild(card);
    (document.body || document.documentElement).appendChild(overlay);
  }

  function showPreloader() {
    createPreloader();
    const overlay = document.getElementById('lorin-page-preloader');
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  }

  function hidePreloader() {
    const overlay = document.getElementById('lorin-page-preloader');
    if (!overlay) return;
    overlay.classList.add('is-hidden');
  }

  if (document.readyState === 'loading') {
    createPreloader();
    document.addEventListener('DOMContentLoaded', createPreloader);
  } else {
    createPreloader();
  }

  window.addEventListener('load', () => {
    setTimeout(hidePreloader, 220);
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      hidePreloader();
    }
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    showPreloader();
  });

  window.LorinPreloader = {
    show: showPreloader,
    hide: hidePreloader
  };
})();
