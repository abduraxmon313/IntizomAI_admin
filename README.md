# IntizomAI — Pitch Deck / Biznes reja sayti

**Bilim + Intizom = Natija**

Bu repozitoriy — [IntizomAI](https://t.me/Intizom_AI) startupi uchun **taqdimot (pitch deck) sayti**. Yoshlar Venture Fund ariza jarayoni uchun "Taqdimot / biznes reja fayliga havola" sifatida ishlatiladi.

IntizomAI — Gen Z va o'quvchilar uchun sun'iy intellektga asoslangan **intizom operatsion tizimi**: Telegram bot + Mini App orqali maqsadlarni XP, streak, kunlik topshiriq va jonli AI murabbiy yordamida odatga aylantiradi.

## Sayt bo'limlari

- **Hero** — mahsulot va shior
- **Muammo** — nega intizom muammo
- **Yechim** — 4 bosqichli halqa (Yozing → Eslataman → Kuzataman → Streak)
- **Mahsulot** — botning haqiqiy ko'rinishlari (mockup ekranlar)
- **Imkoniyatlar** — 9 ta asosiy funksiya
- **Gamifikatsiya** — XP, daraja, intizom balli, yutuqlar
- **Bozor** — TAM / SAM / SOM
- **Biznes model** — freemium obuna + narxlar
- **Texnologiya** — stack va raqobat ustunligi (moat)
- **Yo'l xaritasi** — bosqichlar
- **Jamoa** — asoschi
- **Bog'lanish** — kontaktlar

## Ishga tushirish (lokal)

Node.js (18+) o'rnatilgan bo'lsa:

```bash
npm start          # http://localhost:3000
```

Yoki oddiygina `index.html` faylini brauzerda oching.

## Railway'ga deploy qilish 🚂

Loyiha Railway uchun to'liq sozlangan — statik saytni Node.js server orqali beradi va `$PORT` ga avtomatik ulanadi.

1. [railway.app](https://railway.app) ga kiring → **New Project**
2. **Deploy from GitHub repo** → `abduraxmon313/IntizomAI_admin` ni tanlang
3. Railway avtomatik aniqlaydi: `npm start` → `node server.js`
4. Deploy tugagach → **Settings → Networking → Generate Domain** bosing
5. Railway sizga bepul domen beradi, masalan: `https://intizomai-admin-production.up.railway.app`

Aynan shu havolani Yoshlar Venture arizasiga qo'yasiz. Hech qanday qo'shimcha sozlash yoki muhit o'zgaruvchisi (env) kerak emas.

> **Eslatma:** Server `process.env.PORT` ni o'qiydi (Railway buni o'zi beradi) va `0.0.0.0` ga ulanadi — shuning uchun to'g'ridan-to'g'ri ishlaydi.

## Fayl tuzilishi

```
index.html            # asosiy sahifa (barcha bo'limlar)
server.js             # zero-dependency Node.js static server (Railway uchun)
package.json          # start skripti
railway.json          # Railway deploy sozlamalari
Procfile              # zaxira start komandasi
assets/
  css/style.css       # dizayn tizimi va layout
  js/main.js          # scroll animatsiyalari, nav
README.md
```

## Bog'lanish

- **Asoschi:** Xakimjonov Abduraxmon
- **Telefon:** +998 33 313 44 22
- **Email:** abduraxmonxakimjonov4@gmail.com
- **Telegram:** [@abduraxmon313](https://t.me/abduraxmon313)
- **Instagram:** [intizomai.uz](https://instagram.com/intizomai.uz)

---

© 2026 IntizomAI · Xakimjonov Abduraxmon
