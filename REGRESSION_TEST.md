# Regression Test

## الفحوص المنفذة

- `node --check` على جميع ملفات JavaScript: **PASS**
- `npm ci --ignore-scripts --no-audit --no-fund`: **PASS**
- `npm run audit:release`: **PASS**
- `npm run prepare:web`: **PASS**
- `npm run android:sync`: **PASS**
- `npm run audit:qaloon`: **PASS**
- واجهة القرآن العثماني ووضع قالون منفصلان في المتصفح: **PASS**
- الفاتحة، صفحة قالون، التحديد، وقائمة القراء: **PASS**
- Dark UI بصريًا: **PASS**
- جهاز Android فعلي/محاكي: **NOT RUN**

## ميزات لم تُحذف من المصدر

الرئيسية، الصلاة، GPS، الأذكار، المسموع، المشغل المستمر، الورد، الحفظ، الإعدادات، الثيمات، PWA، Capacitor/Android، وملفات UI10 إلى UI14 بقيت في المصدر. تم تجنب حذف الملفات القديمة غير الموجودة في حزمة D4.
