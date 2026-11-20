# Studio Noire — Real Estate Contact & Lead Intake (MERN Stack)

A production-structured MERN stack contact and lead-qualification application modeled after the warm minimalist Studio Noire aesthetic, extended with **SDE-3** engineering rigor and **Real Estate CEO** lead-qualification fields.

## Project Structure

- `server/` — Express + Mongoose + Zod API (`POST /api/inquiries`, `GET /api/inquiries`, `PATCH /api/inquiries/:id/status`, `GET /api/health`)
- `client/` — React + Vite frontend with editorial greige styling, client/server validation, honeypot spam protection, and a Lead Inbox drawer

## Real Estate Lead Qualification Additions

Beyond the base fields (`First Name`, `Last Name`, `Email`, `Message`, `What are you enquiring about?`), the form captures:
- **Phone Number** & **Preferred Contact Method** (`Email`, `Phone`, `WhatsApp / SMS`)
- **Your Role** (`Homeowner`, `Real Estate Agent / Broker`, `Property Developer`, `Investor`, `Commercial Tenant`, `Other`)
- **Property Type** (`Residential`, `Luxury Estate`, `Commercial / Retail`, `Multi-Family`, `Industrial / Warehouse`, `Land / Development`)
- **Property Location / ZIP** (for territory routing)
- **Estimated Budget** & **Target Timeline** (used server-side to compute `leadScore` 0–100 and `priority`: `high` / `medium` / `standard`)
- **Expanded Service Checkboxes**: `Home Staging`, `Home Improvement`, `Warehousing`, `Property Acquisition / Sales`, `Interior Design & Fit-Out`, `Commercial Leasing`
- **Consent Checkbox** & **Honeypot (`website`)** anti-bot field

## Running Locally

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm test
npm run dev
```

> If MongoDB is not running locally at `MONGO_URI`, the server automatically logs a warning and uses an in-memory fallback store so you can test the full workflow immediately.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`.

