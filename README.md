# StudyFlow – AI Flashcard Assistant

> Transform any study topic or notes into structured, interactive flashcards powered by AI.

StudyFlow is a clean, minimal, and responsive study application designed to convert free-form study topics and raw notes into structured, interactive flashcard decks. Built with modern React and an Express backend, StudyFlow prioritizes clean frontend architecture, defensive validation, reliable API handling, and intuitive study UX without unnecessary bloat or chatbot gimmicks.

---

## Features

- **AI-Generated Flashcards:** Transforms open-ended topics or pasted notes into 5, 8, 10, or 15 focused study flashcards.
- **Strict Structured JSON:** Enforces raw, deterministic JSON generation from Gemini without chat commentary or markdown artifacts.
- **Defensive JSON Validation:** An independent validation module (`validateResult.js`) verifies data integrity, types, and schema before rendering to prevent UI crashes.
- **Interactive Flashcards:** 3D CSS flip animations with smooth transitions and keyboard controls (`Space` to flip, `←`/`→` to navigate, `1` for "Know it", `2` for "Review again").
- **Progress Tracking:** Dynamic progress bar calculating completion percentage and active card counters.
- **Review Difficult Cards Mode:** Filterable review queue allowing students to drill down specifically on concepts marked for review.
- **Stale Response Protection:** Dual-layer race condition prevention using `AbortController` (cancelling in-flight requests) and sequence-indexed `useRef` tokens (discarding out-of-order completions).
- **Resilient Error & Loading States:** Dedicated UI components for empty input, network errors, malformed responses, and friendly retry actions.
- **Responsive Design:** Mobile-friendly experience across desktop, laptop, tablet, and mobile viewport sizes.

---

## Tech Stack

- **Frontend:** React 19, Vite, JavaScript (ES6+), React Hooks (`useState`, `useRef`, `useMemo`, `useEffect`), Vanilla CSS
- **Backend:** Node.js, Express, CORS, Dotenv
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Tooling:** Concurrently (unified dev server runner)

---

## Architecture

```text
React Frontend (Vite)
       │
       ▼  POST /api/generate { input, count }
Node.js / Express Backend
       │
       ▼  generateContent({ responseMimeType: 'application/json' })
Google Gemini API
       │
       ▼  Raw JSON output
Backend Parsing & Sanitization
       │
       ▼  API Response
Defensive Validation Layer (validateResult.js)
       │
       ▼  Sanitized State
Interactive UI & Study Deck (App.jsx)
```

1. **Client Request:** The user submits a study topic and chooses card count (5, 8, 10, 15). React cancels any active in-flight request via `AbortController` and increments the request ID.
2. **Backend Proxy:** The client calls `/api/generate`. The Express server validates input, injects the server-side `GEMINI_API_KEY`, and prompts Gemini with strict JSON schema rules.
3. **Structured Generation:** Gemini produces raw JSON adhering strictly to `{ topic, cards: [{ id, question, answer }] }`.
4. **Validation Layer:** Before rendering, `validateResult.js` verifies structural conditions and schema types. If validation fails, a user-friendly error is surfaced with a retry option.
5. **Interactive Deck:** The validated cards populate the interactive flashcard engine with flip animations, keyboard navigation, and review queues.

---

## Setup & Installation

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd studyflow-flam-assignment
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
Copy the provided `.env.example` template:
```bash
cp .env.example .env
```
*(On Windows PowerShell, use `copy .env.example .env`)*

### 4. Add your Gemini API key
Open `.env` in your editor and add your key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5000
```
> **Security Notice:** `.env` is included in `.gitignore` and must never be committed to Git. The Gemini API key remains strictly on the server and is never bundled in frontend code.

### 5. Start the Application
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

Alternatively, you can run them in separate terminal windows:
- **Terminal 1 (Backend Server):**
  ```bash
  npm run server
  ```
- **Terminal 2 (Frontend Client):**
  ```bash
  npm run client
  ```

Open your browser at:
```text
http://localhost:5173
```

### 6. Running Tests
Run the automated test suite covering all schema edge cases:
```bash
npm test
```
*(When the backend is running, `npm test` automatically includes an end-to-end integration check against `/api/generate`)*

---

## Usage

1. **Enter Study Topic or Notes:** Type or paste your topic in the textarea (e.g., *"Create flashcards for DBMS normalization covering 1NF, 2NF, 3NF and BCNF"*), or click one of the suggested example pills.
2. **Select Card Count:** Choose 5, 8, 10, or 15 cards.
3. **Generate:** Click **Generate Flashcards** (or press `Ctrl+Enter`).
4. **Study & Flip:**
   - Click the card or press `Space` to flip between the Question and Answer.
   - Click **Next** / **Previous** (or press `←` / `→`) to navigate through the deck.
5. **Track Mastery:**
   - Click **Know it** (or press `1`) if you've mastered the concept.
   - Click **Review again** (or press `2`) to flag the card for reinforcement.
6. **Targeted Review:** Click **Practice Marked Cards** to drill only difficult concepts.
7. **New Study Set:** Click **Create New Study Set** at any time to clear the deck and explore a new subject.

---

## AI Usage Note

In accordance with transparent engineering practices: AI tools were utilized during development for architectural brainstorming, exploratory code generation, debugging, and drafting test cases. The final React component architecture, defensive validation rules, state management flows, accessibility hooks, and styling were manually audited, refined, tested, and understood.

---

## Known Limitations

- **LLM Knowledge Cutoffs & Hallucinations:** As with any generative model, output may occasionally contain simplified explanations or factual imprecisions.
- **Network / API Availability:** Flashcard generation requires an active internet connection and an operational Gemini API service.
- **Rate Limits & Demand Spikes:** Generative endpoints may occasionally experience temporary high-demand spikes. The backend includes automated fallback model candidates (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3.1-flash-lite`) and surfaces friendly retry prompts if all candidates are exhausted.
