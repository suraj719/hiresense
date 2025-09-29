## HireSense

An AI‑powered interview assistant that streamlines technical interviews. Candidates upload a resume, answer AI‑generated questions with timers and scoring, and receive a concise AI summary. Interviewers get a clean dashboard to review candidates, scores, summaries, timestamps, and details.

### Live Demo
[https://github.com/suraj719/hiresense](https://hiresense7.vercel.app)

### Features
- **AI resume intake**: Parse candidate details from PDF/DOCX; guide users to fill missing fields.
- **Smart question generation**: 6 tailored questions (easy/medium/hard) for full‑stack roles.
- **Timed interview flow**: Per‑question timers with auto‑resume and progress indicators.
- **Answer scoring**: Each answer is scored and saved with timestamps.
- **AI summary**: Short, actionable summary generated at the end.
- **Interviewer dashboard**: Search/sort candidates, view completion date and time, inspect scores, breakdown, and transcript.
- **Theming and polish**: Theme toggle, responsive, accessible UI.

### Tech Stack
- React + Vite
- Redux Toolkit (state) + redux‑persist
- Tailwind CSS (UI) + shadcn
- Mistral API (Q/A generation, evaluation, summaries)

### Installation
```bash
git clone https://github.com/suraj719/hiresense
cd hiresense
npm install
```

### Environment Setup
Create a `.env` file in the project root with your Mistral API key:
```bash
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
```

### Running the application
```bash
# Start dev server
npm run dev
```
