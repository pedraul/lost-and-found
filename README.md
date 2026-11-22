# Lost & Found

A platform for registering valuables (phones, laptops, vehicles, documents…), reporting them lost or stolen, reporting found items, and verifying ownership. Built for Rwanda, with Paypack mobile-money subscriptions.

| Part | Folder | Stack |
| --- | --- | --- |
| Website | `frontend/` | Next.js 14, React, Tailwind CSS |
| API | `backend/` | Node.js, Express, Sequelize |
| Database | `database/` | PostgreSQL (migrations and seed data) |

## Running locally

Requirements: Node.js 20+, PostgreSQL.

```bash
# API
cd backend
cp .env.example .env        # then fill in the values
npm install
npm run migrate             # create/update tables
npm run seed:catalog        # item categories and device types
npm run dev                 # http://localhost:5000

# Website (second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

`PAYMENT_ENCRYPTION_KEY` is required (payment details are stored AES-256-GCM encrypted). Generate one with
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` and keep a backup: without it, stored payment details cannot be read.

## Deploying to Vercel

The website and the API are deployed as **two Vercel projects** from this one repository.

### 1. API project (`backend/`)

1. Vercel → **Add New → Project** → import this repository.
2. **Root Directory:** `backend`. Framework preset: **Other**. Deploy.
3. In the project: **Storage → Connect Database → Neon** (adds `DATABASE_URL`), and **Storage → Create → Blob** (adds `BLOB_READ_WRITE_TOKEN`).
4. **Settings → Environment Variables:** add the variables from `backend/.env.example` (JWT secrets, email, Paypack, `PAYMENT_ENCRYPTION_KEY`, `CRON_SECRET`, `NODEJS_HELPERS=0`, and `FRONTEND_URL` = the website URL). Redeploy.
5. Create the tables once, from your computer, against the Neon database:
   ```bash
   cd backend
   DATABASE_URL="<Neon connection string>" npm run migrate
   DATABASE_URL="<Neon connection string>" npm run seed:catalog
   ```
6. In Paypack, set the webhook URL to `https://<api-project>.vercel.app/api/payments/paypack/webhook`.

### 2. Website project (`frontend/`)

1. Import the same repository again. **Root Directory:** `frontend` (Next.js is detected).
2. Environment variable `NEXT_PUBLIC_API_URL` = `https://<api-project>.vercel.app/api`. Deploy.

### How production differs from local

- **Uploads** are stored in Vercel Blob (Vercel's own disk is temporary). Photos are resized in the browser before upload because Vercel limits requests to 4.5 MB.
- **Scheduled jobs** (payment reminders, receipt-email retries) run through Vercel Cron, configured in `backend/vercel.json`, instead of in-process timers. On the free Hobby plan each job runs once a day.
- **Logs** appear in the Vercel dashboard (Project → Logs) instead of `backend/logs/`.

Every push to `main` redeploys both projects automatically.
