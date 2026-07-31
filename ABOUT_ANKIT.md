# Ankit Keshari

**Role:** AI builder
**Location:** New Delhi, India
**Status:** Open to internships & freelance AI work

> I build AI systems that ship.
> Agents, ML pipelines, and local-first tools that actually run.

**Meta:** AI Intern @ EY · B.Tech + AI/ML minor, NIT Delhi '27

---

## About

I'm Ankit — a mechanical engineering student at NIT Delhi who fell down the AI rabbit hole and never climbed back out. Most days I'm building agents and ML systems: a job-hunt agent that applies while I sleep, a fully offline dictation app, trading bots that grade their own predictions against the market.

I care about two things: tools that actually ship, and numbers that are actually real. Every project here runs on measured results — hit rates, latencies, accuracy against expert baselines — never vibes.

Off-screen: badminton, lawn tennis, volleyball, and finding new places to travel.

### Facts

- **Education:** B.Tech Mechanical Engineering, Minor in AI & ML — NIT Delhi, 2023–2027
- **Responsibility:** Database Sector Head, Training & Placement Cell, NIT Delhi (Coordinator 2023–25)
- **Currently:** DSA in Java, daily — plus an Obsidian second brain that runs my life

---

## Skills

- **Languages:** Python, Java, C, MATLAB
- **ML & Data:** PyTorch, TensorFlow, Scikit-learn, DeepFace, NumPy, Pandas
- **Core:** Adversarial ML, Regression Modeling, Data Structures & Algorithms
- **Shipping with:** Next.js, TypeScript, Supabase, FastAPI, Cloudflare Workers, Ollama, faster-whisper, Three.js
- **Tools:** Claude Code, Jupyter, Figma, Canva

---

## Experience

### EY — AI Intern
**Jun 2026 — Present** (current)

Building an LLM-powered document-intelligence platform for a government client — end to end, from scanned PDFs to defensible scores.

- OCR pipeline for scanned official journals: PyMuPDF page rendering + vision-model transcription, cached so no document is read twice.
- Rubric-driven LLM scoring that quotes its evidence — every score carries the exact line in the source document it came from.
- Evaluated against 136 expert-rated products: exact-match and within-one accuracy tracked per parameter to pick the best model.

**Stack:** FastAPI, PostgreSQL + pgvector, LlamaIndex, Gemini Vision, Next.js

### DRDO — Scientific Analysis Group (SAG), Delhi — Research Intern, Adversarial Machine Learning
**May — Jul 2025**

Attacked face-recognition models to measure how they break — black-box adversarial ML at a defence research lab.

- Engineered black-box adversarial attack pipelines (SimBA, NES) across 8+ models on 9,000+ samples.
- Implemented transfer-based PGD attacks with norm constraints, using cosine similarity for evaluation.
- Designed score-based query attacks that iterate on similarity feedback alone.
- Evaluated model robustness with DeepFace embeddings and analyzed attack transferability across architectures.

**Stack:** Python, PyTorch, DeepFace, NumPy

---

## Projects — Shipped

### SUNDAY — Job-Hunt Agent ★ featured
*An agent that hunts jobs while I sleep.*

Every morning at 10:00 IST it scrapes AI/ML intern and fresher openings, ranks them against my real resume, builds ATS-safe resume and per-company cover-letter PDFs, and emails me the top five. I reply with a company name — it applies. It never emails the same company twice.

**Stack:** Vercel Serverless, Node.js, Supabase, Gmail SMTP/IMAP, cron
**Link:** [GitHub](https://github.com/maverick14303/sunday_find_me_a_job)
**Note:** Runs live for me daily — the deployment stays private (it holds my resume data).

### WhisperFlow Local ★ featured
*Fully offline dictation for Windows — hold a key, speak, done.*

Hold a global hotkey and talk; your words appear at the cursor in whatever app is focused. Silero VAD gates the mic, faster-whisper transcribes on CPU (int8), and a local Ollama model polishes the text. No cloud anywhere in the pipeline — about 1.5s end-to-end on an i5 laptop with no GPU.

**Stack:** Python, faster-whisper, Silero VAD, Ollama, CTranslate2

### NSE Swing-Trading Bot
*Real money, hard caps, honest gates.*

An automated swing trader for Indian equities, capped at ₹1,000 of real capital. It goes live only through backtest → paper → live gates. Dual-broker architecture: Upstox's free API feeds market data while Zerodha executes with ₹0 delivery brokerage. Reports every move to Telegram.

**Stack:** Python, Upstox API, Zerodha Kite, GitHub Actions, Telegram
**Link:** [GitHub](https://github.com/maverick14303/nse-swing-bot)

### Stock News Monitor
*A news-sentiment system that grades its own predictions.*

Scrapes trusted Indian financial feeds, matches headlines to NSE tickers, and scores sentiment — then checks itself against what each stock actually did the next trading day. An autonomous ₹5,000 paper trader learns source trust and sector weights from its own wins and losses.

**Stack:** Python, SQLite, VADER, Yahoo Finance
**Link:** [GitHub](https://github.com/maverick14303/stock-news-monitor)

### Sunday: Interview Strategy
*The layer above LeetCode — which company asks what, in which round.*

A placement-prep platform mapping companies → interview rounds → real questions, with topic mastery tracking, per-company readiness scores, and next-best-action suggestions. Built single-user and PIN-gated by design.

**Stack:** Next.js, Tailwind v4, Supabase Postgres, Vercel
**Note:** Private build — it holds my actual prep state.

### Chief of Staff *(in progress)*
*A Telegram chief of staff with zero authority.*

Morning briefing in, prioritized checklist out; an evening check-in closes the loop. It tracks an 8-8-8 time budget across personal, professional, and social hours — and nags exactly once. The bot structures; I decide.

**Stack:** Cloudflare Workers, TypeScript, Telegram Bot API, Supabase

### MUN Prep Platform
*Evidence-backed Model UN dossiers with live-verified citations.*

Takes a committee, country, and agenda, and produces a complete delegate dossier — country profile, position paper, speeches, resolution clauses — where every claim traces to a fetched and verified source. Official documents labelled primary; reputable secondary sources labelled as such.

**Stack:** Claude Code, Agentic research, docx pipeline

### Stealth project *(stealth)*
*Computer-vision SaaS in development.*

Under wraps for now.

---

## Projects — Upcoming

### CodeLens
*See your code think.*

Write DSA code and watch it execute live — memory, stack frames, heap objects, pointer arrows, recursion trees — animating as you type. One language-agnostic trace engine drives every panel; Python, C++, and Java plug into it. Reverse execution comes free: the whole run is a scrubbable timeline.

**Meta:** Designed in full · build starts next
**Stack:** React, TypeScript, Monaco, Pyodide, WASM

### ECG Interpreter
*Deep learning on 12-lead ECGs — explained honestly.*

A 1D-CNN/ResNet trained on PTB-XL to flag cardiac abnormality classes, paired with deterministic signal features (intervals, rhythm, axis) and a grounded explanation layer that can only say what the classifier and measurements support. Educational tool — never a medical device, and it says so on every screen.

**Meta:** Planned · PTB-XL · Kaggle GPUs
**Stack:** PyTorch, wfdb, neurokit2, RAG

---

## Contact

- **Email:** ankitkeshari326@gmail.com
- **GitHub:** https://github.com/maverick14303
- **LinkedIn:** https://www.linkedin.com/in/ankit-keshari-105846255/
- **Resume:** /resume.pdf

Recruiting, freelance AI work, or just an idea worth building — my inbox is open.
