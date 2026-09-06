# IntizomAI — Pitch Deck / Biznes reja sayti

**Bilim + Intizom = Natija**

Bu repozitoriy — **IntizomAI** startupi uchun taqdimot (pitch deck) sayti. [yoshlarventures.uz](https://yoshlarventures.uz) ariza jarayonida "Taqdimot / biznes reja fayliga havola" sifatida ishlatiladi.

IntizomAI — o'quvchilar va yosh mutaxassislar uchun sun'iy intellektga asoslangan **intizom operatsion tizimi**: Telegram bot + Mini App orqali maqsadlarni XP, streak, kunlik topshiriq va jonli AI murabbiy yordamida odatga aylantiradi.

## Sayt tuzilishi — 14 slayd

| № | Slayd | Mazmun |
|---|-------|--------|
| 01 | Hero | Mahsulot, logo, shior, asosiy raqamlar |
| 02 | **Muammo** | Nega intizom muammo — 3 ta dalil |
| 03 | **Yechim** | 4 bosqichli halqa |
| 04 | **Mahsulot** · jonli demo | Mini App'ning 7 bo'limi — animatsiya bilan |
| 05 | Imkoniyatlar | 9 ta asosiy funksiya |
| 06 | Gamifikatsiya | XP, unvonlar, intizom balli, yutuqlar |
| 07 | **Bozor** | TAM / SAM / SOM |
| 08 | **Model** · biznes model | Freemium obuna + narxlar |
| 09 | Raqobat | Taqqoslash jadvali + ustunliklar |
| 10 | Holat & texnologiya | Bajarilgan ishlar, stack, moat |
| 11 | **Reja** · yo'l xaritasi | 4 bosqich |
| 12 | So'rov | Investitsiya taqsimoti |
| 13 | **Jamoa** | Asoschilar |
| 14 | Bog'lanish | Kontaktlar |

7 ta asosiy slayd (qalin belgilangan) sahifada **"chapter marker"** bilan ajralib turadi — bu shunchaki sayt emas, **pitch deck** ekanini ta'kidlaydi.

### Jonli Mini App demo (04-slayd)

Saytning markazi — telefon maketi ichida ishlab turgan Mini App. 7 bo'lim **avtomatik almashadi** (yoki bosib tanlanadi):

🏠 Asosiy sahifa · 🎯 Maqsadlar · 🧠 AI Chat · 🔥 Odatlar trekeri · 👥 Do'stlar · 📊 Statistika · 🏆 Reyting

## `/admin` — mini admin panel

- **`/admin`** URL orqali kichik boshqaruv paneli ochiladi
- Kirish uchun `ADMIN_PASSWORD` (Railway env-o'zgaruvchisi)
- Panel orqali **sayt logotipini yuklash / almashtirish / o'chirish** mumkin
- Logo **PostgreSQL** bazasida (`site_assets` jadval, `BYTEA`) saqlanadi
- `/logo` endpointi orqali barcha tashrifchilar (jumladan begonalar) ushbu logoni ko'radi — hech qanday redeploy talab qilinmaydi
- Baza bo'sh bo'lsa avtomatik placeholder SVG ko'rsatiladi (hech qachon buzilgan rasm ko'rinmaydi)
- Sessiya HMAC-imzolangan cookie (12 soat), max fayl hajmi 4 MB, faqat `image/*`

Yangi endpointlar:

| Method | Path | Kirish | Vazifasi |
|--------|------|--------|----------|
| GET | `/logo` | ochiq | Logo baytlarini qaytaradi (yoki placeholder) |
| GET | `/api/logo` | ochiq | `{ logo: dataURL, mime, updatedAt }` |
| GET | `/admin` | ochiq | Admin panel sahifasi |
| GET | `/api/admin/me` | ochiq | Sessiya + DB holati |
| POST | `/api/admin/login` | parol | Cookie beradi |
| POST | `/api/admin/logout` | — | Cookie o'chiradi |
| POST | `/api/admin/logo` | admin | Logoni DB ga yozadi |
| DELETE | `/api/admin/logo` | admin | Logoni DB dan o'chiradi |

## Ishga tushirish (lokal)

```bash
npm install
DATABASE_URL="postgres://user:pass@localhost:5432/intizomai?sslmode=disable" \
ADMIN_PASSWORD="mening-parolim" \
PGSSL=false \
npm start
```

`DATABASE_URL` sozlanmasa — sayt baribir ishlaydi, faqat logo yuklash `503` qaytaradi va placeholder ko'rsatiladi.

## Railway'ga deploy qilish 🚂

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → `abduraxmon313/IntizomAI_admin`
2. **+ Add Service → Database → PostgreSQL** — Railway `DATABASE_URL` env-o'zgaruvchisini avtomatik biriktiradi
3. Loyihaning **Variables** bo'limida qo'shing:
   - `ADMIN_PASSWORD` — o'z parolingiz (masalan: `intizom-2026-secret`)
   - `SESSION_SECRET` — tasodifiy uzun matn (ixtiyoriy — bermasangiz har restartda yangilanadi)
4. **Settings → Networking → Generate Domain** → bepul domen, masalan: `https://intizomai-admin-production.up.railway.app`
5. `/admin` sahifasiga kirib logoni yuklang

## Env o'zgaruvchilar

| Nom | Majburiy? | Standart | Izoh |
|-----|-----------|----------|------|
| `PORT` | yo'q | 3000 | Railway avto-belgilaydi |
| `DATABASE_URL` | logo uchun | — | PostgreSQL ulanish satri |
| `ADMIN_PASSWORD` | yo'q | `intizom2026` | `/admin` uchun parol — o'zgartiring! |
| `SESSION_SECRET` | yo'q | random | Cookie imzo maxfiy so'zi |
| `PGSSL` | yo'q | `true` | Lokal DB uchun `false` |

## Fayl tuzilishi

```
index.html                 # 14 slaydli pitch deck (7 slayd chapter marker bilan)
admin.html                 # /admin — mini boshqaruv paneli
server.js                  # Node.js server: static + /admin API + PostgreSQL
package.json               # start skripti + pg
railway.json               # Railway sozlamalari
Procfile                   # zaxira start komandasi
assets/
  css/style.css            # dizayn tizimi + Mini App maketi + chapter marker
  css/admin.css            # admin panel dizayni
  js/main.js               # bo'lim almashtirish, animatsiya, reveal
  js/admin.js              # admin panel logikasi (login, upload, drag-drop)
```

Logo endi fayl sifatida saqlanmaydi — PostgreSQL `site_assets` jadvalidan `/logo` orqali xizmat qilinadi.

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
