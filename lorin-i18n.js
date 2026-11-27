// lorin-i18n.js
// Lorin Flora bilingual localization and language routing.

(function () {
  if (window.LorinI18n) return;

  const LANG_STORAGE_KEY = 'lorin_lang';

  const translations = {
    ar: {
      lang_code: 'ar',
      dir: 'rtl',
      lang_name: 'العربية',
      switch_lang_label: 'English',
      switch_lang_aria: 'التبديل إلى الإنجليزية',
      
      // Header
      nav_menu: 'القائمة',
      nav_search: 'بحث',
      nav_home: 'الرئيسية',
      nav_account: 'حسابي',
      nav_cart: 'السلة',
      search_products_placeholder: 'ابحث عن الزهور والهدايا...',
      store_title: 'Lorin | زهور وهدايا تُقدّم بمحبة',
      home_primary_categories_title: 'هدايا لكل لحظة',
      home_subcategories_title: 'تسوقي حسب التصنيف',
      home_no_primary_categories: 'لا توجد تصنيفات رئيسية حالياً.',
      home_no_subcategories: 'لا توجد تصنيفات إضافية حالياً.',
      home_no_product_sections: 'لا توجد أقسام منتجات متاحة حالياً.',
      home_search_no_results: 'لم نعثر على منتجات تطابق بحثك.',
      home_choose_gifts: 'اختاري هديتك',
      home_promo_indicators_aria: 'اختيار الشريحة الترويجية',
      home_promo_slide_aria: 'عرض الشريحة',
      home_promo_video_aria: 'فيديو ترويجي من Lorin',
      home_promo_image_aria: 'صورة ترويجية من Lorin',
      home_promo_birthday_heading: 'اكتشفي الهدية المثالية لعيد الميلاد!',
      home_promo_gift_now: 'أهدي الآن',
      home_section_best_sellers: 'الأكثر مبيعاً',
      home_section_something_precious: 'اختيارات مميزة',
      home_section_order_by_occasion: 'تسوقي حسب المناسبة',
      home_category_happy_birthday: 'عيد ميلاد سعيد',
      home_category_i_love_you: 'أحبك',
      home_category_get_well_soon: 'أطيب التمنيات بالشفاء',
      home_category_new_born: 'مولود جديد',
      home_category_graduation: 'التخرج',
      home_category_anniversary: 'ذكرى سنوية',
      home_category_wedding: 'زفاف',
      home_category_housewarming: 'منزل جديد',
      home_category_thank_you: 'شكراً لك',
      home_category_cake: 'كعك',
      home_category_hand_bouquets: 'باقات يد',
      home_category_flowers_in_vases: 'زهور في مزهريات',
      home_category_plants: 'نباتات',
      home_category_chocolates: 'شوكولاتة',
      home_category_perfumes: 'عطور',
      home_category_jewellery: 'مجوهرات',
      home_category_arabian_sweets: 'حلويات عربية',
      home_category_watches: 'ساعات',
      home_category_skincare_cosmetics: 'العناية بالبشرة ومستحضرات التجميل',
      home_category_mens_gifting: 'هدايا رجالية',
      home_category_womens_gifting: 'هدايا نسائية',
      home_category_all_flowers: 'جميع الزهور',
      home_category_view_all: 'عرض الكل',
      home_product_pastel_grace_flower_vase: 'مزهرية أناقة الباستيل',
      home_product_lorin_jumilia_romance_box: 'صندوق لورين جوميليا الرومانسي',
      home_product_eternal_love_heart_box: 'صندوق قلب الحب الأبدي مع الأوركيد',
      home_product_enchanting_flower_garden_bowl: 'وعاء حديقة الزهور الساحر',
      home_product_classic_romance_rose_basket: 'سلة ورود كلاسيكية بطابع رومانسي',
      home_product_red_roses_glass_bowl_vase: 'مزهرية زجاجية بالورود الحمراء',
      home_product_lorin_double_chocolate_cake: 'كعكة لورين بالشوكولاتة المزدوجة',
      home_product_100_red_roses_bouquet: 'باقة من 100 وردة حمراء',
      checkout_title: 'إتمام الطلب | Lorin',
      cart_title: 'سلة المشتريات | Lorin',
      category_label: 'التصنيف',
      footer_explore: 'اكتشفي Lorin',
      footer_about: 'تعرفي علينا',
      footer_customer_service: 'خدمة العملاء',
      footer_intro: 'متجر Lorin للزهور والهدايا الفاخرة، مع توصيل أنيق في الأردن.',
      footer_quick_links: 'روابط سريعة',
      footer_privacy: 'سياسة الخصوصية',
      footer_terms: 'الشروط والأحكام',
      footer_home: 'الرئيسية',
      footer_bouquets: 'الباقات المنسقة',
      footer_gifts: 'هدايا الزهور الطبيعية',
      footer_categories: 'تصفحي التصنيفات',
      footer_careers: 'الوظائف',
      footer_contact: 'تواصلي معنا',
      footer_faq: 'الأسئلة الشائعة',
      footer_social: 'تابعينا على وسائل التواصل',
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
      step_confirmed: 'تم تأكيد طلبك',
      confirmation_heading: 'تم تأكيد طلبك',
      confirmation_intro: 'شكراً لاختيارك Lorin. تم استلام طلبك بنجاح.',
      confirmation_order_number: 'رقم الطلب',
      confirmation_copy: 'نسخ الرقم',
      confirmation_copied: 'تم نسخ رقم الطلب.',
      confirmation_copy_failed: 'تعذر نسخ الرقم. يرجى نسخه يدوياً.',
      confirmation_email_sent: 'تم إرسال رسالة تأكيد الطلب بكامل التفاصيل إلى بريدك الإلكتروني.',
      confirmation_email_pending: 'تم تأكيد طلبك، لكن تعذر التحقق من إرسال البريد الإلكتروني. يرجى التحقق من بريدك أو التواصل معنا.',
      confirmation_track: 'تتبع طلبك',

      // Step 1: Delivery Details
      collect_address_title: 'تنسيق العنوان مع المستلم',
      collect_address_desc: 'سنتواصل مع المستلم بكل لطف لتنسيق عنوان التوصيل، وقد يتغير الموعد إذا تعذر الوصول إليه.',
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
      btn_use_current_location: 'موقعي الحالي',
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
      express_delivery_toast: 'نوصل باقات Lorin المنسقة طازجة خلال ساعتين في عمّان.',

      secret_identity_title: 'إخفاء هويتي عن المستلم (مفاجأة)',
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
      delivery_free: 'مجاناً',
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
      msg_select_area: 'يرجى اختيار المنطقة.',
      msg_order_success: 'تم تأكيد طلبك بنجاح! شكرًا لاختيارك Lorin.',
      msg_auth_required_checkout: 'يرجى تسجيل الدخول أو إنشاء حساب لمتابعة طلبك وحفظ بياناتك بأمان.',
      msg_signed_out: 'تم تسجيل الخروج بنجاح.',

      // Order tracking
      tracker_title: 'تتبع طلبك',
      tracker_back: 'العودة إلى المتجر',
      tracker_access_heading: 'تتبع طلبك',
      tracker_access_message: 'يمكنك تتبع طلبك مباشرةً من زر «تتبع طلبك» في صفحة تأكيد الطلب أو رابط رسالة التأكيد الإلكترونية.',
      tracker_return_to_store: 'العودة إلى المتجر',
      tracker_order_number: 'رقم الطلب',
      tracker_refresh: 'تحديث الحالة',
      tracker_refreshing: 'جارٍ التحديث...',
      tracker_progress: 'مراحل طلبك',
      tracker_item_summary: 'ملخص الطلب',
      tracker_delivery: 'التوصيل',
      tracker_area: 'المنطقة',
      tracker_address: 'العنوان',
      tracker_date_time: 'موعد التوصيل',
      tracker_total: 'الإجمالي',
      tracker_quantity: 'الكمية',
      tracker_gift_card: 'بطاقة الإهداء',
      tracker_photo_title: 'باقتك جاهزة',
      tracker_support: 'الدعم عبر واتساب',
      tracker_load_error: 'تعذر تحميل حالة الطلب الآن. يرجى المحاولة مرة أخرى.',
      tracker_config_error: 'خدمة التتبع غير متاحة حالياً. يرجى التواصل مع المتجر.',
      tracker_fallback_notice: 'نعرض نسخة محفوظة من الطلب إلى أن تتوفر بيانات التتبع المباشرة.',
      tracker_loading: 'جارٍ تحميل تفاصيل طلبك...',
      tracker_step_confirmed: 'تم تأكيد الطلب',
      tracker_step_preparing: 'يجري تجهيز باقتك',
      tracker_step_out_for_delivery: 'خرجت الباقة للتوصيل',
      tracker_step_delivered: 'تم التوصيل',
      tracker_step_confirmed_desc: 'استلمنا طلبك',
      tracker_step_preparing_desc: 'يجري تنسيق باقتك بعناية',
      tracker_step_out_for_delivery_desc: 'باقتك في طريقها إليك',
      tracker_step_delivered_desc: 'وصلت هديتك',
      tracker_placeholder_item: 'منتج',
      tracker_date_unknown: 'سيتم تأكيده قريباً',
      tracker_no_items: 'تفاصيل المنتجات غير متاحة.',
      tracker_no_address: 'سيتم تنسيق العنوان مع المستلم',

      // Admin order management
      admin_title: 'إدارة الطلبات | Lorin',
      admin_lock: 'قفل / تسجيل الخروج',
      admin_orders: 'الطلبات',
      admin_subtitle: 'راجعي الطلبات الجديدة وحدّثي مراحلها وأضيفي صورة الباقة بعد تجهيزها.',
      admin_search_placeholder: 'ابحثي برقم الطلب أو باسم العميل أو المستلم',
      admin_refresh: 'تحديث الطلبات',
      admin_login_title: 'إدارة الطلبات',
      admin_login_copy: 'سجّلي الدخول باستخدام حساب المشرف المعتمد.',
      admin_email: 'البريد الإلكتروني للمشرف',
      admin_password: 'كلمة المرور',
      admin_sign_in: 'تسجيل الدخول',
      admin_auth_note: 'تتم حماية البيانات عبر مصادقة Supabase وسياسات صلاحيات المشرف.',
      admin_status_confirmed: 'تم تأكيد الطلب',
      admin_status_preparing: 'يجري تجهيز الباقة',
      admin_status_out_for_delivery: 'خرجت للتوصيل',
      admin_status_delivered: 'تم التوصيل',
      admin_customer_recipient: 'العميل / المستلم',
      admin_delivery_address: 'منطقة التوصيل والعنوان',
      admin_delivery_schedule: 'موعد التوصيل',
      admin_total: 'الإجمالي',
      admin_order_status: 'حالة الطلب',
      admin_prepared_photo: 'صورة الباقة بعد تجهيزها',
      admin_photo_hint: 'JPG أو PNG أو WebP؛ بحد أقصى 10 ميغابايت',
      admin_upload_photo: 'رفع الصورة',
      admin_save_status: 'حفظ الحالة',
      admin_open_photo: 'فتح الصورة المحفوظة',
      admin_empty_search: 'لا توجد طلبات تطابق بحثك.',
      admin_empty_orders: 'لا توجد طلبات بعد.',
      admin_loading: 'جارٍ تحميل الطلبات…',
      admin_loaded: 'تم تحميل الطلبات.',
      admin_uploaded: 'تم رفع صورة الطلب.',
      admin_load_failed: 'تعذر تحميل الطلبات',
      admin_restore_failed: 'تعذر استعادة جلسة المشرف',
      admin_signin_failed: 'تعذر تسجيل الدخول',
      admin_saving_status: 'جارٍ حفظ الحالة…',
      admin_status_saved: 'تم حفظ حالة الطلب.',
      admin_save_failed: 'تعذر حفظ حالة الطلب',
      admin_choose_image: 'يرجى اختيار صورة قبل الرفع.',
      admin_image_type_error: 'اختاري صورة JPG أو PNG أو WebP بحجم لا يتجاوز 10 ميغابايت.',
      admin_uploading: 'جارٍ رفع الصورة…',
      admin_photo_saved: 'تم حفظ صورة الطلب',
      admin_upload_failed: 'تعذر رفع الصورة',
      admin_orders_one: 'طلب تم تحميله.',
      admin_orders_many: 'طلبات تم تحميلها.'
    },

    en: {
      lang_code: 'en',
      dir: 'ltr',
      lang_name: 'English',
      switch_lang_label: 'العربية',
      switch_lang_aria: 'Switch to Arabic',

      // Header
      nav_menu: 'Menu',
      nav_search: 'Search',
      nav_home: 'Home',
      nav_account: 'Account',
      nav_cart: 'Cart',
      search_products_placeholder: 'Search flowers and gifts...',
      store_title: 'Lorin | Flowers and gifts, thoughtfully delivered',
      home_primary_categories_title: 'Gifts for Every Moment',
      home_subcategories_title: 'Order by Category',
      home_no_primary_categories: 'No main categories are available right now.',
      home_no_subcategories: 'No additional categories are available right now.',
      home_no_product_sections: 'No product sections are available right now.',
      home_search_no_results: 'No products match your search.',
      home_choose_gifts: 'Choose Gifts Now',
      home_promo_indicators_aria: 'Choose a promotional slide',
      home_promo_slide_aria: 'Show slide',
      home_promo_video_aria: 'Lorin promotional video',
      home_promo_image_aria: 'Lorin promotional image',
      home_promo_birthday_heading: 'Discover the Perfect Birthday Gift!',
      home_promo_gift_now: 'Gift Now',
      home_section_best_sellers: 'Best Sellers',
      home_section_something_precious: 'Something Precious',
      home_section_order_by_occasion: 'Order By Occasion',
      home_category_happy_birthday: 'Happy Birthday',
      home_category_i_love_you: 'I Love You',
      home_category_get_well_soon: 'Get Well Soon',
      home_category_new_born: 'New Born',
      home_category_graduation: 'Graduation',
      home_category_anniversary: 'Anniversary',
      home_category_wedding: 'Wedding',
      home_category_housewarming: 'Housewarming',
      home_category_thank_you: 'Thank You',
      home_category_cake: 'cake',
      home_category_hand_bouquets: 'Hand Bouquets',
      home_category_flowers_in_vases: 'Flowers in Vases',
      home_category_plants: 'Plants',
      home_category_chocolates: 'Chocolates',
      home_category_perfumes: 'Perfumes',
      home_category_jewellery: 'Jewellery',
      home_category_arabian_sweets: 'Arabian Sweets',
      home_category_watches: 'Watches',
      home_category_skincare_cosmetics: 'Skincare & Cosmetics',
      home_category_mens_gifting: "Men's gifting",
      home_category_womens_gifting: "Women's Gifting",
      home_category_all_flowers: 'All Flowers',
      home_category_view_all: 'View All',
      home_product_pastel_grace_flower_vase: 'Pastel Grace Flower Vase',
      home_product_lorin_jumilia_romance_box: 'Lorin Jumilia Romance Box',
      home_product_eternal_love_heart_box: 'Eternal Love Heart Box with Orchids',
      home_product_enchanting_flower_garden_bowl: 'Enchanting Flower Garden Bowl',
      home_product_classic_romance_rose_basket: 'Classic Romance Rose Basket',
      home_product_red_roses_glass_bowl_vase: 'Red Roses Glass Bowl Vase',
      home_product_lorin_double_chocolate_cake: 'Lorin Double Chocolate Cake',
      home_product_100_red_roses_bouquet: '100 Red Roses Bouquet',
      checkout_title: 'Checkout | Lorin',
      cart_title: 'Your cart | Lorin',
      category_label: 'Category',
      footer_explore: 'Explore Lorin',
      footer_about: 'About Lorin',
      footer_customer_service: 'Customer service',
      footer_intro: 'Lorin brings you thoughtfully arranged flowers and refined gifts, delivered across Jordan.',
      footer_quick_links: 'Quick links',
      footer_privacy: 'Privacy policy',
      footer_terms: 'Terms & conditions',
      footer_home: 'Home',
      footer_bouquets: 'Curated bouquets',
      footer_gifts: 'Fresh-flower gifts',
      footer_categories: 'Browse categories',
      footer_careers: 'Careers',
      footer_contact: 'Contact us',
      footer_faq: 'Frequently asked questions',
      footer_social: 'Follow us',
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
      step_payment: 'Payment & Order Confirmation',
      step_confirmed: 'Order Confirmed',
      confirmation_heading: 'Your order is confirmed',
      confirmation_intro: 'Thank you for choosing Lorin. We have received your order.',
      confirmation_order_number: 'Order number',
      confirmation_copy: 'Copy number',
      confirmation_copied: 'Order number copied.',
      confirmation_copy_failed: 'Could not copy the number. Please copy it manually.',
      confirmation_email_sent: 'An order confirmation email with full details has been sent to your email address.',
      confirmation_email_pending: 'Your order is confirmed, but we could not confirm the confirmation email delivery. Please check your inbox or contact us.',
      confirmation_track: 'Track Your Order',

      // Step 1: Delivery Details
      collect_address_title: 'Arrange delivery with the recipient',
      collect_address_desc: 'Our team will discreetly coordinate the address with the recipient. Delivery timing may shift if we cannot reach them.',
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
      btn_use_current_location: 'Current Location',
      area_label: 'Area',
      area_placeholder: 'Select Area',
      full_address_label: 'Full Address',
      full_address_placeholder: 'Street name, building number, apartment, landmark...',

      delivery_time_title: 'Delivery Date & Time',
      express_delivery: 'Express Delivery',
      express_delivery_sub: 'Hand-delivered within 120 minutes',
      sameday_delivery: 'Same-Day Delivery',
      choose_datetime: 'Choose a Date & Time',
      express_banner_text: "Share the recipient's address and we'll deliver your gift within 120 minutes.",
      express_banner_link: 'Discover express delivery',
      express_delivery_toast: 'Lorin arrangements are freshly delivered within two hours in Amman.',

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
      delivery_free: 'Free',
      delivery_disclaimer: 'Please note that specific regions and express delivery may incur extra delivery fees.',
      discount: 'Discount',
      total: 'Total',
      qty_label: 'Qty',
      cart_empty: 'Your cart is empty!',
      photo_stick_title: 'Photo Stick-In attached',
      card_extra_title: 'Greeting Card',

      // Action Buttons
      btn_proceed_to_payment: 'Continue to payment',
      btn_place_order: 'Confirm and place order',
      btn_buy_with_apple: 'Buy with Apple Pay',
      btn_proceed_to_checkout: 'Continue to checkout',
      loading_wait: 'Preparing your order…',

      // Messages & Validations
      msg_fill_required: 'Please fill in all required fields to continue.',
      msg_invalid_phone: 'Please enter a valid Jordanian phone number (starts with 7 and has 8 digits).',
      msg_select_area: 'Please select a delivery area.',
      msg_order_success: 'Your order has been confirmed successfully! Thank you for choosing Lorin.',
      msg_auth_required_checkout: 'Please sign in or create an account to proceed with your order securely.',
      msg_signed_out: 'Signed out successfully.',

      // Order tracking
      tracker_title: 'Track your order',
      tracker_back: 'Back to store',
      tracker_access_heading: 'Track your order',
      tracker_access_message: 'Open your order’s tracking page using the “Track Your Order” button on the confirmation page or the link in your confirmation email.',
      tracker_return_to_store: 'Return to store',
      tracker_order_number: 'Order number',
      tracker_refresh: 'Refresh status',
      tracker_refreshing: 'Refreshing…',
      tracker_progress: 'Your order’s journey',
      tracker_item_summary: 'Order summary',
      tracker_delivery: 'Delivery',
      tracker_area: 'Area',
      tracker_address: 'Address',
      tracker_date_time: 'Delivery date & time',
      tracker_total: 'Total',
      tracker_quantity: 'Qty',
      tracker_gift_card: 'Your gift card',
      tracker_photo_title: 'Your arrangement is ready',
      tracker_support: 'WhatsApp support',
      tracker_load_error: 'We couldn’t load your order status. Please try again.',
      tracker_config_error: 'Order tracking is temporarily unavailable. Please contact the store.',
      tracker_fallback_notice: 'Showing your saved order summary while live tracking is unavailable.',
      tracker_loading: 'Loading your order details…',
      tracker_step_confirmed: 'Order confirmed',
      tracker_step_preparing: 'Being arranged with care',
      tracker_step_out_for_delivery: 'Out for delivery',
      tracker_step_delivered: 'Delivered',
      tracker_step_confirmed_desc: 'We’ve received your order',
      tracker_step_preparing_desc: 'Your arrangement is being prepared',
      tracker_step_out_for_delivery_desc: 'Your gift is on its way',
      tracker_step_delivered_desc: 'Your gift has arrived',
      tracker_placeholder_item: 'Product',
      tracker_date_unknown: 'To be confirmed',
      tracker_no_items: 'Product details are not available.',
      tracker_no_address: 'The delivery address will be arranged with the recipient',

      // Admin order management
      admin_title: 'Order management | Lorin',
      admin_lock: 'Lock / sign out',
      admin_orders: 'Orders',
      admin_subtitle: 'Review new orders, update their progress, and add a photo of each finished arrangement.',
      admin_search_placeholder: 'Search by order number or customer / recipient name',
      admin_refresh: 'Refresh orders',
      admin_login_title: 'Order management',
      admin_login_copy: 'Sign in with your authorized administrator account.',
      admin_email: 'Administrator email',
      admin_password: 'Password',
      admin_sign_in: 'Sign in',
      admin_auth_note: 'Data access is protected by Supabase authentication and administrator policies.',
      admin_status_confirmed: 'Order confirmed',
      admin_status_preparing: 'Preparing your arrangement',
      admin_status_out_for_delivery: 'Out for delivery',
      admin_status_delivered: 'Delivered',
      admin_customer_recipient: 'Customer / recipient',
      admin_delivery_address: 'Delivery area & address',
      admin_delivery_schedule: 'Delivery date & time',
      admin_total: 'Total',
      admin_order_status: 'Order status',
      admin_prepared_photo: 'Prepared arrangement photo',
      admin_photo_hint: 'JPG, PNG or WebP; up to 10 MB',
      admin_upload_photo: 'Upload photo',
      admin_save_status: 'Save status',
      admin_open_photo: 'Open saved photo',
      admin_empty_search: 'No orders match your search.',
      admin_empty_orders: 'No orders found yet.',
      admin_loading: 'Loading orders…',
      admin_loaded: 'Orders loaded.',
      admin_uploaded: 'Order photo saved.',
      admin_load_failed: 'Could not load orders',
      admin_restore_failed: 'Could not restore the administrator session',
      admin_signin_failed: 'Sign-in failed',
      admin_saving_status: 'Saving status…',
      admin_status_saved: 'Status saved.',
      admin_save_failed: 'Could not save status',
      admin_choose_image: 'Choose an image before uploading.',
      admin_image_type_error: 'Choose a JPG, PNG or WebP image no larger than 10 MB.',
      admin_uploading: 'Uploading photo…',
      admin_photo_saved: 'Photo saved for order',
      admin_upload_failed: 'Photo upload failed',
      admin_orders_one: 'order loaded.',
      admin_orders_many: 'orders loaded.'
    }
  };

  function isArabicPath(pathname = window.location.pathname) {
    return /^\/ar(?:\/|$)/.test(pathname);
  }

  let localPreviewLang = '';

  function isLocalPreview() {
    const hostname = window.location.hostname.toLowerCase();
    return window.location.protocol === 'file:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1';
  }

  function getLang() {
    if (isLocalPreview()) {
      if (localPreviewLang) return localPreviewLang;
      try {
        const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
        if (storedLang === 'ar' || storedLang === 'en') return storedLang;
      } catch (_) {}
      return new URLSearchParams(window.location.search).get('lang') === 'ar' ? 'ar' : 'en';
    }
    return isArabicPath() ? 'ar' : 'en';
  }

  function storeLang(lang) {
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (_) {}
  }

  function routePathForLanguage(lang) {
    const pathname = window.location.pathname;
    const arabicPath = isArabicPath(pathname);
    let pagePath = arabicPath ? pathname.replace(/^\/ar(?=\/|$)/, '') : pathname;
    if (!pagePath) pagePath = '/';
    if (pagePath === '/index.html' || pagePath === '/index') pagePath = '/';
    if (pagePath === '/product.html' || pagePath === '/product/') pagePath = '/product';
    if (lang === 'ar') return pagePath === '/' ? '/ar' : `/ar${pagePath}`;
    return pagePath;
  }

  function setLang(lang) {
    if (lang !== 'ar' && lang !== 'en') lang = 'en';
    storeLang(lang);
    if (isLocalPreview()) {
      localPreviewLang = lang;
      applyLang(lang);
      window.dispatchEvent(new CustomEvent('lorin:langchange', { detail: { lang } }));
      return;
    }
    const targetPath = routePathForLanguage(lang);
    const targetUrl = `${targetPath}${window.location.search}${window.location.hash}`;
    if (targetUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.location.assign(targetUrl);
      return;
    }
    applyLang(lang);
    window.dispatchEvent(new CustomEvent('lorin:langchange', { detail: { lang } }));
  }

  function toggleLang() {
    setLang(getLang() === 'ar' ? 'en' : 'ar');
  }

  function t(key, fallback = '') {
    const lang = getLang();
    const dict = translations[lang] || translations.en;
    if (dict[key] !== undefined) return dict[key];
    if (lang === 'ar' && translations.en[key] !== undefined) return translations.en[key];
    if (fallback) return fallback;
    return key;
  }

  function translateElement(el) {
    if (!(el instanceof Element)) return;
    const lang = getLang();
    const localizedText = el.getAttribute(`data-i18n-${lang}`);
    const textKey = el.getAttribute('data-i18n');
    if (localizedText !== null && localizedText !== '') {
      if (el.textContent !== localizedText) el.textContent = localizedText;
    } else if (textKey) {
      const translated = t(textKey);
      if (el.textContent !== translated) el.textContent = translated;
    }
    const placeholderKey = el.getAttribute('data-i18n-placeholder');
    if (placeholderKey) el.setAttribute('placeholder', t(placeholderKey));
    const localizedAria = el.getAttribute(`data-i18n-aria-${lang}`);
    const ariaKey = el.getAttribute('data-i18n-aria');
    if (localizedAria !== null && localizedAria !== '') {
      el.setAttribute('aria-label', localizedAria);
    } else if (ariaKey) {
      el.setAttribute('aria-label', t(ariaKey));
    }
    const localizedAlt = el.getAttribute(`data-i18n-alt-${lang}`);
    if (localizedAlt !== null && localizedAlt !== '') el.setAttribute('alt', localizedAlt);
    if (el.matches('.pill-btn--lang')) {
      const label = t('switch_lang_label');
      const span = el.querySelector('span');
      if (span) {
        if (span.textContent !== label) span.textContent = label;
      } else if (el.textContent !== label) {
        el.textContent = label;
      }
      el.setAttribute('aria-label', t('switch_lang_aria'));
    }
  }

  function applyLang(lang, root = document) {
    lang = lang || getLang();
    const isAr = lang === 'ar';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    const base = document.querySelector('base');
    if (!isLocalPreview() && isAr && window.location.pathname === '/ar' && !base) {
      const pageBase = document.createElement('base');
      pageBase.href = '/ar/';
      document.head.insertBefore(pageBase, document.head.firstChild);
    }

    if (root instanceof Element) translateElement(root);
    root.querySelectorAll('[data-i18n], [data-i18n-en], [data-i18n-ar], [data-i18n-placeholder], [data-i18n-aria], [data-i18n-aria-en], [data-i18n-aria-ar], [data-i18n-alt-en], [data-i18n-alt-ar], .pill-btn--lang')
      .forEach(translateElement);

    const title = document.querySelector('title[data-i18n]');
    if (title) document.title = title.textContent;
  }

  const initialLang = getLang();
  if (isLocalPreview()) localPreviewLang = initialLang;
  storeLang(initialLang);
  applyLang(initialLang);

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('.pill-btn--lang, [data-lorin-language-toggle]') : null;
    if (!target) return;
    event.preventDefault();
    toggleLang();
  });

  const observeTranslations = () => {
    if (!document.body || !window.MutationObserver) return;
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) applyLang(getLang(), node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyLang(getLang());
      observeTranslations();
    }, { once: true });
  } else {
    applyLang(getLang());
    observeTranslations();
  }

  window.LorinI18n = {
    getLang,
    setLang,
    toggleLang,
    t,
    applyLang,
    translations
  };
})();
