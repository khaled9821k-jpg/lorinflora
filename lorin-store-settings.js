// lorin-store-settings.js
// قراءة وتطبيق إعدادات المتجر من Supabase (site_settings) بما يطابق admin.html

(function () {
  const CACHE_KEY = 'lorin_site_settings_v2';

  const DEFAULTS = {
    // الهوية والروابط العامة
    footer_facebook: '#',
    footer_instagram: '#',
    primary_color: '#00313C',

    // إعدادات صفحة المنتج (product.html)
    product_notice_enabled: true,
    product_notice_text: 'لست بحاجة لمعرفة العنوان، فريقنا سيفعل ذلك نيابة عنك.',
    product_tax_note_enabled: true,
    product_tax_note_text: 'الأسعار شاملة الضرائب',
    product_desc_tab_label: 'Description',
    product_customize_title: 'Customize Your Order',
    product_fbt_enabled: true,
    product_fbt_title: 'يقوم المستخدمون بشراء هذه المنتجات سوياً',
    product_upsell_modal_title: 'You’ve added items to your cart',
    product_upsell_title: 'Make it perfect',
    product_payment_enabled: true,
    product_payment_logo_url: '',

    // إعدادات صفحة التصنيف (category.html)
    category_default_description: '',
    category_descriptions: {},
    category_show_subpills: true,
    category_show_sidebar: true,
    category_show_price_filter: true,
    category_show_count: true,
    category_grid_columns: '',

    // إعدادات إتمام الطلب (checkout.html)
    checkout_page_title: 'إتمام طلب الهدية',
    checkout_cities: ['عمان', 'الزرقاء', 'إربد', 'السلط', 'العقبة', 'مادبا'],
    checkout_whatsapp: '962700000000',
    checkout_delivery_fee: 0,
    checkout_free_delivery_threshold: 0,
    checkout_gift_note_enabled: true,
    checkout_gift_note_label: 'بطاقة هدية / ملاحظات (اختياري)',
    checkout_gift_note_placeholder: 'اكتب عبارة الهدية إذا كنت تريد إرفاقها مع الزهور...',
    checkout_submit_label: 'تأكيد وإرسال الطلب عبر واتساب'
  };

  function toBool(val, fallback) {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
      if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
    }
    return fallback;
  }

  function toNum(val, fallback) {
    const n = parseFloat(val);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  function tryParseJson(val) {
    if (typeof val !== 'string') return val;
    let current = val.trim();
    for (let i = 0; i < 2; i++) {
      if ((current.startsWith('{') && current.endsWith('}')) || (current.startsWith('[') && current.endsWith(']'))) {
        try {
          const parsed = JSON.parse(current);
          if (typeof parsed === 'string') {
            current = parsed.trim();
            continue;
          }
          return parsed;
        } catch (_) {
          return val;
        }
      }
      break;
    }
    return current;
  }

  function normalizeRows(rows) {
    const out = { ...DEFAULTS, category_descriptions: {} };
    if (!Array.isArray(rows)) return out;

    rows.forEach((row) => {
      if (!row) return;
      const rawKey = row.setting_key || row.key_name;
      if (!rawKey) return;
      const key = String(rawKey).trim();
      let val = tryParseJson(row.setting_value);

      if (key === 'checkout_cities') {
        if (Array.isArray(val)) {
          out.checkout_cities = val.map(String).map((s) => s.trim()).filter(Boolean);
        } else if (typeof val === 'string' && val.trim()) {
          out.checkout_cities = val.split('\n').map((s) => s.trim()).filter(Boolean);
        }
        return;
      }

      if (key === 'category_descriptions') {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          out.category_descriptions = val;
        }
        return;
      }

      if (typeof DEFAULTS[key] === 'boolean') {
        out[key] = toBool(val, DEFAULTS[key]);
      } else if (typeof DEFAULTS[key] === 'number') {
        out[key] = toNum(val, DEFAULTS[key]);
      } else if (val !== undefined && val !== null && String(val) !== '') {
        out[key] = String(val);
      }
    });

    return out;
  }

  async function load(client, forceFresh = true) {
    if (!forceFresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.data) {
            window.lorinSettings = { ...DEFAULTS, ...parsed.data };
          }
        }
      } catch (_) {}
    }

    if (!client) {
      window.lorinSettings = window.lorinSettings || { ...DEFAULTS };
      return window.lorinSettings;
    }

    try {
      const { data, error } = await client
        .from('site_settings')
        .select('setting_key, key_name, setting_value');

      if (!error && Array.isArray(data)) {
        const norm = normalizeRows(data);
        window.lorinSettings = norm;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: norm, ts: Date.now() }));
        } catch (_) {}
        return norm;
      }
    } catch (err) {
      console.warn('LorinStoreSettings.load warning:', err);
    }

    window.lorinSettings = window.lorinSettings || { ...DEFAULTS };
    return window.lorinSettings;
  }

  function get() {
    return window.lorinSettings ? { ...DEFAULTS, ...window.lorinSettings } : { ...DEFAULTS };
  }

  function applyFooterLinks(s) {
    const fb = document.getElementById('footer-fb');
    if (fb && s.footer_facebook) fb.href = s.footer_facebook;
    const ig = document.getElementById('footer-ig');
    if (ig && s.footer_instagram) ig.href = s.footer_instagram;
  }

  function applyProductSettings(settings) {
    const s = { ...DEFAULTS, ...(settings || get()) };
    applyFooterLinks(s);

    const noticeBox = document.querySelector('.floward-notice-box');
    if (noticeBox) {
      noticeBox.style.display = s.product_notice_enabled ? '' : 'none';
      const noticeSpan = noticeBox.querySelector('span:last-child') || noticeBox.querySelector('span');
      if (noticeSpan && s.product_notice_text) noticeSpan.textContent = s.product_notice_text;
    }

    const taxNote = document.querySelector('.product-tax-note');
    if (taxNote) {
      taxNote.style.display = s.product_tax_note_enabled ? '' : 'none';
      if (s.product_tax_note_text) taxNote.textContent = s.product_tax_note_text;
    }

    const descTab = document.querySelector('.product-tab-btn');
    if (descTab && s.product_desc_tab_label) descTab.textContent = s.product_desc_tab_label;

    const custBox = document.getElementById('product-customizations-container');
    if (custBox && s.product_customize_title) {
      const titleEl = custBox.querySelector('h3, h4, .customize-title, strong');
      if (titleEl) titleEl.textContent = s.product_customize_title;
    }

    const fbtSection = document.querySelector('.fbt-section');
    if (fbtSection) {
      fbtSection.style.display = s.product_fbt_enabled ? '' : 'none';
      const fbtHeading = fbtSection.querySelector('h2, h3');
      if (fbtHeading && s.product_fbt_title) fbtHeading.textContent = s.product_fbt_title;
    }

    const upsellModal = document.getElementById('upsell-modal-backdrop');
    if (upsellModal) {
      const modalTitle = upsellModal.querySelector('h2, h3');
      if (modalTitle && s.product_upsell_modal_title) modalTitle.textContent = s.product_upsell_modal_title;
      const upsellSub = upsellModal.querySelector('.upsell-section-title, h4');
      if (upsellSub && s.product_upsell_title) upsellSub.textContent = s.product_upsell_title;
    }

    const payBox = document.querySelector('.payment-methods-box');
    if (payBox) {
      payBox.style.display = s.product_payment_enabled ? '' : 'none';
      if (s.product_payment_logo_url) {
        const img = payBox.querySelector('img');
        if (img) img.src = s.product_payment_logo_url;
      }
    }
  }

 function applyCategorySettings(categoryName, settings) {
    const s = { ...DEFAULTS, ...(settings || get()) };
    applyFooterLinks(s);

    const descEl = document.getElementById('category-description-text');
    if (descEl) {
      const customMap = s.category_descriptions || {};
      const cleanCat = String(categoryName || '').trim().toLowerCase();
      const matchedKey = Object.keys(customMap).find(
        (k) => String(k || '').trim().toLowerCase() === cleanCat
      );
      const customVal = matchedKey ? String(customMap[matchedKey] || '').trim() : '';

      if (customVal) {
        descEl.textContent = customVal;
        descEl.style.display = '';
      } else {
        descEl.textContent = '';
        descEl.style.display = 'none';
      }
    }

    const subpills = document.querySelector('.sub-pills-track');
    if (subpills) subpills.style.display = s.category_show_subpills ? '' : 'none';

    const sidebar = document.querySelector('.filters-sidebar');
    if (sidebar) {
      sidebar.style.display = s.category_show_sidebar ? '' : 'none';
      if (s.category_show_sidebar && !s.category_show_price_filter) {
        const priceGroup = Array.from(sidebar.querySelectorAll('.filter-group')).find((g) =>
          /price/i.test(g.textContent || '')
        );
        if (priceGroup) priceGroup.style.display = 'none';
      }
    }

    const countBadge = document.getElementById('category-count-badge');
    if (countBadge) countBadge.style.display = s.category_show_count ? '' : 'none';

    const grid = document.getElementById('category-products-grid');
    if (grid && s.category_grid_columns) {
      grid.style.gridTemplateColumns = `repeat(${s.category_grid_columns}, minmax(0, 1fr))`;
    }
  }

  function computeDeliveryFee(subtotal, settings) {
    const s = { ...DEFAULTS, ...(settings || get()) };
    const baseFee = toNum(s.checkout_delivery_fee, 0);
    const threshold = toNum(s.checkout_free_delivery_threshold, 0);
    if (threshold > 0 && Number(subtotal) >= threshold) return 0;
    return baseFee;
  }

  function applyCheckoutSettings(settings) {
    const s = { ...DEFAULTS, ...(settings || get()) };
    applyFooterLinks(s);

    const h1 = document.querySelector('main h1');
    if (h1 && s.checkout_page_title) h1.textContent = s.checkout_page_title;

    const citySelect = document.getElementById('city') || document.getElementById('receiver-city');
    if (citySelect && Array.isArray(s.checkout_cities) && s.checkout_cities.length) {
      const currentVal = citySelect.value;
      citySelect.innerHTML = s.checkout_cities
        .map((c) => `<option value="${String(c).replace(/"/g, '&quot;')}">${c}</option>`)
        .join('');
      if (currentVal && s.checkout_cities.includes(currentVal)) {
        citySelect.value = currentVal;
      }
    }

    const giftInput = document.getElementById('gift_message') || document.getElementById('gift-note');
    if (giftInput) {
      const wrapper = giftInput.closest('div');
      if (wrapper) wrapper.style.display = s.checkout_gift_note_enabled ? '' : 'none';
      if (s.checkout_gift_note_placeholder) giftInput.placeholder = s.checkout_gift_note_placeholder;
      if (wrapper && s.checkout_gift_note_label) {
        const lbl = wrapper.querySelector('label');
        if (lbl) lbl.textContent = s.checkout_gift_note_label;
      }
    }

    const submitBtn = document.querySelector('#checkout-form button[type="submit"]') || document.getElementById('submit-order-btn');
    if (submitBtn && s.checkout_submit_label) {
      submitBtn.textContent = s.checkout_submit_label;
    }
  }

  window.LorinStoreSettings = {
    defaults: DEFAULTS,
    load,
    get,
    computeDeliveryFee,
    applyProductSettings,
    applyCategorySettings,
    applyCheckoutSettings
  };
})();
