# Android Build Report — Qaloon UI15-D4

## الأوامر

```bash
./gradlew test lint assembleDebug --no-daemon
```

## النتيجة

- Gradle tests: **PASS**
- Gradle lint: **PASS**
- assembleDebug: **PASS**
- Java: `21.0.12`
- Gradle: `8.11.1`
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- الحجم: `27,707,116 bytes`
- SHA-256: `41eefd39c2a1463024de89706d65cde855ec53e115fa4ef4f709e7436f237749`

## القيود

- هذا APK Debug/Beta وليس Production Final.
- لم يتم تثبيته على جهاز Android فعلي أو محاكي في هذه البيئة: `REAL DEVICE = NOT RUN`.
- لا توجد keystore أو أسرار مضافة إلى Git.
