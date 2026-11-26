// lorin-i18n.js
// Lorin Flora Bilingual (Arabic / English) Internationalization Module

(function () {
  const LANG_STORAGE_KEY = 'lorin_lang';

  const translations = {
    ar: {
      lang_code: 'ar',
      dir: 'rtl',
      lang_name: 'العربية',
      switch_lang_label: 'English',
      
      // Header
      nav_menu: 'القائمة',
      nav_search: 'بحث',
      nav_account: 'حسابي',
      nav_cart: 'السلة',
      header_cart_empty: 'سلة مشترياتك فارغة حالياً.',
      header_cart_continue: 'متابعة التسوق',
      card_preview_to: 'إلى',
      card_preview_from: 'من',
      card_preview_link_attached: 'تم إرفاق رابط',
      card_preview_no_design: 'لم يتم اختيار تصميم البطاقة',
      card_preview_message_placeholder: 'ستظهر رسالتك هنا',
      card_editor_open: 'تخصيص بطاقة الإهداء',
      country_name: 'الأردن',
      currency_code: 'د.أ',

      // Auth Flow
      auth_title_login_signup: 'تسجيل الدخول أو إنشاء حساب',
      auth_subtitle_login_signup: 'اعثر على الهدية المثالية لمناسبتك الخاصة',
      auth_email_label: 'البريد الإلكتروني',
      auth_email_placeholder: 'أدخل بريدك الإلكتروني',
      auth_continue: 'متابعة',
      auth_or: 'أو',
      auth_google: 'المتابعة باستخدام Google',
      auth_apple: 'المتابعة باستخدام Apple',
      auth_terms_prefix: 'بالمتابعة، أنت توافق على ',
      auth_privacy_policy: 'سياسة الخصوصية',
      auth_terms_and: ' و ',
      auth_terms_conditions: 'الشروط والأحكام',
      auth_recaptcha_notice: 'هذه الصفحة محمية بموجب reCAPTCHA وتخضع لسياسة خصوصية Google وشروط الخدمة.',
      auth_forgot_password: 'نسيت كلمة المرور؟',
      auth_reset_sent_msg: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح. يرجى مراجعة صندوق الوارد.',
      auth_email_exists_notice: 'هذا البريد مسجل مسبقاً، يرجى إدخال كلمة المرور للمتابعة',
      search_country: 'ابحث عن الدولة أو الرمز...',
      legal_privacy_title: 'سياسة الخصوصية',
      legal_terms_title: 'الشروط والأحكام',
      reset_pwd_title: 'إعادة تعيين كلمة المرور',
      reset_pwd_subtitle: 'أدخل كلمة المرور الجديدة لحسابك في Lorin',
      reset_pwd_new_label: 'كلمة المرور الجديدة',
      reset_pwd_confirm_label: 'تأكيد كلمة المرور',
      reset_pwd_match_err: 'كلمتا المرور غير متطابقتين',
      reset_pwd_success_title: 'تم تحديث كلمة المرور بنجاح!',
      reset_pwd_success_desc: 'يمكنك الآن متابعة التسوق أو إتمام طلبك بأمان.',
      btn_continue_to_checkout: 'المتابعة إلى إتمام الطلب',
      btn_back_to_home: 'العودة إلى المتجر',

      // Sign Up Step 2
      auth_signup_title: 'إنشاء حساب جديد',
      auth_signup_subtitle: 'أدخل اسمك وأنشئ كلمة مرور آمنة',
      auth_fullname_label: 'الاسم الكامل',
      auth_fullname_placeholder: 'يرجى إدخال اسمك الكامل',
      auth_password_label: 'كلمة المرور',
      auth_password_placeholder: 'أدخل كلمة المرور',
      auth_pwd_rule_title: 'يجب أن تحتوي كلمة المرور على:',
      auth_pwd_rule_lower: 'حرف صغير (a-z)',
      auth_pwd_rule_upper: 'حرف كبير (A-Z)',
      auth_pwd_rule_min: '8 أحرف على الأقل',
      auth_back: 'رجوع',

      // Phone Step 3
      auth_phone_title: 'أخيراً، رقم هاتفك',
      auth_phone_subtitle: 'سنرسل رمزاً لمرة واحدة لتأكيد رقم هاتفك',
      auth_phone_label: 'رقم الهاتف',
      auth_phone_placeholder: '7XXXXXXXX',

      // OTP Step 4
      auth_otp_title: 'تأكيد رقم الهاتف',
      auth_otp_subtitle: 'أرسلنا رمز التحقق عبر رسالة SMS إلى:',
      auth_change: 'تغيير',
      auth_verify: 'تأكيد',
      auth_resend_timer: 'طلب رمز جديد خلال',
      auth_resend_action: 'إعادة إرسال الرمز الآن',

      // Verification Success Step 5
      auth_success_title: 'تم التحقق بنجاح',
      auth_success_subtitle: 'تم تأكيد رقم هاتفك بنجاح وربطه بحسابك.',
      auth_done: 'تم',
      auth_login_tab: 'تسجيل دخول',
      auth_enter_pwd_prompt: 'أدخل كلمة المرور لحسابك المسجل',

      // Account Dropdown
      account_greeting_prefix: 'مرحباً،',
      account_guest: 'ضيفنا الكريم',
      menu_profile: 'عرض / تعديل الملف الشخصي',
      menu_orders: 'طلباتي',
      menu_subscriptions: 'اشتراكاتي',
      menu_notifications: 'الإشعارات',
      menu_addresses: 'عناويني',
      menu_favourite: 'المفضلة',
      menu_signout: 'تسجيل الخروج',

      // Checkout Stepper
      step_delivery: 'تفاصيل التوصيل',
      step_payment: 'الدفع وتأكيد الطلب',

      // Step 1: Delivery Details
      collect_address_title: 'طلب العنوان من المستلم نيابة عنك',
      collect_address_desc: 'سوف نقوم بالتواصل مع المستلم بلباقة لأخذ تفاصيل العنوان. قد يتأثر وقت التوصيل في حال عدم رد المستلم.',
      recipient_details_title: 'معلومات المستلم',
      recipient_name_label: 'اسم المستلم الكامل',
      recipient_name_placeholder: 'أدخل اسم المستلم',
      recipient_phone_label: 'رقم هاتف المستلم',
      recipient_phone_placeholder: '7XXXXXXXX',
      context_gift_self_notice: 'بما أن هذا الطلب لك شخصياً، سنحتاج عنوان التوصيل الكامل أدناه لتأكيد الموعد.',
      
      recipient_address_title: 'عنوان التوصيل',
      recipient_address_desc: 'حدد موقع التوصيل على الخريطة لمساعدتنا على الوصول بالموعد الدقيق',
      btn_add_map_location: 'تحديد الموقع على الخريطة',
      map_pin_instruction: 'انقر على الخريطة أو اسحب المؤشر لتحديد موقع التوصيل بدقة',
      map_search_label: 'ابحث عن موقع التوصيل',
      map_search_results: 'نتائج البحث عن الموقع',
      map_search_placeholder: 'ابحث عن عنوان أو مكان...',
      map_search_button: 'بحث',
      map_open_link: 'فتح الموقع المحدد في خرائط Google',
      map_searching: 'جارٍ البحث عن الموقع...',
      map_search_empty: 'لم يتم العثور على نتائج.',
      map_search_error: 'تعذر البحث عن الموقع. حاول مرة أخرى.',
      map_location_selected: 'تم تحديد الموقع',
      order_email_failed: 'تم إرسال الطلب، لكن تعذر إرسال إشعار البريد الإلكتروني إلى المتجر.',
      btn_use_current_location: 'موقعي الحالي 📍',
      area_label: 'المنطقة',
      area_placeholder: 'اختر المنطقة / الحي',
      full_address_label: 'العنوان التفصيلي (الشارع، رقم البناية، المعلم)',
      full_address_placeholder: 'اكتب اسم الشارع، رقم البناية، والشقة أو أي تفاصيل مميزة...',

      delivery_time_title: 'تاريخ ووقت التوصيل',
      express_delivery: 'توصيل سريع',
      express_delivery_sub: 'توصيل سريع خلال 120 دقيقة',
      sameday_delivery: 'توصيل بنفس اليوم',
      choose_datetime: 'تحديد موعد مخصص',
      express_banner_text: 'أدخل عنوان المستلم وسنضمن وصول هديتك الفاخرة خلال 120 دقيقة!',
      express_banner_link: 'تعرف أكثر على التوصيل السريع',

      secret_identity_title: 'إخفاء هويتي عن المستلم (مفاجأة 🤫)',
      secret_identity_desc: 'عند تفعيل هذا الخيار، لن نشارك أي معلومات شخصية عنك مع المستلم وسيبقى اسمك سراً.',

      // Step 2: Payment & Review
      payment_options_title: 'خيارات الدفع المتاحة',
      pay_apple: 'Apple Pay',
      pay_google: 'Google Pay',
      pay_card: 'بطاقة ائتمان / بطاقة بنكية (Visa / MasterCard)',
      pay_cliq: 'تحويل فوري عبر CliQ (الأردن)',
      pay_cod: 'الدفع عند الاستلام (نقداً)',
      promo_available_label: 'عروض وخصومات متاحة',
      promo_placeholder: 'أدخل كود الخصم',
      promo_apply: 'تطبيق',
      promo_remove: 'إلغاء',
      deliver_to_title: 'بيانات التوصيل المختارة',
      btn_edit: 'تعديل',
      delivery_team_note_title: 'إضافة ملاحظة لفريق التوصيل',
      delivery_team_note_placeholder: 'اكتب أي ملاحظة خاصة بفريق التوصيل (مثال: عدم رن الجرس، ترك الطلب عند الباب، الاتصال قبل الوصول)...',

      // Order Summary
      order_summary_title: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      delivery_charges: 'رسوم التوصيل',
      delivery_free: 'مجاناً 🌸',
      delivery_disclaimer: 'يرجى العلم بأن بعض المناطق البعيدة أو التوصيل السريع الفوري قد يترتب عليها رسوم توصيل إضافية.',
      discount: 'الخصم',
      total: 'المجموع الكلي',
      qty_label: 'الكمية',
      cart_empty: 'سلة المشتريات فارغة!',
      photo_stick_title: 'صورة إضافية مرفقة',
      card_extra_title: 'بطاقة إهداء',

      // Action Buttons
      btn_proceed_to_payment: 'المتابعة إلى الدفع',
      btn_place_order: 'تأكيد وإرسال الطلب',
      btn_buy_with_apple: 'الشراء عبر Apple Pay',
      btn_proceed_to_checkout: 'إتمام الطلب وتعبئة البيانات',
      loading_wait: 'جاري المعالجة...',

      // Messages & Validations
      msg_fill_required: 'يرجى تعبئة الحقول المطلوبة للمتابعة.',
      msg_invalid_phone: 'يرجى إدخال رقم هاتف أردني صحيح (يبدأ بـ 7 ويتكون من 8 خانات).',
      msg_order_success: 'تم تأكيد طلبك بنجاح! شكرًا لاختيارك Lorin 🌸',
      msg_auth_required_checkout: 'يرجى تسجيل الدخول أو إنشاء حساب لمتابعة طلبك وحفظ بياناتك بأمان.',
      msg_signed_out: 'تم تسجيل الخروج بنجاح.'
    },

    en: {
      lang_code: 'en',
      dir: 'ltr',
      lang_name: 'English',
      switch_lang_label: 'العربية',

      // Header
      nav_menu: 'Menu',
      nav_search: 'Search',
      nav_account: 'Account',
      nav_cart: 'Cart',
      header_cart_empty: 'Your cart is currently empty.',
      header_cart_continue: 'Continue Shopping',
      card_preview_to: 'To',
      card_preview_from: 'From',
      card_preview_link_attached: 'Link attached',
      card_preview_no_design: 'No card design selected',
      card_preview_message_placeholder: 'Your message will appear here',
      card_editor_open: 'Personalize your gift card',
      country_name: 'Jordan',
      currency_code: 'JOD',

      // Auth Flow
      auth_title_login_signup: 'Login or Create Account',
      auth_subtitle_login_signup: 'Find the perfect gift for your special occasion',
      auth_email_label: 'Email address',
      auth_email_placeholder: 'Enter your email address',
      auth_continue: 'CONTINUE',
      auth_or: 'or',
      auth_google: 'CONTINUE WITH GOOGLE',
      auth_apple: 'CONTINUE WITH APPLE',
      auth_terms_prefix: 'By proceeding, you agree to our ',
      auth_privacy_policy: 'Privacy policy',
      auth_terms_and: ' and ',
      auth_terms_conditions: 'Terms & Conditions',
      auth_recaptcha_notice: 'This page is protected by reCAPTCHA and is subject to the Google Privacy policy and Terms of Service.',
      auth_forgot_password: 'Forgot Password?',
      auth_reset_sent_msg: 'A password reset link has been sent to your email. Please check your inbox.',
      auth_email_exists_notice: 'This email is already registered. Please enter your password to continue.',
      search_country: 'Search country or code...',
      legal_privacy_title: 'Privacy Policy',
      legal_terms_title: 'Terms & Conditions',
      reset_pwd_title: 'Reset Your Password',
      reset_pwd_subtitle: 'Enter a new password for your Lorin account',
      reset_pwd_new_label: 'New Password',
      reset_pwd_confirm_label: 'Confirm Password',
      reset_pwd_match_err: 'Passwords do not match',
      reset_pwd_success_title: 'Password Updated Successfully!',
      reset_pwd_success_desc: 'You can now proceed to checkout or continue shopping securely.',
      btn_continue_to_checkout: 'Continue to Checkout',
      btn_back_to_home: 'Back to Store',

      // Sign Up Step 2
      auth_signup_title: 'Sign up',
      auth_signup_subtitle: 'Enter your Name and Create a Password',
      auth_fullname_label: 'Full Name',
      auth_fullname_placeholder: 'Please add your full name',
      auth_password_label: 'Password',
      auth_password_placeholder: 'Enter your password',
      auth_pwd_rule_title: 'Your password must contain:',
      auth_pwd_rule_lower: 'Lower case letter (a-z)',
      auth_pwd_rule_upper: 'Upper case letter (A-Z)',
      auth_pwd_rule_min: 'Minimum of 8 characters',
      auth_back: 'Back',

      // Phone Step 3
      auth_phone_title: 'Lastly, Your Phone Number',
      auth_phone_subtitle: 'We will send a one time code to verify your phone number',
      auth_phone_label: 'Phone Number',
      auth_phone_placeholder: '7XXXXXXXX',

      // OTP Step 4
      auth_otp_title: 'Verify Your Phone Number',
      auth_otp_subtitle: 'We sent a verification code via SMS to:',
      auth_change: 'CHANGE',
      auth_verify: 'VERIFY',
      auth_resend_timer: 'Request a new code in',
      auth_resend_action: 'Resend code now',

      // Verification Success Step 5
      auth_success_title: 'Verification Successful',
      auth_success_subtitle: 'Your Phone Number is now verified.',
      auth_done: 'DONE',
      auth_login_tab: 'Sign In',
      auth_enter_pwd_prompt: 'Enter password for your registered account',

      // Account Dropdown
      account_greeting_prefix: 'Hi',
      account_guest: 'Guest',
      menu_profile: 'View/Edit My Profile',
      menu_orders: 'My Orders',
      menu_subscriptions: 'My Subscriptions',
      menu_notifications: 'Notifications',
      menu_addresses: 'My Addresses',
      menu_favourite: 'Favourite',
      menu_signout: 'Sign Out',

      // Checkout Stepper
      step_delivery: 'Delivery Details',
      step_payment: 'Payment',

      // Step 1: Delivery Details
      collect_address_title: 'Collect the address',
      collect_address_desc: 'We will collect the address from the recipient. Delivery times may be impacted if recipient is unreachable.',
      recipient_details_title: 'Recipient Details',
      recipient_name_label: 'Recipient Name',
      recipient_name_placeholder: "Enter Recipient's Name",
      recipient_phone_label: 'Recipient Phone',
      recipient_phone_placeholder: '7XXXXXXXX',
      context_gift_self_notice: "Since this gift is for you, we'll need your complete delivery details. Please add your address below.",

      recipient_address_title: 'Recipient Address',
      recipient_address_desc: 'Add map location to help us deliver on time',
      btn_add_map_location: 'ADD MAP LOCATION',
      map_pin_instruction: 'Click on the map or drag the pin to set the exact delivery location',
      map_search_label: 'Search for a delivery location',
      map_search_results: 'Location search results',
      map_search_placeholder: 'Search for an address or place...',
      map_search_button: 'Search',
      map_open_link: 'Open selected location in Google Maps',
      map_searching: 'Searching for the location...',
      map_search_empty: 'No locations found.',
      map_search_error: 'Unable to search for this location. Please try again.',
      map_location_selected: 'Location selected',
      order_email_failed: 'The order was placed, but the store email notification could not be sent.',
      btn_use_current_location: 'Current Location 📍',
      area_label: 'Area',
      area_placeholder: 'Select Area',
      full_address_label: 'Full Address',
      full_address_placeholder: 'Street name, building number, apartment, landmark...',

      delivery_time_title: 'Delivery Date & Time',
      express_delivery: 'Express Delivery',
      express_delivery_sub: 'Express Delivery 120 Minutes',
      sameday_delivery: 'Same-Day Delivery',
      choose_datetime: 'Choose a Date & Time',
      express_banner_text: "Add the Recipient's address and we will make sure to deliver it in 120 minutes!",
      express_banner_link: 'Know More About Express Delivery',

      secret_identity_title: 'Keep my identity a secret',
      secret_identity_desc: 'By checking this box, we will not share any of your personal details with the recipient',

      // Step 2: Payment & Review
      payment_options_title: 'Payment Options',
      pay_apple: 'Apple pay',
      pay_google: 'Google Pay',
      pay_card: 'Credit Card',
      pay_cliq: 'CliQ / Instant Transfer',
      pay_cod: 'Cash on Delivery',
      promo_available_label: 'Promotions Available',
      promo_placeholder: 'Add a promo code',
      promo_apply: 'Apply',
      promo_remove: 'Remove',
      deliver_to_title: 'Deliver To',
      btn_edit: 'EDIT',
      delivery_team_note_title: 'Add a note for the delivery team',
      delivery_team_note_placeholder: 'Add any specific notes for our couriers (e.g. please do not ring bell, leave at front desk)...',

      // Order Summary
      order_summary_title: 'Order Summary',
      subtotal: 'Subtotal',
      delivery_charges: 'Delivery charges',
      delivery_free: 'Free 🌸',
      delivery_disclaimer: 'Please note that specific regions and express delivery may incur extra delivery fees.',
      discount: 'Discount',
      total: 'Total',
      qty_label: 'Qty',
      cart_empty: 'Your cart is empty!',
      photo_stick_title: 'Photo Stick-In attached',
      card_extra_title: 'Greeting Card',

      // Action Buttons
      btn_proceed_to_payment: 'PROCEED TO PAYMENT',
      btn_place_order: 'PLACE ORDER',
      btn_buy_with_apple: 'Buy with Apple Pay',
      btn_proceed_to_checkout: 'PROCEED TO CHECKOUT',
      loading_wait: 'Processing...',

      // Messages & Validations
      msg_fill_required: 'Please fill in all required fields to continue.',
      msg_invalid_phone: 'Please enter a valid Jordanian phone number (starts with 7 and has 8 digits).',
      msg_order_success: 'Your order has been confirmed successfully! Thank you for choosing Lorin 🌸',
      msg_auth_required_checkout: 'Please sign in or create an account to proceed with your order securely.',
      msg_signed_out: 'Signed out successfully.'
    }
  };

  function getLang() {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'ar';
  }

  function setLang(lang) {
    if (lang !== 'ar' && lang !== 'en') lang = 'ar';
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    applyLang(lang);
    window.dispatchEvent(new CustomEvent('lorin:langchange', { detail: { lang } }));
  }

  function toggleLang() {
    const next = getLang() === 'ar' ? 'en' : 'ar';
    setLang(next);
  }

  function t(key, fallback = '') {
    const lang = getLang();
    const dict = translations[lang] || translations.ar;
    return dict[key] !== undefined ? dict[key] : (translations.ar[key] || fallback || key);
  }

  function applyLang(lang) {
    lang = lang || getLang();
    const isAr = lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    // Update all pill-btn--lang elements
    const langButtons = document.querySelectorAll('.pill-btn--lang');
    langButtons.forEach((btn) => {
      const span = btn.querySelector('span');
      if (span) {
        span.textContent = isAr ? 'English' : 'العربية';
      } else {
        btn.textContent = isAr ? 'English' : 'العربية';
      }
    });

    // Translate any elements marked with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (k) el.textContent = t(k);
    });

    // Translate placeholders marked with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const k = el.getAttribute('data-i18n-placeholder');
      if (k) el.placeholder = t(k);
    });
  }

  // Setup click handler on lang buttons
  document.addEventListener('DOMContentLoaded', () => {
    applyLang();

    document.addEventListener('click', (e) => {
      const langBtn = e.target.closest('.pill-btn--lang');
      if (langBtn) {
        e.preventDefault();
        toggleLang();
      }
    });
  });

  window.LorinI18n = {
    getLang,
    setLang,
    toggleLang,
    t,
    applyLang,
    translations
  };
})();
