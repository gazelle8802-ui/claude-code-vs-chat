# CLAUDE.md — Project Memory

## Project Overview
A single-page HTML website comparing **Claude Code** (CLI agentic tool) vs **Claude Chat** (browser conversational assistant). Aimed at both technical and non-technical audiences.

## Live URLs
- **Vercel (production):** https://claude-code-vs-chat-opal.vercel.app
- **GitHub (source):** https://github.com/gazelle8802-ui/claude-code-vs-chat

## Stack
- Pure HTML + CSS (no build step, no framework)
- Single file: `index.html`
- Fonts via Google Fonts: Fraunces (display), Nunito (body), IBM Plex Mono (code/labels)

## Design System
| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#f4f1ff` | Light lavender page background |
| `--text` | `#1c1530` | Primary deep indigo text |
| `--muted` | `#7060a0` | Secondary/label text |
| `--code-accent` | `#3d9900` | Claude Code green |
| `--code-mid` | `#2a6e00` | Claude Code darker green (table/headings) |
| `--chat-accent` | `#c2006b` | Claude Chat magenta |
| `--chat-mid` | `#8c004e` | Claude Chat darker magenta |
| `--rule` | `rgba(100,80,180,0.1)` | Section dividers |
| `--border` | `rgba(100,80,180,0.12)` | List/table borders |

## Page Structure
1. **Hero** — full-viewport title with animated fade-up, radial gradient mesh, subtle grid overlay
2. **Split panels** — Claude Code (left) / Claude Chat (right), each with: tag pill, title, subtitle, description, pull-quote, feature list, UI mock (terminal / chat)
3. **Comparison table** — 12-row feature matrix, green/magenta ticks
4. **Use cases** — 2-column grid with plain-English intro + 8 bullet points each
5. **Footer** — gradient brand name + links

## Terminal & Chat Mocks
Both mocks keep a **dark background** (`#13102a`) even on the light theme — this makes them visually distinct as "UI artifacts" floating on the page.

## Deployment
- **Vercel CLI:** `vercel --prod --token <token> --yes --scope gazelle8802-7292s-projects`
- **GitHub push:** use PAT stored by user; remote is `https://github.com/gazelle8802-ui/claude-code-vs-chat.git`
- No `vercel.json` needed — Vercel auto-detects static HTML, output dir is `.`

## Content Principles
- Written for **both technical and non-technical readers**
- Each panel opens with a plain-English analogy before diving into features
- Pull-quotes give a concrete one-sentence example of real usage
- Use-case intros frame the scenario in everyday language

## Conventions
- All CSS is in a single `<style>` block inside `index.html`
- CSS variables are declared in `:root` — change colors there, not inline
- Responsive breakpoint at `820px` — switches split grids to single column
- Animations: `fadeUp` (hero elements, staggered delay) and `fadeIn` (panels)

## Environment Quirks
- **No `gh` CLI** — GitHub auth uses PAT embedded in push URL: `git push "https://<PAT>@github.com/gazelle8802-ui/claude-code-vs-chat.git" main`
- **Git identity** — must set before first commit: `git config user.email "..."` and `git config user.name "..."`
- **Vercel project name** — folder name has a space; pass `--name claude-code-vs-chat` to avoid 400 error
- **Full Vercel deploy command:** `vercel --prod --token <token> --yes --scope gazelle8802-7292s-projects --name claude-code-vs-chat`
- **Background tasks + credentials** — tasks requiring interactive prompts (git credential dialog) fail silently; always use non-interactive auth (PAT in URL, `--token` flags)
