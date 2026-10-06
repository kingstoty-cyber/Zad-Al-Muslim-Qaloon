# UI15-D6 — تقرير التدقيق الحالي

## التعديلات المثبتة

- تشغيل السورة كاملة باستخدام ملف MP3 واحد، دون إنشاء Audio جديد لكل آية.
- تتبع الآية حسب `start_ms` مع إبقاء الصوت مستمرًا وتحديث Highlight/page.
- بدء التشغيل من أول السورة أو من آية وسط.
- Repeat للسورة كاملة داخل نفس Audio object، مع بقاء repeat الآية والنطاق.
- Pause/Resume دون إعادة الملف للبداية.
- إعادة تشغيل المصدر الجديد عند تغيير القارئ أثناء التشغيل.
- زر ملء الشاشة وfallback RTL داخل منطقة القراءة.
- ضمان نسخ `quran-libya.js` و`quran-libya-page.js` و`quran-libya.css` وبيانات قالون إلى `www/` وCapacitor.

## النتائج المنفذة

| الفحص | النتيجة |
|---|---|
| Qaloon: 114 سورة / 6214 آية | PASS |
| Ayah regions: 6214 ومطابقة المفاتيح | PASS |
| Pages: 602 متصلة من 1 إلى 602 | PASS |
| Dokali/Husary/Hudhaifi timings | PASS؛ 6214 لكل قارئ |
| Fatiha 1:1 يبدأ بالحمد لله رب العالمين | PASS |
| تشغيل الفاتحة من البداية | PASS تفاعليًا |
| بدء الفاتحة من آية وسط | PASS تفاعليًا |
| ملف MP3 واحد أثناء تشغيل السورة | PASS تفاعليًا |
| Highlight تلقائي حتى نهاية الفاتحة | PASS تفاعليًا |
| Pause/Resume | PASS تفاعليًا |
| Fullscreen fallback وRTL | PASS تفاعليًا |
| تغيير مصادر القراء الثلاثة | PASS تفاعليًا |
| node --check لكل JavaScript | PASS |
| npm ci | PASS |
| npm run audit:release | PASS |
| npm run prepare:web | PASS |
| npm run android:sync | PASS |
| Gradle محلي | NOT RUN؛ Android SDK غير موجود |
| جهاز Android فعلي/محاكي | NOT RUN |
| اختبار البقرة حتى النهاية | NOT RUN |
| اختبار Repeat ×3 بصوت حقيقي حتى الدورات | NOT RUN |

## ملاحظة قرآنية

لم يتم تعديل نص قالون أو تحويله إلى 6236. لم يستخدم الإصلاح mapping أعمى أو `ayah + 1` أو `ayah - 1`.
