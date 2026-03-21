# 🎯 AMDDST — Adaptive Multi-Domain Dialogue State Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://amddst-app.vercel.app)
[![HuggingFace](https://img.shields.io/badge/Model-HuggingFace-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co/ganirathod/amddst-dst-model)
[![HuggingFace Space](https://img.shields.io/badge/Demo-HuggingFace%20Space-blue?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/ganirathod/amddst-demo)

> Based on the IEEE research paper that achieved **3rd place globally** at the DSTC10 Challenge

---

## 🚀 Live Demo

👉 **[https://amddst-app.vercel.app](https://amddst-app.vercel.app)**

---

## 📌 What is AMDDST?

AMDDST is an AI-powered travel assistant that tracks user intent across multi-turn conversations. It understands natural language requests for hotels, restaurants, and attractions — even handling speech recognition errors using Levenshtein post-processing.

**Example:**
```
User: I need a cheap hotel in the centre
AI: Detected → hotel-pricerange = cheap | hotel-area = centre
     → Shows real hotel results from database
```

---

## 🧠 How It Works
```
User speaks/types
       ↓
BART-base model (fine-tuned on MultiWOZ 2.1)
       ↓
Dialogue State Tracking (slot-value pairs)
       ↓
Levenshtein Post-Processing (fixes ASR errors)
       ↓
Database Search (real hotels/restaurants/attractions)
       ↓
Results shown to user
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Framer Motion |
| AI Model | BART-base (Facebook) |
| Training | PyTorch, HuggingFace Transformers |
| Dataset | MultiWOZ 2.1 (77,000+ examples) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Deployment | Vercel (frontend), HuggingFace Spaces (model) |
| PWA | Service Worker, Web App Manifest |

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Training examples | 77,000+ |
| Model parameters | 139M |
| Final training loss | 0.12 |
| Base model | facebook/bart-base |
| Training epochs | 1 |
| GPU | Kaggle T4 |

---

## ✨ Features

- 🎙️ **Voice Input** — Web Speech API integration
- 📁 **Audio Upload** — Upload audio files for processing
- 🏨 **Hotel Search** — Real-time search from MultiWOZ database
- 🍽️ **Restaurant Search** — Filter by cuisine, price, area
- 🎭 **Attraction Discovery** — Find local attractions
- 👤 **User Authentication** — Google OAuth + Email/Password
- 💾 **Conversation History** — Saved to Firestore
- 📱 **PWA** — Installable on any device
- 🌙 **Guest Mode** — Try without signing up

---

## 🏗️ Project Structure
```
amddst-app/
├── public/
│   ├── manifest.json          # PWA config
│   └── service-worker.js      # Offline support
├── src/
│   ├── components/
│   │   ├── SplashScreen.js    # Animated intro
│   │   ├── LandingPage.js     # Home page
│   │   ├── LoginPage.js       # Firebase auth
│   │   ├── ProfileSetup.js    # New user setup
│   │   ├── ProfilePage.js     # Edit profile
│   │   ├── ChatPage.js        # Main chat interface
│   │   ├── BookingsPage.js    # Conversation history
│   │   └── SearchResults.js   # Hotel/restaurant cards
│   ├── data/
│   │   └── database.js        # MultiWOZ database
│   ├── firebase.js            # Firebase config
│   └── App.js                 # Route management
```

---

## 🚀 Run Locally
```bash
# Clone the repo
git clone https://github.com/ganapathichinavath-bot/AMDDST-app.git
cd AMDDST-app

# Install dependencies
npm install

# Start development server
npm start
```

---

## 🤖 Model Training

The BART-base model was fine-tuned on MultiWOZ 2.1 dataset using Kaggle T4 GPU.
```python
# Key training details
model = "facebook/bart-base"
epochs = 1
batch_size = 16
learning_rate = 2e-5
training_examples = 77,441  # includes augmented data
```

**Data Augmentation:** Entity substitution to reduce domain bias
**Post-processing:** Levenshtein distance for ASR error correction

---

## 📄 Research Paper

Based on: **"Adaptive Multi-Domain Dialogue State Tracking on Spoken Conversations"**
- Published in IEEE/ACM Transactions on Audio, Speech, and Language Processing, Vol. 32, 2024
- DSTC10 Challenge — **3rd Place Globally**

---

## 👨‍💻 Author

**Chinavath Ganapathi**
- 🎓 CSE '27 — Neil Gogte Institute of Technology
- 🔗 [LinkedIn](https://www.linkedin.com/in/ganirathod)
- 🤗 [HuggingFace](https://huggingface.co/ganirathod)
- 💻 [GitHub](https://github.com/ganapathichinavath-bot)

---

## 📝 License

MIT License — feel free to use and modify.