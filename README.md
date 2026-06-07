# ReBook

Marketplace buku bekas — React + Express + PostgreSQL.

## Tech stack

- **Frontend:** React, Vite, Tailwind (Vercel)
- **Backend:** Express, Prisma (Railway)
- **Database:** PostgreSQL (Railway)
- **CS AI:** Google Gemini

## Local development

```bash
# Backend
cd backend
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# Frontend (terminal baru)
cd frontend
cp .env.example .env   # optional di local (proxy Vite)
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  

**Akun demo:** `buyer@test.com` / `Test123!` (lihat seed untuk seller & admin)

---

---

## Health check

`GET https://<backend-url>/health`
