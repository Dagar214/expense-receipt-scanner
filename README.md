# 🧾 ReceiptIQ — Expense Receipt Scanner

An OCR-powered expense tracker that turns paper receipts into structured, categorized expense records — automatically.

Upload or photograph a receipt, and [Tesseract.js](https://tesseract.projectnaptha.com/) extracts the store name, date, amount, and tax right in your browser. Review and correct the details, save it, and watch your monthly spending insights update in real time.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=20232a">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&labelColor=20232a">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&labelColor=20232a">
  <img alt="Tesseract.js" src="https://img.shields.io/badge/OCR-Tesseract.js-8A2BE2?labelColor=20232a">
  <img alt="Vite" src="https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white&labelColor=20232a">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg?labelColor=20232a">
</p>

**🔗 Live Demo:** [expense-receipt-scanner-rose.vercel.app](https://expense-receipt-scanner-rose.vercel.app/)
**💻 Source Code:** [github.com/Dagar214/expense-receipt-scanner](https://github.com/Dagar214/expense-receipt-scanner/tree/main)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Design](#-design)
- [Roadmap Ideas](#-roadmap-ideas)
- [License](#-license)

---

## 🔍 Overview

Managing expenses manually is time-consuming, especially when transcribing details from physical bills one by one. **ReceiptIQ** automates that process end-to-end:

1. **Capture** a receipt — upload a photo or use your device's camera
2. **Extract** the text using in-browser OCR (Tesseract.js)
3. **Parse** store name, date, amount, and tax out of the raw OCR output
4. **Review & correct** any misread fields before saving
5. **Track** everything as categorized expenses, with monthly summaries and spending trends

No manual data entry required — just correction where OCR isn't perfect.

---

## ✨ Features

| Category | Details |
|---|---|
| 📤 **Receipt Upload** | Upload an image, capture live via webcam, or delete/reset before saving |
| 🔎 **OCR Processing** | Extracts store name, date, amount, and tax entirely client-side — no image ever needs external OCR APIs |
| ✏️ **Expense Management** | Edit any extracted field, assign/auto-guess categories, delete records |
| 📊 **Monthly Insights** | Category breakdown pie chart, spending trend chart, top-category and total-spent stats |
| 🔍 **Search & Filter** | Find expenses by store name/description or filter by category |
| 📁 **CSV Export** | Export the current (filtered) expense list to a `.csv` file |
| 📱 **Responsive Design** | Full desktop experience with a mobile-optimized bottom navigation |

### Pages
`Dashboard` · `Upload Receipt` · `Expense List` · `Expense Details` · `Monthly Summary`

---

## 🛠 Tech Stack

**Frontend** — `client/`
| Library | Role |
|---|---|
| React 18 + Vite | UI and build tooling |
| React Router DOM | Client-side routing across pages |
| **Tesseract.js** | In-browser OCR engine |
| Recharts | Spending trend & category pie charts |
| Axios | REST API communication |
| lucide-react | Icon set |
| date-fns | Date formatting utilities |

**Backend** — `server/`
| Library | Role |
|---|---|
| Express | REST API server |
| Mongoose | MongoDB object modeling |
| Multer | Receipt image upload handling |
| CORS | Cross-origin access for the deployed frontend |
| dotenv | Environment configuration |

**Database:** MongoDB Atlas — `Receipts` and `Expenses` collections

**Hosting:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## 📂 Project Structure

```
expense-receipt-scanner/
├── server/                    # Express + MongoDB API
│   ├── config/db.js           # Mongoose connection
│   ├── models/                # Receipt.js, Expense.js schemas
│   ├── routes/                # receipts.js, expenses.js, summary.js
│   ├── middleware/upload.js   # Multer image upload config
│   ├── uploads/                # Saved receipt images
│   └── server.js
│
└── client/                    # React (Vite) frontend
    └── src/
        ├── pages/             # Dashboard, UploadReceipt, ExpenseList,
        │                      # ExpenseDetails, MonthlySummary
        ├── components/        # Sidebar, StatCard, CategoryBadge, ConfirmModal
        ├── utils/             # ocrParser.js, categories.js
        └── api/api.js         # Axios API client
```

---

## ⚙️ How It Works

```
 ┌────────────┐     ┌───────────────┐     ┌──────────────┐     ┌────────────┐
 │  Upload /   │ ──▶ │  Tesseract.js │ ──▶ │  Regex-based │ ──▶ │  Review &  │
 │  Capture    │     │  (OCR, in-    │     │  Parser      │     │  Edit Form │
 │  Image      │     │  browser)     │     │  (extracts   │     │            │
 └────────────┘     └───────────────┘     │  fields)     │     └─────┬──────┘
                                            └──────────────┘          │
                                                                       ▼
                              ┌───────────────────────┐     ┌──────────────────┐
                              │  MongoDB (Receipts +  │ ◀── │  Express API      │
                              │  Expenses collections)│     │  (Multer + REST)  │
                              └───────────────────────┘     └──────────────────┘
```

OCR runs **entirely in the browser** — the raw image is only sent to the server once the user confirms and saves, keeping the extraction step fast and free of external API costs.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/Dagar214/expense-receipt-scanner.git
cd expense-receipt-scanner
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env` with your MongoDB connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/expense-receipt-scanner
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```
Run it:
```bash
npm run dev
```
You should see `Server running on port 5000` and `MongoDB connected: ...`.

### 3. Frontend setup
Open a **second terminal**:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Open **http://localhost:5173** in your browser.

### 4. Try it out
1. Go to **Upload Receipt** → upload or capture a receipt image
2. Click **Extract Details (OCR)** and wait for it to finish
3. Review/correct the auto-filled fields
4. Click **Save Expense**
5. Check **Expense List** and **Monthly Summary** to see it reflected

> 💡 OCR accuracy depends on image clarity — a well-lit, straight-on photo of a printed receipt works best. Any field can be corrected by hand before saving.

---

## 🔑 Environment Variables

**`server/.env`**
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas (or local) connection string |
| `PORT` | Port the Express server runs on (default `5000`) |
| `CLIENT_ORIGIN` | The deployed frontend's URL, for CORS |

**`client/.env`**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000/api`) |

---

## ☁️ Deployment

This project is deployed using a free-tier, three-service setup:

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Static Vite build, root directory `client` |
| Backend | [Render](https://render.com) | Node web service, root directory `server` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | Free M0 cluster |

> ⚠️ **Note on image persistence:** Render's free tier uses an ephemeral filesystem — files saved to `server/uploads/` are cleared on redeploy or after extended inactivity. This doesn't affect app functionality but is worth knowing for production use; the fix would be swapping local disk storage for a cloud bucket (e.g. Cloudinary or S3).

---

## 🎨 Design

A dark **glassmorphism** aesthetic — layered gradient blobs, a subtle grid overlay, and an inner-shadow vignette across the background (`client/src/index.css` → `.app-background`), with translucent glass cards and a consistent indigo / teal / amber accent palette. Fully responsive, with a bottom navigation bar on mobile.

---

## 🗺 Roadmap Ideas

- Cloud image storage (Cloudinary/S3) for persistent uploads in production
- PDF export alongside CSV
- Multi-currency support
- Receipt-level notes and tags

---

## 👤 Author

**Dev Dagar**
GitHub: [@Dagar214](https://github.com/Dagar214)

---

## 📄 License

This project was built as an academic mini-project. Free to use and adapt for learning purposes.

---

<p align="center">Built by Dev Dagar with React, Node.js, MongoDB, and Tesseract.js</p>