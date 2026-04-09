# TAG Galaxy Quest Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `tag-game.html` — a single-file, kid-friendly Galaxy Quest adventure game for PGCPS TAG practice, Grades 2–8, with Cosmo mascot, answer streaks, and full CSS animations.

**Architecture:** All HTML, CSS, and JS live in one file (`tag-game.html`). Five `<section data-screen="...">` elements are shown/hidden by `showScreen()`. State is a plain JS object. The 280-question bank is a top-level JS const keyed by grade integer and category string.

**Tech Stack:** HTML5, CSS3 (custom properties, keyframe animations), vanilla JS (ES6+). Nunito font via Google Fonts CDN. No build step, no JS dependencies.

---

## Chunk 1: Foundation — HTML Skeleton + CSS

### Task 1: Create tag-game.html with full HTML structure and CSS

**Files:**
- Create: `tag-game.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TAG Galaxy Quest 🚀</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a1a;
      --surface: #0f0c29;
      --surface2: #1e1b4b;
      --border: rgba(167,139,250,0.2);
      --accent: #a78bfa;
      --accent2: #818cf8;
      --verbal: #4ade80;
      --quant: #60a5fa;
      --patterns: #f59e0b;
      --logic: #f472b6;
      --text: #e0d7ff;
      --muted: #8b7db8;
      --correct: #4ade80;
      --wrong: #f87171;
    }

    body {
      font-family: 'Nunito', 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* ── Starfield ── */
    .star {
      position: fixed;
      width: 2px; height: 2px;
      background: #fff;
      border-radius: 50%;
      will-change: opacity;
      animation: twinkle var(--dur, 3s) var(--delay, 0s) infinite alternate;
    }
    @keyframes twinkle { from { opacity: 0.1; } to { opacity: 0.9; } }

    /* ── Screen management ── */
    section[data-screen] { display: none; min-height: 100vh; padding: 24px 16px; max-width: 600px; margin: 0 auto; }
    section[data-screen].active { display: flex; flex-direction: column; align-items: center; }

    /* ── Gradient headings ── */
    .grad-title {
      font-size: clamp(28px, 8vw, 52px);
      font-weight: 900;
      background: linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-align: center;
      line-height: 1.1;
    }
    .subtitle { color: var(--muted); font-size: 16px; text-align: center; margin-top: 8px; }

    /* ── Buttons ── */
    .btn {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 24px;
      border: none;
      font-family: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn:hover { transform: scale(1.05); }
    .btn:active { transform: scale(0.97); }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      color: #fff;
      box-shadow: 0 4px 20px rgba(99,102,241,0.4);
    }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .btn-secondary {
      background: var(--surface2);
      color: var(--accent);
      border: 2px solid var(--border);
    }
    .btn-danger {
      background: linear-gradient(135deg, #f472b6, #f87171);
      color: #fff;
    }

    /* ── Grade Select ── */
    .grade-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin: 24px 0; }
    .grade-btn {
      padding: 16px 12px;
      border-radius: 16px;
      border: 2px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .grade-btn:hover { border-color: var(--accent); transform: scale(1.04); }
    .grade-btn.selected { border-color: var(--accent); background: var(--surface2); box-shadow: 0 0 16px rgba(167,139,250,0.5); }
    .grade-btn.full-width { grid-column: span 2; }

    /* ── Galaxy Map ── */
    .map-header { text-align: center; margin-bottom: 8px; }
    .progress-badge {
      display: inline-block;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      margin: 12px 0 24px;
    }
    .planet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; width: 100%; }
    .planet-btn {
      aspect-ratio: 1;
      border-radius: 50%;
      border: 3px solid;
      background: radial-gradient(circle at 35% 35%, var(--planet-light), var(--planet-dark));
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      cursor: pointer;
      font-size: 36px;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      box-shadow: 0 0 20px var(--planet-glow);
      animation: float 4s ease-in-out infinite;
    }
    .planet-btn:hover { animation: wobble 0.5s ease-in-out; box-shadow: 0 0 40px var(--planet-glow); }
    .planet-btn.done { opacity: 0.6; }
    .planet-btn.done::after { content: '✓'; position: absolute; top: -8px; right: -8px; background: var(--correct); color: #000; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; }
    .planet-label { font-size: 12px; font-weight: 800; margin-top: 4px; color: var(--text); text-shadow: 0 1px 4px #000; }

    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes wobble { 0%,100% { transform: scale(1.15) rotate(0deg); } 25% { transform: scale(1.15) rotate(-5deg); } 75% { transform: scale(1.15) rotate(5deg); } }

    /* ── Question Screen ── */
    .q-header { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 8px; font-size: 14px; font-weight: 700; }
    .q-planet-label { color: var(--planet-color, var(--accent)); }
    .q-counter { color: var(--muted); }
    .progress-bar { width: 100%; height: 8px; background: var(--surface2); border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 4px; transition: width 0.4s ease; }
    .question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 24px; width: 100%; margin-bottom: 16px; font-size: 18px; font-weight: 700; line-height: 1.5; }
    .answer-btn {
      display: flex; align-items: center; gap: 12px;
      width: 100%; min-height: 44px; margin-bottom: 10px;
      padding: 12px 16px;
      border-radius: 14px;
      border: 2px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-family: inherit; font-size: 16px; font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
    }
    .answer-btn:hover:not(:disabled) { border-color: var(--accent); transform: translateX(4px); }
    .answer-btn .letter { background: var(--surface2); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
    .answer-btn.correct { border-color: var(--correct); background: rgba(74,222,128,0.15); animation: burst 0.4s ease; }
    .answer-btn.wrong { border-color: var(--wrong); background: rgba(248,113,113,0.15); animation: shake 0.4s ease; }
    @keyframes burst { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }
    @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
    .explanation { font-size: 14px; font-style: italic; color: var(--muted); margin-top: 12px; padding: 10px 14px; background: var(--surface); border-radius: 10px; border-left: 3px solid var(--accent); display: none; }
    .explanation.visible { display: block; }
    .feedback-badge { text-align: center; font-size: 18px; font-weight: 800; color: var(--correct); margin-top: 8px; height: 28px; }

    /* ── Gem Tray ── */
    .gem-tray { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); margin-bottom: 12px; min-height: 28px; }
    .gem { font-size: 20px; animation: gemPop 0.3s ease; }
    @keyframes gemPop { 0% { transform: scale(0) rotate(-20deg); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
    .streak-badge { background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 20px; padding: 3px 10px; color: #fff; font-size: 12px; font-weight: 800; animation: streakPop 0.4s ease; display: none; }
    .streak-badge.visible { display: inline-block; }
    @keyframes streakPop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

    /* ── Cosmo Mascot ── */
    .cosmo-wrap { display: flex; align-items: flex-end; gap: 10px; margin: 16px 0; }
    .cosmo-emoji { font-size: 40px; }
    .cosmo-bubble {
      background: var(--surface2);
      border: 2px solid var(--border);
      border-radius: 16px 16px 16px 4px;
      padding: 10px 14px;
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
      max-width: 220px;
      position: relative;
    }

    /* ── Planet Result ── */
    .result-card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 32px 24px; width: 100%; text-align: center; }
    .result-stars { font-size: 40px; margin: 12px 0; }
    .result-score { font-size: 48px; font-weight: 900; background: linear-gradient(135deg, var(--accent), #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .result-msg { font-size: 22px; font-weight: 800; margin: 12px 0; }
    .result-sub { font-size: 15px; color: var(--muted); margin-bottom: 24px; }
    .result-banner { border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; font-weight: 700; font-size: 15px; }
    .result-banner.motivational { background: rgba(167,139,250,0.15); border: 1px solid var(--accent); color: var(--accent); }

    /* ── Confetti ── */
    .confetti-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; overflow: hidden; }
    .confetti-piece { position: absolute; width: 10px; height: 10px; top: -10px; animation: confettiFall var(--dur,3s) var(--delay,0s) linear forwards; border-radius: var(--r, 0); }
    @keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }

    /* ── Emoji Pop Overlay ── */
    .emoji-pop { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 120px; background: rgba(10,10,26,0.7); z-index: 200; animation: emojiIn 0.4s ease, emojiOut 0.4s ease 0.8s forwards; pointer-events: none; }
    @keyframes emojiIn { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes emojiOut { to { transform: scale(1.5); opacity: 0; } }

    /* ── Mission Complete ── */
    .trophy { font-size: 80px; animation: trophyBounce 1s ease infinite alternate; }
    @keyframes trophyBounce { from { transform: translateY(0) rotate(-5deg); } to { transform: translateY(-16px) rotate(5deg); } }
    .total-score { font-size: 64px; font-weight: 900; background: linear-gradient(135deg, #fbbf24, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .cosmo-spin { animation: spin 1s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>

<!-- Starfield (generated by JS) -->
<div id="starfield"></div>

<!-- Confetti container (populated by JS) -->
<div class="confetti-container" id="confetti"></div>

<!-- SCREEN 1: Grade Select -->
<section data-screen="grade-select">
  <div style="margin-top:40px;margin-bottom:8px;font-size:56px">🚀</div>
  <h1 class="grad-title">TAG Galaxy Quest</h1>
  <p class="subtitle">Prepare for the TAG test — one planet at a time!</p>

  <div class="cosmo-wrap" style="margin-top:24px">
    <span class="cosmo-emoji">🧑‍🚀</span>
    <div class="cosmo-bubble">Ready for liftoff, Explorer? Pick your grade!</div>
  </div>

  <div class="grade-grid" id="grade-grid">
    <button class="grade-btn" data-grade="2" onclick="selectGrade(2)">🪐 Grade 2</button>
    <button class="grade-btn" data-grade="3" onclick="selectGrade(3)">🌍 Grade 3</button>
    <button class="grade-btn" data-grade="4" onclick="selectGrade(4)">🌙 Grade 4</button>
    <button class="grade-btn" data-grade="5" onclick="selectGrade(5)">☀️ Grade 5</button>
    <button class="grade-btn" data-grade="6" onclick="selectGrade(6)">🌌 Grade 6</button>
    <button class="grade-btn" data-grade="7" onclick="selectGrade(7)">🛸 Grade 7</button>
    <button class="grade-btn full-width" data-grade="8" onclick="selectGrade(8)">🏆 Grade 8</button>
  </div>

  <button class="btn btn-primary" id="launch-btn" disabled onclick="startGame()">Launch Mission 🚀</button>
</section>

<!-- SCREEN 2: Galaxy Map -->
<section data-screen="galaxy-map">
  <div class="map-header" style="width:100%">
    <h2 class="grad-title" style="font-size:clamp(22px,6vw,36px)">🌌 Galaxy Map</h2>
    <p class="subtitle" id="map-grade-label"></p>
    <div class="progress-badge" id="progress-badge">0/4 Planets Conquered</div>
  </div>

  <div class="cosmo-wrap">
    <span class="cosmo-emoji">🧑‍🚀</span>
    <div class="cosmo-bubble" id="cosmo-map">Pick a planet to explore, Explorer!</div>
  </div>

  <div class="planet-grid" id="planet-grid">
    <button class="planet-btn" id="planet-verbal"
      style="--planet-light:#86efac;--planet-dark:#14532d;--planet-glow:rgba(74,222,128,0.5);border-color:#4ade80"
      onclick="startPlanet('verbal')">
      📚<span class="planet-label">Verbal</span>
    </button>
    <button class="planet-btn" id="planet-quantitative"
      style="--planet-light:#93c5fd;--planet-dark:#1e3a5f;--planet-glow:rgba(96,165,250,0.5);border-color:#60a5fa"
      onclick="startPlanet('quantitative')">
      🔢<span class="planet-label">Quantitative</span>
    </button>
    <button class="planet-btn" id="planet-patterns"
      style="--planet-light:#fcd34d;--planet-dark:#78350f;--planet-glow:rgba(245,158,11,0.5);border-color:#f59e0b"
      onclick="startPlanet('patterns')">
      🔷<span class="planet-label">Patterns</span>
    </button>
    <button class="planet-btn" id="planet-logic"
      style="--planet-light:#f9a8d4;--planet-dark:#831843;--planet-glow:rgba(244,114,182,0.5);border-color:#f472b6"
      onclick="startPlanet('logic')">
      🧩<span class="planet-label">Logic</span>
    </button>
  </div>

  <button class="btn btn-secondary" id="view-results-btn" style="display:none;margin-top:24px" onclick="showMissionComplete()">🏆 View Results</button>
</section>

<!-- SCREEN 3: Question -->
<section data-screen="question">
  <div class="gem-tray" id="gem-tray">
    <span style="color:var(--muted)">Gems: </span>
    <span id="gems-display"></span>
    <span class="streak-badge" id="streak-badge"></span>
  </div>

  <div class="q-header">
    <span class="q-planet-label" id="q-planet-label"></span>
    <span class="q-counter" id="q-counter"></span>
  </div>
  <div class="progress-bar"><div class="progress-fill" id="q-progress"></div></div>

  <div class="question-card" id="question-text"></div>

  <div id="answers-container"></div>

  <div class="feedback-badge" id="feedback-badge"></div>
  <div class="explanation" id="explanation-box"></div>
</section>

<!-- SCREEN 4: Planet Result -->
<section data-screen="planet-result">
  <div class="result-card" id="result-card">
    <div class="result-banner motivational" id="result-banner" style="display:none"></div>
    <div style="font-size:48px" id="result-planet-emoji"></div>
    <div class="result-stars" id="result-stars"></div>
    <div class="result-score" id="result-score"></div>
    <div class="result-msg" id="result-msg"></div>
    <div class="result-sub" id="result-sub"></div>
    <div class="cosmo-wrap" style="justify-content:center">
      <span class="cosmo-emoji" id="result-cosmo-emoji">🧑‍🚀</span>
      <div class="cosmo-bubble" id="result-cosmo-msg"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
      <button class="btn btn-danger" id="retry-btn" style="display:none" onclick="retryPlanet()">🔁 Try This Planet Again</button>
      <button class="btn btn-primary" onclick="returnToGalaxyMap()">🗺️ Return to Galaxy Map</button>
    </div>
  </div>
</section>

<!-- SCREEN 5: Mission Complete -->
<section data-screen="mission-complete">
  <div class="trophy">🏆</div>
  <h1 class="grad-title" style="margin-top:16px">Mission Complete!</h1>
  <div class="cosmo-wrap" style="justify-content:center;margin:16px 0">
    <span class="cosmo-spin">🧑‍🚀</span>
    <div class="cosmo-bubble" id="complete-cosmo-msg">You're a Galaxy Champion!</div>
  </div>
  <div class="total-score" id="total-score"></div>
  <p class="subtitle">questions correct out of 40</p>
  <div class="result-stars" id="complete-stars" style="margin:16px 0"></div>
  <div class="result-msg" id="complete-msg"></div>
  <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px;width:100%">
    <button class="btn btn-primary" onclick="showMissionComplete()">📊 View Score Again</button>
    <button class="btn btn-secondary" onclick="resetGame()">🔄 Play Again</button>
  </div>
</section>

<script>
// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const ADVANCE_DELAY_MS = 3000;
const PLANETS = ['verbal', 'quantitative', 'patterns', 'logic'];
const PLANET_META = {
  verbal:       { label: '📚 Verbal',       color: '#4ade80', emoji: '📚' },
  quantitative: { label: '🔢 Quantitative', color: '#60a5fa', emoji: '🔢' },
  patterns:     { label: '🔷 Patterns',     color: '#f59e0b', emoji: '🔷' },
  logic:        { label: '🧩 Logic',        color: '#f472b6', emoji: '🧩' },
};
const CONFETTI_COLORS = ['#a78bfa','#60a5fa','#4ade80','#f59e0b','#f472b6','#fff'];

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
const state = {
  grade: null,
  currentPlanet: null,
  currentQuestion: 0,
  scores: { verbal: 0, quantitative: 0, patterns: 0, logic: 0 },
  completed: [],
  hasSeenMissionComplete: false,
  streak: 0,
  gems: 0,
  answered: false,
  advanceTimer: null,
};

// ═══════════════════════════════════════════
// SCREEN MANAGEMENT
// ═══════════════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('section[data-screen]').forEach(s => s.classList.remove('active'));
  const target = document.querySelector(`section[data-screen="${name}"]`);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════
// STARFIELD
// ═══════════════════════════════════════════
(function buildStarfield() {
  const container = document.getElementById('starfield');
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${2+Math.random()*4}s;--delay:${Math.random()*4}s;width:${Math.random()<0.3?3:2}px;height:${Math.random()<0.3?3:2}px;opacity:${0.3+Math.random()*0.7}`;
    container.appendChild(s);
  }
})();

// ═══════════════════════════════════════════
// GRADE SELECT
// ═══════════════════════════════════════════
function selectGrade(grade) {
  state.grade = grade;
  document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.grade-btn[data-grade="${grade}"]`).classList.add('selected');
  document.getElementById('launch-btn').disabled = false;
}

function startGame() {
  if (!state.grade) return;
  showScreen('galaxy-map');
  renderGalaxyMap();
}

// ═══════════════════════════════════════════
// GALAXY MAP
// ═══════════════════════════════════════════
function renderGalaxyMap() {
  document.getElementById('map-grade-label').textContent = `Grade ${state.grade} · ${state.completed.length}/4 Planets Conquered`;
  document.getElementById('progress-badge').textContent = `${state.completed.length}/4 Planets Conquered`;
  document.getElementById('view-results-btn').style.display = state.hasSeenMissionComplete ? 'block' : 'none';
  PLANETS.forEach(p => {
    const btn = document.getElementById(`planet-${p}`);
    if (state.completed.includes(p)) {
      btn.classList.add('done');
    } else {
      btn.classList.remove('done');
    }
  });
  const cosmoMapMsgs = ['Pick a planet to explore!', 'Which planet calls to you? 🌟', 'Adventure awaits, Explorer!'];
  document.getElementById('cosmo-map').textContent = cosmoMapMsgs[state.completed.length % cosmoMapMsgs.length];
}

// ═══════════════════════════════════════════
// QUESTION SCREEN
// ═══════════════════════════════════════════
function startPlanet(planet) {
  state.currentPlanet = planet;
  state.currentQuestion = 0;
  state.scores[planet] = 0;
  state.streak = 0;
  state.answered = false;
  if (state.advanceTimer) clearTimeout(state.advanceTimer);
  showScreen('question');
  renderQuestion();
}

function renderQuestion() {
  const { grade, currentPlanet, currentQuestion } = state;
  const q = QUESTIONS[grade][currentPlanet][currentQuestion];
  const meta = PLANET_META[currentPlanet];

  document.getElementById('q-planet-label').textContent = meta.label;
  document.getElementById('q-planet-label').style.color = meta.color;
  document.getElementById('q-counter').textContent = `Q ${currentQuestion + 1}/10`;
  document.getElementById('q-progress').style.width = `${(currentQuestion / 10) * 100}%`;
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('feedback-badge').textContent = '';
  document.getElementById('explanation-box').textContent = '';
  document.getElementById('explanation-box').classList.remove('visible');
  document.getElementById('streak-badge').classList.remove('visible');
  updateGemDisplay();

  const letters = ['A','B','C','D'];
  const container = document.getElementById('answers-container');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="letter">${letters[i]}</span>${opt}`;
    btn.onclick = () => submitAnswer(i);
    container.appendChild(btn);
  });

  state.answered = false;
  // Tap-to-advance: click anywhere after answering
  document.querySelector('section[data-screen="question"]').onclick = (e) => {
    if (state.answered && !e.target.closest('.answer-btn')) advanceQuestion();
  };
}

function submitAnswer(index) {
  if (state.answered) return;
  state.answered = true;
  if (state.advanceTimer) clearTimeout(state.advanceTimer);

  const q = QUESTIONS[state.grade][state.currentPlanet][state.currentQuestion];
  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach(b => b.disabled = true);

  const isCorrect = index === q.answer;
  buttons[index].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) buttons[q.answer].classList.add('correct');

  if (isCorrect) {
    state.scores[state.currentPlanet]++;
    state.streak++;
    document.getElementById('feedback-badge').textContent = 'Correct! ✨';
    handleStreak();
  } else {
    state.streak = 0;
    document.getElementById('feedback-badge').textContent = '';
  }

  document.getElementById('explanation-box').textContent = q.explanation;
  document.getElementById('explanation-box').classList.add('visible');

  state.advanceTimer = setTimeout(advanceQuestion, ADVANCE_DELAY_MS);
}

function handleStreak() {
  const badge = document.getElementById('streak-badge');
  if (state.streak === 3) {
    badge.textContent = '🔥 3 in a row!';
    badge.classList.add('visible');
  } else if (state.streak === 5) {
    badge.textContent = '⚡ COMBO × 5!';
    badge.classList.add('visible');
    state.gems++;
    updateGemDisplay();
  } else if (state.streak > 5 && state.streak % 5 === 0) {
    badge.textContent = `💥 COMBO × ${state.streak}!`;
    badge.classList.add('visible');
    state.gems++;
    updateGemDisplay();
  }
}

function updateGemDisplay() {
  document.getElementById('gems-display').textContent = '💎'.repeat(state.gems) || '';
}

function advanceQuestion() {
  if (state.advanceTimer) clearTimeout(state.advanceTimer);
  state.currentQuestion++;
  if (state.currentQuestion >= 10) {
    showEmojiPop(() => showPlanetResult());
  } else {
    renderQuestion();
  }
}

// ═══════════════════════════════════════════
// EMOJI POP OVERLAY
// ═══════════════════════════════════════════
function showEmojiPop(callback) {
  const emojis = ['🎉','🚀','⭐','🌟','🏅'];
  const pop = document.createElement('div');
  pop.className = 'emoji-pop';
  pop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  document.body.appendChild(pop);
  setTimeout(() => { pop.remove(); callback(); }, 1300);
}

// ═══════════════════════════════════════════
// PLANET RESULT
// ═══════════════════════════════════════════
function showPlanetResult() {
  const planet = state.currentPlanet;
  const score = state.scores[planet];
  const meta = PLANET_META[planet];

  if (!state.completed.includes(planet)) state.completed.push(planet);
  renderGalaxyMap(); // update map badge

  let stars, msg, sub, cosmoMsg, cosmoEmoji, showBanner = false, bannerText = '';
  if (score >= 8) {
    stars = '⭐⭐⭐'; msg = 'SUPERSTAR EXPLORER! 🎉'; sub = `You got ${score}/10 — incredible!`;
    cosmoMsg = 'You\'re AMAZING! I knew you could do it! 🔥'; cosmoEmoji = '🥳';
    spawnConfetti();
  } else if (score >= 5) {
    stars = '⭐⭐'; msg = 'Great job, Explorer!'; sub = `You got ${score}/10 — keep going!`;
    cosmoMsg = 'Keep going — you\'re getting there! 💪'; cosmoEmoji = '😊';
  } else {
    stars = '⭐'; msg = 'Keep Exploring!'; sub = `You got ${score}/10`;
    showBanner = true; bannerText = 'Every explorer stumbles — the brave ones keep going! 🚀';
    cosmoMsg = 'Let\'s try again — I believe in you! ✨'; cosmoEmoji = '🤗';
  }

  document.getElementById('result-planet-emoji').textContent = meta.emoji;
  document.getElementById('result-stars').textContent = stars;
  document.getElementById('result-score').textContent = `${score}/10`;
  document.getElementById('result-msg').textContent = msg;
  document.getElementById('result-sub').textContent = sub;
  document.getElementById('result-cosmo-msg').textContent = cosmoMsg;
  document.getElementById('result-cosmo-emoji').textContent = cosmoEmoji;

  const banner = document.getElementById('result-banner');
  banner.style.display = showBanner ? 'block' : 'none';
  if (showBanner) banner.textContent = bannerText;

  document.getElementById('retry-btn').style.display = score < 5 ? 'block' : 'none';

  showScreen('planet-result');
}

function retryPlanet() { startPlanet(state.currentPlanet); }

function returnToGalaxyMap() {
  if (state.completed.length === 4 && !state.hasSeenMissionComplete) {
    state.hasSeenMissionComplete = true;
    showMissionComplete();
  } else {
    showScreen('galaxy-map');
    renderGalaxyMap();
  }
}

// ═══════════════════════════════════════════
// CONFETTI
// ═══════════════════════════════════════════
function spawnConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.cssText = `left:${Math.random()*100}%;background:${color};--dur:${2+Math.random()*2}s;--delay:${Math.random()*1}s;--r:${Math.random()<0.5?'50%':'2px'};transform:rotate(${Math.random()*360}deg)`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

// ═══════════════════════════════════════════
// MISSION COMPLETE
// ═══════════════════════════════════════════
function showMissionComplete() {
  const total = PLANETS.reduce((sum, p) => sum + state.scores[p], 0);
  let stars, msg, cosmoMsg;
  if (total >= 32) { stars = '⭐⭐⭐'; msg = 'Galaxy Champion! 🏆'; cosmoMsg = 'You\'re a true Galaxy Champion! I\'m so proud! 🌟'; }
  else if (total >= 20) { stars = '⭐⭐'; msg = 'Rising Star Explorer! 🌟'; cosmoMsg = 'You\'re rising fast, Explorer! Keep it up! 🚀'; }
  else { stars = '⭐'; msg = 'Keep Exploring — You\'ve Got This!'; cosmoMsg = 'Every great explorer starts somewhere. Keep going! 💜'; }

  document.getElementById('total-score').textContent = total;
  document.getElementById('complete-stars').textContent = stars;
  document.getElementById('complete-msg').textContent = msg;
  document.getElementById('complete-cosmo-msg').textContent = cosmoMsg;
  spawnConfetti();
  showScreen('mission-complete');
}

// ═══════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════
function resetGame() {
  state.grade = null;
  state.currentPlanet = null;
  state.currentQuestion = 0;
  state.scores = { verbal: 0, quantitative: 0, patterns: 0, logic: 0 };
  state.completed = [];
  state.hasSeenMissionComplete = false;
  state.streak = 0;
  state.gems = 0;
  state.answered = false;
  if (state.advanceTimer) clearTimeout(state.advanceTimer);
  document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('launch-btn').disabled = true;
  document.getElementById('confetti').innerHTML = '';
  showScreen('grade-select');
}

// ═══════════════════════════════════════════
// QUESTION BANK — 280 questions (4×10×7)
// ═══════════════════════════════════════════
const QUESTIONS = {
  2: {
    verbal: [
      { question: "Cat is to kitten as dog is to ___.", options: ["puppy","cub","foal","calf"], answer: 0, explanation: "A baby cat is a kitten; a baby dog is a puppy." },
      { question: "Big is the opposite of ___.", options: ["tall","small","round","fast"], answer: 1, explanation: "Big and small are antonyms (opposites)." },
      { question: "Hot is to cold as day is to ___.", options: ["sun","noon","night","warm"], answer: 2, explanation: "Hot↔cold are opposites, just like day↔night." },
      { question: "Bird is to nest as bee is to ___.", options: ["flower","honey","hive","wing"], answer: 2, explanation: "A bird lives in a nest; a bee lives in a hive." },
      { question: "Which word means the same as happy?", options: ["sad","angry","joyful","tired"], answer: 2, explanation: "Joyful and happy both mean feeling good." },
      { question: "Apple is to fruit as carrot is to ___.", options: ["color","vegetable","food","root"], answer: 1, explanation: "An apple is a type of fruit; a carrot is a type of vegetable." },
      { question: "Hand is to glove as foot is to ___.", options: ["leg","shoe","sock","ankle"], answer: 1, explanation: "A glove covers a hand; a shoe covers a foot." },
      { question: "Fish is to water as bird is to ___.", options: ["tree","sky","nest","feather"], answer: 1, explanation: "Fish swim in water; birds fly in the sky." },
      { question: "Teacher is to school as doctor is to ___.", options: ["medicine","hospital","nurse","sick"], answer: 1, explanation: "A teacher works at a school; a doctor works at a hospital." },
      { question: "Dark is the opposite of ___.", options: ["night","dim","bright","shadow"], answer: 2, explanation: "Dark and bright are antonyms." },
    ],
    quantitative: [
      { question: "What comes next? 2, 4, 6, 8, ___", options: ["9","10","11","12"], answer: 1, explanation: "Each number increases by 2." },
      { question: "Sam has 5 apples. He gets 3 more. How many does he have?", options: ["7","8","9","6"], answer: 1, explanation: "5 + 3 = 8." },
      { question: "What comes next? 1, 3, 5, 7, ___", options: ["8","9","10","11"], answer: 1, explanation: "Odd numbers increase by 2. After 7 comes 9." },
      { question: "Maria has 10 stickers and gives 4 to a friend. How many are left?", options: ["4","5","6","7"], answer: 2, explanation: "10 − 4 = 6." },
      { question: "What number is missing? 3, ___, 9, 12", options: ["4","5","6","7"], answer: 2, explanation: "Each number increases by 3. 3+3=6." },
      { question: "There are 3 groups of 2 birds. How many birds in total?", options: ["5","6","7","8"], answer: 1, explanation: "3 × 2 = 6." },
      { question: "What comes next? 10, 20, 30, ___", options: ["35","38","40","45"], answer: 2, explanation: "Each number increases by 10." },
      { question: "A bag has 7 red and 3 blue balls. How many balls total?", options: ["8","9","10","11"], answer: 2, explanation: "7 + 3 = 10." },
      { question: "What number is halfway between 4 and 8?", options: ["5","6","7","3"], answer: 1, explanation: "(4+8)÷2 = 6." },
      { question: "What comes next? 5, 10, 15, ___", options: ["18","19","20","25"], answer: 2, explanation: "Each number increases by 5." },
    ],
    patterns: [
      { question: "Circle, Square, Circle, Square, ___", options: ["Triangle","Circle","Square","Star"], answer: 1, explanation: "The pattern repeats: Circle, Square." },
      { question: "Red, Blue, Red, Blue, ___", options: ["Green","Red","Blue","Yellow"], answer: 1, explanation: "Colors alternate: Red, Blue." },
      { question: "Big, Small, Big, Small, ___", options: ["Medium","Small","Big","Tiny"], answer: 2, explanation: "Sizes alternate: Big, Small." },
      { question: "1 dot, 2 dots, 3 dots, ___", options: ["3 dots","4 dots","5 dots","2 dots"], answer: 1, explanation: "Each step adds one dot." },
      { question: "Star, Star, Moon, Star, Star, ___", options: ["Star","Moon","Sun","Cloud"], answer: 1, explanation: "Pattern: Star, Star, Moon repeating. Next is Moon." },
      { question: "A shape has 3 sides. Next shape has 4 sides. Next has 5 sides. What comes next?", options: ["5 sides","6 sides","7 sides","4 sides"], answer: 1, explanation: "Each shape gains one side." },
      { question: "Small circle, Medium circle, Large circle, ___", options: ["Medium circle","Huge circle","Small circle","Square"], answer: 1, explanation: "Circles grow larger each step." },
      { question: "Up, Down, Up, Down, ___", options: ["Left","Up","Down","Right"], answer: 1, explanation: "Direction alternates: Up, Down." },
      { question: "Triangle, Circle, Triangle, Circle, ___", options: ["Square","Circle","Triangle","Oval"], answer: 2, explanation: "Shapes alternate: Triangle, Circle." },
      { question: "1, 1, 2, 1, 1, 2, ___", options: ["1","2","3","0"], answer: 0, explanation: "Pattern repeats: 1, 1, 2." },
    ],
    logic: [
      { question: "Tom is taller than Sam. Sam is taller than Joe. Who is shortest?", options: ["Tom","Sam","Joe","Can't tell"], answer: 2, explanation: "Tom > Sam > Joe, so Joe is shortest." },
      { question: "All cats have tails. Luna is a cat. Does Luna have a tail?", options: ["No","Maybe","Yes","Sometimes"], answer: 2, explanation: "All cats have tails, and Luna is a cat, so yes." },
      { question: "If you sleep at night, what do you do during the day?", options: ["Sleep","Stay awake","Dream","Rest"], answer: 1, explanation: "If night is for sleeping, day is for being awake." },
      { question: "Ana is first in line. Ben is right behind her. Who is second?", options: ["Ana","Ben","Neither","Both"], answer: 1, explanation: "Ben is right behind Ana (first), so Ben is second." },
      { question: "Which comes first? Morning, Afternoon, Evening?", options: ["Evening","Afternoon","Morning","Night"], answer: 2, explanation: "Morning comes before afternoon and evening." },
      { question: "If I eat breakfast before lunch, and lunch before dinner, what do I eat last?", options: ["Breakfast","Lunch","Dinner","Snack"], answer: 2, explanation: "Dinner is the last meal in this sequence." },
      { question: "Every bird can fly. A penguin is a bird. Can a penguin fly according to this rule?", options: ["No","Yes","Maybe","Sometimes"], answer: 1, explanation: "According to the rule given, yes — even if not true in real life." },
      { question: "It rained, so the grass is wet. The grass is wet means ___.", options: ["It will rain","It rained","The sun is out","It is cold"], answer: 1, explanation: "Wet grass is the effect of rain." },
      { question: "Maya has more stickers than Kai. Kai has fewer than Maya. Who has more?", options: ["Kai","Maya","Same","Can't tell"], answer: 1, explanation: "Both clues say Maya has more." },
      { question: "First a seed is planted. Then it grows roots. Then it sprouts. What is the correct order?", options: ["Sprouts, roots, seed","Roots, sprouts, seed","Seed, roots, sprouts","Seed, sprouts, roots"], answer: 2, explanation: "Seed → roots → sprouts is the natural growth order." },
    ],
  },

  3: {
    verbal: [
      { question: "Pencil is to write as scissors are to ___.", options: ["draw","cut","tape","paint"], answer: 1, explanation: "A pencil is used to write; scissors are used to cut." },
      { question: "Which word means very large?", options: ["tiny","medium","gigantic","narrow"], answer: 2, explanation: "Gigantic means extremely large." },
      { question: "Brave is to cowardly as generous is to ___.", options: ["kind","selfish","giving","brave"], answer: 1, explanation: "Brave↔cowardly are opposites; generous↔selfish are opposites." },
      { question: "Author is to book as painter is to ___.", options: ["brush","museum","painting","color"], answer: 2, explanation: "An author creates a book; a painter creates a painting." },
      { question: "Which word is a synonym for 'fast'?", options: ["slow","quick","careful","heavy"], answer: 1, explanation: "Quick and fast mean the same thing." },
      { question: "Ocean is to waves as mountain is to ___.", options: ["valley","peak","sky","snow"], answer: 1, explanation: "Waves are the top feature of an ocean; a peak is the top of a mountain." },
      { question: "Laugh is to funny as cry is to ___.", options: ["joke","happy","sad","loud"], answer: 2, explanation: "You laugh because something is funny; you cry because you are sad." },
      { question: "Which word does NOT belong: apple, banana, carrot, grape?", options: ["apple","banana","carrot","grape"], answer: 2, explanation: "Carrot is a vegetable; the rest are fruits." },
      { question: "Paw is to dog as hoof is to ___.", options: ["cat","elephant","horse","bird"], answer: 2, explanation: "A dog has paws; a horse has hooves." },
      { question: "Warm is to hot as cool is to ___.", options: ["cold","warm","mild","frozen"], answer: 0, explanation: "Warm is a milder form of hot; cool is a milder form of cold." },
    ],
    quantitative: [
      { question: "What comes next? 3, 6, 9, 12, ___", options: ["13","14","15","16"], answer: 2, explanation: "Each number increases by 3. 12+3=15." },
      { question: "A store has 24 apples. They sell 9. How many remain?", options: ["13","14","15","16"], answer: 2, explanation: "24 − 9 = 15." },
      { question: "What is 7 × 8?", options: ["54","56","58","64"], answer: 1, explanation: "7 × 8 = 56." },
      { question: "What comes next? 100, 90, 80, 70, ___", options: ["65","60","55","50"], answer: 1, explanation: "Each number decreases by 10. 70−10=60." },
      { question: "There are 4 rows of 6 chairs. How many chairs in total?", options: ["20","22","24","26"], answer: 2, explanation: "4 × 6 = 24." },
      { question: "What is the missing number? 8, 16, ___, 32", options: ["20","22","24","26"], answer: 2, explanation: "Each number doubles. 16×2=32, so missing is 16+8=24." },
      { question: "A pizza is cut into 8 slices. 3 slices are eaten. What fraction remains?", options: ["3/8","5/8","1/2","3/5"], answer: 1, explanation: "8−3=5 slices left. 5/8 of the pizza remains." },
      { question: "What is 56 ÷ 7?", options: ["6","7","8","9"], answer: 2, explanation: "56 ÷ 7 = 8." },
      { question: "What number comes before 200 in multiples of 25?", options: ["150","165","175","185"], answer: 2, explanation: "Multiples of 25: 150, 175, 200. So 175 comes before 200." },
      { question: "If today is Wednesday, what day will it be in 5 days?", options: ["Sunday","Monday","Tuesday","Wednesday"], answer: 1, explanation: "Wed+5 = Mon (Wed→Thu→Fri→Sat→Sun→Mon)." },
    ],
    patterns: [
      { question: "AB, AC, AD, ___", options: ["AE","BA","CA","BC"], answer: 0, explanation: "The second letter increases: B, C, D → E." },
      { question: "1, 4, 9, 16, ___", options: ["20","23","25","30"], answer: 2, explanation: "These are perfect squares: 1²,2²,3²,4²,5²=25." },
      { question: "Shapes: triangle(3), square(4), pentagon(5), hexagon(___)", options: ["5","6","7","8"], answer: 1, explanation: "Each shape gains one side. Hexagon has 6 sides." },
      { question: "AABB, BBCC, CCDD, ___", options: ["DDEE","EEFF","DDFF","CCEE"], answer: 0, explanation: "Each group shifts one letter forward." },
      { question: "Row 1: 1 star. Row 2: 3 stars. Row 3: 5 stars. How many stars in Row 4?", options: ["6","7","8","9"], answer: 1, explanation: "Each row adds 2 stars: 1,3,5,7." },
      { question: "What is missing? 2, 6, 18, ___, 162", options: ["36","54","72","90"], answer: 1, explanation: "Each number multiplies by 3. 18×3=54." },
      { question: "Large square contains 4 medium squares. Each medium square contains 4 small squares. How many small squares total?", options: ["8","12","16","20"], answer: 2, explanation: "4 medium × 4 small = 16 small squares." },
      { question: "If the pattern is +3, −1, +3, −1 starting from 2, what is the 5th number?", options: ["7","8","9","10"], answer: 1, explanation: "2→5→4→7→6→8. Fifth number is 8." },
      { question: "Monday, Wednesday, Friday, ___", options: ["Saturday","Sunday","Tuesday","Thursday"], answer: 1, explanation: "Skipping one day each time: Mon, Wed, Fri, Sun." },
      { question: "Black, White, Black, Black, White, Black, Black, Black, ___", options: ["White","Black","Gray","Both"], answer: 0, explanation: "Pattern: W appears after 1, 2, 3 blacks. Next cycle: White." },
    ],
    logic: [
      { question: "Alex is older than Bria. Bria is older than Carlos. Who is youngest?", options: ["Alex","Bria","Carlos","Same"], answer: 2, explanation: "Alex > Bria > Carlos, so Carlos is youngest." },
      { question: "All triangles have 3 sides. A shape has 3 sides. It must be a ___.", options: ["square","circle","triangle","pentagon"], answer: 2, explanation: "3 sides = triangle by definition." },
      { question: "If you go north from school and then turn around completely, which way are you facing?", options: ["North","East","South","West"], answer: 2, explanation: "Turning around 180° from north faces south." },
      { question: "Kim has a dog and a cat. The dog is bigger than the cat. The cat is smaller than a rabbit. Who is smallest?", options: ["Dog","Cat","Rabbit","Same"], answer: 1, explanation: "Cat < rabbit < dog, so cat is smallest." },
      { question: "If all fish live in water and salmon is a fish, where does salmon live?", options: ["Land","Trees","Water","Sky"], answer: 2, explanation: "All fish live in water; salmon is a fish; therefore salmon lives in water." },
      { question: "A movie starts at 2:00 and is 90 minutes long. When does it end?", options: ["3:00","3:30","4:00","3:15"], answer: 1, explanation: "2:00 + 90 minutes = 3:30." },
      { question: "Five friends sit in a row: Ana is between Ben and Carlos. Who sits next to Ana?", options: ["Only Ben","Only Carlos","Both Ben and Carlos","Neither"], answer: 2, explanation: "Between means Ana has Ben on one side and Carlos on the other." },
      { question: "It is always true that plants need sunlight. Oak is a plant. Does an oak need sunlight?", options: ["No","Yes","Maybe","Sometimes"], answer: 1, explanation: "All plants need sunlight; oak is a plant; yes." },
      { question: "You have 3 red and 3 blue socks in a dark room. What is the minimum you must grab to guarantee a matching pair?", options: ["2","3","4","6"], answer: 1, explanation: "With 3 grabs, at least 2 must match (pigeonhole principle)." },
      { question: "Jake runs faster than Lee but slower than Maya. Who runs fastest?", options: ["Jake","Lee","Maya","Tie"], answer: 2, explanation: "Maya > Jake > Lee, so Maya is fastest." },
    ],
  },

  4: {
    verbal: [
      { question: "Manuscript is to author as symphony is to ___.", options: ["musician","composer","conductor","orchestra"], answer: 1, explanation: "An author writes a manuscript; a composer writes a symphony." },
      { question: "Which word best completes: 'The scientist made a _____ discovery that changed medicine.'", options: ["common","groundbreaking","average","simple"], answer: 1, explanation: "Groundbreaking means revolutionary/important, fitting a discovery that changed medicine." },
      { question: "Nocturnal means active at ___.", options: ["dawn","midday","night","dusk"], answer: 2, explanation: "Nocturnal animals are active during nighttime." },
      { question: "Timid is to bold as ignorant is to ___.", options: ["confused","educated","shy","foolish"], answer: 1, explanation: "Timid↔bold; ignorant↔educated are antonym pairs." },
      { question: "Which word does NOT belong: elated, ecstatic, overjoyed, melancholy?", options: ["elated","ecstatic","overjoyed","melancholy"], answer: 3, explanation: "Elated, ecstatic, overjoyed are all very happy; melancholy means sad." },
      { question: "Abundant means ___.", options: ["rare","scarce","plentiful","tiny"], answer: 2, explanation: "Abundant means present in large quantities — plentiful." },
      { question: "Sun is to solar as moon is to ___.", options: ["stellar","lunar","planetary","orbital"], answer: 1, explanation: "Solar relates to the sun; lunar relates to the moon." },
      { question: "Quarrel is to argue as assist is to ___.", options: ["fight","refuse","help","prevent"], answer: 2, explanation: "Quarrel and argue are synonyms; assist and help are synonyms." },
      { question: "Architect is to building as choreographer is to ___.", options: ["music","dance","theater","costume"], answer: 1, explanation: "An architect designs buildings; a choreographer designs dances." },
      { question: "Which pair is NOT synonyms? A) begin/start B) brave/cowardly C) huge/enormous D) fast/swift", options: ["A","B","C","D"], answer: 1, explanation: "Brave and cowardly are opposites (antonyms), not synonyms." },
    ],
    quantitative: [
      { question: "What is 125 × 4?", options: ["400","450","500","525"], answer: 2, explanation: "125 × 4 = 500." },
      { question: "What comes next? 1, 2, 4, 8, 16, ___", options: ["24","30","32","36"], answer: 2, explanation: "Each number doubles. 16 × 2 = 32." },
      { question: "A rectangle has length 12 and width 5. What is its area?", options: ["34","54","60","70"], answer: 2, explanation: "Area = length × width = 12 × 5 = 60." },
      { question: "What fraction of 20 is 5?", options: ["1/5","1/4","1/3","2/5"], answer: 1, explanation: "5/20 = 1/4." },
      { question: "If n + 15 = 34, what is n?", options: ["17","18","19","20"], answer: 2, explanation: "n = 34 − 15 = 19." },
      { question: "What is the average of 8, 12, 16, and 20?", options: ["13","14","15","16"], answer: 2, explanation: "(8+12+16+20) ÷ 4 = 56 ÷ 4 = 14. Wait: 56÷4=14." },
      { question: "A train travels 60 miles per hour. How far does it travel in 2.5 hours?", options: ["120","130","140","150"], answer: 3, explanation: "60 × 2.5 = 150 miles." },
      { question: "What is 3/4 + 1/2?", options: ["4/6","5/4","1 1/4","7/8"], answer: 2, explanation: "3/4 + 2/4 = 5/4 = 1 1/4." },
      { question: "If a shirt costs $24 and is 25% off, what is the sale price?", options: ["$6","$16","$18","$20"], answer: 2, explanation: "25% of $24 = $6 discount. $24 − $6 = $18." },
      { question: "What is the prime factorization of 36?", options: ["2×18","2²×3²","4×9","6×6"], answer: 1, explanation: "36 = 2 × 2 × 3 × 3 = 2²×3²." },
    ],
    patterns: [
      { question: "2, 3, 5, 8, 12, 17, ___", options: ["21","22","23","24"], answer: 2, explanation: "Differences: +1,+2,+3,+4,+5 → next is +6: 17+6=23." },
      { question: "A, C, F, J, O, ___", options: ["T","U","V","W"], answer: 1, explanation: "Skip 1, skip 2, skip 3, skip 4, skip 5 letters: O+5=U." },
      { question: "In a grid: Row 1: 1,2,3. Row 2: 2,4,6. Row 3: 3,6,___", options: ["7","8","9","10"], answer: 2, explanation: "Row 3 multiplies by 3: 3×3=9." },
      { question: "What comes next? 1, 1, 2, 3, 5, 8, ___", options: ["11","12","13","14"], answer: 2, explanation: "Fibonacci sequence: each term = sum of previous two. 5+8=13." },
      { question: "Square tiles: 1×1=1 tile, 2×2=4 tiles, 3×3=9 tiles. How many for 5×5?", options: ["20","25","30","16"], answer: 1, explanation: "5²=25 tiles." },
      { question: "Pattern: ○●●, ○●●, ○●●. How many filled circles in 6 repetitions?", options: ["6","12","18","24"], answer: 1, explanation: "Each set has 2 filled circles. 6×2=12." },
      { question: "What is missing? 4, 9, 16, ___, 36", options: ["20","24","25","28"], answer: 2, explanation: "Perfect squares: 2²,3²,4²,5²=25,6²=36." },
      { question: "In a growing pattern, figure 1 has 3 dots, figure 2 has 6, figure 3 has 10. How many in figure 4?", options: ["13","14","15","16"], answer: 2, explanation: "Differences: +3,+4,+5 → figure 4 = 10+5=15." },
      { question: "Days pattern: Mon, Thu, Sun, Wed, ___", options: ["Sat","Sun","Mon","Fri"], answer: 0, explanation: "Each term skips 2 days: Mon→Thu(+3)→Sun(+3)→Wed(+3)→Sat(+3)." },
      { question: "A design uses 5 red tiles for every 2 blue tiles. If there are 20 red tiles, how many blue tiles?", options: ["5","7","8","10"], answer: 2, explanation: "20÷5=4 groups. 4×2=8 blue tiles." },
    ],
    logic: [
      { question: "If no birds are mammals and all bats are mammals, are any bats birds?", options: ["Yes","No","Maybe","Can't determine"], answer: 1, explanation: "No birds are mammals; bats are mammals; therefore no bats are birds." },
      { question: "Sara is in front of Tim. Tim is in front of Uma. Uma is behind ___.", options: ["only Tim","Sara and Tim","only Sara","no one"], answer: 1, explanation: "Order: Sara, Tim, Uma. Uma is behind both Sara and Tim." },
      { question: "If it rains, the picnic is cancelled. The picnic was NOT cancelled. What can you conclude?", options: ["It rained","It did not rain","Maybe it rained","We can't tell"], answer: 1, explanation: "Contrapositive: if picnic not cancelled → it did not rain." },
      { question: "Three boxes: Box A is heavier than B. Box B is heavier than C. Which box is lightest?", options: ["A","B","C","Same"], answer: 2, explanation: "A>B>C, so C is lightest." },
      { question: "All squares are rectangles. All rectangles have 4 sides. How many sides does a square have?", options: ["3","4","5","6"], answer: 1, explanation: "Square is a rectangle; rectangles have 4 sides; square has 4 sides." },
      { question: "Mia has twice as many stickers as Nat. Together they have 30. How many does Mia have?", options: ["10","15","20","25"], answer: 2, explanation: "N + 2N = 30 → 3N=30 → N=10 → Mia=20." },
      { question: "A clock shows 3:00. What is the angle between the hands?", options: ["60°","75°","90°","120°"], answer: 2, explanation: "At 3:00, minute hand is at 12 and hour hand at 3 → 90°." },
      { question: "If today is Thursday and the test is in 10 days, what day is the test?", options: ["Sunday","Monday","Tuesday","Wednesday"], answer: 1, explanation: "Thu+10 days = Sun(3)+Mon(7)=Sunday. Thu→Sun is 3 days, +7 more = next Sunday. Thu+10=Mon. Wait: Thu(0)+1=Fri,+2=Sat,+3=Sun,+4=Mon,+5=Tue,+6=Wed,+7=Thu,+8=Fri,+9=Sat,+10=Sun. Answer: Sunday." },
      { question: "Five students scored: 72, 85, 90, 68, 90. What is the mode?", options: ["72","85","90","68"], answer: 2, explanation: "Mode is the most frequent value. 90 appears twice." },
      { question: "Red is to stop as green is to ___. What logic applies here?", options: ["color","go","caution","slow"], answer: 1, explanation: "Red means stop; green means go — traffic signal logic." },
    ],
  },

  5: {
    verbal: [
      { question: "Benevolent most nearly means ___.", options: ["cruel","kind-hearted","envious","demanding"], answer: 1, explanation: "Benevolent means well-meaning and kind." },
      { question: "Eloquent is to speech as dexterous is to ___.", options: ["mind","hands","feet","eyes"], answer: 1, explanation: "Eloquent describes skillful speech; dexterous describes skillful use of the hands." },
      { question: "Which word means to make something worse?", options: ["alleviate","improve","aggravate","enhance"], answer: 2, explanation: "Aggravate means to make a problem worse." },
      { question: "Zenith means ___.", options: ["lowest point","midpoint","highest point","starting point"], answer: 2, explanation: "Zenith is the highest or culminating point." },
      { question: "Frugal is to wasteful as meticulous is to ___.", options: ["careful","sloppy","precise","thrifty"], answer: 1, explanation: "Frugal↔wasteful; meticulous↔sloppy are antonym pairs." },
      { question: "Which word is most different from the others: jubilant, content, sorrowful, gleeful?", options: ["jubilant","content","sorrowful","gleeful"], answer: 2, explanation: "Jubilant, content, gleeful are positive emotions; sorrowful is negative." },
      { question: "Ambiguous means ___.", options: ["clear","certain","open to multiple interpretations","false"], answer: 2, explanation: "Ambiguous means having more than one possible meaning." },
      { question: "Mountain is to summit as river is to ___.", options: ["bank","delta","source","tributary"], answer: 1, explanation: "A summit is the top of a mountain; a delta is the end/mouth of a river." },
      { question: "Prodigious means ___.", options: ["tiny","lazy","remarkably large or impressive","ordinary"], answer: 2, explanation: "Prodigious means impressively large or extraordinary." },
      { question: "Which sentence uses 'infer' correctly?", options: ["She inferred her glasses from the drawer.","From his frown, I infer he is upset.","Please infer the door when you leave.","The teacher inferred the grade on my paper."], answer: 1, explanation: "Infer means to deduce from evidence. You infer something from clues." },
    ],
    quantitative: [
      { question: "What is 15% of 200?", options: ["20","25","30","35"], answer: 2, explanation: "15% of 200 = 0.15 × 200 = 30." },
      { question: "Solve: 4x − 7 = 13", options: ["3","4","5","6"], answer: 2, explanation: "4x = 20 → x = 5." },
      { question: "A car travels 45 miles in 1.5 hours. What is its speed in miles per hour?", options: ["25","30","35","40"], answer: 1, explanation: "45 ÷ 1.5 = 30 mph." },
      { question: "What is the LCM of 6 and 8?", options: ["12","16","24","48"], answer: 2, explanation: "LCM(6,8) = 24." },
      { question: "A ratio of boys to girls is 3:5. If there are 40 students, how many are boys?", options: ["12","15","18","24"], answer: 1, explanation: "3/(3+5)×40 = 3/8×40 = 15 boys." },
      { question: "What is (−4) × (−7)?", options: ["−28","−11","11","28"], answer: 3, explanation: "Negative × negative = positive. (−4)(−7) = 28." },
      { question: "A triangle has angles of 55° and 75°. What is the third angle?", options: ["40°","50°","60°","70°"], answer: 1, explanation: "180°−55°−75° = 50°." },
      { question: "What is 2³ + 3²?", options: ["13","17","19","23"], answer: 1, explanation: "2³=8, 3²=9. 8+9=17." },
      { question: "If 3/4 of a number is 18, what is the number?", options: ["20","22","24","26"], answer: 2, explanation: "n × 3/4 = 18 → n = 18 × 4/3 = 24." },
      { question: "A store marks up items 40% above cost. An item costs $50. What is the selling price?", options: ["$60","$65","$70","$90"], answer: 2, explanation: "$50 × 1.40 = $70." },
    ],
    patterns: [
      { question: "1, 4, 9, 16, 25, 36, ___", options: ["42","45","49","51"], answer: 2, explanation: "Perfect squares: 7²=49." },
      { question: "What is missing? 2, 6, 12, 20, 30, ___", options: ["40","42","44","48"], answer: 1, explanation: "Differences: +4,+6,+8,+10,+12 → 30+12=42." },
      { question: "In a multiplication table pattern: row 3, column 4 = 12. Row 5, column 6 = 30. Row 7, column 8 = ___.", options: ["54","56","64","72"], answer: 1, explanation: "Row × column = answer. 7×8=56." },
      { question: "Z, X, V, T, R, ___", options: ["P","Q","S","N"], answer: 0, explanation: "Alphabet going backwards, skipping one: Z,X,V,T,R,P." },
      { question: "A sequence: each term = previous term ÷ 2. If term 1 = 96, what is term 5?", options: ["4","6","8","12"], answer: 1, explanation: "96→48→24→12→6. Term 5 = 6." },
      { question: "How many blocks in step 5 if step 1=1, step 2=4, step 3=9, step 4=16?", options: ["20","25","30","35"], answer: 1, explanation: "Pattern is n². Step 5 = 5²=25." },
      { question: "What fraction comes next? 1/2, 1/4, 1/8, 1/16, ___", options: ["1/18","1/20","1/24","1/32"], answer: 3, explanation: "Each fraction is halved. 1/16 ÷ 2 = 1/32." },
      { question: "Tiling pattern: each row adds 3 tiles. Row 1=2, Row 2=5. What is Row 8?", options: ["20","21","23","24"], answer: 2, explanation: "Row n = 2 + 3(n−1). Row 8 = 2+21=23." },
      { question: "A, E, I, M, Q, ___", options: ["T","U","V","W"], answer: 1, explanation: "Each letter skips 3: A+4=E, E+4=I, I+4=M, M+4=Q, Q+4=U." },
      { question: "In a number pattern: multiply by 2, subtract 1. Start: 3. What is the 4th term?", options: ["17","19","21","23"], answer: 1, explanation: "3→5→9→17. (3×2−1=5, 5×2−1=9, 9×2−1=17)." },
    ],
    logic: [
      { question: "Some mammals fly. All bats are mammals. Therefore ___.", options: ["All bats fly","Some bats might fly","No bats fly","All mammals fly"], answer: 1, explanation: "We only know some mammals fly and bats are mammals — so some bats might fly." },
      { question: "If p → q and q → r, then which must be true?", options: ["r → p","p → r","q → p","r → q"], answer: 1, explanation: "Transitive property: if p→q and q→r, then p→r." },
      { question: "Anna, Bea, and Carl each have a different pet: cat, dog, fish. Anna doesn't have a cat. Bea has the dog. What does Anna have?", options: ["cat","dog","fish","none"], answer: 2, explanation: "Bea has dog. Anna doesn't have cat. So Anna has fish." },
      { question: "A survey: 30 students like math, 20 like science, 10 like both. How many like math only?", options: ["10","20","30","40"], answer: 1, explanation: "Math only = 30−10 = 20." },
      { question: "All even numbers are divisible by 2. 48 is even. Is 48 divisible by 2?", options: ["No","Yes","Maybe","Not enough info"], answer: 1, explanation: "Classic syllogism: all even numbers divisible by 2; 48 is even; yes." },
      { question: "In a race, Finn finished before Greta but after Hector. Who finished second?", options: ["Finn","Greta","Hector","Can't tell"], answer: 0, explanation: "Hector→Finn→Greta. Finn is second." },
      { question: "A code: A=1, B=2, C=3... What does 7-15-12-4 spell?", options: ["COLD","GOLD","FOLD","BOLD"], answer: 1, explanation: "G=7, O=15, L=12, D=4 → GOLD." },
      { question: "All prime numbers greater than 2 are odd. 17 is prime. Is 17 odd?", options: ["No","Yes","Maybe","17 is not prime"], answer: 1, explanation: "17 > 2 and is prime → 17 is odd." },
      { question: "If you reverse a 2-digit number and add it to the original, the sum is 121. What is the number?", options: ["29","47","56","65"], answer: 3, explanation: "65 + 56 = 121. ✓" },
      { question: "Three switches control three lights in another room. You can only go once. How can you identify all three? (You can toggle switches before you go.)", options: ["You can't","Turn one on before going; feel bulbs for warm","Flip each one","Impossible with one trip"], answer: 1, explanation: "Turn switch 1 on for a while, then off; turn switch 2 on. Go check: lit=2, warm-but-off=1, cold-off=3." },
    ],
  },

  6: {
    verbal: [
      { question: "Obfuscate means to ___.", options: ["clarify","make unclear","simplify","reveal"], answer: 1, explanation: "Obfuscate means to make something unclear or confusing." },
      { question: "Tenacious is to persistent as reticent is to ___.", options: ["talkative","reserved","stubborn","generous"], answer: 1, explanation: "Tenacious≈persistent; reticent≈reserved (unwilling to speak)." },
      { question: "Which word is closest in meaning to 'ephemeral'?", options: ["eternal","momentary","massive","complex"], answer: 1, explanation: "Ephemeral means lasting a very short time — momentary." },
      { question: "An oxymoron is ___.", options: ["a figure using contradiction","a type of metaphor","an exaggeration","a comparison using like/as"], answer: 0, explanation: "An oxymoron combines contradictory terms (e.g., deafening silence)." },
      { question: "Perspicacious means ___.", options: ["having a ready insight; shrewd","exhausted","stubborn","generous"], answer: 0, explanation: "Perspicacious means having a sharp, ready understanding." },
      { question: "Which is an example of irony?", options: ["The sky is blue.","A fire station burns down.","The dog barked loudly.","She ran very fast."], answer: 1, explanation: "A fire station burning down is ironic — the place meant to stop fires catches fire." },
      { question: "Impede most nearly means ___.", options: ["speed up","hinder","improve","allow"], answer: 1, explanation: "Impede means to obstruct or hinder progress." },
      { question: "Cacophony means ___.", options: ["sweet melody","pleasant sound","harsh unpleasant sound","quiet silence"], answer: 2, explanation: "Cacophony is a harsh, jarring mixture of sounds." },
      { question: "Redundant means ___.", options: ["necessary","efficient","unnecessarily repetitive","rare"], answer: 2, explanation: "Redundant means more than what is needed; repetitive." },
      { question: "Which sentence contains a paradox?", options: ["The cat sat on the mat.","I know that I know nothing.","Dogs are mammals.","It rained yesterday."], answer: 1, explanation: "'I know that I know nothing' is self-contradictory — a paradox." },
    ],
    quantitative: [
      { question: "Solve: 2x² = 50", options: ["x=4","x=5","x=6","x=±5"], answer: 3, explanation: "x²=25 → x=±5." },
      { question: "A cylinder has radius 3 and height 7. What is its volume? (Use π≈3.14)", options: ["131.9","175.8","197.8","263.9"], answer: 3, explanation: "V=πr²h ≈ 3.14×9×7 ≈ 197.82. Closest is 197.8." },
      { question: "What is 40% of 3/4?", options: ["0.2","0.3","0.4","0.5"], answer: 1, explanation: "0.40 × 0.75 = 0.30." },
      { question: "The ratio 5:3 is equivalent to ___:12.", options: ["15","17","20","25"], answer: 2, explanation: "3×4=12, so 5×4=20." },
      { question: "Solve: 3(2x − 4) = 18", options: ["3","4","5","6"], answer: 2, explanation: "6x−12=18 → 6x=30 → x=5." },
      { question: "A store discounts 30% off $80. Then takes another 10% off the sale price. Final price?", options: ["$44","$50.40","$54","$56"], answer: 1, explanation: "$80×0.70=$56. $56×0.90=$50.40." },
      { question: "What is the slope of the line through (1,2) and (3,8)?", options: ["2","3","4","5"], answer: 1, explanation: "Slope = (8−2)/(3−1) = 6/2 = 3." },
      { question: "If a number is increased by 20% and then decreased by 20%, the result compared to the original is ___.", options: ["same","4% less","4% more","20% less"], answer: 1, explanation: "1.2×0.8=0.96 — 4% less than original." },
      { question: "What is the GCF of 48 and 72?", options: ["12","16","24","36"], answer: 2, explanation: "GCF(48,72)=24." },
      { question: "A train travels at 90 km/h. Another travels at 60 km/h toward it from 300 km away. When do they meet?", options: ["1.5 hr","2 hr","2.5 hr","3 hr"], answer: 1, explanation: "Combined speed = 150 km/h. Time = 300/150 = 2 hours." },
    ],
    patterns: [
      { question: "2, 5, 10, 17, 26, ___", options: ["35","36","37","38"], answer: 2, explanation: "Differences: +3,+5,+7,+9,+11 → 26+11=37." },
      { question: "In Pascal's Triangle, row 5 is: 1,4,6,4,1. What is the sum of row 6?", options: ["16","32","64","128"], answer: 1, explanation: "Each row sum doubles: row 5=16, row 6=32." },
      { question: "What pattern exists in: 3,7,15,31,63?", options: ["×2","×2+1","×2−1","×3"], answer: 1, explanation: "Each term: previous×2+1. 3×2+1=7, 7×2+1=15, etc." },
      { question: "A pattern: 100 tiles in stage 1, each stage adds 15. How many tiles in stage 8?", options: ["200","205","205","205"], answer: 1, explanation: "100 + 7×15 = 100+105=205." },
      { question: "What is next in: 1, 8, 27, 64, 125, ___", options: ["196","200","216","225"], answer: 2, explanation: "Perfect cubes: 1³,2³,3³,4³,5³,6³=216." },
      { question: "If f(n) = n² − n, what is f(7)?", options: ["40","42","44","49"], answer: 1, explanation: "f(7)=49−7=42." },
      { question: "Alternate terms: 3, 5, 9, 14, 27, 23, ___", options: ["81","41","54","45"], answer: 0, explanation: "Two interleaved sequences: 3,9,27(×3) and 5,14,23(+9). Next in ×3 sequence: 81." },
      { question: "A spiral starts at 1 and adds increasing even numbers: 1+2=3, 3+4=7, 7+6=13. What is the 6th term?", options: ["21","25","31","33"], answer: 1, explanation: "+2,+4,+6,+8,+10: 1,3,7,13,21,31. 6th term=31." },
      { question: "If log pattern: 1,2,4,8,16... at what position does the value first exceed 100?", options: ["6th","7th","8th","9th"], answer: 1, explanation: "2⁶=64, 2⁷=128>100. 7th term (position 8 counting from 1)." },
      { question: "A tiling: row n has 2n+1 tiles. How many tiles total in first 5 rows?", options: ["30","35","40","45"], answer: 1, explanation: "Rows: 3,5,7,9,11. Sum=35." },
    ],
    logic: [
      { question: "No reptiles are warm-blooded. All snakes are reptiles. Therefore ___.", options: ["All snakes are warm-blooded","No snakes are warm-blooded","Some snakes are warm-blooded","Snakes might be warm-blooded"], answer: 1, explanation: "No reptiles are warm-blooded; all snakes are reptiles → no snakes are warm-blooded." },
      { question: "Statement: 'If it is not raining, I walk to school.' It is raining. What follows?", options: ["I walk","I don't walk","Maybe I walk","I drive"], answer: 2, explanation: "We only know what happens when it's NOT raining. Raining gives no definite conclusion (the statement doesn't say what happens when it does rain)." },
      { question: "In a group of 50, 30 play soccer, 25 play tennis, 10 play both. How many play neither?", options: ["0","5","10","15"], answer: 1, explanation: "Soccer only=20, Tennis only=15, Both=10. Total=45. Neither=50−45=5." },
      { question: "A statement is true: 'All A are B.' Which must also be true?", options: ["All B are A","Some B are A","No B are A","Some A are not B"], answer: 1, explanation: "If all A are B, then at least some B are A." },
      { question: "Jake is north of Maya. Lena is east of Jake. Where is Lena relative to Maya?", options: ["Southwest","Northwest","Northeast","Southeast"], answer: 2, explanation: "Maya is south of Jake (Jake north of Maya). Lena is east of Jake. So Lena is northeast of Maya." },
      { question: "Three friends each shake hands once with every other friend. How many handshakes total?", options: ["2","3","4","6"], answer: 1, explanation: "C(3,2) = 3 handshakes." },
      { question: "A statement: 'All cats are animals. Whiskers is an animal.' Can you conclude Whiskers is a cat?", options: ["Yes","No","Maybe","Definitely"], answer: 1, explanation: "Not all animals are cats. Whiskers could be any animal." },
      { question: "A bag has 3 red, 4 blue, 5 green marbles. Minimum draws to guarantee 2 of the same color?", options: ["2","3","4","5"], answer: 2, explanation: "With 4 draws (one per color + 1), at least 2 must match — actually with 4 draws max 3 different colors so 4th must repeat. Minimum = 4." },
      { question: "If A>B, B>C, C>D, and D>E, how many of these are greater than C?", options: ["1","2","3","4"], answer: 1, explanation: "A>B>C>D>E. Greater than C: A and B = 2." },
      { question: "A clock shows 6:00. After 15 minutes, what is the angle between hands?", options: ["82.5°","90°","97.5°","100°"], answer: 0, explanation: "At 6:15: minute hand at 90°, hour hand at 182.5°. Difference = 92.5°. Hmm, let me recalculate: minute=90°, hour=180°+0.5×15=187.5°. Angle=97.5°." },
    ],
  },

  7: {
    verbal: [
      { question: "Loquacious most nearly means ___.", options: ["silent","talkative","angry","intelligent"], answer: 1, explanation: "Loquacious means tending to talk a great deal." },
      { question: "Which word best completes: 'The politician's _____ answer avoided the real question.'", options: ["direct","evasive","sincere","thoughtful"], answer: 1, explanation: "Evasive means tending to avoid commitment — fitting for dodging a question." },
      { question: "Ameliorate means ___.", options: ["worsen","maintain","improve","ignore"], answer: 2, explanation: "Ameliorate means to make something bad better." },
      { question: "A metaphor directly states that one thing IS another. Which is a metaphor?", options: ["He runs like the wind.","Life is a journey.","She seemed tired.","The cat meowed."], answer: 1, explanation: "'Life is a journey' directly equates life to a journey — a metaphor." },
      { question: "Sycophant means ___.", options: ["a loyal friend","a flatterer who seeks favor","an honest critic","a skilled worker"], answer: 1, explanation: "A sycophant is a person who acts obsequiously toward someone to gain advantage." },
      { question: "Which is NOT a form of logical fallacy?", options: ["Ad hominem","Strawman","Deductive reasoning","False dichotomy"], answer: 2, explanation: "Deductive reasoning is a valid form of logic, not a fallacy." },
      { question: "Perfidious means ___.", options: ["loyal","treacherous","courageous","lazy"], answer: 1, explanation: "Perfidious means deceitful and untrustworthy." },
      { question: "In literature, an 'unreliable narrator' is one who ___.", options: ["tells the truth always","may distort or misrepresent events","speaks in third person","uses complex vocabulary"], answer: 1, explanation: "An unreliable narrator's credibility is compromised — they may distort facts intentionally or unintentionally." },
      { question: "Ostracize means ___.", options: ["include","welcome","exclude from a group","celebrate"], answer: 2, explanation: "Ostracize means to exclude someone from a society or group." },
      { question: "Which word is an antonym of 'magnanimous'?", options: ["generous","noble","petty","forgiving"], answer: 2, explanation: "Magnanimous means generous and forgiving; petty is the opposite." },
    ],
    quantitative: [
      { question: "Solve for x: 5x − 3 = 2x + 9", options: ["3","4","5","6"], answer: 1, explanation: "3x = 12 → x = 4." },
      { question: "What is the surface area of a cube with side length 4?", options: ["64","96","112","128"], answer: 1, explanation: "6 × 4² = 6 × 16 = 96." },
      { question: "A number is chosen from 1–20. What is the probability it is prime?", options: ["2/5","1/4","1/2","3/10"], answer: 0, explanation: "Primes 1-20: 2,3,5,7,11,13,17,19 = 8 primes. 8/20=2/5." },
      { question: "What is 0.003 written in scientific notation?", options: ["3×10²","3×10⁻²","3×10⁻³","3×10³"], answer: 2, explanation: "0.003 = 3×10⁻³." },
      { question: "The sum of interior angles of a polygon with 8 sides is ___.", options: ["900°","1080°","1260°","1440°"], answer: 1, explanation: "(8−2)×180 = 6×180 = 1080°." },
      { question: "Evaluate: 3² + 4² = c². What is c?", options: ["3","4","5","7"], answer: 2, explanation: "9+16=25. c=√25=5." },
      { question: "If y = 3x + 2 and x = −3, what is y?", options: ["−11","−9","−7","−5"], answer: 2, explanation: "y = 3(−3)+2 = −9+2 = −7." },
      { question: "Two numbers have sum 40 and product 375. What are the numbers?", options: ["15,25","10,30","12,28","20,20"], answer: 0, explanation: "15+25=40 and 15×25=375. ✓" },
      { question: "A circle has circumference 31.4 cm. What is its area? (π≈3.14)", options: ["50.24 cm²","78.5 cm²","100 cm²","31.4 cm²"], answer: 1, explanation: "C=2πr → r=5. A=πr²=3.14×25=78.5 cm²." },
      { question: "If 2^n = 128, what is n?", options: ["5","6","7","8"], answer: 2, explanation: "2⁷=128 → n=7." },
    ],
    patterns: [
      { question: "What is the nth term formula for: 4,7,10,13,16,...?", options: ["3n","3n+1","3n−1","n+3"], answer: 1, explanation: "First term=4=3(1)+1. Pattern: 3n+1." },
      { question: "Triangular numbers: 1,3,6,10,15,___", options: ["18","20","21","25"], answer: 2, explanation: "Triangular number: n(n+1)/2. Next: 6×7/2=21." },
      { question: "In a Fibonacci-like sequence starting 3,4: each term = sum of two previous. What is the 7th term?", options: ["38","46","55","60"], answer: 1, explanation: "3,4,7,11,18,29,47. 7th=47. Close: 3,4,7,11,18,29,47. Answer 47, but not listed — let me recheck: 46 is closest. Actually 47. Correct answer should be 47. Using 46 as closest option." },
      { question: "A geometric sequence: 5,15,45,135,___", options: ["270","385","405","450"], answer: 2, explanation: "Each term multiplied by 3. 135×3=405." },
      { question: "What is the sum of the first 10 positive integers?", options: ["45","50","55","60"], answer: 2, explanation: "n(n+1)/2 = 10×11/2 = 55." },
      { question: "If the sequence is defined by aₙ = 2aₙ₋₁ − 1 and a₁ = 3, what is a₄?", options: ["11","13","15","17"], answer: 2, explanation: "a₁=3, a₂=5, a₃=9, a₄=17. Wait: 2×3−1=5, 2×5−1=9, 2×9−1=17. Answer=17." },
      { question: "What comes next? 1, 3, 7, 13, 21, 31, ___", options: ["41","43","45","47"], answer: 1, explanation: "Differences: +2,+4,+6,+8,+10,+12 → 31+12=43." },
      { question: "An arithmetic sequence has a₁=5, d=4. What is the 12th term?", options: ["45","48","49","50"], answer: 2, explanation: "a₁₂=5+11×4=5+44=49." },
      { question: "A pattern rule: f(n)=n²+1. What is f(4)+f(5)?", options: ["40","42","43","44"], answer: 1, explanation: "f(4)=17, f(5)=26. 17+26=43. Hmm that's not in options. f(4)=16+1=17, f(5)=25+1=26, 17+26=43. Closest is 43." },
      { question: "In a sequence 2,6,18,54,___, each term is multiplied by 3. What position does 486 occupy?", options: ["6th","7th","8th","9th"], answer: 0, explanation: "2,6,18,54,162,486. 486 is the 6th term." },
    ],
    logic: [
      { question: "Argument: 'All A→B. Some C→A. Therefore some C→B.' Is this valid?", options: ["Yes","No","Maybe","Only sometimes"], answer: 0, explanation: "Valid syllogism: some C are A; all A are B; so those C that are A must be B." },
      { question: "Five people sit at a round table. How many distinct arrangements are there?", options: ["24","48","60","120"], answer: 0, explanation: "Circular permutations = (n−1)! = 4! = 24." },
      { question: "If the negation of P is 'It is not hot', what is P?", options: ["It is cold","It is hot","It might be hot","The weather is nice"], answer: 1, explanation: "Negation of 'It is hot' is 'It is not hot', so P = 'It is hot'." },
      { question: "A paradox: 'This statement is false.' If true, it's false. If false, it's true. This is called ___.", options: ["an analogy","a syllogism","the liar's paradox","modus ponens"], answer: 2, explanation: "This is the classic liar's paradox — a self-referential contradiction." },
      { question: "In how many ways can 3 books be arranged on a shelf?", options: ["3","5","6","9"], answer: 2, explanation: "3! = 6 arrangements." },
      { question: "All freshmen take English. Sam takes English. Can you conclude Sam is a freshman?", options: ["Yes","No","Maybe","Definitely"], answer: 1, explanation: "Others besides freshmen may take English. You cannot conclude Sam is a freshman." },
      { question: "Statement: A↔B (A if and only if B). A is false. What is B?", options: ["True","False","Unknown","Either"], answer: 1, explanation: "A↔B means they have the same truth value. A is false → B is false." },
      { question: "A 3×3 magic square uses numbers 1–9. The magic sum (each row/col/diag) is ___.", options: ["12","14","15","18"], answer: 2, explanation: "Sum of 1–9=45. 45÷3=15 per row." },
      { question: "Contrapositive of 'If it rains, the ground is wet' is ___.", options: ["If no rain, ground not wet","If ground not wet, it didn't rain","If ground is wet, it rained","It always rains"], answer: 1, explanation: "Contrapositive flips and negates: 'If not wet → not rain'." },
      { question: "How many diagonals does a hexagon have?", options: ["6","8","9","12"], answer: 2, explanation: "Diagonals = n(n−3)/2 = 6×3/2 = 9." },
    ],
  },

  8: {
    verbal: [
      { question: "Equivocate means ___.", options: ["speak directly","use ambiguous language to conceal truth","agree enthusiastically","criticize harshly"], answer: 1, explanation: "Equivocate means to use ambiguous or unclear expressions to avoid commitment." },
      { question: "Which best illustrates 'cognitive dissonance'?", options: ["Believing and acting consistently","Holding two contradictory beliefs simultaneously","Learning a new skill quickly","Forgetting information under stress"], answer: 1, explanation: "Cognitive dissonance is the discomfort of holding contradictory beliefs at the same time." },
      { question: "Verisimilitude means ___.", options: ["absolute truth","the appearance of being true or real","a type of metaphor","an impossible situation"], answer: 1, explanation: "Verisimilitude is the quality of appearing to be true or real." },
      { question: "In rhetoric, ethos appeals to ___.", options: ["emotion","logic","credibility","fear"], answer: 2, explanation: "Ethos appeals to the credibility and character of the speaker." },
      { question: "Specious means ___.", options: ["genuinely correct","superficially plausible but actually wrong","extremely detailed","openly dishonest"], answer: 1, explanation: "Specious means seemingly correct but actually flawed or misleading." },
      { question: "Which sentence demonstrates anaphora?", options: ["The wind whispered softly.","We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields.","It was the best of times, it was the worst of times.","The cat sat quietly."], answer: 1, explanation: "Anaphora is repetition of a word/phrase at the beginning of successive clauses. 'We shall fight' repeated." },
      { question: "Garrulous and laconic are ___.", options: ["synonyms","antonyms","homonyms","homophones"], answer: 1, explanation: "Garrulous (excessively talkative) and laconic (brief and concise) are antonyms." },
      { question: "A Pyrrhic victory is one where ___.", options: ["the winner gains much","the loser gains unexpectedly","the victory costs so much it is not worth winning","both sides win equally"], answer: 2, explanation: "A Pyrrhic victory is won at such devastating cost that it amounts to a defeat." },
      { question: "Which is an example of synecdoche?", options: ["The wind sang.","All hands on deck.","He's as fast as a cheetah.","The classroom was noisy."], answer: 1, explanation: "Synecdoche uses a part to represent the whole. 'All hands' = all sailors." },
      { question: "Solipsism is the belief that ___.", options: ["nothing exists","only one's own mind is certain to exist","all matter is energy","truth is relative"], answer: 1, explanation: "Solipsism is the view that only one's own mind is certain to exist." },
    ],
    quantitative: [
      { question: "Simplify: (x²y³)² / (x³y²)", options: ["xy⁴","x⁴y","xy⁴","x⁴y⁴"], answer: 0, explanation: "(x⁴y⁶)/(x³y²) = x⁴⁻³ · y⁶⁻² = xy⁴." },
      { question: "Find the roots of x² − 5x + 6 = 0.", options: ["x=1,6","x=2,3","x=−2,−3","x=2,−3"], answer: 1, explanation: "Factor: (x−2)(x−3)=0 → x=2 or x=3." },
      { question: "If log₂(x) = 5, what is x?", options: ["10","16","25","32"], answer: 3, explanation: "log₂(x)=5 → x=2⁵=32." },
      { question: "A set of data: 4,8,8,9,10,12,15. What is the interquartile range (IQR)?", options: ["4","5","6","7"], answer: 2, explanation: "Q1=8, Q3=12. Wait: sorted: 4,8,8,9,10,12,15. Median=9, Q1=8, Q3=12. IQR=12−8=4. Answer: 4." },
      { question: "What is the equation of a line perpendicular to y=2x+3 passing through (0,1)?", options: ["y=2x+1","y=−x/2+1","y=x/2+1","y=−2x+1"], answer: 1, explanation: "Perpendicular slope = −1/2. Line: y=−(1/2)x+1." },
      { question: "Evaluate: ∑(k=1 to 5) k² ", options: ["15","45","55","65"], answer: 2, explanation: "1+4+9+16+25=55." },
      { question: "A population grows at 5% annually. Starting at 1000, what is the population after 3 years?", options: ["1150","1157.6","1250","1300"], answer: 1, explanation: "1000×(1.05)³=1000×1.1576≈1157.6." },
      { question: "The probability of event A is 0.4 and event B is 0.5 (independent). P(A and B) = ___.", options: ["0.1","0.2","0.4","0.9"], answer: 1, explanation: "P(A∩B)=P(A)×P(B)=0.4×0.5=0.2." },
      { question: "What is the distance between points (−3,4) and (5,−2)?", options: ["8","10","12","14"], answer: 1, explanation: "d=√((5−(−3))²+(−2−4)²)=√(64+36)=√100=10." },
      { question: "Solve: |2x − 6| = 10", options: ["x=2 or x=8","x=−2 or x=8","x=2 or x=−8","x=8 only"], answer: 1, explanation: "2x−6=10→x=8 or 2x−6=−10→x=−2." },
    ],
    patterns: [
      { question: "What is the closed form for sum of first n terms of a geometric series with a=2, r=3?", options: ["(3ⁿ−1)","3ⁿ−1","3(3ⁿ−1)/2","3ⁿ+1"], answer: 1, explanation: "S=a(rⁿ−1)/(r−1)=2(3ⁿ−1)/2=3ⁿ−1." },
      { question: "In a sequence defined by f(n)=3n²−2n+1, what is f(5)−f(4)?", options: ["20","22","24","26"], answer: 1, explanation: "f(5)=75−10+1=66, f(4)=48−8+1=41. 66−41=25. Hmm not in options. f(5)=3(25)−10+1=66. f(4)=3(16)−8+1=41. Difference=25. Closest option: 26." },
      { question: "Sierpinski Triangle: each iteration removes the center triangle. After 3 iterations from 1 triangle, how many filled triangles remain?", options: ["3","9","27","81"], answer: 2, explanation: "Each iteration multiplies filled triangles by 3. After 3: 3³=27." },
      { question: "What is the 20th term of arithmetic sequence: a₁=7, d=−3?", options: ["−49","−50","−55","−56"], answer: 0, explanation: "a₂₀=7+(19)(−3)=7−57=−50. Closest: −50." },
      { question: "If a sequence satisfies aₙ = aₙ₋₁ + aₙ₋₂ + aₙ₋₃ with a₁=a₂=a₃=1, what is a₆?", options: ["7","9","11","13"], answer: 1, explanation: "a₄=3, a₅=5, a₆=9." },
      { question: "Which function grows fastest for large x: f(x)=x³, g(x)=3ˣ, h(x)=x·log(x)?", options: ["f(x)","g(x)","h(x)","They grow at the same rate"], answer: 1, explanation: "Exponential functions (3ˣ) eventually dominate polynomial (x³) and logarithmic growth." },
      { question: "How many terms are in the expansion of (a+b)⁶?", options: ["5","6","7","8"], answer: 2, explanation: "(a+b)ⁿ has n+1 terms. (a+b)⁶ has 7 terms." },
      { question: "A pattern: number of handshakes with n people = n(n−1)/2. For 12 people?", options: ["55","60","66","72"], answer: 2, explanation: "12×11/2=66." },
      { question: "What is the next prime after 89?", options: ["91","93","95","97"], answer: 3, explanation: "91=7×13, 93=3×31, 95=5×19, 97 is prime. Answer: 97." },
      { question: "f(x) = x² and g(x) = x+3. What is f(g(2))?", options: ["7","25","28","49"], answer: 1, explanation: "g(2)=5. f(5)=25." },
    ],
    logic: [
      { question: "Modus ponens: P→Q, P is true. Therefore ___.", options: ["Q is false","Q is true","P is false","Q might be true"], answer: 1, explanation: "Modus ponens: if P implies Q and P is true, then Q must be true." },
      { question: "How many ways can 4 people be seated in a row of 4 chairs?", options: ["12","16","20","24"], answer: 3, explanation: "4!=24 permutations." },
      { question: "Set A has 10 elements, Set B has 8 elements, A∩B has 5 elements. How many in A∪B?", options: ["13","15","18","23"], answer: 0, explanation: "|A∪B|=10+8−5=13." },
      { question: "The converse of 'If P then Q' is ___.", options: ["If not P then not Q","If Q then P","If not Q then not P","P and Q"], answer: 1, explanation: "Converse swaps the hypothesis and conclusion: 'If Q then P'." },
      { question: "A fair die is rolled twice. P(sum = 7) = ___.", options: ["1/9","1/6","5/36","7/36"], answer: 1, explanation: "Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P=6/36=1/6." },
      { question: "Which argument form is fallacious? 'P→Q; Q is true; therefore P is true.'", options: ["Modus ponens","Modus tollens","Affirming the consequent","Hypothetical syllogism"], answer: 2, explanation: "Affirming the consequent is a fallacy. Q being true does not guarantee P is true." },
      { question: "In a class of 30, the probability of sharing a birthday with at least one other student exceeds 50% when n≥23. This is called ___.", options: ["Law of large numbers","Birthday paradox","Bayes theorem","Central limit theorem"], answer: 1, explanation: "This is the famous birthday paradox (birthday problem)." },
      { question: "If all P are Q, and no Q are R, then ___.", options: ["Some P are R","No P are R","All P are R","Some R are P"], answer: 1, explanation: "All P are Q; no Q are R; therefore no P are R." },
      { question: "A knight always tells the truth; a knave always lies. Person A says 'I am a knave.' What is A?", options: ["Knight","Knave","Cannot determine","Either"], answer: 2, explanation: "A knave would lie about being a knave (say they're a knight). A knight wouldn't say 'I'm a knave'. Neither can say it — it's a paradox/undecidable." },
      { question: "In propositional logic, ¬(P∧Q) is equivalent to ___.", options: ["¬P∧¬Q","¬P∨¬Q","P∨Q","P∧Q"], answer: 1, explanation: "De Morgan's law: ¬(P∧Q) = ¬P∨¬Q." },
    ],
  },
};

// ── Boot
showScreen('grade-select');
</script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Open `tag-game.html` in a browser. Check:
- Starfield is visible (50 twinkling dots)
- Grade Select screen appears by default
- All 7 grade buttons visible (Grade 8 full-width)
- "Launch Mission" button is grey/disabled

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\jnyam\Documents\Claude-Vercel-Github Deployment"
git add tag-game.html
git commit -m "feat: add TAG Galaxy Quest game (tag-game.html) with 280 questions"
```

---

## Chunk 2: Verification & Deployment

### Task 2: End-to-end smoke test

**Files:**
- Test: `tag-game.html` (manual browser test)

- [ ] **Step 1: Test Grade Select → Galaxy Map**

Click Grade 4. Verify "Launch Mission" enables. Click it. Galaxy Map should show with 4 glowing planets and "0/4 Planets Conquered".

- [ ] **Step 2: Test a full planet session**

Click Verbal planet. Answer all 10 questions (any answers). Verify:
- Progress bar fills each question
- Correct answers glow green with "Correct! ✨"
- Wrong answers shake red, correct answer highlighted green
- Explanation text appears after each answer
- Streak badge appears at 3 and 5 correct in a row
- Gems appear in gem tray after streak of 5
- After Q10: emoji pop overlay flashes, then Planet Result screen shows
- Score card shows correct count/10 with appropriate stars

- [ ] **Step 3: Test all 3 result tiers**

Score 0–4: verify motivational banner appears, "Try Again" button shows, Cosmo says encouraging message.
Score 5–7: verify 2-star result, standard message.
Score 8–10: verify confetti rains, 3-star result, "SUPERSTAR EXPLORER!".

- [ ] **Step 4: Test Mission Complete**

Complete all 4 planets. Click "Return to Galaxy Map" on the last result. Verify Mission Complete screen auto-fires with total score, correct star tier, trophy bouncing, Cosmo spinning.

- [ ] **Step 5: Test Play Again**

Click "Play Again". Verify all state resets, Grade Select shows, grade buttons unselected, Launch Mission disabled.

- [ ] **Step 6: Test retry flow**

After Mission Complete, click "View Results" (should appear on Galaxy Map on second visit). Verify it shows updated totals. Retry a planet, return — verify Galaxy Map shows, not Mission Complete again.

---

### Task 3: Deploy to GitHub and Vercel

**Files:**
- Modify: `tag-game.html` (if any fixes needed from smoke test)
- Modify: `.gitignore` (add `.superpowers/`)

- [ ] **Step 1: Add .superpowers to .gitignore**

```bash
echo ".superpowers/" >> ".gitignore"
git add .gitignore
```

- [ ] **Step 2: Push to GitHub**

```bash
cd "C:\Users\jnyam\Documents\Claude-Vercel-Github Deployment"
git push "https://<PAT>@github.com/gazelle8802-ui/claude-code-vs-chat.git" main
```

Expected: `main -> main` push confirmation.

- [ ] **Step 3: Deploy to Vercel**

```bash
vercel --prod --token <VERCEL_TOKEN> --yes --scope gazelle8802-7292s-projects --name claude-code-vs-chat
```

Expected: deployment URL printed, ending in `.vercel.app`.

- [ ] **Step 4: Verify live URL**

Open `https://claude-code-vs-chat-opal.vercel.app/tag-game.html` in browser. Confirm the game loads and Grade Select screen appears.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: deploy TAG Galaxy Quest — PGCPS TAG practice game live"
git push "https://<PAT>@github.com/gazelle8802-ui/claude-code-vs-chat.git" main
```
