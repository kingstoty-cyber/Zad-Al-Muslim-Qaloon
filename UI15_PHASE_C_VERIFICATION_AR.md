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
| DOKALI | PASS |
| HUSARY | PASS |
| HUDHAIFY | PASS |
| REPEAT | PASS |
| RANGE | PASS |
| STATE RESTORE | NOT RUN |
| TAFSIR MAPPING | NOT RUN |
| ADHKAR UI14 | PASS |
| AUDIO CONFLICT | PASS |
| AUDIT | PASS |
| PREPARE | PASS |
| CAP SYNC | PASS |
| APK BUILD | PASS |
| APK INSTALL | NOT RUN |
| REAL DEVICE | NOT RUN |

## قيود الاختبار

- لا يوجد Android SDK في Sandbox، لذلك لم يُعتبر البناء المحلي نجاحًا؛ GitHub Actions هو مسار البناء المؤهل.
- لم يُشغّل صوت فعليًا داخل WebView ولم يُثبت APK على Emulator أو جهاز Android.
- GitHub Actions build: https://github.com/kingstoty-cyber/Zad-Al-Muslim-Qaloon/actions/runs/37356501335
- APK SHA-256: `caf9cda57fcbfa9408a15aad855ca973ba9dacb1b4db54171031858cd0bf2563`
- لم يبدأ Phase D.
