# Erasmus Connect Mobile 📱

React Native mobil uygulaması - Expo ile geliştirilmiştir.

## 🚀 Başlangıç

### Gereksinimler

- Node.js 16+
- npm veya yarn
- Android Studio (Android için)
- Expo Go uygulaması (Test için)

### Kurulum

```bash
cd mobile
npm install
```

### Çalıştırma

#### Android
```bash
npm run android
```

#### iOS (macOS gerekir)
```bash
npm run ios
```

#### Web
```bash
npm run web
```

#### Expo Go ile Test
```bash
npx expo start
```

QR kodu Expo Go uygulaması ile tarayın.

## 📁 Proje Yapısı

```
mobile/
├── src/
│   ├── components/       # Yeniden kullanılabilir UI bileşenleri
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── config/          # API ve yapılandırma
│   │   └── api.ts
│   ├── navigation/      # Navigasyon yapısı
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/         # Uygulama ekranları
│   │   ├── auth/        # Giriş ve kayıt ekranları
│   │   └── main/        # Ana uygulama ekranları
│   ├── services/        # API servisleri
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── match.service.ts
│   │   ├── post.service.ts
│   │   └── country.service.ts
│   ├── store/           # State yönetimi (Zustand)
│   │   └── authStore.ts
│   └── theme/           # Renkler ve stil sabitleri
│       ├── colors.ts
│       └── spacing.ts
├── App.tsx
└── package.json
```

## 🎨 Özellikler

### ✅ Tamamlanan

- ✨ Auth sistemi (Login/Register)
- 🏠 Dashboard ekranı
- 👥 Eşleşme sistemi (Roommate, Mentor, Communication)
- 📝 Gönderiler
- 🌍 Ülkeler sayfası
- 👤 Profil sayfası
- 🎨 Modern UI/UX tasarımı
- 🔐 Token tabanlı authentication
- 📱 Responsive tasarım

### 📋 Yapılacaklar

- 🔔 Bildirimler
- 💬 Mesajlaşma sistemi
- 📸 Fotoğraf yükleme
- 🗺️ Harita entegrasyonu
- 🌐 Çoklu dil desteği

## 🔧 Konfigürasyon

### API URL

`src/config/api.ts` dosyasında API URL'ini değiştirin:

```typescript
export const API_URL = 'http://YOUR_BACKEND_URL/api';
```

**Not:** Localhost kullanıyorsanız:
- Android emulator: `http://10.0.2.2:4000/api`
- iOS simulator: `http://localhost:4000/api`
- Fiziksel cihaz: Bilgisayarınızın IP adresi

## 🎯 Kullanılan Teknolojiler

- **React Native** - Mobil uygulama framework'ü
- **Expo** - React Native geliştirme platformu
- **TypeScript** - Tip güvenliği
- **React Navigation** - Navigasyon
- **Zustand** - State yönetimi
- **Axios** - HTTP istekleri
- **Expo Linear Gradient** - Gradient efektleri
- **Ionicons** - İkonlar

## 📱 Demo Hesap

```
E-posta: ahmet.yilmaz@example.com
Şifre: demo123
```

## 🐛 Sorun Giderme

### Metro bundler hatası
```bash
npx expo start -c
```

### Android build hatası
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS pods hatası
```bash
cd ios
pod install
cd ..
npm run ios
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Geliştirici

Erasmus Connect Ekibi

