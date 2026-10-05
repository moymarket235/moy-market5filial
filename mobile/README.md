# Мой Маркет — Mobile App

Бул папка азыркы Мой Маркет сайтын Capacitor аркылуу Android жана iOS колдонмосуна даярдайт.

## Package ID

kg.moymarket.app

## App name

Мой Маркет

## Local commands

npm install
npm run add:android
npm run add:ios
npm run sync
npm run build:android:debug

## How it works

prepare-web.mjs репозиторийдин азыркы веб-нускасын mobile/www ичине көчүрөт. Негизги сайттын файлдары өзгөрбөйт.

Андан кийин Capacitor ошол веб-нускадан Android жана iOS native долбоорлорун түзөт.

## Google Play

2026-жылдагы талапка ылайык Android 16 / API 36 target кылынган Capacitor 8 тармагы колдонулат.

Release AAB үчүн кийин Android signing key кошулат:
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

## App Store

iOS build үчүн macOS + Xcode керек. Capacitor 8 iOS build үчүн Xcode 26.0+ талап кылынат.

App Store жарыялоо алдында Apple Developer аккаунту, signing жана App Store Connect metadata кошулат.

## Кийинки этап

1. Android debug build текшерүү.
2. Android app icon + splash screen коюу.
3. iOS build текшерүү.
4. Native share / notifications сыяктуу app-specific функцияларды кошуу.
5. Release signing.
6. Google Play Console жана App Store Connect аркылуу жарыялоо.
