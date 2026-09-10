# Ish Ritmi 🎯

Shaxsiy **vazifa va ball boshqaruv** ilovasi — Ionic React (Capacitor) asosida
qurilgan, keyinchalik **iOS/Android** ilovaga aylantirishga tayyor.

O'zbek tilida, **yorug'** va **qorong'u** rejimlar bilan.

## Asosiy imkoniyatlar

- **Trello uslubidagi taxta** — vazifalarni 4 ustunga (Oson / O'rtacha / Qiyin /
  Juda qiyin) o'zingiz **sudrab** (drag & drop) joylashtirasiz. Telefonда
  vazifani **bosib ushlang** va kerakli ustunga suring.
- **Haqiqiy ball tizimi** — har bir daraja ball beradi (10 / 25 / 50 / 100).
  Ball real vaqtda hisoblanadi.
- **8 soatlik ish vaqti rejasi** — kunlik vazifalar qiyinlikka qarab avtomatik
  taqsimlanadi, tushlik tanaffusi hisobga olinadi, sig'magani ogohlantiriladi.
- **"Juda qiyin" (asosiy maqsad)** — ko'p kunlik loyihalar. Muddatni (kun)
  o'zingiz kiritasiz, har kuni progressni bir qadam oshirasiz.
- **Davomat** — Keldim / Ketdim. Kechikish yoki erta ketish balldan jarima oladi.
- **Haftalik streak + mukofot/jarima**
  - Yaxshi hafta (o'rtacha ≥ chegara) → **mukofot** (masalan: yakshanba 3 soat
    kompyuter o'ynash huquqi).
  - Yomon hafta → **jarima** (masalan: −35 000 so'm). Ikkalasi ham Profil
    sahifasidan tahrirlanadi.
- **Tahrirlash / O'chirish** — istalgan vazifani ⋮ menyudan tahrirlang yoki
  o'chiring. **O'chirilgan vazifa** ball va progressga umuman ta'sir qilmaydi.
- **Bitta hisob, barcha qurilmalarda** — Supabase Auth (email + parol) orqali
  kiring. Telefonda kiritgan vazifa kompyuterda, planshetda — hammasida real
  vaqtda ko'rinadi. Oflayn bo'lsangiz ham ilova mahalliy keshdan ishlayveradi,
  internet qaytganda avtomatik sinxronlanadi.

## Supabase sozlash (bir martalik)

1. [supabase.com](https://supabase.com)'da loyiha oching (yoki mavjudini
   ishlating — jadval nomi `ish_ritmi_` prefiksi bilan, boshqa loyihalar bilan
   aralashmaydi).
2. **SQL Editor**'ga o'ting, `supabase/schema.sql` faylini to'liq nusxalab
   ishga tushiring.
3. **Settings → API**'dan `Project URL` va `anon public` kalitni oling.
4. Loyiha ildizida `.env` fayl yarating (`.env.example`dan nusxalab):
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
5. **Vercel'da deploy qilsangiz**: xuddi shu ikkita qiymatni
   **Project Settings → Environment Variables**'ga ham qo'shing (Vite
   o'zgaruvchilari build vaqtida kerak, `.env` fayl git'ga qo'shilmaydi),
   so'ng **Redeploy** qiling.

## Ishga tushirish

```bash
npm install
npm run dev        # brauzerda ochish (http://localhost:5173)
npm run build      # ishlab chiqarish uchun yig'ish
npm run preview    # yig'ilgan versiyani ko'rish
```

## Telefon ilovasiga aylantirish (keyinchalik)

Loyiha Capacitor bilan sozlangan:

```bash
npm run build
npm run cap:android   # Android loyihasini qo'shadi va sinxronlaydi
npm run cap:ios       # iOS loyihasini qo'shadi va sinxronlaydi
```

Keyin `npx cap open android` (yoki `ios`) orqali Android Studio / Xcode'da ochib,
haqiqiy qurilmaga o'rnatasiz.

## Texnologiyalar

| Qatlam        | Vosita                          |
| ------------- | ------------------------------- |
| UI freymvork  | Ionic React 8                   |
| Til           | TypeScript                      |
| Qurish        | Vite                            |
| Native        | Capacitor 6                     |
| Holat         | React Context + useReducer      |
| Saqlash       | localStorage                    |

## Loyiha tuzilishi

```
src/
├── components/   # StatCard, TaskCard, KanbanBoard, StreakChart, ...
├── context/      # AppContext — holat, reducer, saqlash
├── data/         # qiyinlik darajalari, namunaviy ma'lumot
├── pages/        # Asosiy, Vazifalar, Statistika, Profil
├── theme/        # ranglar (light/dark), global uslublar
├── utils/        # ball hisoblash, reja tuzish, vaqt
└── types.ts      # ma'lumot turlari
```
