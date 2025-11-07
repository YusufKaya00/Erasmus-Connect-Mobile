@echo off
echo ========================================
echo   ERASMUS CONNECT - Backend Baslatiyor
echo ========================================
echo.

cd backend

echo Backend dizinine giriliyor...
echo.

echo MongoDB baglantisi kontrol ediliyor...
echo .env dosyasinda DATABASE_URL ayarlanmis olmali!
echo.

echo Backend baslatiliyor...
npm run dev

pause

