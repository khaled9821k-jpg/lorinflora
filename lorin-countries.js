// lorin-countries.js
// Lorin Flora Global Country Dial-Code Directory
// Comprehensive list of Arab and International countries with Jordan (+962) default.

(function () {
  const COUNTRIES = [
    // Jordan (Default)
    { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dial: '+962', placeholder: '7XXXXXXXX' },

    // Arab Countries (GCC, Levant, North Africa, etc.)
    { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', dial: '+966', placeholder: '5XXXXXXXX' },
    { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', dial: '+971', placeholder: '5XXXXXXXX' },
    { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dial: '+965', placeholder: 'XXXXXXXX' },
    { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dial: '+974', placeholder: 'XXXXXXXX' },
    { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dial: '+973', placeholder: 'XXXXXXXX' },
    { code: 'OM', nameAr: 'سلطنة عُمان', nameEn: 'Oman', dial: '+968', placeholder: 'XXXXXXXX' },
    { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', dial: '+970', placeholder: '5XXXXXXXX' },
    { code: 'EG', nameAr: 'جمهورية مصر العربية', nameEn: 'Egypt', dial: '+20', placeholder: '1XXXXXXXXX' },
    { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', dial: '+961', placeholder: 'XXXXXXXX' },
    { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', dial: '+964', placeholder: '7XXXXXXXXX' },
    { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', dial: '+963', placeholder: '9XXXXXXXX' },
    { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', dial: '+967', placeholder: '7XXXXXXXX' },
    { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', dial: '+212', placeholder: '6XXXXXXXX' },
    { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', dial: '+213', placeholder: 'XXXXXXXXX' },
    { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', dial: '+216', placeholder: 'XXXXXXXX' },
    { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', dial: '+218', placeholder: '9XXXXXXXX' },
    { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', dial: '+249', placeholder: '9XXXXXXXX' },

    // Top International Countries
    { code: 'US', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', dial: '+1', placeholder: 'XXXXXXXXXX' },
    { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', dial: '+44', placeholder: '7XXXXXXXXX' },
    { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', dial: '+1', placeholder: 'XXXXXXXXXX' },
    { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', dial: '+90', placeholder: '5XXXXXXXXX' },
    { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', dial: '+49', placeholder: '1XXXXXXXXXX' },
    { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', dial: '+33', placeholder: '6XXXXXXXX' },
    { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', dial: '+39', placeholder: '3XXXXXXXXX' },
    { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', dial: '+34', placeholder: '6XXXXXXXX' },
    { code: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', dial: '+31', placeholder: '6XXXXXXXX' },
    { code: 'SE', nameAr: 'السويد', nameEn: 'Sweden', dial: '+46', placeholder: '7XXXXXXXX' },
    { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', dial: '+41', placeholder: '7XXXXXXXX' },
    { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', dial: '+61', placeholder: '4XXXXXXXX' },
    { code: 'IN', nameAr: 'الهند', nameEn: 'India', dial: '+91', placeholder: '9XXXXXXXXX' },
    { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', dial: '+92', placeholder: '3XXXXXXXXX' },
    { code: 'CY', nameAr: 'قبرص', nameEn: 'Cyprus', dial: '+357', placeholder: '9XXXXXXX' },
    { code: 'GR', nameAr: 'اليونان', nameEn: 'Greece', dial: '+30', placeholder: '69XXXXXXXX' },
    { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', dial: '+60', placeholder: '1XXXXXXXX' },
    { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', dial: '+62', placeholder: '8XXXXXXXXX' },
    { code: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines', dial: '+63', placeholder: '9XXXXXXXXX' },
    { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', dial: '+55', placeholder: 'XXXXXXXXXXX' },
    { code: 'RU', nameAr: 'روسيا', nameEn: 'Russia', dial: '+7', placeholder: '9XXXXXXXXX' },
    { code: 'CN', nameAr: 'الصين', nameEn: 'China', dial: '+86', placeholder: '1XXXXXXXXXX' }
  ];

  window.LORIN_COUNTRIES = COUNTRIES;

  window.getLorinCountryByCode = function (code) {
    if (!code) return COUNTRIES[0];
    return COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase()) || COUNTRIES[0];
  };

  window.getLorinCountryByDial = function (dial) {
    if (!dial) return COUNTRIES[0];
    const clean = dial.startsWith('+') ? dial : '+' + dial;
    return COUNTRIES.find(c => c.dial === clean) || COUNTRIES[0];
  };
})();
