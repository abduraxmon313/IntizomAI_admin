# IntizomAI — Pitch Deck / Biznes reja sayti

**Bilim + Intizom = Natija**

Bu repozitoriy — **IntizomAI** startupi uchun taqdimot (pitch deck) sayti. [yoshlarventures.uz](https://yoshlarventures.uz) ariza jarayonida "Taqdimot / biznes reja fayliga havola" sifatida ishlatiladi.

IntizomAI — o'quvchilar va yosh mutaxassislar uchun sun'iy intellektga asoslangan **intizom operatsion tizimi**: Telegram bot + Mini App orqali maqsadlarni XP, streak, kunlik topshiriq va jonli AI murabbiy yordamida odatga aylantiradi.

## Sayt tuzilishi — 14 slayd

| № | Slayd | Mazmun |
|---|-------|--------|
| 01 | Hero | Mahsulot, logo, shior, asosiy raqamlar |
| 02 | Muammo | Nega intizom muammo — 3 ta dalil |
| 03 | Yechim | 4 bosqichli halqa |
| 04 | **Mahsulot · jonli demo** | Mini App'ning 7 bo'limi — animatsiya bilan |
| 05 | Imkoniyatlar | 9 ta asosiy funksiya |
| 06 | Gamifikatsiya | XP, unvonlar, intizom balli, yutuqlar |
| 07 | Bozor | TAM / SAM / SOM |
| 08 | Biznes model | Freemium obuna + narxlar |
| 09 | Raqobat | Taqqoslash jadvali + ustunliklar |
| 10 | Holat & texnologiya | Bajarilgan ishlar, stack, moat |
| 11 | Yo'l xaritasi | 4 bosqich |
| 12 | So'rov | Investitsiya taqsimoti |
| 13 | Jamoa | Asoschilar |
| 14 | Bog'lanish | Kontaktlar |

### Jonli Mini App demo (04-slayd)

Saytning markazi — telefon maketi ichida ishlab turgan Mini App. 7 bo'lim **avtomatik almashadi** (yoki bosib tanlanadi):

🏠 Asosiy sahifa · 🎯 Maqsadlar · 🧠 AI Chat · 🔥 Odatlar trekeri · 👥 Do'stlar · 📊 Statistika · 🏆 Reyting

Har bir bo'limda jonli animatsiya: intizom halqasi to'ladi, XP paneli o'sadi, AI chat xabarlari yozilib chiqadi, odat belgilari bosiladi, grafik ustunlari ko'tariladi, reyting qatorlari suriladi.

## Ishga tushirish (lokal)

```bash
npm start          # http://localhost:3000
```

Yoki `index.html` faylini brauzerda oching.

## Railway'ga deploy qilish 🚂

Loyiha Railway uchun to'liq sozlangan — `$PORT`ga avtomatik ulanadi.

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → `abduraxmon313/IntizomAI_admin`
3. Railway o'zi aniqlaydi: `npm start` → `node server.js`
4. **Settings → Networking → Generate Domain**
5. Bepul domen olasiz, masalan: `https://intizomai-admin-production.up.railway.app`

Hech qanday env o'zgaruvchi kerak emas.

## Fayl tuzilishi

```
index.html            # 14 slaydli pitch deck
server.js             # zero-dependency Node static server (Railway)
package.json          # start skripti
railway.json          # Railway sozlamalari
Procfile              # zaxira start komandasi
assets/
  css/style.css       # dizayn tizimi + Mini App maketi
  js/main.js          # bo'lim almashtirish, animatsiya, reveal
  img/logo.svg        # IntizomAI logotipi (vektor)
```

## Asoschilar

**Xakimjonov Abduraxmon** — Asoschi · Dasturchi
**Adxamov Asror** — Asoschi · Strategiya & O'sish

## Bog'lanish

- 📱 +998 33 313 44 22
- ✉️ abduraxmonxakimjonov4@gmail.com
- ✈️ [@abduraxmon313](https://t.me/abduraxmon313)
- 📷 [intizomai.uz](https://instagram.com/intizomai.uz)

---

© 2026 IntizomAI
