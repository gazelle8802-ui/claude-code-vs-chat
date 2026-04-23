# House Advisor — Design Spec
**Date:** 2026-04-23  
**Status:** Approved

## Overview

A single-page house-buying advisor website (`house-advisor.html`) that accepts user financial inputs and returns two outputs: a mortgage affordability breakdown and a list of real neighborhoods in the selected city ranked by fit. Deployed to Vercel (same project as existing site) with one serverless function for external API calls.

## Goals

- Help prospective buyers understand what they can afford before talking to a lender
- Surface real neighborhood/zip code data so users know where to look
- Be accessible to non-technical users — plain language, no jargon

## Non-Goals

- No user accounts or data persistence
- No mortgage application or lender referral
- No live property listings (MLS data)

## Architecture

### Files

```
house-advisor.html       ← main page: form + results UI (pure HTML/CSS/JS)
api/
  housing.js             ← Vercel serverless function (Node.js)
```

### Design Style

Professional & trust-building: navy blue (`#1a3a6b`), white, light blue-gray (`#e8edf8`), green accent (`#2e7d32`). Matches financial services aesthetic. Google Fonts: same stack as existing project (or system sans-serif fallback).

---

## Page Sections (`house-advisor.html`)

### 1. Hero
- Navy background, white text
- Brand name: "HomeAdvisor IQ"
- Tagline: "Should You Buy a House?"
- Subtext: "Enter your details and we'll calculate what you can afford — and where to look."

### 2. Input Form
Four fields displayed in a 4-column grid:

| Field | Type | Validation |
|---|---|---|
| Monthly Income | Number input (USD) | Required, > 0 |
| Credit Score | Number input | Required, 300–850 |
| State | Dropdown (all 50 US states) | Required |
| City | Text input | Required |

Submit button: "Get My Home Report →"  
On submit: shows loading state, calls `/api/housing`, renders results section.

### 3. Affordability Cards (results)

Three cards in a 3-column grid, computed client-side before API call:

**Card 1 — Max Home Price**
- Formula: `maxPrice = (monthlyIncome × 0.28 × 12) / annualMortgageConstant`
- Annual mortgage constant for 30yr at estimated rate: `rate / (1 - (1 + rate)^-360)` × 12
- Displayed as: `$XXX,XXX`

**Card 2 — Est. Monthly Payment**
- Standard amortization on `maxPrice` at 20% down
- Adds estimated taxes (1.2% annual / 12) and insurance ($150/mo flat)
- Displayed as: `$X,XXX / mo`

**Card 3 — Credit Tier + Rate**

| Credit Score | Tier | Est. 30yr Rate |
|---|---|---|
| 760+ | Excellent | 6.0% |
| 700–759 | Good | 6.2% |
| 640–699 | Fair | 6.8% |
| 580–639 | Poor | 7.5% |
| < 580 | Very Poor | 8.5%+ |

Card color: green for Excellent/Good, amber for Fair, red for Poor/Very Poor.

### 4. Neighborhood List (results)

Populated from `/api/housing` response. Shows up to 6 zip code areas:

Each row displays:
- Zip code + area name (from Census place data)
- Median home value (Census ACS)
- Median gross rent (Census ACS)
- Badge: **Best Value** (green) if < 75% of maxPrice, **In Range** (blue) if 75–100%, **Near Limit** (amber) if 100–115%, hidden if > 115%

Sorted: Best Value first, then In Range, then Near Limit.

### 5. Key Considerations (footer strip)

Static navy footer with 4 tips:
1. Keep debt-to-income ratio below 43%
2. Aim for 20% down to avoid PMI
3. Get pre-approved before house hunting
4. Local market context (dynamically inserted from API response if available, otherwise static)

---

## Serverless Function (`api/housing.js`)

### Request
```
GET /api/housing?state=TX&city=Austin&maxPrice=385000
```

### Logic

1. **Resolve FIPS codes** — map state abbreviation + city name to Census FIPS state/county code using a bundled lookup table (JSON file committed to repo)
2. **Call Census ACS 5-Year API**
   - Endpoint: `https://api.census.gov/data/2022/acs/acs5`
   - Variables: `B25077_001E` (median home value), `B25064_001E` (median gross rent)
   - Geography: zip code tabulation areas (ZCTAs) within the resolved county
   - No API key required (Census allows unauthenticated requests up to rate limit)
3. **Call HUD FMR API** (optional, for rent cross-check)
   - Endpoint: `https://www.huduser.gov/hudapi/public/fmr/statedata/{stateCode}`
   - Requires free HUD token (stored as `HUD_API_TOKEN` Vercel env var)
   - Used to enrich the response with Fair Market Rent for the metro
4. **Filter & rank** zip codes: exclude those with median home value > 115% of `maxPrice` or with missing data
5. **Return** top 6 results as JSON

### Response
```json
{
  "neighborhoods": [
    {
      "zip": "78702",
      "name": "East Austin",
      "medianHomeValue": 310000,
      "medianRent": 1450,
      "badge": "in_range"
    }
  ],
  "hudFMR": 1680,
  "marketNote": "Austin is a competitive market — expect offers above asking price."
}
```

### Error handling
- If Census API fails: return `{ error: "data_unavailable" }` — frontend shows "We couldn't load neighborhood data for this city. Try a nearby major city."
- If city not found in FIPS lookup: return `{ error: "city_not_found" }` — frontend prompts user to check spelling or try the county name

---

## Data Sources

| Source | URL | Auth | Used For |
|---|---|---|---|
| Census ACS 5-Year | `api.census.gov/data/2022/acs/acs5` | None required | Median home values, rents by zip |
| HUD Fair Market Rents | `huduser.gov/hudapi/public/fmr` | Free token (env var) | Metro-level rent benchmark |
| Census FIPS lookup | Bundled JSON in repo | N/A | City → county FIPS mapping |

---

## Deployment

- Same Vercel project as existing site (`claude-code-vs-chat` project)
- Vercel auto-detects `/api/*.js` as serverless functions
- Add `HUD_API_TOKEN` as a Vercel environment variable
- No `vercel.json` needed
- GitHub push triggers auto-deploy (same PAT workflow as existing project)

---

## Success Criteria

1. User fills form and receives affordability results within 3 seconds
2. Neighborhood list shows at least 3 zip codes for any major US city
3. Error states are handled gracefully with plain-English messages
4. Page is responsive (matches existing 820px breakpoint)
5. Passes Vercel deploy without build errors
