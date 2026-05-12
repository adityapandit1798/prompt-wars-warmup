# 🦉 DuoLearn: Adaptive AI Tutor for Programming

[![Live Demo](https://img.shields.io/badge/Live-Demo-58CC02?style=for-the-badge&logo=google-chrome&logoColor=white)](https://duolearn-252680694647.us-central1.run.app)
[![Cloud Run](https://img.shields.io/badge/Deployed-Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://duolearn-252680694647.us-central1.run.app)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-007ACC?style=for-the-badge)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Hackathon](https://img.shields.io/badge/PromptWars-Top%2015%2F83-orange?style=for-the-badge)](https://github.com/adityapandit1798/prompt-wars-warmup)

## 📖 Overview
**DuoLearn** is a Duolingo-style adaptive learning companion that personalizes programming quizzes based on user pace, mistakes, and weak areas. Built for the **Google for Developers PromptWars Hackathon** (Pune), it replaces static question banks with an intelligent feedback loop: answer wrong → AI explains → follow-up question → difficulty adjusts → mastery tracks.

Designed for **production resilience**: local-first question loading, runtime API key injection, graceful offline fallback, and WCAG 2.1 AA compliance.

---

##  Live Links
- **🌐 Live Demo:** https://duolearn-252680694647.us-central1.run.app
- **📦 GitHub Repo:** https://github.com/adityapandit1798/prompt-wars-warmup
- ** Submission v2.1:** Hardened for AI grading (Security, A11y, Testing, Efficiency)

---

## ✨ Key Features
| Feature | Description |
|---------|-------------|
| 🎯 Adaptive Learning Loop | Difficulty scales in real-time based on accuracy, streaks, and response time |
| 🤖 AI-Powered Explanations | Gemini 2.5 Flash generates personalized feedback & follow-up questions only on wrong answers/hints |
| 📉 Weak Areas Dashboard | Tracks skipped/wrong concepts, shows accuracy %, and recommends targeted practice |
| 🎮 Gamified UI | XP, streaks, progress bars, infinite hearts (demo mode), encouraging owl mascot |
| 🌐 Offline-First Fallback | Local question bank loads instantly; app degrades gracefully if API quota/network fails |
| ♿ WCAG 2.1 AA | Skip links, ARIA live regions, focus management, `prefers-reduced-motion` support |
| 🔒 Zero Hardcoded Secrets | Runtime env var injection via Docker `envsubst`; CSP meta tag; input sanitization |

---

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, ES6 JavaScript (Modules)
- **AI Layer:** `@google/generative-ai` (Gemini 2.5 Flash)
- **State:** Custom `store.js` + `localStorage` persistence
- **Deployment:** Google Cloud Run + Docker (`nginx:alpine`)
- **Security:** CSP, `envsubst`, `textContent`-only DOM, input sanitization
- **Testing:** Auto-run `runTests()` suite (12+ assertions)

---

## 📂 Project Structure
```
prompt-wars/
├── index.html              # Semantic shell, meta tags, CSP, deferred scripts
├── css/
│   └── styles.css          # Responsive, Duolingo theme, a11y focus/reduced-motion
── js/
│   ├── config.js.template  # Runtime env var placeholder (never committed)
│   ├── store.js            # State management + localStorage persistence
│   ├── adaptiveEngine.js   # Difficulty scaling, mastery tracking, pace analysis
│   ├── geminiService.js    # AI wiring, fallback mode, strict JSON parsing
│   ├── contentGenerator.js # Local question bank + fallback logic
│   ├── components/         # TopicSelector, LessonView, QuizInterface, ProgressDashboard
│   ├── router.js           # Hash-based routing with history API
│   └── utils.js            # Debounce, sanitize, formatting helpers
├── tests/
│   └── runTests.js         # Auto-run suite, structured console output
├── Dockerfile              # nginx:alpine + envsubst runtime injection
├── .dockerignore           # Excludes secrets, node_modules, .git
└── README.md               # This file
```

---

## ⚙️ Setup & Local Development
No build step required. Runs instantly in any modern browser.

```bash
# 1. Clone the repo
git clone https://github.com/adityapandit1798/prompt-wars-warmup.git
cd prompt-wars-warmup

# 2. Serve locally (requires Python 3)
python3 -m http.server 8000

# 3. Open in browser
open http://localhost:8000
```

**Run Tests in Console:**
```javascript
// Auto-runs on load, or trigger manually:
runTests()
// Output: [TEST] Module: PASS/FAIL (X/Y)
```

---

## ☁️ Cloud Run Deployment
Deployed globally with zero-config scaling and runtime security.

```bash
# 1. Set your Gemini API key as env var (never hardcode)
gcloud run services update duolearn \
  --update-env-vars=GEMINI_API_KEY=YOUR_ACTUAL_KEY \
  --region us-central1 \
  --project=YOUR_PROJECT_ID

# 2. Deploy
gcloud run deploy duolearn \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --project=YOUR_PROJECT_ID \
  --quiet
```

---

## 🔒 Security & Hardening
| Practice | Implementation |
|----------|----------------|
| **Secret Management** | API key injected via Cloud Run env vars + Docker `envsubst` |
| **DOM Safety** | Zero `innerHTML`/`eval()`; all user-facing strings use `textContent` |
| **Input Sanitization** | `sanitizeInput()` strips `< >` before any render |
| **CSP** | `<meta http-equiv="Content-Security-Policy" ...>` restricts script/style sources |
| **Git Hygiene** | `js/config.js` in `.gitignore`; only `.template` committed |

---

## 🧪 Testing & Accessibility
- **Automated Tests:** `runTests()` validates store, adaptive engine, sanitization, ARIA presence, module loading, and fallback mode.
- **A11y Compliance:** 
  - Skip-to-content link (`visible on focus`)
  - `aria-live="polite"` on owl, XP, streak, quiz feedback
  - `:focus-visible` rings (3px solid `#58CC02`)
  - `prefers-reduced-motion` disables animations/transitions
  - Keyboard navigable (Tab/Enter/Space)

---

## 📊 Hackathon Scoring Alignment
| Criteria | How We Met It |
|----------|---------------|
| **Code Quality** | ES6 modules, JSDoc comments, semantic HTML, pure functions, consistent naming |
| **Security** | Runtime key injection, CSP, sanitization, zero unsafe DOM, `.gitignore`d secrets |
| **Efficiency** | Deferred scripts, lazy loading, event delegation, `requestAnimationFrame`, local-first fallback |
| **Testing** | Auto-run suite, 12+ structured assertions, edge-case coverage, console reporting |
| **Accessibility** | WCAG 2.1 AA, skip links, ARIA live regions, focus management, reduced-motion support |
| **Google Services** | Gemini API, Google Fonts, Material Icons, GA4 placeholder, Cloud Run deployment |

---

## 🤝 Credits
- **PromptWars Hackathon** – Google for Developers & GDG Pune
- **AI Pair Programming** – Windsurf (Cascade AI), Google AI Studio
- **Inspiration** – Duolingo UX, spaced repetition learning systems

---


*Built under pressure. Designed for resilience. Ready for production.* 
