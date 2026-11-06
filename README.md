# AMDDST — Adaptive Multi-Domain Dialogue State Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://amddst-app.vercel.app)
[![HuggingFace Space](https://img.shields.io/badge/Demo-HuggingFace%20Space-blue?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/ganirathod/amddst-demo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

An enterprise multi-turn conversational AI system that tracks user intent and belief states across Cambridge **Accommodations**, **Dining**, **Attractions**, and **Transit**. Powered by a fine-tuned sequence-to-sequence BART model on MultiWOZ 2.1 (DSTC-10 Benchmark, 3rd place globally).

---

## Architecture Overview

- **Frontend**: React 19 SPA, Glassmorphism design system, Sidecar Yellow palette, Outfit typography, Lucide icons.
- **Backend**: Node.js & Express API Gateway with automatic client-side fallback to Hugging Face Gradio inference and local MultiWOZ dataset.
- **Model**: Fine-tuned `facebook/bart-base` (139M parameters) with Levenshtein phoneme correction for robust speech error recovery.

---

## Project Structure

```text
AMDDST-app/
├── backend/                  # Node.js & Express API Gateway
│   ├── src/
│   │   ├── controllers/      # DST & search request handlers
│   │   ├── routes/           # /api/health, /api/dst, /api/search
│   │   ├── services/         # HF Gradio client & MultiWOZ search
│   │   ├── data/             # MultiWOZ dataset
│   │   └── server.js         # Express server entry (:5000)
│   └── package.json
│
├── frontend/                 # React 19 Client SPA
│   ├── public/               # HTML shell, manifest, icons
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # LandingPage, ChatPage, BookingsPage, etc.
│       ├── services/         # API client with zero-downtime fallbacks
│       ├── data/             # Local MultiWOZ database
│       └── firebase.js       # Firebase Auth & Firestore client
│
├── vercel.json               # Monorepo deployment & SPA filesystem routing
└── package.json              # Monorepo orchestration scripts
```

---

## Quickstart

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Locally (Full Stack)
```bash
npm start
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

### 3. Individual Services
```bash
# Frontend only
npm run start:frontend

# Backend only
npm run start:backend

# Backend in watch mode
npm run dev
```

---

## Production Build & Deployment

```bash
# Build frontend
npm run build
```

This repository is pre-configured for **Vercel** with [`vercel.json`](vercel.json):
- Build command: `npm run vercel-build`
- Output directory: `frontend/build`
- Static filesystem routing enabled for single-page application deep linking (`/chat`, `/bookings`, `/profile`).

---

## Research Citation

> **Adaptive Multi-Domain Dialogue State Tracking on Spoken Conversations**  
> Published in IEEE/ACM Transactions on Audio, Speech, and Language Processing, Vol. 32, 2024.  
> DSTC-10 Challenge — 3rd Place Globally.

---

## License

[MIT](LICENSE)
