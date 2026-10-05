# UI15 Phase C — تقرير التحقق الأساسي لمصحف قالون ليبيا

## نطاق العمل

تم استخدام حزمة `Zad-Al-Muslim-UI15-Qaloon-Libya-Phase-C-source.zip` فقط، وإنشاء مستودع مستقل خاص باسم `Zad-Al-Muslim-Qaloon`. لم يتم تعديل مستودع `Zad-al-Muslim` القديم، ولم تبدأ Phase D.

## التغييرات المحافظة المسموح بها

- تعقيم 62 قيمة إحداثية هندسية طفيفة خارج `[0,1]` إلى حدود الصفحة، دون تعديل نص القرآن أو أرقام الآيات أو الصور/الصفحات.
- عزل مشغل قالون عن مشغل القرآن، المسموع، والأذكار، والعكس عند بدء أي مشغل آخر.
- لا توجد إضافة ميزات جديدة ولا تحويل لملفات `.svgz/.vec`.

## النتائج

| الفحص | النتيجة |
|---|---|
| SOURCE | PASS |
| 6214 DATA | PASS |
| 602 PAGES DATA | PASS |
| DOKALI | PASS (بيانات ثابتة) |
| HUSARY | PASS (بيانات ثابتة) |
| HUDHAIFY | PASS (بيانات ثابتة) |
| REPEAT | PASS (مراجعة منطقية ثابتة) |
| RANGE | PASS (مراجعة منطقية ثابتة) |
| STATE RESTORE | NOT RUN (اختبار إغلاق/عودة فعلي يحتاج متصفح/جهاز) |
| TAFSIR MAPPING | PASS لتجنب الربط الأعمى؛ NOT READY لخريطة عامة 6214↔6236 |
| ADHKAR UI14 | PASS (العداد والتكرار الصوتي موجودان؛ اختبار واجهة فعلي NOT RUN) |
| AUDIO CONFLICT | PASS (عزل صريح في أحداث التشغيل) |
| AUDIT | PASS |
| PREPARE | PASS |
| CAP SYNC | PASS |
| APK BUILD | PENDING CI |
| APK INSTALL | NOT RUN |
| REAL DEVICE | NOT RUN |

## قيود الاختبار

- لا يوجد Android SDK في Sandbox، لذلك لم يُعتبر البناء المحلي نجاحًا؛ GitHub Actions هو مسار البناء المؤهل.
- لم يُشغّل صوت فعليًا داخل WebView ولم يُثبت APK على Emulator أو جهاز Android.
- لم يبدأ Phase D.
