# TAG Galaxy Quest — Design Spec
**Date:** 2026-04-09
**Project:** PGCPS TAG Practice Game
**Stack:** Single-file HTML/CSS/JS. No JS dependencies. Google Fonts CDN is acceptable.

---

## Overview

A kid-friendly, browser-based game helping Prince George's County Public Schools (PGCPS) students in Grades 2–8 practice for the Talented and Gifted (TAG) assessment. The game uses a **Galaxy Quest Adventure Map** format: kids pick a grade level, then explore a galaxy of 4 planets, each representing a TAG question category. Each planet has 10 multiple-choice questions. No timer — relaxed, self-paced learning.

---

## Screens & User Flow

```
Grade Select → Galaxy Map → Question Screen → Planet Result → (repeat) → Mission Complete
```

### Screen 1 — Grade Select
- Hero with rocket logo and tagline: "TAG Galaxy Quest"
- Subtitle: "Choose your grade, Explorer!"
- 7 buttons in a 2-column grid: Grade 2 through Grade 7, with Grade 8 as a full-width button spanning both columns on the last row
- Selected grade highlights with a glowing border
- "Launch Mission 🚀" CTA button activates only after a grade is selected
- Dark starfield background, deep indigo/purple color palette

### Screen 2 — Galaxy Map
- Starfield background (CSS-only animation — no `<canvas>`, no JS library)
- 4 clickable glowing planets arranged in a 2×2 grid:
  - 📚 **Verbal Planet** — green glow
  - 🔢 **Quantitative Planet** — blue glow
  - 🔷 **Patterns Planet** — amber glow
  - 🧩 **Logic Planet** — pink glow
- Progress badge updates live as planets are completed: `X/4 Planets Conquered`
- Completed planets: show ✓ checkmark, reduced glow, still clickable (retry allowed — see Retry Behavior below)
- Planet labels always visible (not hover-only, for mobile friendliness)
- **Transition to Mission Complete:** After the player returns to the Galaxy Map and all 4 planets are in the `completed` array, the game automatically navigates to Screen 5 (Mission Complete)

### Screen 3 — Question Screen
- Header: planet name + category icon (top-left), question counter `Q 3/10` (top-right)
- Progress bar fills across top as questions are answered
- Question displayed in a card with large, readable font (min 18px)
- 4 answer options (A–D) as tappable/clickable buttons with large tap targets (min 44px height)
- On answer:
  - Correct: button glows green, brief "Correct! ✨" badge appears
  - Wrong: selected button glows red, correct answer highlighted green
  - Explanation text (`question.explanation`) appears below the answer buttons as small italic text, visible for the full delay before advancing
  - Auto-advances to next question after `ADVANCE_DELAY_MS = 2000` ms (2 seconds — enough for a child to read the explanation)
- No timer shown

### Screen 4 — Planet Result

All three outcome states use the **same Planet Result card layout**. The 0–4 state adds a motivational message banner at the top of the card (not a separate overlay). All three states include a **"Return to Galaxy Map"** button. The 0–4 state additionally shows a prominent **"Try This Planet Again"** button above the Return button.

| Score | Stars | Banner/Message | Buttons |
|-------|-------|----------------|---------|
| 8–10 | ⭐⭐⭐ | 🎉 "SUPERSTAR EXPLORER!" with confetti animation | "Return to Galaxy Map" |
| 5–7  | ⭐⭐  | "Keep going, you're getting there!" | "Return to Galaxy Map" |
| 0–4  | ⭐   | Motivational banner: "Every explorer stumbles — the brave ones keep going!" | "Try This Planet Again" (primary) + "Return to Galaxy Map" (secondary) |

**Confetti animation (8–10 only):** CSS-only confetti using `@keyframes` falling colored squares/circles. No JS library.

### Retry Behavior
- A player may retry any planet (completed or not) by clicking it on the Galaxy Map
- On retry, the new score **overwrites** the previous score for that planet
- The planet remains in `completed` after any retry (it does not un-complete)
- Mission Complete triggers when all 4 planets are in `completed` — retrying does not un-trigger it; the player finishes the retry, returns to Galaxy Map, and Mission Complete fires again with updated totals

### Screen 5 — Mission Complete
- Triggered automatically when the player returns to the Galaxy Map with all 4 planets in `completed`
- Celebration animation (CSS stars/sparkles)
- Total score: `X/40 questions correct`
- Overall star rating based on total score (thresholds aligned with per-planet thresholds: 4×8=32, 4×5=20):
  - 32–40 correct → ⭐⭐⭐ "Galaxy Champion!"
  - 20–31 correct → ⭐⭐ "Rising Star Explorer!"
  - 0–19 correct → ⭐ "Keep Exploring — You've Got This!"
- "Play Again" button resets all state to Grade Select

---

## Question Bank

- **4 categories × 10 questions × 7 grade levels = 280 questions** total
- Questions authored inline as a top-level JS constant — no external fetch needed
- Structure: `QUESTIONS[grade][category]` → array of 10 question objects

**Question object schema:**
```js
{
  question: "Happy is to Sad as Hot is to ___?",
  options: ["Warm", "Cold", "Fire", "Weather"],  // full answer text; A/B/C/D labels prepended by renderer
  answer: 1,           // integer index into options[] — options[1] = "Cold"
  explanation: "Opposites: happy↔sad, hot↔cold."  // max ~15 words / 1-2 short sentences
}
```

- `answer` is always an **integer index (0–3)** into `options[]`
- Scoring: `selectedIndex === question.answer` (1 point per correct answer)
- `QUESTIONS` key format: `QUESTIONS[gradeInt][categoryString]` — e.g., `QUESTIONS[4]['verbal']` for Grade 4 Verbal questions
- Difficulty scales per grade:
  - Grades 2–3: concrete, everyday language, single-step reasoning
  - Grades 4–5: intermediate reasoning, slightly abstract
  - Grades 6–8: abstract reasoning, multi-step logic, advanced vocabulary

### Category Breakdown
- **Verbal Reasoning:** analogies, vocabulary in context, sentence completion
- **Quantitative Reasoning:** number patterns, arithmetic word problems, sequences
- **Non-Verbal / Patterns:** shape sequences described in text, matrix completion, spatial reasoning
- **Logic & Sequences:** cause & effect, ordering, deductive reasoning

---

## Kid-Friendly UI Enhancements ("Full Package")

### Mascot — Cosmo the Astronaut 🧑‍🚀
- Cosmo is a small astronaut emoji character rendered in a speech bubble / dialogue box
- Appears on: Grade Select ("Ready for liftoff, Explorer?"), Galaxy Map ("Pick a planet!"), correct answer ("AMAZING! Keep going! 🔥"), wrong answer ("Almost! The right answer is..."), Planet Result (cheering or encouraging), Mission Complete (celebration dance)
- Cosmo's dialogue is rendered as a CSS speech bubble (no images required — pure emoji + CSS)
- Cosmo does NOT appear during the question itself to avoid distraction

### Answer Streak & Collectibles ⚡
- A `streak` counter tracks consecutive correct answers within a planet session
- At streak = 3: show "🔥 3 in a row!" flash badge
- At streak = 5: show "⚡ COMBO × 5!" badge + gem collectible added to a visible gem tray
- Gems collected: 💎 (blue, every 5-streak); streak resets on any wrong answer
- Gem tray shown at top of Question Screen, persists across planets for the whole session
- Gems are cosmetic only — no score impact

### Animated Reactions (CSS-only, no JS libraries)
- **Planet hover:** `transform: scale(1.15)` + wobble keyframe (`rotate ±5deg`) on Galaxy Map planets
- **Answer selected:** button scales up briefly (`scale(1.08)`) then snaps — green burst ring on correct, red shake on wrong (`@keyframes shake`)
- **Correct answer:** mini star burst animation (`✨`) radiates from the answer button using CSS `@keyframes`
- **Planet completion:** full-screen emoji pop overlay (`🎉 or 🚀 or ⭐`) fades in and out over 1 second before showing Planet Result card
- **3-star result:** CSS confetti (falling colored divs) + Cosmo jumps in speech bubble
- **Mission Complete:** pulsing starfield intensifies, large animated trophy `🏆` bounces, Cosmo does a spin

### Typography & Button Style
- Buttons: large, rounded (`border-radius: 24px`), bold text, subtle drop shadow, scale on hover
- Grade buttons: each has a small planet emoji prefix (🪐 Grade 2, 🌍 Grade 3, etc.)
- Headings: extra-large (clamp 28px–48px), bright gradient text (`-webkit-background-clip: text`)
- All body text: min 16px, high contrast, generous line-height (1.6)

## Visual Design

| Token | Value | Purpose |
|-------|-------|---------|
| Page background | `#0a0a1a` | Deep space black |
| Surface | `#0f0c29` | Dark indigo panels |
| Primary accent | `#a78bfa` | Violet — buttons, highlights |
| Verbal planet | `#4ade80` | Green glow |
| Quantitative planet | `#60a5fa` | Blue glow |
| Patterns planet | `#f59e0b` | Amber glow |
| Logic planet | `#f472b6` | Pink glow |
| Text primary | `#e0d7ff` | Light lavender white |
| Text muted | `#8b7db8` | Dimmed purple |

- **Font:** `'Nunito', 'Segoe UI', sans-serif` — imported via Google Fonts CDN (rounded, kid-friendly)
- **Starfield:** CSS-only `@keyframes` animation — ~50 `<span>` elements (capped for performance on low-end tablets) with `will-change: opacity` and randomized positions and blink delays. No `<canvas>`, no JS library.
- **Confetti (3-star Planet Result only):** Pure CSS `@keyframes` falling squares/circles — colored `<div>` elements animated with `translateY` + `rotate`. No JS confetti library.
- Planet hover/focus: `transform: scale(1.1)` + glow intensity increases
- All interactive elements: min 44px tap targets, WCAG AA color contrast (≥ 4.5:1 for text). No formal accessibility audit, but semantic HTML (`<button>`, `<section>`, `aria-label`) is expected throughout.

---

## Architecture

**File:** `tag-game.html` (single file)

**Scoring:** 1 point per correct answer. Max 10 per planet. Max 40 total across all planets.

**State object:**
```js
const state = {
  grade: null,                  // integer 2–8
  currentPlanet: null,          // 'verbal' | 'quantitative' | 'patterns' | 'logic'
  currentQuestion: 0,           // 0–9
  scores: {
    verbal: 0,
    quantitative: 0,
    patterns: 0,
    logic: 0
  },
  completed: [],                // planet keys finished at least once
  hasSeenMissionComplete: false // true after first auto-route to Mission Complete
};
```

**Constants:**
```js
const ADVANCE_DELAY_MS = 3000;   // ms before auto-advancing after an answer (3s — enough for a child to read explanation)
const PLANETS = ['verbal', 'quantitative', 'patterns', 'logic'];
```

**Tap-to-advance:** The player may also tap/click anywhere on the question screen after answering to advance immediately, without waiting for `ADVANCE_DELAY_MS`. This accommodates faster readers.

**Screen management:**
```js
function showScreen(name) {
  // hides all <section data-screen="..."> elements
  // shows the one with data-screen === name
}
```

**Key functions:**
- `startGame(grade)` — sets state.grade, calls showScreen('galaxy-map')
- `startPlanet(planet)` — resets currentQuestion/score for that planet, showScreen('question')
- `submitAnswer(index)` — scores, shows feedback, queues advance
- `showPlanetResult()` — calculates stars, renders result card
- `returnToGalaxyMap()` — updates completed[], then:
  - If `completed[].length === 4` AND `hasSeenMissionComplete === false`: set flag to true, call `showMissionComplete()`
  - If `completed[].length === 4` AND `hasSeenMissionComplete === true`: showScreen('galaxy-map') (Galaxy Map shows a "View Results" button that calls `showMissionComplete()`)
  - Otherwise: showScreen('galaxy-map')
- `showMissionComplete()` — computes total score by summing current `scores{}` values at render time (always reflects most recent attempt per planet); renders Mission Complete screen. Called by `returnToGalaxyMap()` on first completion and by "View Results" button on subsequent visits.
- `resetGame()` — resets `grade`, `scores`, `completed[]`, `currentPlanet`, `currentQuestion`, and `hasSeenMissionComplete` to initial values; calls showScreen('grade-select')

---

## Deployment

- File: `tag-game.html` alongside existing `index.html`
- GitHub: `https://github.com/gazelle8802-ui/claude-code-vs-chat`
- Vercel: `https://claude-code-vs-chat-opal.vercel.app/tag-game.html`
- Deploy: `vercel --prod --token <token> --yes --scope gazelle8802-7292s-projects --name claude-code-vs-chat`
- GitHub push: `git push "https://<PAT>@github.com/gazelle8802-ui/claude-code-vs-chat.git" main`

---

## Out of Scope

- User accounts / score persistence across sessions
- Sound effects or audio
- External images or SVG assets
- Formal accessibility audit (basic semantic HTML and WCAG AA contrast expected)
- Mobile app packaging
