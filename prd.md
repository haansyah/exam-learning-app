# PRD: Exam Learning App (Nuxt / Vercel / Web)

> **v2 note**: This supersedes the original React Native/Expo mobile PRD. The product concept and UX are unchanged; the technology stack has moved to a statically-generated Nuxt website deployed on Vercel, with no backend and exam history stored in the browser's localStorage.

## Problem Statement

As a learner preparing for exams, I want a focused, browser-based practice app organized by subject where I can practice multiple-choice questions, get immediate feedback with explanations, and track how I'm improving across repeated attempts — accessible from any device with a browser, with no account, no backend, and no install required (though installable as a PWA if desired).

## Solution

A Nuxt website, fully statically generated (`nuxt generate`) and deployed to Vercel, with no backend of any kind. Question banks are served as static JSON files and fetched at runtime. Users browse subjects from a Home page, view subject details (question count, description, best score, attempt count), start an exam, answer single-select MCQs one at a time with immediate answer-checking and explanation reveal, and land on a result page showing score, time taken, pass/fail status, and a full question-by-question review. All attempts are saved to the browser's localStorage (via a persisted Pinia store) and viewable in a History section, and every exam can be retried as many times as desired, with each retry preserved as a separate history entry. The site is installable as a PWA with offline support after first visit.

## User Stories

### Home & Subject Browsing
1. As a learner, I want to see a list of all available subjects on the Home page, so that I can choose what to study.
2. As a learner, I want each subject in the list to show its name, total question count, and my best score badge, so that I get an at-a-glance sense of my progress without opening each subject.
3. As a learner, I want to click a subject to see its detail page, so that I can learn more before starting.
4. As a learner, I want the subject detail page to show a description, total question count, my best score, and how many times I've attempted it, so that I can decide whether to retry or move on.
5. As a learner, I want a "Start" action on the subject detail page, so that I can begin a new attempt.
6. As a learner, I want a shuffle toggle (off by default) shown right before I start, so that I can optionally randomize question and option order for that attempt.

### Taking an Exam
7. As a learner, I want to see one multiple-choice question at a time, so that I can focus without being overwhelmed.
8. As a learner, I want to select one option per question, so that I can give my answer.
9. As a learner, I want to click "Check Answer" to see immediately whether I was correct, so that I get instant feedback.
10. As a learner, I want to see the explanation for the question after checking my answer, so that I understand the reasoning, not just the result.
11. As a learner, I want a "Next" action to move forward once I've checked my answer, so that I can proceed through the exam.
12. As a learner, I want the app to prevent me from going back to a previous question once I've moved on, so that the exam flow stays linear and honest.
13. As a learner, I want to see a progress indicator (e.g. question X of Y) during the exam, so that I know how far along I am.
14. As a learner, I want to see a 40-minute countdown timer during the exam, so that I'm aware of my pacing.
15. As a learner, if the timer runs out before I finish, I want the exam to auto-submit, so that I don't get stuck.
16. As a learner, if questions remain unanswered when time runs out, I want them flagged as "skipped" (not marked wrong), so that my score reflects what I actually attempted.
17. As a learner, when time runs out, I want to see a summary of which questions were skipped before I land on the final results, so that I clearly understand what wasn't completed.
18. As a learner, if a question includes an image, I want it displayed clearly within the question card, so that diagrams/charts are usable.
19. As a learner, if a question includes a mathematical formula, I want it rendered properly (not as raw LaTeX text), so that I can read it correctly.
20. As a learner, if I opted into shuffle, I want both question order and option order randomized for that attempt, so that retries don't let me memorize positions instead of content.

### Results
21. As a learner, I want to see my final score as a percentage after completing an exam, so that I know how I did.
22. As a learner, I want to see how long the exam took me, so that I can track my pacing over time.
23. As a learner, I want to see whether I passed or failed based on the subject's configured pass threshold, so that I have a clear outcome.
24. As a learner, I want to see a full list of every question from the attempt along with my selected answer (and the correct answer), so that I can review my mistakes.
25. As a learner, I want skipped questions to be visually distinguished from wrong answers in the result review, so that I don't confuse "didn't answer" with "answered incorrectly."
26. As a learner, I want a way to retry the same exam directly from the result page, so that I can immediately try again.

### History
27. As a learner, I want a History section showing all my past exam attempts across every subject, sorted by most recent first, so that I can review my overall progress.
28. As a learner, I want to filter or navigate to a per-subject view of my history, so that I can focus on one subject's progress over time.
29. As a learner, I want each history entry to show the subject, date, score, and pass/fail status, so that I can scan my history quickly.
30. As a learner, I want to click a history entry to revisit that attempt's full result page (question-by-question review), so that I can review old mistakes even after the attempt is over.
31. As a learner, I want every retry to create a new history entry rather than overwriting my previous attempt, so that I can see my improvement (or regression) over time.

### Retrying
32. As a learner, I want to retry any subject's exam an unlimited number of times, so that I can practice as much as I need.
33. As a learner, I want each retry to be treated as a fresh attempt (new timer, fresh answer state), so that previous answers don't carry over.

### Installation & Updates (new in v2)
34. As a learner, I want to be able to install the site to my home screen/desktop as a PWA, so that it feels like a native app and launches quickly.
35. As a learner, I want to be notified when new content (e.g. updated questions) is available, so that I can choose to refresh and get the latest version rather than silently working with stale data mid-session.

## Implementation Decisions

### Tech Stack
- **Framework**: Nuxt (Vue 3), **TypeScript**.
- **Rendering mode**: Fully static (SSG) via `nuxt generate`. No server runtime, no API routes, no Vercel serverless functions — pure static output served from Vercel's CDN.
- **Routing**: Nuxt's built-in file-based routing (`pages/`), no extra router config needed.
- **UI components**: Nuxt UI (official Nuxt component library, built on Tailwind CSS).
- **State management**: Pinia, with two main stores — an exam-session store (current question index, selected answer, checked/locked state, timer remaining, shuffle config) and a history store (persisted attempts).
- **Persistence**: `pinia-plugin-persistedstate`, auto-syncing the history store to `localStorage` on every mutation. SSR-safe (relevant even for a statically generated site, since Nuxt still does a build-time render pass).
- **Math rendering**: `katex` (npm package) wrapped in a small custom Vue component that calls `katex.render()` on mount/update, for any question/option/explanation field containing a formula.
- **PWA**: `@vite-pwa/nuxt` module, configured to precache the app shell and static JSON data, with a "new content available, click to refresh" prompt on update (not silent auto-update).
- **Deployment**: Vercel, static hosting preset (Nuxt's static output auto-detected). No environment variables, no serverless functions, no database — pure static + client-side JS.
- **Responsive design**: Mobile-first, scaling up to desktop layouts.
- **Data source**: Fully offline-capable after first load (via PWA caching). No backend, no auth, no network calls beyond fetching the static JSON files and app shell.

### Data Loading Strategy
- Question data is **not** bundled into the JS via import. It's served as static files under `public/data/` (e.g. `public/data/manifest.json`, `public/data/subjects/ekma4213.json`) and fetched at runtime via `$fetch`/`useFetch`.
- This means adding or editing a subject only requires dropping in/updating a JSON file and redeploying — no application code changes, no rebuild logic branching on subject content.
- Each subject's questions are only fetched when the user opens that subject (lazy-loaded), keeping initial page load light.

### Data Schema
Same schema as the original PRD, framework-agnostic:

```ts
// public/data/manifest.json
interface SubjectManifestEntry {
  id: string;
  name: string;
  description: string;
  passThreshold: number; // percentage, e.g. 70
  questionFile: string; // e.g. "subjects/ekma4213.json"
}

// public/data/subjects/<subject>.json
interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
  isFormula?: boolean; // if true, `text` is treated as LaTeX
}

interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  isFormula?: boolean;
  options: QuestionOption[]; // single-select; exactly one is correct
  correctOptionId: string;
  explanation: string;
  explanationImageUrl?: string;
}

interface SubjectQuestionFile {
  subjectId: string;
  questions: Question[];
}

// history entry (localStorage, via Pinia persisted store)
interface ExamAttempt {
  attemptId: string;
  subjectId: string;
  startedAt: string; // ISO timestamp
  completedAt: string;
  durationSeconds: number;
  shuffleEnabled: boolean;
  scorePercent: number;
  passed: boolean;
  responses: {
    questionId: string;
    selectedOptionId: string | null; // null = skipped
    isCorrect: boolean;
    wasSkipped: boolean;
  }[];
}
```

### Exam Flow Logic
- Navigation through questions is **strictly forward-only** — no back navigation once a question is checked and "Next" is clicked.
- Each question has two states: unanswered (selecting an option) and checked (answer locked, explanation visible, "Next" enabled).
- Exam has an overall **40-minute timer**, started when the user clicks "Start" on the subject detail page.
- On timeout: the exam auto-submits. Any question not yet answered/checked is marked `wasSkipped: true` and excluded from the wrong-answer count, but still counted in the percentage denominator. A pre-result summary page lists the skipped questions before routing to the full result page.
- Shuffle toggle (default OFF) is presented on the subject detail page immediately before "Start." When enabled, both question order and option order are randomized for that attempt only (not persisted).
- Score calculation: `scorePercent = (correct answers / total questions) * 100`.
- Pass/fail is determined by comparing `scorePercent` against the subject's `passThreshold` from the manifest.

### Pages
- **`/` (Home)**: List of subjects (name, question count, best score badge). Click → Subject Detail.
- **`/subjects/[id]`**: Description, question count, best score, attempt count, shuffle toggle, Start button.
- **`/subjects/[id]/exam`**: One question per view, progress indicator (X of Y), timer, option list, Check Answer button, explanation panel (post-check), Next button.
- **Skipped Summary** (timeout-only, sub-state of exam flow): List of skipped questions before continuing to Result.
- **`/subjects/[id]/result/[attemptId]`**: Score %, time taken, pass/fail badge, full question list with user's answer vs. correct answer, skipped questions visually distinguished, Retry button.
- **`/history`**: Global list of all attempts (subject, date, score, pass/fail), sorted by most recent. Click entry → Result page (read-only review).
- **`/subjects/[id]/history`**: Same list component, filtered to one subject.

### PWA Behavior
- App shell, Nuxt UI assets, and the manifest/subject JSON files are precached by the service worker on first visit.
- When a new deployment changes any precached asset (including question JSON), returning visitors see a non-intrusive "Update available" toast/banner; clicking it reloads with the new service worker active. No silent mid-session content swaps.
- Works fully offline after first successful load, including starting/completing/reviewing exams and viewing history (history is local to the browser regardless of network state).

## Testing Decisions

This is a greenfield project on a new stack — no existing Nuxt codebase to follow as prior art. Establish conventions as part of this build:

- **Test external behavior, not implementation details.** Tests should assert on what the user sees/can do (score shown, explanation visible after check, retry creates a new history entry) rather than internal store shape.
- **Test runner**: Vitest, with `@vue/test-utils` for component tests and Nuxt's test utilities (`@nuxt/test-utils`) for page-level/integration tests.
- **Pinia stores** (unit tests): scoring calculation including skipped questions, pass/fail threshold comparison, timer countdown and auto-submit-on-timeout behavior, shuffle producing a randomized-but-complete question/option set, forward-only navigation guard (cannot revisit a checked question), `pinia-plugin-persistedstate` correctly round-tripping through localStorage.
- **History persistence** (unit tests): writing a new `ExamAttempt` per retry (not overwriting), reading/sorting history by date, per-subject filtering, best-score and attempt-count derivation from stored history.
- **JSON schema validation** (unit tests or a small validation script run against the data in `public/data/`): every subject file in the manifest exists and parses, every question has exactly one valid `correctOptionId` referencing one of its own options, every `passThreshold` is a valid percentage.
- **Component tests**: MCQ option selection and locking after "Check Answer," explanation visibility toggling, timer display countdown, skipped-question visual distinction on the Result page, KaTeX formula rendering does not crash on malformed LaTeX (graceful fallback).
- **Build/deploy smoke test**: `nuxt generate` completes without errors and the static output serves correctly when previewed locally before each Vercel deploy.

## Out of Scope

- Multi-select (choose-multiple-correct-answers) questions — schema and UI assume single-select only.
- Any backend, API routes, database, remote question sync, or content-update mechanism beyond redeploying static JSON files.
- User accounts, authentication, or cross-device sync (history is local to one browser/device only — clearing browser data or switching devices loses history).
- Native mobile app distribution (App Store/Play Store) — this is a responsive website/PWA only.
- Per-question timers (only an overall 40-minute exam timer is supported).
- Analytics, crash reporting, or telemetry.
- Social sharing, leaderboards, or gamification beyond best-score/attempt-count.
- An in-app authoring tool for questions — question JSON files are hand-authored/edited directly.
- Configurable timer duration per subject (fixed at 40 minutes for MVP).

## Further Notes

- **localStorage capacity**: typically ~5–10MB per origin, which comfortably fits thousands of `ExamAttempt` records given their small size — not a practical concern for the foreseeable scope of this app, but worth revisiting if history grows unbounded over years of use.
- **History is device/browser-local**: clearing browser storage, using a different browser, or using incognito mode will not show prior history. This is a direct consequence of "no backend" and should be communicated to users somewhere in the UI (e.g. a small note on the History page).
- Because the manifest + per-subject-file split is unchanged from the mobile version, content authoring workflow stays the same — only the serving location changed (`public/data/` instead of bundled into the native app).
- `nuxt generate` + Vercel's static preset means there is genuinely nothing to operate or scale — it's CDN-served static files plus client-side JavaScript, consistent with the "tanpa backend" requirement.
- Content authoring (writing the actual questions, options, explanations, and LaTeX formulas into the JSON files) remains a separate, ongoing task outside this PRD's scope.