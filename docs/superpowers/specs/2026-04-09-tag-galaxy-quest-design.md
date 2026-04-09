# TAG Galaxy Quest — Design Spec
**Date:** 2026-04-09
**Project:** PGCPS TAG Practice Game
**Stack:** Single-file HTML/CSS/JS, no dependencies

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
- 7 buttons in a 2-column grid: Grade 2 through Grade 8
- Selected grade highlights with a glowing border
- "Launch Mission 🚀" CTA button activates after selection
- Dark starfield background, deep indigo/purple color palette

### Screen 2 — Galaxy Map
- Starfield background with animated twinkling stars
- 4 clickable glowing planets arranged in a loose orbital layout:
  - 📚 **Verbal Planet** — green glow
  - 🔢 **Quantitative Planet** — blue glow
  - 🔷 **Patterns Planet** — amber glow
  - 🧩 **Logic Planet** — pink glow
- Progress badge: `0/4 Planets Conquered`
- Completed planets: show ✓ checkmark, reduced glow, not re-enterable unless user wants to retry
- Planet labels appear on hover/tap

### Screen 3 — Question Screen
- Header: planet name + category icon (top-left), question counter `Q 3/10` (top-right)
- Progress bar fills across top as questions are answered
- Question displayed in a card with large, readable font
- 4 answer options (A–D) as tappable buttons
- On answer:
  - Correct: button glows green, brief "Correct! ✨" feedback
  - Wrong: selected button glows red, correct answer highlighted green
  - Auto-advances to next question after 1.5 seconds
- No timer shown

### Screen 4 — Planet Result
Three outcome states based on score:

| Score | Stars | Experience |
|-------|-------|------------|
| 8–10 correct | ⭐⭐⭐ | 🎉 Celebratory popup with confetti animation, "SUPERSTAR EXPLORER!" message |
| 5–7 correct | ⭐⭐ | Standard result card, "Keep going, you're getting there!" |
| 0–4 correct | ⭐ | Warm motivational overlay, "Every explorer stumbles — the brave ones keep going! Try again?" with prominent retry button |

- All states show score (`X/10`), star rating, and a message
- "Return to Galaxy Map" button (or "Try Again" for low scores)

### Screen 5 — Mission Complete
- Triggered when all 4 planets are conquered
- Celebration animation (stars, confetti)
- Total score: `X/40 questions correct`
- Overall star rating
- "Play Again" button resets to Grade Select

---

## Question Bank

- **4 categories × 10 questions × 7 grade levels = 280 questions** total
- Questions authored inline in JavaScript (no external fetch needed)
- Each question object: `{ question, options: [A,B,C,D], answer, explanation }`
- Difficulty scales per grade:
  - Grades 2–3: concrete, picture-based language
  - Grades 4–5: intermediate reasoning
  - Grades 6–8: abstract reasoning, multi-step logic

### Category Breakdown
- **Verbal Reasoning:** analogies, vocabulary in context, reading comprehension snippets
- **Quantitative Reasoning:** number patterns, arithmetic word problems, sequences
- **Non-Verbal / Patterns:** shape sequences, matrix completion (described in text), spatial reasoning
- **Logic & Sequences:** cause & effect, ordering, deductive reasoning

---

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

- Font: system-safe stack — `'Nunito', 'Segoe UI', sans-serif` (rounded, kid-friendly)
- Animated starfield: CSS keyframe animation, ~100 tiny star dots
- Planet hover: `scale(1.1)` + glow intensifies
- All interactive elements: large tap targets (min 44px), high contrast

---

## Architecture

- **Single file:** `tag-game.html`
- **No external dependencies** — pure HTML/CSS/JS
- **State managed in JS object:**
  ```js
  state = {
    grade: null,           // 2–8
    currentPlanet: null,   // 'verbal' | 'quantitative' | 'patterns' | 'logic'
    currentQuestion: 0,    // 0–9
    scores: { verbal: 0, quantitative: 0, patterns: 0, logic: 0 },
    completed: []          // planets completed
  }
  ```
- **Rendering:** `showScreen(name)` hides all sections, shows target `<section>` via CSS class
- **Question bank:** top-level `QUESTIONS` const, keyed by `grade → category → array`

---

## Deployment

- File saved as `tag-game.html` alongside existing `index.html`
- Pushed to GitHub: `https://github.com/gazelle8802-ui/claude-code-vs-chat`
- Deployed to Vercel: `https://claude-code-vs-chat-opal.vercel.app/tag-game.html`
- Deploy command: `vercel --prod --token <token> --yes --scope gazelle8802-7292s-projects --name claude-code-vs-chat`

---

## Out of Scope

- User accounts / score persistence (no backend)
- Sound effects / audio
- Images or external assets
- Mobile app packaging
- Accessibility audit (basic a11y only)
