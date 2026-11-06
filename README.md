# AMDDST — Adaptive Multi-Domain Dialogue State Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://amddst-app.vercel.app)
[![HuggingFace](https://img.shields.io/badge/Model-HuggingFace-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co/ganirathod/amddst-dst-model)
[![HuggingFace Space](https://img.shields.io/badge/Demo-HuggingFace%20Space-blue?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/ganirathod/amddst-demo)

> Based on the IEEE research paper that achieved **3rd place globally** at the DSTC10 Challenge.

---

## What is AMDDST?

AMDDST is an AI-powered dialogue state tracking system that tracks user intent across multi-turn conversations. It accurately infers natural language requests for hotels, restaurants, cultural attractions, and taxis — recovering from noisy speech recognition inputs via Levenshtein post-processing.

**Example Dialogue State Ingestion:**
```text
User: I need a cheap hotel in the centre with free parking
State Inferred: [hotel-pricerange = cheap, hotel-area = centre, hotel-parking = yes]
Resolution: Queries verified MultiWOZ accommodations knowledge base
```

---

## Architectural Pipeline
```text
User Speech / Natural Language Input
       ↓
Fine-Tuned BART-Base Sequence Model (MultiWOZ 2.1)
       ↓
Dialogue Belief State Extraction (Slot-Value Pairs)
       ↓
Levenshtein Phoneme Distance Correction (ASR Robustness)
       ↓
Domain Knowledge Base Query (Hotels · Dining · Attractions · Transit)
       ↓
Structured State & Verified Cards Presented to User
```

---

## Full-Stack Monorepo Structure

```text
AMDDST-app/
├── backend/                        # Node.js & Express API Gateway
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── dstController.js    # Inference job orchestration
│   │   │   └── searchController.js # MultiWOZ domain search
│   │   ├── routes/
│   │   │   ├── dstRoutes.js        # POST /api/dst/predict
│   │   │   ├── searchRoutes.js     # POST /api/search
│   │   │   └── healthRoutes.js     # GET /api/health
│   │   ├── services/
│   │   │   ├── hfInferenceService.js # Hugging Face Gradio client
│   │   │   └── multiwozService.js  # Knowledge base search engine
│   │   ├── data/
│   │   │   └── database.js         # MultiWOZ knowledge base
│   │   └── server.js               # Express application entry
│   ├── .env.example
│   └── package.json
│
├── frontend/                       # React 19 Client SPA
│   ├── public/
│   │   ├── manifest.json           # PWA configuration
│   │   └── index.html              # HTML shell & font references
│   └── src/
│       ├── components/             # Reusable design components
│       │   ├── BrandLogo.js        # Vector neural brand emblem
│       │   ├── SearchResults.js    # Result cards with Lucide icons
│       │   ├── SkeletonLoader.js   # Slate shimmer placeholders
│       │   └── SplashScreen.js     # Minimalist splash screen
│       ├── pages/                  # Route views
│       │   ├── LandingPage.js      # Executive product landing
│       │   ├── LoginPage.js        # Google OAuth & Email auth
│       │   ├── ChatPage.js         # Core dialogue console
│       │   ├── ProfilePage.js      # Account & parameter settings
│       │   ├── ProfileSetup.js     # New profile onboarding
│       │   ├── BookingsPage.js     # Saved reservations log
│       │   ├── BookingConfirmPage.js # Reservation confirmation
│       │   └── NotFoundPage.js     # 404 error page
│       ├── services/
│       │   └── api.js              # Backend client with automatic HF fallback
│       ├── data/
│       │   └── database.js         # Client-side fallback dataset
│       ├── firebase.js             # Firebase Auth & Firestore client
│       ├── App.js                  # Router & auth state listener
│       └── index.css               # Design tokens & slate palette
│
├── package.json                    # Monorepo orchestration scripts
└── README.md
```

---

## Quickstart & Local Execution

### 1. Install Dependencies
```bash
# Installs root, frontend, and backend packages
npm run install:all
```

### 2. Start Both Frontend and Backend Concurrently
```bash
# Starts Express backend on :5000 and React frontend on :3000
npm start
```

### 3. Individual Service Execution
```bash
# Run only the React frontend
npm run start:frontend

# Run only the Express backend
npm run start:backend

# Run backend in auto-reload watch mode
npm run dev
```

---

## Model Benchmark & Training

The BART-base model was fine-tuned on the MultiWOZ 2.1 dataset:
```python
model = "facebook/bart-base"
parameters = "139M"
training_dialogues = 77,441
final_loss = 0.057
augmentation = "Entity substitution to minimize domain bias"
post_processing = "Levenshtein distance for ASR error correction"
```

---

## Citation & Research

Based on: **"Adaptive Multi-Domain Dialogue State Tracking on Spoken Conversations"**
- Published in IEEE/ACM Transactions on Audio, Speech, and Language Processing, Vol. 32, 2024
- DSTC10 Challenge — **3rd Place Globally**

---

## License

MIT License.
