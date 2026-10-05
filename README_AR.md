# تعليمات تسليم Qaloon UI15-D4

## التحقق

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run audit:qaloon
npm run audit:release
npm run prepare:web
npm run android:sync
cd android
./gradlew test lint assembleDebug
```

## APK Debug

المسار:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

SHA-256:

```text
41eefd39c2a1463024de89706d65cde855ec53e115fa4ef4f709e7436f237749
```

هذه الحزمة Debug/Beta وليست Release Production. لم تتم إضافة أي keystore إلى GitHub.
