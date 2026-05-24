# 🏥 ClinicMate — Healthcare Operations Automation

ClinicMate is an autonomous AI agent operations layer designed to solve the RM 1.4 Billion administrative cashflow crunch for Malaysia's 9,600+ solo GP clinics. 

It acts as a shadow back-office that automates the entire claims lifecycle between clinics and their 30+ Third-Party Administrators (TPAs) — from patient check-in to payment reconciliation.

Developed for **Track 3 (Healthcare Operations Automation)** in the Lovable Hackathon.

---

## 🌟 Key Features

### 1. Cinematic Interactive Simulator (`/demo`)
A fully-narrated walkthrough of the ClinicMate operational ecosystem:
- **Paced Workflow**: View the entire claim lifecycle (9 stages) from patient check-in to revenue recovery.
- **Dynamic Speed Controls**: Adjust playback speeds from `0.25x` to `2.0x`.
- **Seek Timeline Controls**: Jump backward/forward by **`1s`**, **`5s`**, or **`15s`** across any stage boundary.
- **Theme Switcher**: Toggle between the cinematic dark theme and the premium enterprise white theme.

### 2. Autonomous Status Sweep (`/auto-sweep`)
Simulates the **StatusAgent** querying multiple payers in parallel:
- **Audio Call Simulation**: Initiates live telephone hotline calls using the **Web Audio API** to generate realistic dial tones, ring back tones, IVR menus, and connect/hangup chimes.
- **Browser Text-To-Speech (SpeechSynthesis)**: Speaks dialogue lines aloud in real-time with custom accents and conversational pacing.
- **Multi-Payer Connectors**: Simulates portal automation (headless Chromium), virtual Android app bridges, direct API calls, and voice calls.

### 3. Claim Submission & Text Extraction (`/submit`)
- **Direct Text/Notes Extraction**: Paste raw clinical consultation notes directly into the form. The simulated AI extracts patient names, IC numbers, ICD-10 diagnosis codes, and medication list items, auto-filling the form.
- **Drag & Drop Upload**: Supports uploading PDF, TXT, or JPEG medical docs with automatic data extraction.
- **Visual Pipeline**: Displays an active multi-agent pipeline validating codes, checking drug compatibility, and routing requests.

### 4. Patient Eligibility Verification (`/eligibility`)
- **Malaysian MyKad Rules**: Automatically decodes gender (odd final digit = Male, even = Female), date of birth, and home state from Malaysian IC numbers.
- **Parallel Query**: Queries 6 TPAs in parallel to return visit caps, remaining plan limits, co-payments, and latency.

### 5. Remittance Reconciliation (`/reconcile`)
- **5-Agent Pipeline**: Ingestion (OCR) ➔ Matching (Fuzzy match claims) ➔ Variance (Flag differences) ➔ Appeal (Draft appeal) ➔ Analytics (Update dashboard).
- **Appeal Generator**: View unexplained deductions and auto-generate bilingual appeal letters (Bahasa Melayu + English) ready for approval.

---

## 🛠️ The 8 Autonomous Agents

1. **OrchestratorAgent**: Selects claims from the queue, prioritizes checks, and delegates tasks.
2. **StatusAgent**: Queries TPAs via custom methods (Portal, API, App, or Hotline phone calls).
3. **DecisionAgent**: Analyzes TPA responses, extracts payment promises, and schedules smart cooldowns.
4. **IngestionAgent**: Extracts remittance details from unstructured files (PDF, CSV).
5. **MatchingAgent**: Performs fuzzy-matching between remittance records and open clinic accounts.
6. **VarianceAgent**: Audits agreements, classifying fee discrepancies as explained vs unexplained.
7. **AppealAgent**: Drafts legally compliant bilingual dispute letters to recover deductions.
8. **AnalyticsAgent**: Syncs clinic dashboard metrics and surfaces financial insights.

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed on your system.

### Installation

1. Clone or download the repository directory.
2. Open your terminal inside the project directory (`panelrx` folder).
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the local development server:
   ```bash
   npm run dev
   ```

The app will start running on your local machine. Open your browser and navigate to the address shown in your terminal (typically [http://localhost:5175/](http://localhost:5175/)).

---

## 📦 Project Structure

- `src/cinematic/`: Simulator engine, playback controllers, stage narrations, and custom visual components.
- `src/pages/`: Interactive modules (Eligibility, Submit, Auto-Sweep, Reconcile, Aggregate, Connectors, Dashboard).
- `src/pages/sweep/`: The autonomous sweep modal and voice call components.
- `src/lib/sounds.ts`: Tone generator (Web Audio API) and speech synthesis runner.
- `src/data/`: Clinic profiles, patient directories, TPA lists, and mock claim queues.
- `src/shell/`: Main sidebar navigation, top bar notification badges, status updates, and layouts.
