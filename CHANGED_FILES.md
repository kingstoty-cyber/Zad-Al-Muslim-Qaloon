# Changed Files — UI15-D4

تم الدمج من حزمة D4 فوق أحدث `main`، مع الحفاظ على الملفات الأقدم غير الموجودة في الحزمة.

## ملفات قارئ Qaloon

- `quran.js`
- `quran-libya.js`
- `quran-libya-page.js`
- `quran-libya.css`
- `quran-libya-data/qaloon-text.json`
- `quran-libya-data/ayah-regions.json`
- `quran-libya-data/*_qaloon-timings.json`
- `assets/fonts/quran/qaloon.10.ttf`

## تكامل الصوت والتشغيل دون اتصال

- `app.js`
- `quran-audio.js`
- `surah-audio.js`
- `scripts/prepare-capacitor.mjs`
- `sw.js`
- `scripts/audit-qaloon-d4.mjs`
- `package.json`
- النسخ الناتجة داخل `www/`.

## التعارضات والحلول

لم يحدث تعارض Git نصي عند نسخ D4، لكن مراجعة السلوك كشفت أن نسخة D4 أزالت استدعاءات إيقاف مشغل قالون من الأذكار والمسموع، وأزالت إيقاف المشغلات الأخرى عند تشغيل قالون. تمت إعادة هذه الاستدعاءات صراحةً في ملفات الصوت الأربعة لمنع اختلاط التلاوات.

كما اكتُشف أن `prepare:web` لا ينسخ `quran-libya-data` وملفات Qaloon إلى `www`. تمت إضافة هذه الملفات والبيانات إلى التجهيز وService Worker، ثم أعيد اختبار المتصفح وCapacitor.
