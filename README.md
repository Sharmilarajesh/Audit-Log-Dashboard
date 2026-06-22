
# AuditWatch — Audit Log Dashboard

A full-stack security audit log dashboard built with React, Node.js, Express, and MongoDB. Security engineers can upload bulk audit logs via Excel, then search, filter, sort, and paginate through them in real time - all processing handled server-side.

---

## Live Demo

- **Frontend:** https://audit-log-dashboard-sepia.vercel.app/
- **Backend:** https://auditwatch-backend.onrender.com

> Note: The backend is hosted on Render's free tier. The first request after a period of inactivity may take 30–60 seconds to respond while the server wakes up. Subsequent requests will be fast.

---

## GitHub Repository

https://github.com/Sharmilarajesh/Audit-Log-Dashboard

---

## Built By

Sharmila Rajesh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| HTTP Client | Axios |
| Excel Parsing | SheetJS (xlsx) |
| Deployment | Vercel (frontend), Render (backend) |

---

## What This App Does

- Upload bulk audit logs from an Excel (.xlsx) file
- View all logs in a table with search, filter, sort and pagination
- All filtering, sorting, searching and pagination happens on the server - not in the browser
- Duplicate logs are automatically detected and skipped
- Invalid rows are reported with row number, field name and reason before anything is saved

---

## Features

- Bulk Excel upload with drag and drop support
- Full row-by-row validation - entire batch is rejected if any row has errors, with a detailed error table so the user knows exactly what to fix
- Duplicate detection - same actor doing same action on same resource at same timestamp is skipped silently
- Server-side search across actor, action and resource
- Server-side filter by severity, status and role
- Server-side sort by actor, severity and timestamp
- Server-side pagination - 20 records per page
- Stats bar showing total logs, HIGH severity count and unresolved count
- Download sample Excel template from the upload modal
- Warm white and orange theme with color-coded severity and status badges

---

## Project Structure

```
audit-log-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── logController.js
│   ├── models/
│   │   └── Log.js
│   ├── routes/
│   │   └── logRoutes.js
│   ├── services/
│   │   └── logService.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── LogTable.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── UploadModal.jsx
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js v22+
- MongoDB Atlas account
- Git

### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
MONGO_URI=your_mongodb_connection_string/auditlogs?retryWrites=true&w=majority
PORT=5000
```

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### Upload Logs

```
POST /api/logs/upload
Content-Type: application/json
Body: Array of log objects
```

### Get Logs

```
GET /api/logs
Query params:
  page       - page number (default: 1)
  limit      - records per page (default: 20)
  search     - searches actor, action, resource
  severity   - LOW / MEDIUM / HIGH / CRITICAL
  status     - Resolved / Unresolved
  role       - any role value
  sortField  - field to sort by (default: timestamp)
  sortOrder  - asc or desc (default: desc)
```

---

## Excel Upload Format

The uploaded file must have these exact column headers:

| Column | Example | Allowed Values |
|---|---|---|
| actor | priya.nair@company.com | Any string |
| role | admin | Any string |
| action | DELETE_USER | Any string |
| resource | /api/users/334 | Any string |
| resourceType | USER | Any string |
| ipAddress | 192.168.1.45 | Any string |
| region | ap-south-1 | Any string |
| severity | HIGH | LOW, MEDIUM, HIGH, CRITICAL |
| status | Unresolved | Resolved, Unresolved |
| timestamp | 2025-06-14T08:32:11Z | Valid ISO date |

A ready-to-use sample file can be downloaded from the Upload modal inside the app.

---

## Technical Decisions

**MongoDB** - Logs are append-only with no joins needed. MongoDB's `insertMany` handles bulk inserts efficiently in a single database call.

**Server-side processing** - All filtering, sorting, searching and pagination runs on the backend against MongoDB indexes. The browser only receives the records needed for the current page.

**Indexes** - Added indexes on severity, status and timestamp for fast filtering. Text index on actor, action and resource for search. Without indexes MongoDB scans every record on every query.

**Duplicate detection** - Compound unique index on actor + action + resource + timestamp. All four together identify a unique event. Duplicates are skipped using `ordered: false` in insertMany without stopping the rest of the batch.

**Full batch validation** - All rows are validated before any insert. If any row fails, the entire batch is rejected with a table showing row number, field and reason. User fixes everything at once and re-uploads.

**SheetJS for Excel parsing** - Excel is parsed on the frontend and converted to JSON before sending to the backend. Keeps the upload API simple - it only receives a plain JSON array.

