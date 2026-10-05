# REGRESSION_TEST_UI14_UI15

| المجال | النتيجة | الدليل/الملاحظة |
|---|---|---|
| الأذكار والعداد | PASS | `adhkar_progress` و`completedBy` وعداد الصوت موجودة في `app.js` |
| تكرار الذكر الصوتي | PASS | منطق `handleDhikrAudioEnded` يحترم `item.count` |
| القرآن الحالي حفص | PASS | ملفات `quran-data` و6236 لم تُستبدل |
| قالون 6214 | PASS | `quran-libya-data/ayah-regions.json` وملفات التوقيت مكتملة |
| تعارض المشغلات | PASS | إيقاف متبادل مضاف في مشغلات قالون/القرآن/الأذكار/المسموع |
| prayer/GPS | PASS (مراجعة مصدر) | لم تُحذف الملفات أو الإضافات؛ اختبار جهاز NOT RUN |
| themes/settings/PWA | PASS (مراجعة مصدر) | الأصول والـService Worker وCapacitor موجودة |
| UI flow فعلي | NOT RUN | لا يوجد متصفح تفاعلي/جهاز Android في هذه المرحلة |
