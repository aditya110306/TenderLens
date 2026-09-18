# TenderLens 🔍
> **Public Procurement Anomaly Detection & Investigation Platform**

TenderLens is an end-to-end intelligence platform designed for public procurement integrity and oversight. It provides real-time anomaly detection, risk scoring, vendor relationship network analysis, and case management across government procurement contracts.

---

## 🌟 Key Features

- **Integrity Dashboard**: Real-time KPI metrics, departmental risk distribution, anomaly trend analysis, and priority case summaries.
- **Automated Anomaly Scoring**: Rule-based detection signals evaluating single-bidder patterns, price deviation, unusual timing, split contracts, and frequent winning patterns.
- **Case Queue & Investigation Board**: Searchable and filterable case management pipeline with Kanban status workflows (*New, Under Review, Escalated, Resolved*).
- **Vendor Relationship Graph**: Interactive 2D force-directed network graph visualizing co-bidding patterns, shared registered addresses, and shared directorships.
- **Executive Audit Reports**: Formal investigation reports with printable views and JSON export.
- **AI Assistant Copilot**: Natural language assistant providing contextual insights, case summaries, and direct links to flagged tenders.

---

## 🏗 Architecture & Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, `react-force-graph-2d`
- **Backend**: Node.js, Express, TypeScript, tsx
- **Data Engine**: Deterministic rule-based scoring engine operating on synthetic public procurement datasets

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend API starts on `http://localhost:3001`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application starts on `http://localhost:5173`.

---

## ⚖️ Neutral Governance Standard
All findings produced by TenderLens represent statistical patterns and investigation signals flagged for administrative review, adhering to objective, neutral public oversight standards.
