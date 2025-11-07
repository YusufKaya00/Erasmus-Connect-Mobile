# 📱 Erasmus Connect Mobile - Nasıl Çalıştırırım?

## 🚀 Hızlı Başlangıç (3 Adımda!)

### Adım 1: Expo Go Uygulamasını İndir
- **Android**: [Play Store'dan Expo Go'yu indir](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store'dan Expo Go'yu indir](https://apps.apple.com/app/expo-go/id982107779)

### Adım 2: Mobil Projeyi Başlat
Terminal'de:
```bash
cd mobile
npm start
```

### Adım 3: QR Kodu Tara
- Terminal'de çıkan QR kodu Expo Go uygulaması ile tara
- Uygulama telefonunda açılacak! 🎉

---

## 📱 DİĞER YÖNTEMLER

### 2️⃣ Android Studio Emulator ile

1. **Android Studio Kur** (Yoksa)
   - https://developer.android.com/studio indir

2. **Emulator Oluştur**
   - Android Studio aç
   - Tools > Device Manager
   - Create Device > Pixel 5 (veya herhangi bir cihaz)

3. **Emulator'ı Başlat**
   - Device Manager'dan cihazı başlat

4. **Uygulamayı Çalıştır**
   ```bash
   cd mobile
   npm run android
   ```

### 3️⃣ Web Tarayıcıda (Test için)

```bash
cd mobile
npm run web
```

---

## ⚙️ Backend API Ayarı

Mobil uygulama backend'e bağlanmak için API URL'sini ayarlaman gerekiyor:

### `mobile/src/config/api.ts` dosyasını aç:

```typescript
// Localhost için:
export const API_URL = 'http://10.0.2.2:4000/api'; // Android Emulator
// export const API_URL = 'http://localhost:4000/api'; // iOS veya Web

// Gerçek cihaz için (bilgisayarının IP'si):
// export const API_URL = 'http://192.168.1.XXX:4000/api';
```

### IP Adresini Bul:

**Windows:**
```bash
ipconfig
# "Wireless LAN adapter Wi-Fi" altındaki IPv4 adresini kullan
```

**Mac/Linux:**
```bash
ifconfig
# en0 altındaki inet adresini kullan
```

---

## 🎮 Kullanım

### Backend'i Başlat
```bash
cd backend
npm run dev
```

### Mobile'ı Başlat
```bash
cd mobile
npm start
```

### Demo Hesap
```
E-posta: ahmet.yilmaz@example.com
Şifre: demo123
```

---

## 🐛 Sorun mu Yaşıyorsun?

### "Network Error" alıyorum
- Backend çalışıyor mu kontrol et
- API_URL doğru ayarlanmış mı kontrol et
- Telefon ve bilgisayar aynı WiFi'de mi?

### QR kod çalışmıyor
```bash
cd mobile
npx expo start --tunnel
```

### Metro bundler hatası
```bash
cd mobile
npx expo start -c
```

### Android build hatası
```bash
cd mobile
npm run android -- --reset-cache
```

---

## 📸 Ekran Görüntüleri

Uygulama çalıştığında göreceğin ekranlar:
- ✅ Login/Register ekranları
- ✅ Ana sayfa (Dashboard)
- ✅ Eşleşmeler (Swipe kartları)
- ✅ Gönderiler
- ✅ Ülkeler
- ✅ Profil

---

## 🎯 Sonraki Adımlar

1. Backend'i çalıştır
2. `mobile/src/config/api.ts` dosyasında API URL'ini ayarla
3. `npm start` ile mobil uygulamayı başlat
4. Expo Go ile QR kodu tara
5. Demo hesap ile giriş yap

**Başarılar! 🚀**



denemememem