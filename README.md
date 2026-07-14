# ReceiptIQ — Expense Receipt Scanner

An OCR-powered expense tracker. Upload or photograph a receipt, Tesseract.js
extracts the store name, date, amount, and tax right in the browser, you
review/edit the details, and it's saved as a categorized expense — with
monthly summaries and spending insights.

**Stack:** React (Vite) · Node.js / Express · MongoDB (Mongoose) · Tesseract.js (OCR) · Recharts

---

## 1. Project Structure

```
expense-receipt-scanner/
├── server/              # Node.js + Express + MongoDB API
│   ├── config/db.js
│   ├── models/          # Receipt.js, Expense.js
│   ├── routes/          # receipts.js, expenses.js, summary.js
│   ├── middleware/upload.js
│   ├── uploads/          # receipt images saved here
│   └── server.js
└── client/              # React (Vite) frontend
    └── src/
        ├── pages/        # Dashboard, UploadReceipt, ExpenseList, ExpenseDetails, MonthlySummary
        ├── components/   # Sidebar, StatCard, CategoryBadge, ConfirmModal, Background
        ├── utils/        # ocrParser.js (OCR text → structured fields), categories.js
        └── api/api.js
```

---

## 2. Why MongoDB (not Supabase)?

Short answer: **go with MongoDB** for this project. A few reasons:

- The assignment brief itself calls out **"Database Collections"** (Receipts,
  Expenses) — that's MongoDB's vocabulary. Supabase is built on Postgres,
  which uses **tables**, not collections, so using Mongo keeps your project
  aligned with the spec.
- Each receipt is a loosely-structured document (image path, OCR text,
  extracted fields that may be partially missing/inaccurate) — that fits a
  document database more naturally than a rigid relational schema.
- MongoDB Atlas has a free tier that's simple to spin up for a course
  project, and Mongoose gives you schema validation without giving up
  flexibility.

You don't *need* Supabase here — it would work too (Postgres + its storage
buckets are fine for images), but it adds relational-schema overhead
(migrations, foreign keys) that this project doesn't need. This build uses
**MongoDB**, with receipt images stored on disk (`server/uploads/`) and
their paths saved in MongoDB — that keeps things simple and free to deploy.

---

## 3. Features Implemented

- **Receipt Upload:** file upload, camera capture (mobile), delete/reset before saving
- **OCR Processing:** Tesseract.js runs in the browser, extracts raw text, and a
  parser (`utils/ocrParser.js`) pulls out store name, date, amount, and tax
  using pattern matching
- **Expense Management:** edit any extracted field before saving, category
  selection (auto-guessed, editable), monthly summary with a category
  breakdown pie chart and spending trend
- **Pages:** Dashboard, Upload Receipt, Expense List (search + filter), Expense
  Details (edit/delete), Monthly Summary (month switcher + charts)
- **Design:** dark glassmorphism theme, layered gradient + grid background with
  soft inner-shadow vignette (see `client/src/index.css` → `.app-background`),
  fully responsive (bottom nav on mobile)

---

## 4. Run It Locally in VS Code

### Prerequisites
- [Node.js](https://nodejs.org) v18+ installed
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
  (or local MongoDB) — you just need a connection string

### Step 1 — Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense-receipt-scanner
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Run it:
```bash
npm run dev
```
You should see `Server running on port 5000` and `MongoDB connected: ...`.

### Step 2 — Frontend

Open a **second terminal**:
```bash
cd client
npm install
cp .env.example .env
```

`client/.env` already points at `http://localhost:5000/api` by default — leave
it as is for local dev.

Run it:
```bash
npm run dev
```
Open **http://localhost:5173** — you should see the dashboard.

### Step 3 — Test the flow
1. Go to **Upload Receipt** → upload any receipt photo (or take one on
   mobile) → click **Extract Details (OCR)**
2. Review/edit the auto-filled Store Name, Amount, Tax, Date, Category
3. Click **Save Expense** → you'll land on the Expense Details page
4. Check **Expense List** and **Monthly Summary** to see it reflected

> OCR accuracy depends on photo clarity — a well-lit, straight-on photo of a
> printed receipt works best. You can always fix any field by hand before saving.

---

## 5. Push to GitHub

```bash
cd expense-receipt-scanner
git init
git add .
git commit -m "Expense Receipt Scanner - mini project"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Both `server/.gitignore` and `client/.gitignore` already exclude
`node_modules`, `.env`, and `uploads/*` (except a `.gitkeep`) — so your
Mongo URI and API keys never get committed.

---

## 6. Deploy (Render + Vercel + MongoDB Atlas)

This mirrors the setup you've used before, so it should feel familiar.

### 6a. MongoDB Atlas
1. Create a free cluster at Atlas → **Database Access**: create a user +
   password → **Network Access**: allow `0.0.0.0/0` (or Render's IPs)
2. Copy the connection string, e.g.
   `mongodb+srv://user:pass@cluster0.mongodb.net/expense-receipt-scanner`

### 6b. Backend on Render
1. New **Web Service** → connect your GitHub repo
2. **Root directory:** `server`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Environment variables:**
   - `MONGO_URI` = your Atlas connection string
   - `CLIENT_ORIGIN` = your Vercel URL (add after step 6c, comma-separate if you need more than one)
   - `PORT` is set automatically by Render — you don't need to add it

> **Important:** Render's free tier disks are **ephemeral** — files saved to
> `server/uploads/` will be wiped on redeploy/restart. That's fine for demoing
> the project, but if you want uploaded receipt images to persist long-term,
> the fix is swapping local disk storage for a cloud bucket (e.g. Cloudinary
> or an S3-compatible bucket) in `middleware/upload.js`. Not required for
> the assignment, but worth mentioning if your teacher asks about production
> readiness.

### 6c. Frontend on Vercel
1. New Project → import the same repo
2. **Root directory:** `client`
3. **Build command:** `npm run build` (auto-detected for Vite)
4. **Output directory:** `dist` (auto-detected)
5. **Environment variable:**
   - `VITE_API_BASE_URL` = `https://<your-render-app>.onrender.com/api`
6. Deploy, then go back to Render and set `CLIENT_ORIGIN` to your new Vercel URL
   so CORS allows it.

### 6d. Sanity check
- Visit your Render URL directly → should show "Expense Receipt Scanner API is running"
- Visit your Vercel URL → Dashboard should load without a "server not connected" error
- If it still fails: check that `VITE_API_BASE_URL` ends in `/api`, and that
  `CLIENT_ORIGIN` on Render **exactly** matches your Vercel domain (including `https://`)

---

## 7. Notes for Your Report / Resume

- **Learning objectives covered:** OCR (Tesseract.js), image handling (upload +
  camera capture + preview), data extraction (regex-based parsing of OCR
  output), expense tracking (categorized records + monthly aggregation)
- **Resume line (from your brief):** *"Built an OCR-powered receipt scanner
  that extracts billing information and automatically creates categorized
  expense records."*
