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
  let authStep = 1; // 1: Email/Social, 2: Name & Password, 3: Phone, 4: OTP (Legacy/Bypassed), 5: Success, 6: Password Sign In
  let pendingEmail = '';
  let pendingName = '';
  let pendingPassword = '';
  let pendingPhone = '';
  let redirectAfterAuth = null;

  // Country Directory fallback if lorin-countries.js isn't already loaded
  const DEFAULT_COUNTRIES = [
    { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dial: '+962', flag: '🇯🇴', placeholder: '7XXXXXXXX' },
    { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', placeholder: '5XXXXXXXX' },
    { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', dial: '+971', flag: '🇦🇪', placeholder: '5XXXXXXXX' },
    { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dial: '+965', flag: '🇰🇼', placeholder: 'XXXXXXXX' },
    { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dial: '+974', flag: '🇶🇦', placeholder: 'XXXXXXXX' },
    { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dial: '+973', flag: '🇧🇭', placeholder: 'XXXXXXXX' },
    { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman', dial: '+968', flag: '🇴🇲', placeholder: 'XXXXXXXX' },
    { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', dial: '+970', flag: '🇵🇸', placeholder: '5XXXXXXXX' },
    { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dial: '+20', flag: '🇪🇬', placeholder: '1XXXXXXXXX' },
    { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', dial: '+961', flag: '🇱🇧', placeholder: 'XXXXXXXX' },
    { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', dial: '+964', flag: '🇮🇶', placeholder: '7XXXXXXXXX' },
    { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', dial: '+963', flag: '🇸🇾', placeholder: '9XXXXXXXX' },
    { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', dial: '+967', flag: '🇾🇪', placeholder: '7XXXXXXXX' },
    { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dial: '+212', flag: '🇲🇦', placeholder: '6XXXXXXXX' },
    { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dial: '+213', flag: '🇩🇿', placeholder: 'XXXXXXXXX' },
    { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dial: '+216', flag: '🇹🇳', placeholder: 'XXXXXXXX' },
    { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', dial: '+218', flag: '🇱🇾', placeholder: '9XXXXXXXX' },
    { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', dial: '+249', flag: '🇸🇩', placeholder: '9XXXXXXXX' },
    { code: 'US', nameAr: 'الولايات المتحدة', nameEn: 'United States', dial: '+1', flag: '🇺🇸', placeholder: 'XXXXXXXXXX' },
    { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', dial: '+44', flag: '🇬🇧', placeholder: '7XXXXXXXXX' },
    { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', dial: '+1', flag: '🇨🇦', placeholder: 'XXXXXXXXXX' },
    { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', dial: '+90', flag: '🇹🇷', placeholder: '5XXXXXXXXX' },
    { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', dial: '+49', flag: '🇩🇪', placeholder: '1XXXXXXXXXX' },
    { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', dial: '+33', flag: '🇫🇷', placeholder: '6XXXXXXXX' },
    { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', dial: '+39', flag: '🇮🇹', placeholder: '3XXXXXXXXX' },
    { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', dial: '+34', flag: '🇪🇸', placeholder: '6XXXXXXXX' },
    { code: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', dial: '+31', flag: '🇳🇱', placeholder: '6XXXXXXXX' },
    { code: 'SE', nameAr: 'السويد', nameEn: 'Sweden', dial: '+46', flag: '🇸🇪', placeholder: '7XXXXXXXX' },
    { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', dial: '+41', flag: '🇨🇭', placeholder: '7XXXXXXXX' },
    { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', dial: '+61', flag: '🇦🇺', placeholder: '4XXXXXXXX' },
    { code: 'IN', nameAr: 'الهند', nameEn: 'India', dial: '+91', flag: '🇮🇳', placeholder: '9XXXXXXXXX' },
    { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', dial: '+92', flag: '🇵🇰', placeholder: '3XXXXXXXXX' },
    { code: 'CY', nameAr: 'قبرص', nameEn: 'Cyprus', dial: '+357', flag: '🇨🇾', placeholder: '9XXXXXXX' },
    { code: 'GR', nameAr: 'اليونان', nameEn: 'Greece', dial: '+30', flag: '🇬🇷', placeholder: '69XXXXXXXX' },
    { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', dial: '+60', flag: '🇲🇾', placeholder: '1XXXXXXXX' },
    { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', dial: '+62', flag: '🇮🇩', placeholder: '8XXXXXXXXX' },
    { code: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines', dial: '+63', flag: '🇵🇭', placeholder: '9XXXXXXXXX' },
    { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', dial: '+55', flag: '🇧🇷', placeholder: 'XXXXXXXXXXX' },
    { code: 'RU', nameAr: 'روسيا', nameEn: 'Russia', dial: '+7', flag: '🇷🇺', placeholder: '9XXXXXXXXX' },
    { code: 'CN', nameAr: 'الصين', nameEn: 'China', dial: '+86', flag: '🇨🇳', placeholder: '1XXXXXXXXXX' }
  ];

  let selectedSenderCountry = DEFAULT_COUNTRIES[0]; // Jordan (+962)

  function getCountriesList() {
    return window.LORIN_COUNTRIES || DEFAULT_COUNTRIES;
  }

  function t(key, fallback) {
    if (window.LorinI18n && typeof window.LorinI18n.t === 'function') {
      return window.LorinI18n.t(key, fallback);
    }
    return fallback || key;
  }

  function isRtl() {
    if (window.LorinI18n && typeof window.LorinI18n.getLang === 'function') {
      return window.LorinI18n.getLang() === 'ar';
    }
    return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
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

      /* Centered Auth Card */
      .lorin-auth-card {
        background: #FFFFFF;
        width: 100%;
        max-width: 440px;
        border-radius: 12px;
        box-shadow: 0 16px 40px rgba(0, 49, 60, 0.12), 0 2px 6px rgba(0,0,0,0.04);
        border: 1px solid var(--lorin-border);
        padding: 38px 32px;
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
        font-size: 27px;
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
        margin: 0 0 24px 0;
        line-height: 1.45;
      }

      .lorin-field-group {
        margin-bottom: 18px;
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

      /* Social OAuth Button (Google) */
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

      /* Password Strength Checklist */
      .lorin-pwd-checklist {
        margin: 14px 0 20px 0;
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

      /* Phone Input with Global Country Selector */
      .lorin-phone-wrapper {
        display: flex;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        background: #FFFFFF;
        position: relative;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .lorin-phone-wrapper:focus-within {
        border-color: var(--lorin-brand);
        box-shadow: 0 0 0 3px rgba(0, 49, 60, 0.08);
      }
      .lorin-phone-prefix-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #F9FAFB;
        border: none;
        border-${isRtl() ? 'left' : 'right'}: 1px solid #E5E7EB;
        padding: 0 12px;
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        cursor: pointer;
        transition: background 0.15s;
        font-family: inherit;
        border-top-${isRtl() ? 'right' : 'left'}-radius: 5px;
        border-bottom-${isRtl() ? 'right' : 'left'}-radius: 5px;
        user-select: none;
        white-space: nowrap;
      }
      .lorin-phone-prefix-btn:hover {
        background: #F3F4F6;
      }
      .lorin-phone-input {
        flex: 1;
        border: none;
        padding: 12px 14px;
        font-size: 14px;
        color: #111827;
        outline: none;
        font-family: inherit;
        border-top-${isRtl() ? 'left' : 'right'}-radius: 5px;
        border-bottom-${isRtl() ? 'left' : 'right'}-radius: 5px;
      }

      /* Global Country Dropdown Menu */
      .lorin-country-menu {
        position: absolute;
        top: calc(100% + 6px);
        ${isRtl() ? 'right: 0;' : 'left: 0;'};
        width: 320px;
        max-width: 90vw;
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 10px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0,0,0,0.04);
        z-index: 999999;
        overflow: hidden;
        animation: lorinFadeIn 0.15s ease forwards;
        box-sizing: border-box;
      }
      .lorin-country-search-wrap {
        padding: 10px;
        border-bottom: 1px solid #F3F4F6;
        background: #FAFAFA;
      }
      .lorin-country-search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        font-size: 12px;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
      }
      .lorin-country-search-input:focus {
        border-color: var(--lorin-brand);
      }
      .lorin-country-list {
        max-height: 220px;
        overflow-y: auto;
        padding: 4px 0;
      }
      .lorin-country-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px;
        font-size: 12px;
        color: #374151;
        cursor: pointer;
        transition: background 0.12s;
        text-align: ${isRtl() ? 'right' : 'left'};
      }
      .lorin-country-item:hover, .lorin-country-item.is-selected {
        background: #F3F4F6;
        color: #111827;
      }
      .lorin-country-item-left {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
      }
      .lorin-country-flag {
        font-size: 16px;
        flex-shrink: 0;
      }
      .lorin-country-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .lorin-country-dial {
        font-size: 11px;
        font-weight: 700;
        color: #6B7280;
        direction: ltr;
        flex-shrink: 0;
        margin-${isRtl() ? 'right' : 'left'}: 8px;
      }

      /* Forgot Password Link */
      .lorin-forgot-pwd-link {
        background: none;
        border: none;
        color: var(--lorin-brand);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        transition: color 0.15s;
        font-family: inherit;
      }
      .lorin-forgot-pwd-link:hover {
        color: #07515b;
      }

      /* Header Account Dropdown */
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

      /* Slide-out Drawer & Legal Overlay */
      .lorin-drawer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 999995;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
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
        width: 520px;
        max-width: 92vw;
        height: 100vh;
        background: #FFFFFF;
        z-index: 999996;
        box-shadow: 0 0 30px rgba(0,0,0,0.18);
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
    closeCountryDropdown();
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
      // Step 1: Email + Google (Apple removed per specification)
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

        <p style="font-size: 11px; color: #9CA3AF; text-align: center; margin: 24px 0 0 0; line-height: 1.5;">
          ${t('auth_terms_prefix', 'By proceeding, you agree to our ')}
          <a href="privacy-policy.html" target="_blank" onclick="LorinAuth.openLegalModal('privacy', event)" style="color: #4B5563; text-decoration: underline;">${t('auth_privacy_policy', 'Privacy policy')}</a>
          ${t('auth_terms_and', ' and ')}
          <a href="terms-and-conditions.html" target="_blank" onclick="LorinAuth.openLegalModal('terms', event)" style="color: #4B5563; text-decoration: underline;">${t('auth_terms_conditions', 'Terms & Conditions')}</a>
        </p>

        <p style="font-size: 10px; color: #9CA3AF; text-align: center; margin: 12px 0 0 0; line-height: 1.4;">
          ${t('auth_recaptcha_notice', 'This page is protected by reCAPTCHA and is subject to the Google Privacy policy and Terms of Service.')}
        </p>
      `;
    } else if (authStep === 2) {
      // Step 2: Sign Up (Name & Password with visual checklist)
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
      // Step 3: Sender Phone with Searchable Global Country Selector
      const c = selectedSenderCountry || DEFAULT_COUNTRIES[0];
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <button class="lorin-auth-back-btn" onclick="LorinAuth.setStep(2)">
          <span>‹</span> <span>${t('auth_back', 'Back')}</span>
        </button>

        <h2 class="lorin-auth-title">${t('auth_phone_title', 'Lastly, Your Phone Number')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_phone_subtitle', 'We will link your phone number to your account for orders and updates')}</p>

        <form id="lorin-step3-form" onsubmit="LorinAuth.handleStep3Submit(event)">
          <div class="lorin-field-group">
            <label class="lorin-field-label">${t('auth_phone_label', 'Phone Number')}</label>
            <div class="lorin-phone-wrapper" id="sender-phone-wrapper">
              <button type="button" class="lorin-phone-prefix-btn" id="sender-country-trigger" onclick="LorinAuth.toggleCountryDropdown(event)">
                <span id="sender-flag">${c.flag}</span>
                <span id="sender-dial" dir="ltr">${c.dial}</span>
                <span style="font-size: 10px; color: #9CA3AF;">▾</span>
              </button>
              <input type="tel" id="auth-phone-input" class="lorin-phone-input" placeholder="${c.placeholder || '7XXXXXXXX'}" value="${pendingPhone}" required dir="ltr">

              <!-- Country Dropdown Menu -->
              <div id="sender-country-dropdown" class="lorin-country-menu" style="display: none;">
                <div class="lorin-country-search-wrap">
                  <input type="text" id="sender-country-search" class="lorin-country-search-input" placeholder="${t('search_country', 'Search country or code...')}" oninput="LorinAuth.filterCountries(this.value)">
                </div>
                <div class="lorin-country-list" id="sender-country-list">
                  <!-- Injected via renderCountryList() -->
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="lorin-btn-primary" id="btn-auth-step3" style="margin-top: 10px;">${t('auth_continue', 'CONTINUE')}</button>
        </form>

        <p style="font-size: 10px; color: #9CA3AF; text-align: center; margin: 24px 0 0 0; line-height: 1.4;">
          ${t('auth_recaptcha_notice', 'This page is protected by reCAPTCHA and is subject to the Google Privacy policy and Terms of Service.')}
        </p>
      `;
    } else if (authStep === 6) {
      // Step 6: Existing User Password Sign In with Prominent Forgot Password Link
      container.innerHTML = `
        <button class="lorin-auth-close-btn" onclick="LorinAuth.closeModal()" aria-label="Close">✕</button>
        <button class="lorin-auth-back-btn" onclick="LorinAuth.setStep(1)">
          <span>‹</span> <span>${t('auth_back', 'Back')}</span>
        </button>

        <h2 class="lorin-auth-title">${t('auth_login_tab', 'Sign In')}</h2>
        <p class="lorin-auth-subtitle">${t('auth_enter_pwd_prompt', 'Enter password for your registered account')}<br><b style="color: #111;">${pendingEmail}</b></p>

        <form id="lorin-signin-form" onsubmit="LorinAuth.handleSignInSubmit(event)">
          <div class="lorin-field-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="lorin-field-label" style="margin-bottom: 0;">${t('auth_password_label', 'Password')}</label>
              <button type="button" class="lorin-forgot-pwd-link" onclick="LorinAuth.handleForgotPassword(event)">
                ${t('auth_forgot_password', 'Forgot Password? / نسيت كلمة المرور؟')}
              </button>
            </div>
            <div style="position: relative;">
              <input type="password" id="auth-signin-pwd" class="lorin-text-input" placeholder="${t('auth_password_placeholder', 'Enter your password')}" required autofocus style="padding-${isRtl() ? 'left' : 'right'}: 40px;">
              <button type="button" onclick="LorinAuth.togglePasswordVisibility('auth-signin-pwd', this)" style="position: absolute; top: 50%; ${isRtl() ? 'left: 12px;' : 'right: 12px;'}; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6B7280; font-size: 15px;">👁</button>
            </div>
          </div>

          <div id="signin-feedback-msg" style="display: none; padding: 10px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 14px; line-height: 1.45;"></div>

          <button type="submit" class="lorin-btn-primary" id="btn-auth-signin">${t('auth_continue', 'CONTINUE')}</button>
        </form>
      `;
    }
  }

  // Country selector methods
  function toggleCountryDropdown(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const dropdown = document.getElementById('sender-country-dropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    if (isVisible) {
      dropdown.style.display = 'none';
    } else {
      dropdown.style.display = 'block';
      renderCountryList('');
      const searchInput = document.getElementById('sender-country-search');
      if (searchInput) {
        searchInput.value = '';
        setTimeout(() => searchInput.focus(), 50);
      }
    }
  }

  function closeCountryDropdown() {
    const dropdown = document.getElementById('sender-country-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }

  function renderCountryList(query = '') {
    const listEl = document.getElementById('sender-country-list');
    if (!listEl) return;
    const q = (query || '').trim().toLowerCase();
    const countries = getCountriesList();
    const isAr = isRtl();

    const filtered = countries.filter(c => {
      if (!q) return true;
      return (
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="padding: 16px; text-align: center; color: #9CA3AF; font-size: 12px;">No countries found</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(c => `
      <div class="lorin-country-item ${c.code === selectedSenderCountry.code ? 'is-selected' : ''}" onclick="LorinAuth.selectCountry('${c.code}')">
        <span class="lorin-country-item-left">
          <span class="lorin-country-flag">${c.flag}</span>
          <span class="lorin-country-name">${isAr ? c.nameAr : c.nameEn}</span>
        </span>
        <span class="lorin-country-dial">${c.dial}</span>
      </div>
    `).join('');
  }

  function filterCountries(val) {
    renderCountryList(val);
  }

  function selectCountry(code) {
    const countries = getCountriesList();
    const match = countries.find(c => c.code === code) || countries[0];
    selectedSenderCountry = match;

    const flagEl = document.getElementById('sender-flag');
    const dialEl = document.getElementById('sender-dial');
    const phoneInput = document.getElementById('auth-phone-input');

    if (flagEl) flagEl.textContent = match.flag;
    if (dialEl) dialEl.textContent = match.dial;
    if (phoneInput && match.placeholder) phoneInput.placeholder = match.placeholder;

    closeCountryDropdown();
    if (phoneInput) phoneInput.focus();
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#sender-phone-wrapper')) {
      closeCountryDropdown();
    }
  });

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

  // Step 1: Smart Email Detection
  async function handleStep1Submit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email-input');
    if (!emailInput) return;
    pendingEmail = emailInput.value.trim().toLowerCase();
    if (!pendingEmail) return;

    const btn = document.getElementById('btn-auth-step1');
    if (btn) {
      btn.disabled = true;
      btn.textContent = t('loading_wait', 'Processing...');
    }

    let emailExists = false;
    if (client) {
      try {
        const { data, error } = await client.rpc('check_email_exists', { email_input: pendingEmail });
        if (!error && typeof data === 'boolean') {
          emailExists = data;
        } else if (error) {
          console.warn('RPC check_email_exists note:', error.message);
          // Fallback to checking profiles table if present
          try {
            const { data: pData, error: pErr } = await client
              .from('profiles')
              .select('id')
              .eq('email', pendingEmail)
              .maybeSingle();
            if (!pErr && pData) {
              emailExists = true;
            }
          } catch (_) {}
        }
      } catch (rpcErr) {
        console.warn('check_email_exists error:', rpcErr);
      }
    }

    if (emailExists) {
      // Existing user -> Password sign in with prominent Forgot Password link
      authStep = 6;
      renderCurrentStep();
    } else {
      // New user -> Name & Password step
      authStep = 2;
      renderCurrentStep();
    }
  }

  // Step 2: Name & Password -> Proceed to Phone
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

  // Step 3: Phone -> Instant Sign Up (No SMS OTP or Email Confirmation Blocking)
  async function handleStep3Submit(e) {
    e.preventDefault();
    const phoneInput = document.getElementById('auth-phone-input');
    if (!phoneInput) return;

    let rawPhone = phoneInput.value.replace(/\D/g, '');
    if (rawPhone.length < 6) {
      showToastNotification(t('msg_invalid_phone', 'Please enter a valid phone number'), { type: 'warning' });
      return;
    }

    const c = selectedSenderCountry || DEFAULT_COUNTRIES[0];
    const fullPhone = c.dial + rawPhone;
    pendingPhone = rawPhone;

    const btn = document.getElementById('btn-auth-step3');
    if (btn) {
      btn.disabled = true;
      btn.textContent = t('loading_wait', 'Creating account...');
    }

    if (client) {
      try {
        const { data: sData, error: sErr } = await client.auth.signUp({
          email: pendingEmail,
          password: pendingPassword,
          options: {
            data: {
              full_name: pendingName,
              phone: fullPhone,
              country_code: c.code,
              dial_code: c.dial
            }
          }
        });

        if (sErr) {
          if (/already registered|already in use/i.test(sErr.message)) {
            authStep = 6;
            renderCurrentStep();
            const feedback = document.getElementById('signin-feedback-msg');
            if (feedback) {
              feedback.style.display = 'block';
              feedback.style.background = '#FEF2F2';
              feedback.style.color = '#DC2626';
              feedback.style.border = '1px solid #FEE2E2';
              feedback.textContent = t('auth_email_exists_notice', 'هذا البريد مسجل مسبقاً، يرجى إدخال كلمة المرور للمتابعة');
            }
            return;
          } else {
            showToastNotification(sErr.message, { type: 'error' });
            if (btn) {
              btn.disabled = false;
              btn.textContent = t('auth_continue', 'CONTINUE');
            }
            return;
          }
        }

        // Ensure session is signed in immediately
        if (!sData?.session) {
          try {
            await client.auth.signInWithPassword({
              email: pendingEmail,
              password: pendingPassword
            });
          } catch (_) {}
        }
      } catch (err) {
        console.warn('Sign up error:', err);
      }
    }

    await syncUser();

    // Instant redirect straight to Checkout Step 1 ("Delivery Details") without SMS OTP blocking
    closeModal();
    updateHeaderAccount();

    if (window.location.pathname.endsWith('checkout.html') || window.location.pathname.includes('checkout')) {
      const nameInput = document.getElementById('receiver-name');
      if (nameInput && !nameInput.value) nameInput.value = pendingName;
      const phoneInputEl = document.getElementById('receiver-phone');
      if (phoneInputEl && !phoneInputEl.value) phoneInputEl.value = pendingPhone;
      if (typeof goToStep === 'function') goToStep(1);
    } else {
      window.location.href = 'checkout.html';
    }
  }

  // Step 6: Password Sign In
  async function handleSignInSubmit(e) {
    e.preventDefault();
    const pwdInput = document.getElementById('auth-signin-pwd');
    const feedback = document.getElementById('signin-feedback-msg');
    const btn = document.getElementById('btn-auth-signin');
    if (!pwdInput) return;

    btn.disabled = true;
    btn.textContent = t('loading_wait', 'Processing...');
    if (feedback) feedback.style.display = 'none';

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: pendingEmail,
          password: pwdInput.value
        });

        if (error) {
          if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = '#FEF2F2';
            feedback.style.color = '#DC2626';
            feedback.style.border = '1px solid #FEE2E2';
            feedback.textContent = error.message;
          }
          btn.disabled = false;
          btn.textContent = t('auth_continue', 'CONTINUE');
          return;
        }
      } catch (err) {
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.background = '#FEF2F2';
          feedback.style.color = '#DC2626';
          feedback.style.border = '1px solid #FEE2E2';
          feedback.textContent = err.message;
        }
        btn.disabled = false;
        btn.textContent = t('auth_continue', 'CONTINUE');
        return;
      }
    }

    await syncUser();
    finishAuth();
  }

  // Forgot Password Trigger
  async function handleForgotPassword(e) {
    if (e) e.preventDefault();
    if (!pendingEmail) {
      showToastNotification('Please enter your email first', { type: 'warning' });
      return;
    }

    const feedback = document.getElementById('signin-feedback-msg');
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#EFF6FF';
      feedback.style.color = '#1E40AF';
      feedback.style.border = '1px solid #DBEAFE';
      feedback.textContent = t('loading_wait', 'Sending password reset link...');
    }

    if (client) {
      try {
        const resetRedirect = window.location.origin + '/reset-password.html';
        const { error } = await client.auth.resetPasswordForEmail(pendingEmail, {
          redirectTo: resetRedirect
        });

        if (error) {
          if (feedback) {
            feedback.style.background = '#FEF2F2';
            feedback.style.color = '#DC2626';
            feedback.style.border = '1px solid #FEE2E2';
            feedback.textContent = error.message;
          }
        } else {
          if (feedback) {
            feedback.style.background = '#F0FDF4';
            feedback.style.color = '#166534';
            feedback.style.border = '1px solid #DCFCE7';
            feedback.innerHTML = `✓ ${t('auth_reset_sent_msg', 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح. يرجى مراجعة صندوق الوارد.')}`;
          }
        }
      } catch (err) {
        if (feedback) {
          feedback.style.background = '#FEF2F2';
          feedback.style.color = '#DC2626';
          feedback.style.border = '1px solid #FEE2E2';
          feedback.textContent = err.message || 'Error sending reset email';
        }
      }
    }
  }

  // Google OAuth (redirects directly to checkout.html preserving cart)
  async function handleGoogleAuth() {
    if (!client) return;
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/checkout.html'
        }
      });
      if (error) {
        showToastNotification('Google Sign-In note: ' + error.message, { type: 'error' });
      }
    } catch (e) {
      showToastNotification('Google Sign-In note: ' + e.message, { type: 'error' });
    }
  }

  function finishAuth() {
    closeModal();
    updateHeaderAccount();

    if (redirectAfterAuth) {
      const dest = redirectAfterAuth;
      redirectAfterAuth = null;
      window.location.href = dest;
    } else if (window.location.pathname.endsWith('checkout.html') || window.location.pathname.includes('checkout')) {
      if (typeof renderOrderSummary === 'function') renderOrderSummary();
      if (typeof goToStep === 'function') goToStep(1);
    } else {
      window.location.href = 'checkout.html';
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

  async function getUser() {
    if (currentUser) return currentUser;
    return await syncUser();
  }

  function getUserDisplayName() {
    if (!currentUser) return '';
    const meta = currentUser.user_metadata || {};
    return meta.full_name || meta.name || currentUser.email.split('@')[0] || '';
  }

  function headerCartItemCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('lorin_cart') || '[]');
      if (!Array.isArray(cart)) return 0;
      return cart.reduce((total, item) => total + Math.max(1, Math.floor(Number(item.quantity) || 1)), 0);
    } catch (_) {
      return 0;
    }
  }

  function initEmptyHeaderCartPopover() {
    const buttons = document.querySelectorAll('header .floward-right-group a[href="cart.html"]');
    buttons.forEach((link, index) => {
      const wrapper = document.createElement('span');
      const popover = document.createElement('div');
      const message = document.createElement('p');
      const continueButton = document.createElement('button');
      const id = `lorin-empty-cart-popover-${index}`;

      wrapper.className = 'lorin-header-cart-wrap';
      link.parentNode.insertBefore(wrapper, link);
      wrapper.appendChild(link);

      popover.className = 'lorin-header-cart-popover';
      popover.id = id;
      popover.hidden = true;
      popover.setAttribute('role', 'dialog');
      popover.setAttribute('aria-live', 'polite');
      message.textContent = t('header_cart_empty', 'Your cart is currently empty.');
      continueButton.type = 'button';
      continueButton.textContent = t('header_cart_continue', 'Continue Shopping');
      popover.append(message, continueButton);
      wrapper.appendChild(popover);

      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', id);
      link.setAttribute('aria-expanded', 'false');

      function closePopover() {
        popover.hidden = true;
        link.setAttribute('aria-expanded', 'false');
      }

      link.addEventListener('click', (event) => {
        if (headerCartItemCount() > 0) {
          closePopover();
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const shouldOpen = popover.hidden;
        document.querySelectorAll('.lorin-header-cart-popover').forEach((item) => { item.hidden = true; });
        document.querySelectorAll('header .floward-right-group a[aria-controls^="lorin-empty-cart-popover-"]').forEach((item) => item.setAttribute('aria-expanded', 'false'));
        popover.hidden = !shouldOpen;
        link.setAttribute('aria-expanded', String(shouldOpen));
      });

      continueButton.addEventListener('click', () => {
        closePopover();
      });

      document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) closePopover();
      });

      window.addEventListener('lorin:langchange', () => {
        message.textContent = t('header_cart_empty', 'Your cart is currently empty.');
        continueButton.textContent = t('header_cart_continue', 'Continue Shopping');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.lorin-header-cart-popover:not([hidden])').forEach((popover) => {
          popover.hidden = true;
          const button = document.querySelector(`header .floward-right-group a[aria-controls="${popover.id}"]`);
          if (button) {
            button.setAttribute('aria-expanded', 'false');
            button.focus();
          }
        });
      }
    });
  }

  // Header Dropdown Setup
  function setupHeaderAccount() {
    injectStyles();

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

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lorin-account-trigger') && !e.target.closest('.lorin-account-dropdown-menu')) {
        closeAccountDropdown();
      }
    });
  }

  function onAccountClick(triggerEl) {
    if (!currentUser) {
      openModal(1);
    } else {
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
    showToastNotification(t('msg_signed_out', 'Signed out successfully.'), { type: 'info' });
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
            <input type="tel" id="edit-profile-phone" class="lorin-text-input" value="${meta.phone || ''}" dir="ltr">
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

  // Non-destructive Legal Modal (preserves typed auth data without leaving screen)
  function openLegalModal(type, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    createLegalDrawer();
    const titleEl = document.getElementById('lorin-legal-title');
    const bodyEl = document.getElementById('lorin-legal-body');
    const backdrop = document.getElementById('lorin-legal-backdrop');
    const drawer = document.getElementById('lorin-legal-drawer');
    if (!titleEl || !bodyEl || !drawer) return;

    const isAr = isRtl();

    if (type === 'privacy') {
      titleEl.textContent = isAr ? 'سياسة الخصوصية — متجر Lorin' : 'Privacy Policy — Lorin Flora';
      bodyEl.innerHTML = isAr ? `
        <div style="line-height: 1.8; color: #374151; font-size: 13px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 0 0 8px 0;">1. حماية بيانات الحساب وتسجيل الدخول</h4>
          <p>في متجر Lorin للزهور والهدايا (عمان، الأردن)، نولي خصوصيتك أعلى درجات الأمان. تُحفظ بياناتك الشخصية (البريد الإلكتروني، الاسم، وكلمات المرور المشفرة) عبر خوادم آمنة مع تشفير قياسي، ولا تتم مشاركتها مع أي جهات خارجية غير مخولة.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">2. بيانات المستلم والتوصيل الفاخر</h4>
          <p>تُستخدم بيانات المستلم (الاسم، رقم الهاتف، وإحداثيات الموقع أو التواصل عبر واتساب) حصرياً لغايات تنسيق تسليم باقة الزهور في الوقت المحدد وبأعلى معايير اللباقة والاحترافية.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">3. ميزة إخفاء الهوية (الإهداء السري 🤫)</h4>
          <p>عند تفعيل خيار "إخفاء هويتي عن المستلم"، نتعهد تماماً بعدم الكشف عن هوية المشتري أو اسمه أو رقم هاتفه للمستلم، وتبقى المفاجأة سرية بالكامل.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">4. الزهور الطبيعية وسياسة التبديل والتوصيل</h4>
          <p>نحرص على انتقاء أجود أنواع الزهور الطبيعية يومياً. نظراً للطبيعة الموسمية للزهور، قد يتم استبدال نوع معين بآخر من نفس القيمة الرفيعة والتناغم اللوني في حال عدم توفره، مع الالتزام التام برونق التصميم.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">5. فترات التوصيل والتوصيل السريع خلال 120 دقيقة</h4>
          <p>نوفر خدمة التوصيل السريع خلال 120 دقيقة داخل العاصمة عمان، إضافة إلى مواعيد التوصيل المجدولة وفق اختياركم.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">6. أمان المدفوعات والبطاقات</h4>
          <p>يتم الدفع بواسطة بوابات دفع مصرفية مشفرة بالكامل (Apple Pay، فيزا، ماستركارد، وCliQ الأردن، والدفع عند الاستلام). نحن لا نقوم بتخزين أي أرقام بطاقات أو رموز أمان على خوادمنا.</p>
        </div>
      ` : `
        <div style="line-height: 1.8; color: #374151; font-size: 13px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 0 0 8px 0;">1. Account & Login Data Privacy</h4>
          <p>At Lorin Flora (Amman, Jordan), your personal privacy is paramount. Your email, name, phone, and securely hashed passwords are safeguarded using enterprise-level encryption and are never shared or sold to unauthorized third parties.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">2. Recipient Delivery Details</h4>
          <p>Recipient information (name, phone number, and GPS/map location) is utilized strictly to coordinate seamless, polite, and timely floral deliveries across Amman and Jordan.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">3. Anonymous Gifting (Secret Identity 🤫)</h4>
          <p>When selecting "Keep my identity a secret", we guarantee that no sender details, names, or contact numbers are disclosed to the recipient.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">4. Fresh Flower Sourcing & Substitution Policy</h4>
          <p>Due to the seasonal nature of fresh blooms, subtle substitutions of equal or higher luxury value and matching palette may occur to ensure peak floral freshness.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">5. Delivery Slots & 120-Minute Express Service</h4>
          <p>We provide rapid 120-minute express courier delivery across Amman, Jordan, alongside customized same-day and scheduled delivery slots.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">6. Payment Security</h4>
          <p>All payments via Apple Pay, Credit/Debit Cards, Jordan's CliQ network, and Cash on Delivery are processed securely without storing sensitive card details on our servers.</p>
        </div>
      `;
    } else {
      titleEl.textContent = isAr ? 'الشروط والأحكام — متجر Lorin' : 'Terms & Conditions — Lorin Flora';
      bodyEl.innerHTML = isAr ? `
        <div style="line-height: 1.8; color: #374151; font-size: 13px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 0 0 8px 0;">1. قبول الشروط والطلبات</h4>
          <p>باستخدامك لموقع متجر Lorin، فإنك توافق على الالتزام بكافة الشروط والأحكام المعمول بها داخل المملكة الأردنية الهاشمية.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">2. دقة بيانات الطلب والمستلم</h4>
          <p>يتحمل المشتري مسؤولية تقديم معلومات اتصال صحيحة ودقيقة للمستلم لتجنب أي تأخير في مواعيد التسليم.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">3. خدمة التوصيل السريع (120 دقيقة)</h4>
          <p>تخضع خدمة التوصيل السريع لجاهزية المستلم للتنسيق ووضوح العنوان في نطاق التغطية داخل العاصمة عمان.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">4. سياسة الإلغاء والتعديل</h4>
          <p>نظراً لطبيعة الزهور القابلة للتلف وسرعة تجهيز الباقات الطبيعية المخصصة، يمكن تعديل أو إلغاء الطلبات قبل بدء تنسيق الزهور بواسطة فريقنا.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">5. العملة والأسعار</h4>
          <p>كافة الأسعار الموضحة على الموقع بالدينار الأردني (JOD / د.أ) وتشمل التجهيز الفاخر الموضح في صفحة المنتج.</p>
        </div>
      ` : `
        <div style="line-height: 1.8; color: #374151; font-size: 13px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 0 0 8px 0;">1. Acceptance of Terms</h4>
          <p>By accessing Lorin Flora and placing orders, you agree to comply with our terms and applicable laws of the Hashemite Kingdom of Jordan.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">2. Order Accuracy & Recipient Availability</h4>
          <p>Customers must provide accurate recipient contact details to ensure punctual delivery without courier disruptions.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">3. Express 120-Minute Delivery</h4>
          <p>Express 120-minute delivery is available across eligible zones in Amman and is contingent upon recipient responsiveness.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">4. Cancellation & Fresh Perishables</h4>
          <p>Because bespoke floral arrangements consist of perishable blooms prepared on demand, cancellations or modifications must be made before floral assembly begins.</p>

          <h4 style="font-size: 15px; font-weight: 700; color: #00313C; margin: 16px 0 8px 0;">5. Currency & Pricing</h4>
          <p>All prices are quoted in Jordanian Dinars (JOD / د.أ) inclusive of presentation standards shown on each product page.</p>
        </div>
      `;
    }

    backdrop.classList.add('is-active');
    drawer.classList.add('is-active');
  }

  function createLegalDrawer() {
    if (document.getElementById('lorin-legal-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'lorin-legal-backdrop';
    backdrop.className = 'lorin-drawer-backdrop';

    const drawer = document.createElement('div');
    drawer.id = 'lorin-legal-drawer';
    drawer.className = 'lorin-slide-drawer';
    drawer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6;">
        <h3 id="lorin-legal-title" style="margin: 0; font-size: 17px; font-weight: 700; color: #00313C;"></h3>
        <button type="button" onclick="LorinAuth.closeLegalDrawer()" style="background: none; border: none; font-size: 20px; color: #9CA3AF; cursor: pointer;">✕</button>
      </div>
      <div id="lorin-legal-body" style="flex: 1; overflow-y: auto; padding-top: 20px;"></div>
      <div style="padding-top: 14px; border-top: 1px solid #F3F4F6; text-align: center;">
        <button type="button" class="lorin-btn-primary" onclick="LorinAuth.closeLegalDrawer()" style="padding: 10px 20px;">${t('auth_done', 'Done')}</button>
      </div>
    `;

    backdrop.addEventListener('click', closeLegalDrawer);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
  }

  function closeLegalDrawer() {
    const backdrop = document.getElementById('lorin-legal-backdrop');
    const drawer = document.getElementById('lorin-legal-drawer');
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
      showToastNotification('تم حفظ البيانات بنجاح 🌸');
      closeAccountDrawer();
    }
  }

  async function loadUserOrders(container) {
    container.innerHTML = `<p style="text-align: center; color: #9CA3AF; padding: 20px;">${t('loading_wait', 'جاري جلب الطلبات...')}</p>`;
    if (!client) return;

    try {
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
    initEmptyHeaderCartPopover();
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
    handleSignInSubmit,
    handleForgotPassword,
    handleGoogleAuth,
    validateStep2,
    togglePasswordVisibility,
    toggleCountryDropdown,
    filterCountries,
    selectCountry,
    openLegalModal,
    closeLegalDrawer,
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
