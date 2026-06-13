# ReBook
Marketplace buku bekas terkurasi — beli atau jual buku bekasmu dalam satu platform.

## Fitur utama

- **Katalog & pencarian** — filter kategori, kondisi, harga; detail produk dengan review
- **Keranjang & checkout** — pembayaran dan pesanan (biaya layanan + ongkir pesanan)
- **Wishlist**, chat pembeli–penjual, alamat otomatis (Nominatim)
- **Seller Centre** — listing, pesanan, statistik penjual
- **Badge penjual terverifikasi** — otomatis setelah 10 penjualan sukses, atau manual oleh admin
- **Admin Panel** — pengguna, produk, pesanan, banner, audit log, dll
- **CS AI** — popup bantuan via Google Gemini

## Tech stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Zustand |
| Backend | Express 5, Prisma, JWT |
| Database | PostgreSQL |
| Media | Cloudinary (Cloud Storage) |
| Deploy | Vercel (frontend), Railway (backend + DB) |

## Prasyarat

- Node.js 18+
- PostgreSQL (lokal atau Railway)
- Akun [Cloudinary](https://cloudinary.com) (upload gambar)
- API key [Google AI Studio](https://aistudio.google.com) (opsional, untuk CS AI)

## Setup lokal

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# 2. Frontend (terminal baru)
cd frontend
cp .env.example .env   # opsional — dev pakai proxy Vite
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/health |

## Akun demo

Password semua akun: **`Test123!`**

| Email | Role |
|-------|------|
| `buyer@test.com` | Pembeli |
| `seller@test.com` | Penjual (Semarang) |
| `seller2@test.com` | Penjual (Yogyakarta) |
| `admin@test.com` | Admin |

## Environment variables

**Backend** (`backend/.env`) — lihat `.env.example`:

- `DATABASE_URL` — koneksi PostgreSQL
- `JWT_SECRET`, `JWT_EXPIRY`
- `FRONTEND_URL` — origin frontend (CORS)
- `CLOUDINARY_*` — upload profil & foto produk
- `GEMINI_API_KEY` — customer service AI

**Frontend** (`frontend/.env`) — production only:

- `VITE_API_URL` — URL backend Railway (tanpa `/api`)

## Scripts

```bash
# Backend
npm run dev          # development (nodemon)
npm run deploy         # migrate + start (production)
npm run db:seed        # data demo
npm run db:studio      # Prisma Studio

# Frontend
npm run dev            # development
npm run build          # production build
npm run preview        # preview build lokal
```

## Struktur proyek

```
rebook-app/
├── backend/           # Express API, Prisma, migrations
│   ├── prisma/
│   └── src/
├── frontend/          # React SPA
│   └── src/
└── README.md
```

## Deployment

1. **Railway** — deploy backend, set env variable, jalankan `npm run deploy`
2. **Vercel** — deploy folder `frontend`, set `VITE_API_URL` ke URL Railway
3. Pastikan `FRONTEND_URL` di backend mencantumkan domain Vercel

---

>Proyek hanya untuk pembelajaran / portfolio — ReBook marketplace buku bekas.
