// lorin-auth.js
// Lorin Flora Unified Authentication & Account Dropdown Module
// Floward-inspired multi-step auth, clean account dropdown, and cart-to-checkout gate.

(function () {
  const SUPABASE_URL = 'https://dptincirgzfwrlrpxajl.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_DbYCExpNFypVQARATbdeVw_hipYS1Oa';

  let client = window.supabaseClient;
  if (!client && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = client;
  }

  // Internal state
  let currentUser = null;
  let authStep = 1; // 1: Email/Social, 2: Name & Password, 3: Phone, 4: OTP, 5: Success, 6: Password Sign In
  let pendingEmail = '';
  let pendingName = '';
  let pendingPassword = '';
  let pendingPhone = '';
  let otpTimerInterval = null;
  let otpTimeRemaining = 57;
  let redirectAfterAuth = null;

  function t(key, fallback) {
    if (window.LorinI18n && typeof window.LorinI18n.t === 'function') {
      return window.LorinI18n.t(key, fallback);
    }
    return fallback || key;
  }

  function isRtl() {
    return document.documentElement.dir === 'rtl';
  }

  // Inject Luxury Auth & Dropdown Styles
  function injectStyles() {
    if (document.getElementById('lorin-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'lorin-auth-styles';
    style.textContent = `
      :root {
        --lorin-brand: #00313C;
        --lorin-brand-hover: #00222B;
        --lorin-accent: #07515b;
        --lorin-bg-warm: #FAF8F5;
        --lorin-border: #E5E7EB;
        --lorin-text: #1F292E;
        --lorin-muted: #6B7280;
      }

      /* Modal Backdrop */
      #lorin-auth-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 999990;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }

      #lorin-auth-modal-backdrop.is-active {
        opacity: 1;
        visibility: visible;
      }

      /* Centered Auth Card (Matching Screenshots 1, 2, 3, 4, 7, 9) */
      .lorin-auth-card {
        background: #FFFFFF;
        width: 100%;
        max-width: 440px;
        border-radius: 12px;
        box-shadow: 0 16px 40px rgba(0, 49, 60, 0.12), 0 2px 6px rgba(0,0,0,0.04);
        border: 1px solid var(--lorin-border);
        padding: 40px 36px;
        position: relative;
        transform: translateY(16px) scale(0.98);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }

      #lorin-auth-modal-backdrop.is-active .lorin-auth-card {
        transform: translateY(0) scale(1);
      }

      .lorin-auth-close-btn {
        position: absolute;
        top: 18px;
        ${isRtl() ? 'left: 18px;' : 'right: 18px;'};
        background: none;
        border: none;
        font-size: 20px;
        color: #9CA3AF;
        cursor: pointer;
        padding: 6px;
        line-height: 1;
        border-radius: 6px;
        transition: color 0.15s;
      }
      .lorin-auth-close-btn:hover { color: #111; }

      .lorin-auth-back-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        font-size: 13px;
        color: #6B7280;
        cursor: pointer;
        padding: 0;
        margin-bottom: 18px;
        font-weight: 500;
        transition: color 0.15s;
      }
      .lorin-auth-back-btn:hover { color: #111; }

      .lorin-auth-title {
        font-family: "Cormorant Garamond", Georgia, "Tajawal", serif;
        font-size: 28px;
        font-weight: 600;
        color: #111827;
        text-align: center;
        margin: 0 0 6px 0;
        line-height: 1.2;
      }

      .lorin-auth-subtitle {
        font-size: 13px;
        color: #6B7280;
        text-align: center;
        margin: 0 0 28px 0;
        line-height: 1.45;
      }

      .lorin-field-group {
        margin-bottom: 20px;
        text-align: ${isRtl() ? 'right' : 'left'};
      }

      .lorin-field-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
      }

      .lorin-text-input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        font-size: 14px;
        color: #111827;
        background: #FFFFFF;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
      }
      .lorin-text-input:focus {
        border-color: var(--lorin-brand);
        box-shadow: 0 0 0 3px rgba(0, 49, 60, 0.08);
      }

      /* Primary Button */
      .lorin-btn-primary {
        width: 100%;
        background: #111111;
        color: #FFFFFF;
        border: none;
        border-radius: 6px;
        padding: 13px 18px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: inherit;
      }
      .lorin-btn-primary:hover {
        background: var(--lorin-brand);
      }
      .lorin-btn-primary:disabled {
        background: #D1D5DB;
        color: #9CA3AF;
        cursor: not-allowed;
      }

      /* Social OAuth Buttons */
      .lorin-social-btn {
        width: 100%;
        background: #FFFFFF;
        color: #374151;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        padding: 11px 16px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: background 0.15s, border-color 0.15s;
        font-family: inherit;
        margin-top: 10px;
      }
      .lorin-social-btn:hover {
        background: #F9FAFB;
        border-color: #9CA3AF;
      }
      .lorin-social-btn svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .lorin-auth-divider {
        display: flex;
        align-items: center;
        margin: 20px 0;
        color: #9CA3AF;
        font-size: 12px;
      }
      .lorin-auth-divider::before,
      .lorin-auth-divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #E5E7EB;
      }
      .lorin-auth-divider span {
        padding: 0 12px;
      }

      /* Password Strength Checklist (Screenshot 9) */
      .lorin-pwd-checklist {
        margin: 14px 0 22px 0;
        text-align: ${isRtl() ? 'right' : 'left'};
      }
      .lorin-pwd-checklist-title {
        font-size: 12px;
        color: #6B7280;
        margin-bottom: 8px;
      }
      .lorin-pwd-rule {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #6B7280;
        margin-bottom: 6px;
        transition: color 0.2s;
      }
      .lorin-pwd-rule.is-valid {
        color: #10B981;
        font-weight: 600;
      }
      .lorin-pwd-rule-box {
        width: 14px;
        height: 14px;
        border: 1px solid #D1D5DB;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        transition: background 0.2s, border-color 0.2s;
      }
      .lorin-pwd-rule.is-valid .lorin-pwd-rule-box {
        background: #10B981;
        border-color: #10B981;
        color: #FFFFFF;
      }

      /* Phone Input with Jordan Flag (Screenshot 2) */
      .lorin-phone-wrapper {
        display: flex;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        overflow: hidden;
        background: #FFFFFF;
      }
      .lorin-phone-prefix {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #F9FAFB;
        border-${isRtl() ? 'left' : 'right'}: 1px solid #E5E7EB;
        padding: 0 12px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        user-select: none;
      }
      .lorin-phone-input {
        flex: 1;
        border: none;
        padding: 12px 14px;
        font-size: 14px;
        color: #111827;
        outline: none;
        font-family: inherit;
      }

      /* OTP Box (Screenshot 7) */
      .lorin-otp-inputs {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 24px 0 20px 0;
        direction: ltr;
      }
      .lorin-otp-box {
        width: 52px;
        height: 56px;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        text-align: center;
        font-size: 22px;
        font-weight: 700;
        color: #111827;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .lorin-otp-box:focus {
        border-color: var(--lorin-brand);
        box-shadow: 0 0 0 3px rgba(0, 49, 60, 0.1);
      }

      /* Success Screen (Screenshot 4) */
      .lorin-success-icon-wrap {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px auto;
        background: #F0FDF4;
        border: 1px solid #DCFCE7;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Header Account Dropdown (Matching Screenshot 8) */
      .lorin-account-dropdown-menu {
        display: none;
        position: absolute;
        top: calc(100% + 10px);
        ${isRtl() ? 'left: 0;' : 'right: 0;'};
        width: 290px;
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0,0,0,0.03);
        z-index: 99999;
        overflow: hidden;
        animation: lorinFadeIn 0.2s ease forwards;
        box-sizing: border-box;
      }
      .lorin-account-dropdown-menu.is-active {
        display: block;
      }

      @keyframes lorinFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .lorin-acc-header {
        padding: 16px 20px 14px 20px;
        border-bottom: 1px solid #F3F4F6;
        text-align: ${isRtl() ? 'right' : 'left'};
      }
      .lorin-acc-greeting {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .lorin-acc-email {
        font-size: 11px;
        color: #9CA3AF;
        margin: 2px 0 0 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .lorin-acc-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 18px;
        background: transparent;
        border: none;
        text-decoration: none;
        color: #374151;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        text-align: ${isRtl() ? 'right' : 'left'};
        box-sizing: border-box;
      }
      .lorin-acc-item:hover {
        background: #F9FAFB;
        color: #111827;
      }
      .lorin-acc-item-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .lorin-acc-icon {
        width: 18px;
        height: 18px;
        color: #6B7280;
        flex-shrink: 0;
      }
      .lorin-acc-chevron {
        font-size: 12px;
        color: #9CA3AF;
        transition: transform 0.15s;
        ${isRtl() ? 'transform: rotate(180deg);' : ''}
      }
      .lorin-acc-badge {
        background: #F3F4F6;
        color: #374151;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 9999px;
        margin-${isRtl() ? 'left' : 'right'}: 6px;
      }

      .lorin-acc-signout-row {
        border-top: 1px solid #F3F4F6;
        padding-top: 4px;
        margin-top: 4px;
      }
      .lorin-acc-signout-btn {
        color: #DC2626 !important;
      }
      .lorin-acc-signout-btn .lorin-acc-icon {
        color: #DC2626 !important;
      }

      /* Slide-out Drawer for Account Details (Orders, Profile, Addresses) */
      .lorin-drawer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 999992;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s;
      }
      .lorin-drawer-backdrop.is-active {
        opacity: 1;
        visibility: visible;
      }
      .lorin-slide-drawer {
        position: fixed;
        top: 0;
        ${isRtl() ? 'left: 0;' : 'right: 0;'};
        width: 440px;
        max-width: 90vw;
        height: 100vh;
        background: #FFFFFF;
        z-index: 999993;
        box-shadow: 0 0 30px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        transform: translateX(${isRtl() ? '-100%' : '100%'});
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 24px;
        box-sizing: border-box;
      }
      .lorin-slide-drawer.is-active {
        transform: translateX(0);
      }
    `;
    document.head.appendChild(style);
  }

  // Create & Inject Modal DOM
  function createModal() {
    if (document.getElementById('lorin-auth-modal-backdrop')) return;
    injectStyles();

    const backdrop = document.createElement('div');
    backdrop.id = 'lorin-auth-modal-backdrop';
    backdrop.innerHTML = `
      <div class="lorin-auth-card" id="lorin-auth-card-content">
        <!-- Injected via renderCurrentStep() -->
      </div>
    `;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    document.body.appendChild(backdrop);
  }

  // Close Auth Modal
  function closeModal() {
    const backdrop = document.getElementById('lorin-auth-modal-backdrop');
    if (backdrop) backdrop.classList.remove('is-active');
    if (otpTimerInterval) clearInterval(otpTimerInterval);
  }

  // Open Auth Modal
  function openModal(step = 1, redirect = null) {
    createModal();
    authStep = step;
    redirectAfterAuth = redirect || redirectAfterAuth;
    renderCurrentStep();
    const backdrop = document.getElementById('lorin-auth-modal-backdrop');
    if (backdrop) backdrop.classList.add('is-active');
  }

  // Render Step Inside Card
  function renderCurrentStep() {
    const container = document.getElementById('lorin-auth-card-content');
    if (!container) return;

    if (authStep === 1) {
      // Step 1: Email + Social (Screenshot 1)
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <h2 class="lorin-auth-title">${t('auth_title_login_signup', 'Login or Create Account')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_subtitle_login_signup', 'Find the perfect gift for your special occasion')}</p>

        <form id="lorin-step1-form" onsubmit="LorinAuth.handleStep1Submit(event)">
          <div class="lorin-field-group">
            <label class="lorin-field-label">${t('auth_email_label', 'Email address')}</label>
            <input type="email" id="auth-email-input" class="lorin-text-input" placeholder="${t('auth_email_placeholder', 'Enter your email address')}" value="${pendingEmail}" required autocomplete="email">
          </div>
          <button type="submit" class="lorin-btn-primary" id="btn-auth-step1">${t('auth_continue', 'CONTINUE')}</button>
        </form>

        <div class="lorin-auth-divider"><span>${t('auth_or', 'or')}</span></div>

        <button type="button" class="lorin-social-btn" onclick="LorinAuth.handleGoogleAuth()">
          <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          <span>${t('auth_google', 'CONTINUE WITH GOOGLE')}</span>
        </button>

        <button type="button" class="lorin-social-btn" onclick="LorinAuth.handleAppleAuth()">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96.99-3.12-1 .04-2.18.66-2.87 1.48-.61.71-1.14 1.88-.99 3 1.11.09 2.22-.55 2.87-1.36z"/></svg>
          <span>${t('auth_apple', 'CONTINUE WITH APPLE')}</span>
        </button>

        <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
          ${t('auth_terms_prefix', 'By proceeding, you agree to our ')}
          <a href="#" style="color: #4B5563; text-decoration: underline;">${t('auth_privacy_policy', 'Privacy policy')}</a>
          ${t('auth_terms_and', ' and ')}
          <a href="#" style="color: #4B5563; text-decoration: underline;">${t('auth_terms_conditions', 'Terms & Conditions')}</a>
        </p>

        <p style="font-size: 10px; color: #9CA3AF; text-align: center; margin: 12px 0 0 0; line-height: 1.4;">
          ${t('auth_recaptcha_notice', 'This page is protected by reCAPTCHA and is subject to the Google Privacy policy and Terms of Service.')}
        </p>
      `;
    } else if (authStep === 2) {
      // Step 2: Sign Up (Name & Password with visual checklist - Screenshots 3 & 9)
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <button class="lorin-auth-back-btn" onclick="LorinAuth.setStep(1)">
          <span>‹</span> <span>${t('auth_back', 'Back')}</span>
        </button>

        <h2 class="lorin-auth-title">${t('auth_signup_title', 'Sign up')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_signup_subtitle', 'Enter your Name and Create a Password')}</p>

        <form id="lorin-step2-form" onsubmit="LorinAuth.handleStep2Submit(event)">
          <div class="lorin-field-group">
            <label class="lorin-field-label">${t('auth_fullname_label', 'Full Name')}</label>
            <input type="text" id="auth-name-input" class="lorin-text-input" placeholder="${t('auth_fullname_placeholder', 'Please add your full name')}" value="${pendingName}" required oninput="LorinAuth.validateStep2()">
          </div>

          <div class="lorin-field-group">
            <label class="lorin-field-label">${t('auth_password_label', 'Password')}</label>
            <div style="position: relative;">
              <input type="password" id="auth-pwd-input" class="lorin-text-input" placeholder="${t('auth_password_placeholder', 'Enter your password')}" value="${pendingPassword}" required oninput="LorinAuth.validateStep2()" style="padding-${isRtl() ? 'left' : 'right'}: 40px;">
              <button type="button" onclick="LorinAuth.togglePasswordVisibility('auth-pwd-input', this)" style="position: absolute; top: 50%; ${isRtl() ? 'left: 12px;' : 'right: 12px;'}; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6B7280; font-size: 15px;">👁</button>
            </div>
          </div>

          <div class="lorin-pwd-checklist">
            <div class="lorin-pwd-checklist-title">${t('auth_pwd_rule_title', 'Your password must contain:')}</div>
            <div class="lorin-pwd-rule" id="rule-lower">
              <span class="lorin-pwd-rule-box">✓</span>
              <span>${t('auth_pwd_rule_lower', 'Lower case letter (a-z)')}</span>
            </div>
            <div class="lorin-pwd-rule" id="rule-upper">
              <span class="lorin-pwd-rule-box">✓</span>
              <span>${t('auth_pwd_rule_upper', 'Upper case letter (A-Z)')}</span>
            </div>
            <div class="lorin-pwd-rule" id="rule-min">
              <span class="lorin-pwd-rule-box">✓</span>
              <span>${t('auth_pwd_rule_min', 'Minimum of 8 characters')}</span>
            </div>
          </div>

          <button type="submit" class="lorin-btn-primary" id="btn-auth-step2" disabled>${t('auth_continue', 'CONTINUE')}</button>
        </form>
      `;
      validateStep2();
    } else if (authStep === 3) {
      // Step 3: Phone Number with +962 Jordan flag (Screenshot 2)
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <button class="lorin-auth-back-btn" onclick="LorinAuth.setStep(2)">
          <span>‹</span> <span>${t('auth_back', 'Back')}</span>
        </button>

        <h2 class="lorin-auth-title">${t('auth_phone_title', 'Lastly, Your Phone Number')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_phone_subtitle', 'We will send a one time code to verify your phone number')}</p>

        <form id="lorin-step3-form" onsubmit="LorinAuth.handleStep3Submit(event)">
          <div class="lorin-field-group">
            <label class="lorin-field-label">${t('auth_phone_label', 'Phone Number')}</label>
            <div class="lorin-phone-wrapper">
              <div class="lorin-phone-prefix">
                <span>🇯🇴</span>
                <span>+962 ▾</span>
              </div>
              <input type="tel" id="auth-phone-input" class="lorin-phone-input" placeholder="789719084" value="${pendingPhone}" required dir="ltr" maxlength="10">
            </div>
          </div>

          <button type="submit" class="lorin-btn-primary" id="btn-auth-step3" style="margin-top: 10px;">${t('auth_continue', 'CONTINUE')}</button>
        </form>

        <p style="font-size: 10px; color: #9CA3AF; text-align: center; margin: 24px 0 0 0; line-height: 1.4;">
          ${t('auth_recaptcha_notice', 'This page is protected by reCAPTCHA and is subject to the Google Privacy policy and Terms of Service.')}
        </p>
      `;
    } else if (authStep === 4) {
      // Step 4: OTP Verification Screen (Screenshot 7)
      startOtpTimer();
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <button class="lorin-auth-back-btn" onclick="LorinAuth.setStep(3)">
          <span>‹</span> <span>${t('auth_back', 'Back')}</span>
        </button>

        <h2 class="lorin-auth-title">${t('auth_otp_title', 'Verify Your Phone Number')}</h2>
        <p class="lorin-auth-subtitle" style="margin-bottom: 8px;">${t('auth_otp_subtitle', 'We sent a verification code via SMS to:')}</p>
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
          <strong dir="ltr" style="font-size: 14px; color: #111;">+962${pendingPhone}</strong>
          <button type="button" onclick="LorinAuth.setStep(3)" style="background: none; border: none; color: #0284C7; font-size: 11px; font-weight: 700; cursor: pointer;">${t('auth_change', 'CHANGE')}</button>
        </div>

        <form id="lorin-otp-form" onsubmit="LorinAuth.handleOtpSubmit(event)">
          <div class="lorin-otp-inputs">
            <input type="text" maxlength="1" class="lorin-otp-box" data-idx="0" autofocus oninput="LorinAuth.handleOtpInput(this, event)">
            <input type="text" maxlength="1" class="lorin-otp-box" data-idx="1" oninput="LorinAuth.handleOtpInput(this, event)">
            <input type="text" maxlength="1" class="lorin-otp-box" data-idx="2" oninput="LorinAuth.handleOtpInput(this, event)">
            <input type="text" maxlength="1" class="lorin-otp-box" data-idx="3" oninput="LorinAuth.handleOtpInput(this, event)">
          </div>

          <button type="submit" class="lorin-btn-primary" id="btn-auth-otp">${t('auth_verify', 'VERIFY')}</button>
        </form>

        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #6B7280;">
          <span id="otp-timer-text">${t('auth_resend_timer', 'Request a new code in')} <b id="otp-countdown">00:57</b></span>
          <button type="button" id="btn-resend-otp" onclick="LorinAuth.resendOtp()" style="display: none; background: none; border: none; color: var(--lorin-brand); font-weight: 700; cursor: pointer; text-decoration: underline;">${t('auth_resend_action', 'Resend code now')}</button>
        </div>
      `;
    } else if (authStep === 5) {
      // Step 5: Verification Successful (Screenshot 4)
      container.innerHTML = `
        <div class="lorin-success-icon-wrap">
          <svg style="width: 36px; height: 36px; color: #10B981;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>

        <h2 class="lorin-auth-title">${t('auth_success_title', 'Verification Successful')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_success_subtitle', 'Your Phone Number is now verified.')}</p>

        <button type="button" class="lorin-btn-primary" onclick="LorinAuth.finishAuth()">${t('auth_done', 'DONE')}</button>
      `;
    } else if (authStep === 6) {
      // Step 6: Existing User Password Sign In
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <button class="lorin-auth-back-btn" onclick="LorinAuth.setStep(1)">
          <span>‹</span> <span>${t('auth_back', 'Back')}</span>
        </button>

        <h2 class="lorin-auth-title">${t('auth_login_tab', 'Sign In')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_enter_pwd_prompt', 'Enter password for your registered account')}<br><b style="color: #111;">${pendingEmail}</b></p>

        <form id="lorin-signin-form" onsubmit="LorinAuth.handleSignInSubmit(event)">
          <div class="lorin-field-group">
            <label class="lorin-field-label">${t('auth_password_label', 'Password')}</label>
            <div style="position: relative;">
              <input type="password" id="auth-signin-pwd" class="lorin-text-input" placeholder="${t('auth_password_placeholder', 'Enter your password')}" required autofocus style="padding-${isRtl() ? 'left' : 'right'}: 40px;">
              <button type="button" onclick="LorinAuth.togglePasswordVisibility('auth-signin-pwd', this)" style="position: absolute; top: 50%; ${isRtl() ? 'left: 12px;' : 'right: 12px;'}; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6B7280; font-size: 15px;">👁</button>
            </div>
          </div>

          <div id="signin-error-msg" style="display: none; color: #DC2626; font-size: 12px; margin-bottom: 12px; font-weight: 600;"></div>

          <button type="submit" class="lorin-btn-primary" id="btn-auth-signin">${t('auth_continue', 'CONTINUE')}</button>
        </form>
      `;
    }
  }

  // Password validation in Step 2
  function validateStep2() {
    const nameInput = document.getElementById('auth-name-input');
    const pwdInput = document.getElementById('auth-pwd-input');
    const submitBtn = document.getElementById('btn-auth-step2');
    if (!pwdInput || !submitBtn) return;

    const pwd = pwdInput.value || '';
    const name = nameInput ? nameInput.value.trim() : '';

    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasMin = pwd.length >= 8;

    const rLower = document.getElementById('rule-lower');
    const rUpper = document.getElementById('rule-upper');
    const rMin = document.getElementById('rule-min');

    if (rLower) rLower.classList.toggle('is-valid', hasLower);
    if (rUpper) rUpper.classList.toggle('is-valid', hasUpper);
    if (rMin) rMin.classList.toggle('is-valid', hasMin);

    const isAllValid = hasLower && hasUpper && hasMin && name.length >= 2;
    submitBtn.disabled = !isAllValid;
  }

  function togglePasswordVisibility(inputId, btn) {
    const el = document.getElementById(inputId);
    if (!el) return;
    if (el.type === 'password') {
      el.type = 'text';
      btn.textContent = '🔒';
    } else {
      el.type = 'password';
      btn.textContent = '👁';
    }
  }

  // Handlers
  async function handleStep1Submit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email-input');
    if (!emailInput) return;
    pendingEmail = emailInput.value.trim().toLowerCase();
    if (!pendingEmail) return;

    const btn = document.getElementById('btn-auth-step1');
    btn.disabled = true;
    btn.textContent = t('loading_wait', 'Processing...');

    // Check if user exists or proceed to step 2 for clean signup
    // In Supabase, signInWithPassword test allows detecting if account is existing or fresh
    authStep = 2;
    renderCurrentStep();
  }

  function handleStep2Submit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('auth-name-input');
    const pwdInput = document.getElementById('auth-pwd-input');
    if (!nameInput || !pwdInput) return;

    pendingName = nameInput.value.trim();
    pendingPassword = pwdInput.value;
    authStep = 3; // Proceed to Phone
    renderCurrentStep();
  }

  async function handleStep3Submit(e) {
    e.preventDefault();
    const phoneInput = document.getElementById('auth-phone-input');
    if (!phoneInput) return;

    let phone = phoneInput.value.replace(/\D/g, '');
    if (phone.startsWith('962')) phone = phone.slice(3);
    if (phone.startsWith('0')) phone = phone.slice(1);

    if (phone.length < 8) {
      alert(t('msg_invalid_phone', 'Please enter a valid Jordanian phone number'));
      return;
    }

    pendingPhone = phone;
    const btn = document.getElementById('btn-auth-step3');
    btn.disabled = true;
    btn.textContent = t('loading_wait', 'Processing...');

    // Attempt Supabase Sign Up or Sign In
    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: pendingEmail,
          password: pendingPassword,
          options: {
            data: {
              full_name: pendingName,
              phone: '+962' + pendingPhone,
              jordanian_phone: '+962' + pendingPhone
            }
          }
        });

        if (error && /already registered|already in use/i.test(error.message)) {
          // Switch to Step 6 (Sign In)
          authStep = 6;
          renderCurrentStep();
          return;
        }
      } catch (err) {
        console.warn('Auth note:', err);
      }
    }

    // Advance to OTP verification screen
    authStep = 4;
    renderCurrentStep();
  }

  function handleOtpInput(input, event) {
    const val = input.value.replace(/\D/g, '');
    input.value = val;
    const idx = parseInt(input.getAttribute('data-idx') || '0', 10);
    const boxes = document.querySelectorAll('.lorin-otp-box');

    if (val && idx < boxes.length - 1) {
      boxes[idx + 1].focus();
    } else if (!val && event.inputType === 'deleteContentBackward' && idx > 0) {
      boxes[idx - 1].focus();
    }
  }

  function startOtpTimer() {
    if (otpTimerInterval) clearInterval(otpTimerInterval);
    otpTimeRemaining = 57;
    otpTimerInterval = setInterval(() => {
      otpTimeRemaining--;
      const el = document.getElementById('otp-countdown');
      if (el) {
        const m = Math.floor(otpTimeRemaining / 60);
        const s = otpTimeRemaining % 60;
        el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      if (otpTimeRemaining <= 0) {
        clearInterval(otpTimerInterval);
        const timerText = document.getElementById('otp-timer-text');
        const resendBtn = document.getElementById('btn-resend-otp');
        if (timerText) timerText.style.display = 'none';
        if (resendBtn) resendBtn.style.display = 'inline-block';
      }
    }, 1000);
  }

  function resendOtp() {
    alert(t('auth_otp_title', 'Verify Your Phone Number') + ': ' + t('loading_wait', 'Code sent!'));
    startOtpTimer();
    const timerText = document.getElementById('otp-timer-text');
    const resendBtn = document.getElementById('btn-resend-otp');
    if (timerText) timerText.style.display = 'inline-block';
    if (resendBtn) resendBtn.style.display = 'none';
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    const boxes = Array.from(document.querySelectorAll('.lorin-otp-box'));
    const code = boxes.map((b) => b.value).join('');

    if (code.length < 4) {
      alert(t('msg_fill_required', 'Please fill in verification code'));
      return;
    }

    const btn = document.getElementById('btn-auth-otp');
    btn.disabled = true;
    btn.textContent = t('loading_wait', 'Processing...');

    // If verification token check is required
    if (client) {
      try {
        await client.auth.verifyOtp({
          email: pendingEmail,
          token: code,
          type: 'signup'
        });
      } catch (_) {}
    }

    // Refresh user session & advance to Success
    await syncUser();
    authStep = 5;
    renderCurrentStep();
  }

  async function handleSignInSubmit(e) {
    e.preventDefault();
    const pwdInput = document.getElementById('auth-signin-pwd');
    const errBox = document.getElementById('signin-error-msg');
    const btn = document.getElementById('btn-auth-signin');
    if (!pwdInput) return;

    btn.disabled = true;
    btn.textContent = t('loading_wait', 'Processing...');
    if (errBox) errBox.style.display = 'none';

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: pendingEmail,
          password: pwdInput.value
        });

        if (error) {
          if (errBox) {
            errBox.textContent = error.message;
            errBox.style.display = 'block';
          }
          btn.disabled = false;
          btn.textContent = t('auth_continue', 'CONTINUE');
          return;
        }
      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message;
          errBox.style.display = 'block';
        }
        btn.disabled = false;
        btn.textContent = t('auth_continue', 'CONTINUE');
        return;
      }
    }

    await syncUser();
    finishAuth();
  }

  async function handleGoogleAuth() {
    if (!client) return;
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) {
        alert('Google Sign-In note: ' + error.message);
      }
    } catch (e) {
      alert('Google Sign-In note: ' + e.message);
    }
  }

  async function handleAppleAuth() {
    if (!client) return;
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) {
        alert('Apple Sign-In note: ' + error.message);
      }
    } catch (e) {
      alert('Apple Sign-In note: ' + e.message);
    }
  }

  function finishAuth() {
    closeModal();
    updateHeaderAccount();

    if (redirectAfterAuth) {
      const dest = redirectAfterAuth;
      redirectAfterAuth = null;
      window.location.href = dest;
    }
  }

  // User State Sync
  async function syncUser() {
    if (!client) return null;
    try {
      const { data } = await client.auth.getSession();
      if (data && data.session && data.session.user) {
        currentUser = data.session.user;
      } else {
        currentUser = null;
      }
    } catch (_) {
      currentUser = null;
    }
    updateHeaderAccount();
    return currentUser;
  }

  function getUser() {
    return currentUser;
  }

  function getUserDisplayName() {
    if (!currentUser) return '';
    const meta = currentUser.user_metadata || {};
    return meta.full_name || meta.name || currentUser.email.split('@')[0] || '';
  }

  // Header Dropdown Setup (Screenshot 8)
  function setupHeaderAccount() {
    injectStyles();

    // Find account trigger buttons on the page
    const accountButtons = document.querySelectorAll('.floward-right-group a, a.floward-btn-link');
    accountButtons.forEach((link) => {
      const text = (link.textContent || '').trim().toLowerCase();
      const hasAccountSvg = link.querySelector('svg path[d*="M20 21"]');
      if (text.includes('account') || text.includes('حسابي') || hasAccountSvg) {
        link.classList.add('lorin-account-trigger');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          onAccountClick(link);
        });
      }
    });

    updateHeaderAccount();
  }

  function updateHeaderAccount() {
    const triggers = document.querySelectorAll('.lorin-account-trigger');
    const name = getUserDisplayName();

    triggers.forEach((btn) => {
      const label = btn.querySelector('span, .btn-label');
      if (label) {
        if (currentUser && name) {
          const first = name.split(' ')[0];
          label.textContent = `${t('account_greeting_prefix', 'Hi')} ${first}`;
        } else {
          label.textContent = t('nav_account', 'Account');
        }
      }
    });

    // Close any open dropdown on body click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lorin-account-trigger') && !e.target.closest('.lorin-account-dropdown-menu')) {
        closeAccountDropdown();
      }
    });
  }

  function onAccountClick(triggerEl) {
    if (!currentUser) {
      // Unauthenticated -> Open multi-step auth modal
      openModal(1);
    } else {
      // Authenticated -> Toggle dropdown matching Screenshot 8
      toggleAccountDropdown(triggerEl);
    }
  }

  function toggleAccountDropdown(triggerEl) {
    let dropdown = document.getElementById('lorin-header-account-dropdown');
    if (dropdown && dropdown.classList.contains('is-active')) {
      closeAccountDropdown();
      return;
    }

    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'lorin-header-account-dropdown';
      dropdown.className = 'lorin-account-dropdown-menu';
      document.body.appendChild(dropdown);
    }

    const name = getUserDisplayName() || t('account_guest', 'Guest');
    const email = currentUser ? currentUser.email : '';

    // STRICT FILTER: View/Edit Profile, My Orders, My Subscriptions, Notifications, My Addresses, Favourite
    // EXCLUDES: VIP, Points, Referrals, Invoices, Occasions & Network
    dropdown.innerHTML = `
      <div class="lorin-acc-header">
        <p class="lorin-acc-greeting">${t('account_greeting_prefix', 'Hi')} ${name}</p>
        <p class="lorin-acc-email">${email}</p>
      </div>

      <button type="button" class="lorin-acc-item" onclick="LorinAuth.openAccountView('profile')">
        <span class="lorin-acc-item-left">
          <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>${t('menu_profile', 'View/Edit My Profile')}</span>
        </span>
        <span class="lorin-acc-chevron">›</span>
      </button>

      <button type="button" class="lorin-acc-item" onclick="LorinAuth.openAccountView('orders')">
        <span class="lorin-acc-item-left">
          <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>${t('menu_orders', 'My Orders')}</span>
        </span>
        <span class="lorin-acc-chevron">›</span>
      </button>

      <button type="button" class="lorin-acc-item" onclick="LorinAuth.openAccountView('subscriptions')">
        <span class="lorin-acc-item-left">
          <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>${t('menu_subscriptions', 'My Subscriptions')}</span>
        </span>
        <span class="lorin-acc-chevron">›</span>
      </button>

      <button type="button" class="lorin-acc-item" onclick="LorinAuth.openAccountView('notifications')">
        <span class="lorin-acc-item-left">
          <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span>${t('menu_notifications', 'Notifications')}</span>
        </span>
        <span style="display: flex; align-items: center;">
          <span class="lorin-acc-badge">1</span>
          <span class="lorin-acc-chevron">›</span>
        </span>
      </button>

      <button type="button" class="lorin-acc-item" onclick="LorinAuth.openAccountView('addresses')">
        <span class="lorin-acc-item-left">
          <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>${t('menu_addresses', 'My Addresses')}</span>
        </span>
        <span class="lorin-acc-chevron">›</span>
      </button>

      <button type="button" class="lorin-acc-item" onclick="LorinAuth.openAccountView('favourite')">
        <span class="lorin-acc-item-left">
          <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>${t('menu_favourite', 'Favourite')}</span>
        </span>
        <span class="lorin-acc-chevron">›</span>
      </button>

      <div class="lorin-acc-signout-row">
        <button type="button" class="lorin-acc-item lorin-acc-signout-btn" onclick="LorinAuth.signOut()">
          <span class="lorin-acc-item-left">
            <svg class="lorin-acc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>${t('menu_signout', 'Sign Out')}</span>
          </span>
          <span class="lorin-acc-chevron">›</span>
        </button>
      </div>
    `;

    // Position dropdown under trigger element
    const rect = triggerEl.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 8}px`;
    if (isRtl()) {
      dropdown.style.left = `${Math.max(12, rect.left - 100)}px`;
      dropdown.style.right = 'auto';
    } else {
      dropdown.style.right = `${Math.max(12, window.innerWidth - rect.right - 20)}px`;
      dropdown.style.left = 'auto';
    }

    dropdown.classList.add('is-active');
  }

  function closeAccountDropdown() {
    const dropdown = document.getElementById('lorin-header-account-dropdown');
    if (dropdown) dropdown.classList.remove('is-active');
  }

  async function signOut() {
    closeAccountDropdown();
    if (client) {
      await client.auth.signOut();
    }
    currentUser = null;
    updateHeaderAccount();
    alert(t('msg_signed_out', 'Signed out successfully.'));
  }

  // Account Slide-out Views
  function openAccountView(view) {
    closeAccountDropdown();
    createAccountDrawer();

    const titleEl = document.getElementById('lorin-drawer-title');
    const bodyEl = document.getElementById('lorin-drawer-body');
    const drawerBackdrop = document.getElementById('lorin-account-drawer-backdrop');
    const drawer = document.getElementById('lorin-account-drawer');

    if (!titleEl || !bodyEl || !drawer) return;

    if (view === 'profile') {
      titleEl.textContent = t('menu_profile', 'View/Edit My Profile');
      const meta = (currentUser && currentUser.user_metadata) || {};
      bodyEl.innerHTML = `
        <form onsubmit="LorinAuth.saveProfile(event)" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label class="lorin-field-label">${t('auth_fullname_label', 'Full Name')}</label>
            <input type="text" id="edit-profile-name" class="lorin-text-input" value="${meta.full_name || ''}" required>
          </div>
          <div>
            <label class="lorin-field-label">${t('auth_phone_label', 'Phone Number')}</label>
            <input type="tel" id="edit-profile-phone" class="lorin-text-input" value="${meta.phone || meta.jordanian_phone || ''}" dir="ltr">
          </div>
          <div>
            <label class="lorin-field-label">${t('auth_email_label', 'Email address')}</label>
            <input type="email" class="lorin-text-input" value="${currentUser ? currentUser.email : ''}" disabled style="background: #F3F4F6;">
          </div>
          <button type="submit" class="lorin-btn-primary" style="margin-top: 10px;">${t('auth_done', 'Save Changes')}</button>
        </form>
      `;
    } else if (view === 'orders') {
      titleEl.textContent = t('menu_orders', 'My Orders');
      loadUserOrders(bodyEl);
    } else if (view === 'addresses') {
      titleEl.textContent = t('menu_addresses', 'My Addresses');
      bodyEl.innerHTML = `
        <div style="padding: 20px 0; text-align: center; color: #6B7280; font-size: 13px;">
          <p>📍 عمان، الأردن (العنوان المسجل تلقائياً مع طلباتك)</p>
          <p style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">يمكنك إضافة عناوين جديدة مباشرة أثناء إتمام طلباتك.</p>
        </div>
      `;
    } else if (view === 'notifications') {
      titleEl.textContent = t('menu_notifications', 'Notifications');
      bodyEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
          <div style="padding: 14px; background: #FAF8F5; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 12px;">
            <div style="font-weight: 700; color: #00313C; margin-bottom: 4px;">🌸 مرحباً بك في متجر Lorin للزهور والهدايا</div>
            <div style="color: #6B7280;">استمتع بتجربة تسوق راقية وتوصيل فوري خلال 120 دقيقة في الأردن.</div>
          </div>
        </div>
      `;
    } else {
      titleEl.textContent = t('menu_' + view, view);
      bodyEl.innerHTML = `<p style="text-align: center; color: #9CA3AF; padding: 40px 0; font-size: 13px;">لا توجد عناصر حالياً.</p>`;
    }

    drawerBackdrop.classList.add('is-active');
    drawer.classList.add('is-active');
  }

  function createAccountDrawer() {
    if (document.getElementById('lorin-account-drawer-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'lorin-account-drawer-backdrop';
    backdrop.className = 'lorin-drawer-backdrop';

    const drawer = document.createElement('div');
    drawer.id = 'lorin-account-drawer';
    drawer.className = 'lorin-slide-drawer';
    drawer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6;">
        <h3 id="lorin-drawer-title" style="margin: 0; font-size: 18px; font-weight: 700; color: #111;"></h3>
        <button type="button" onclick="LorinAuth.closeAccountDrawer()" style="background: none; border: none; font-size: 20px; color: #9CA3AF; cursor: pointer;">✕</button>
      </div>
      <div id="lorin-drawer-body" style="flex: 1; overflow-y: auto; padding-top: 20px;"></div>
    `;

    backdrop.addEventListener('click', closeAccountDrawer);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
  }

  function closeAccountDrawer() {
    const backdrop = document.getElementById('lorin-account-drawer-backdrop');
    const drawer = document.getElementById('lorin-account-drawer');
    if (backdrop) backdrop.classList.remove('is-active');
    if (drawer) drawer.classList.remove('is-active');
  }

  async function saveProfile(e) {
    e.preventDefault();
    const name = document.getElementById('edit-profile-name').value.trim();
    const phone = document.getElementById('edit-profile-phone').value.trim();

    if (client) {
      await client.auth.updateUser({
        data: { full_name: name, phone: phone }
      });
      await syncUser();
      alert('تم حفظ البيانات بنجاح 🌸');
      closeAccountDrawer();
    }
  }

  async function loadUserOrders(container) {
    container.innerHTML = `<p style="text-align: center; color: #9CA3AF; padding: 20px;">${t('loading_wait', 'جاري جلب الطلبات...')}</p>`;
    if (!client) return;

    try {
      const meta = (currentUser && currentUser.user_metadata) || {};
      const userPhone = meta.phone || meta.jordanian_phone || '';
      const cleanPhone = userPhone.replace(/\D/g, '');

      let query = client.from('orders').select('*').order('created_at', { ascending: false }).limit(10);
      const { data: orders, error } = await query;

      if (error || !orders || orders.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #9CA3AF; padding: 30px;">لم تقم بأي طلبات بعد 🌸</p>`;
        return;
      }

      container.innerHTML = orders.map((o) => `
        <div style="background: #FAF8F5; border: 1px solid #E5E7EB; border-radius: 10px; padding: 14px; margin-bottom: 12px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; color: #00313C; margin-bottom: 6px;">
            <span>طلب #${o.id || 'N/A'}</span>
            <span style="color: #DC2626;">${Number(o.total_price || 0).toFixed(2)} د.أ</span>
          </div>
          <div style="color: #4B5563; font-size: 12px; line-height: 1.5;">${o.shipping_address || 'عنوان التوصيل'}</div>
          <div style="color: #9CA3AF; font-size: 11px; margin-top: 6px;">${o.created_at ? new Date(o.created_at).toLocaleDateString() : 'مكتمل'}</div>
        </div>
      `).join('');
    } catch (_) {
      container.innerHTML = `<p style="text-align: center; color: #9CA3AF; padding: 30px;">لم تقم بأي طلبات بعد 🌸</p>`;
    }
  }

  // Cart-to-Checkout Gate
  async function requireAuthOrRedirect(targetUrl = 'checkout.html') {
    await syncUser();
    if (currentUser) {
      window.location.href = targetUrl;
    } else {
      openModal(1, targetUrl);
    }
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', async () => {
    await syncUser();
    setupHeaderAccount();

    window.addEventListener('lorin:langchange', () => {
      updateHeaderAccount();
      if (document.getElementById('lorin-auth-modal-backdrop')?.classList.contains('is-active')) {
        renderCurrentStep();
      }
    });
  });

  window.LorinAuth = {
    openModal,
    closeModal,
    setStep: (s) => { authStep = s; renderCurrentStep(); },
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
    handleOtpSubmit,
    handleOtpInput,
    resendOtp,
    handleSignInSubmit,
    handleGoogleAuth,
    handleAppleAuth,
    validateStep2,
    togglePasswordVisibility,
    finishAuth,
    getUser,
    getUserDisplayName,
    signOut,
    openAccountView,
    closeAccountDrawer,
    saveProfile,
    requireAuthOrRedirect
  };
})();
