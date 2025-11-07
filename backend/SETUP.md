# Backend Setup Guide

## 🚀 Kurulum

### 1. Gerekli Paketleri Yükleyin

```bash
npm install
```

### 2. Environment Variables (.env)

Backend klasöründe `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Server Configuration
NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# Database (MongoDB)
DATABASE_URL=mongodb://localhost:27017/erasmus_connect

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Supabase (for profiles and matches)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Redis (for caching and queues)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3000

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=noreply@erasmusconnect.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 (optional, for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=erasmus-connect-uploads

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Email Doğrulama için Gmail Kurulumu

#### Gmail App Password Oluşturma:

1. Google hesabınıza gidin: https://myaccount.google.com/
2. "Security" sekmesine tıklayın
3. "2-Step Verification" aktif olmalı
4. "App passwords" bölümüne tıklayın
5. Uygulama seçin: "Mail"
6. Cihaz seçin: "Other" (Custom name) ve "Erasmus Connect" yazın
7. Generate edilen şifreyi kopyalayın
8. `.env` dosyasında `SMTP_PASS` değişkenine yapıştırın

#### Alternatif Email Servisleri:

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### 4. Google OAuth Kurulumu

#### Google Cloud Console'da Proje Oluşturma:

1. https://console.cloud.google.com/ adresine gidin
2. Yeni proje oluşturun veya mevcut bir proje seçin
3. "APIs & Services" > "Credentials" sayfasına gidin
4. "Create Credentials" > "OAuth client ID" seçin
5. Application type: "Web application"
6. Name: "Erasmus Connect"
7. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:4000`
8. Authorized redirect URIs:
   - `http://localhost:4000/api/v1/auth/google/callback`
9. "Create" butonuna tıklayın
10. Client ID ve Client Secret'i kopyalayın
11. `.env` dosyasına ekleyin

#### Production için:

Authorized JavaScript origins ve redirect URIs'e production URL'leri ekleyin:
- `https://yourdomain.com`
- `https://api.yourdomain.com/api/v1/auth/google/callback`

### 5. Prisma Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations (if using migrations)
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 6. Sunucuyu Başlatın

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## 📧 Email Doğrulama Özellikleri

### Yeni Özellikler:

1. **Kayıt Sonrası Email Doğrulama**: Kullanıcı kayıt olduğunda otomatik doğrulama emaili gönderilir
2. **Login Email Kontrolü**: Email doğrulanmadan giriş yapılamaz
3. **Resend Verification**: Kullanıcı doğrulama emailini tekrar gönderebilir
4. **Welcome Email**: Email doğrulandıktan sonra hoş geldin emaili gönderilir

### Endpoints:

- `POST /api/v1/auth/register` - Kayıt ol (doğrulama emaili gönderir)
- `GET /api/v1/auth/verify-email?token=xxx` - Email doğrula
- `POST /api/v1/auth/resend-verification` - Doğrulama emailini tekrar gönder
- `POST /api/v1/auth/login` - Giriş yap (email doğrulanmış olmalı)

## 🔐 Google OAuth Özellikleri

### Yeni Özellikler:

1. **Google ile Giriş**: Kullanıcılar Google hesaplarıyla giriş yapabilir
2. **Otomatik Profil Oluşturma**: Google hesabından ad, soyad ve fotoğraf çekilir
3. **Email Otomatik Doğrulama**: Google hesapları otomatik doğrulanmış sayılır
4. **Mevcut Hesaplarla Bağlantı**: Aynı email varsa mevcut hesaba bağlanır

### Endpoints:

- `GET /api/v1/auth/google` - Google OAuth başlat
- `GET /api/v1/auth/google/callback` - Google OAuth callback

### Flow:

1. Frontend'den "Continue with Google" butonuna tıklanır
2. Kullanıcı Google'da giriş yapar ve izin verir
3. Google, callback URL'ine yönlendirir
4. Backend, kullanıcıyı oluşturur/bulur ve token'ları oluşturur
5. Frontend'e token'larla redirect edilir
6. Frontend, token'ları kaydeder ve kullanıcıyı dashboard'a yönlendirir

## 🧪 Test

### Email Gönderme Testi (Development):

SMTP bilgileri yoksa development ortamında emailler console'a yazılır:

```bash
📧 [SIMULATED EMAIL]
To: user@example.com
Subject: Email Adresinizi Doğrulayın - Erasmus Connect
Content: ...
```

### Production'da Test:

1. Gerçek bir email adresiyle kayıt olun
2. Email kutunuzu kontrol edin
3. Doğrulama linkine tıklayın
4. Giriş yapın

## 🔧 Troubleshooting

### Email Gönderilmiyor:

1. SMTP bilgilerini kontrol edin
2. Gmail kullanıyorsanız "Less secure app access" kapalı olmalı ve App Password kullanılmalı
3. Firewall'un 587 portunu engellemediğinden emin olun

### Google OAuth Çalışmıyor:

1. Google Cloud Console'da OAuth consent screen'i yapılandırdığınızdan emin olun
2. Redirect URI'lerin doğru olduğunu kontrol edin
3. Client ID ve Secret'in doğru olduğunu kontrol edin

### Token Expiry Hataları:

1. Verification token'lar 24 saat geçerlidir
2. Süresi dolmuş token için "Resend verification" kullanın

## 📚 Daha Fazla Bilgi

- [API Documentation](../docs/API.md)
- [Database Schema](../docs/DATABASE.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

