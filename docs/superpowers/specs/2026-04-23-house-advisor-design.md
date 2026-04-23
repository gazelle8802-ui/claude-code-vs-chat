# House Advisor — Design Spec
**Date:** 2026-04-23  
**Status:** Under Review (Pass 3)

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

---

## Architecture

### Files

```
house-advisor.html           ← main page: form + results UI (pure HTML/CSS/JS)
api/
  housing.js                 ← Vercel serverless function (Node.js)
data/
  zip-county.json            ← ZIP → county FIPS (from HUD USPS ZIP-to-County crosswalk, Type 2)
  zcta-names.json            ← ZCTA → human-readable city/area name (from USPS ZIP data)
  city-fips.json             ← "city|STATE" → {stateFIPS, countyFIPS, countyName} (top 1000 US cities)
  city-cbsa.json             ← "city|STATE" → {cbsaCode, cbsaName} (HUD metro area definitions)
```

**Data file key format:** All lookup keys use `"${city.trim().toLowerCase()}|${state.toUpperCase()}"` e.g. `"austin|TX"`. State is always 2-letter uppercase.

**Data file sources:**
- `zip-county.json` — HUD USPS ZIP-to-County crosswalk (Type 2), available at huduser.gov/portal/datasets/usps_crosswalk.html. Maps each ZIP to its primary county FIPS (5-digit: 2-digit state + 3-digit county).
- `zcta-names.json` — Census ZCTA place name file or USPS ZIP city name data. Maps ZCTA (5-digit string) to human-readable label (e.g., `"78702": "East Austin, TX"`).
- `city-fips.json` — Built from Census TIGER/Line Places data. Top 1000 US cities by population. Each entry: `{ stateFIPS, countyFIPS, countyName }` where countyName is the full county name (e.g., "Travis County, TX").
- `city-cbsa.json` — Built from HUD FMR area definitions. Each entry: `{ cbsaCode, cbsaName }` where cbsaName is the HUD metro area name (e.g., "Austin-Round Rock, TX HUD Metro FMR Area").

### Design System

| Token | Value | Purpose |
|---|---|---|
| Navy | `#1a3a6b` | Primary backgrounds, headings, buttons |
| Light blue-gray | `#e8edf8` | Input fields, card backgrounds |
| Green | `#2e7d32` | Good/Excellent credit, Best Value badge |
| Amber | `#e65100` | Fair credit, Near Limit badge |
| Red | `#c62828` | Poor/Very Poor credit badge |
| Blue | `#1565c0` | In Range badge |
| White | `#ffffff` | Card bodies |
| Muted | `#7a8fa8` | Label text |

Fonts: system-ui, sans-serif (no external font dependency).  
Responsive breakpoint: `820px` — all multi-column grids collapse to single column below.

---

## Page Sections (`house-advisor.html`)

### 1. Hero
- Navy background, white text
- Brand name: **"Home Budget IQ"**
- Tagline: "Should You Buy a House?"
- Subtext: "Enter your details and we'll calculate what you can afford — and where to look."

### 2. Input Form

Four fields in a 4-column grid:

| Field | Element | Validation Rule | Error Message |
|---|---|---|---|
| Monthly Income | `<input type="number" min="1">` | Required; must be > 0 | "Please enter your monthly income" |
| Credit Score | `<input type="number" min="300" max="850">` | Required; integer 300–850 | "Enter a score between 300 and 850" |
| State | `<select>` (all 50 + DC) | Required | "Please select your state" |
| City | `<input type="text">` | Required; non-empty after trim | "Please enter a city name" |

**Validation behavior:**
- Validated on each submit attempt only
- Each invalid field gets a red border (`border: 2px solid #c62828`) and an inline `<p class="field-error">` below it
- On re-submit: all field errors are cleared first, then re-validated from scratch (errors don't persist from previous attempt)
- Submission blocked if any field fails

**Loading state:** On valid submit, button text becomes "Loading…", button is `disabled`, a CSS spinner icon appears inline. Results section remains hidden until response is received (success or error).

### 3. Affordability Cards (computed client-side, before API call)

Three cards in a 3-column grid.

**Credit rate lookup (used in cards 1 and 2):**

| Credit Score | Tier | Annual Rate | Card Accent Color |
|---|---|---|---|
| 760+ | Excellent | 6.0% | Green (`#2e7d32`) |
| 700–759 | Good | 6.2% | Green (`#2e7d32`) |
| 640–699 | Fair | 6.8% | Amber (`#e65100`) |
| 580–639 | Poor | 7.5% | Red (`#c62828`) |
| < 580 | Very Poor | 8.5% | Red (`#c62828`) |

**Card 1 — Max Home Price:**
```js
const annualRate = 0.062;              // from credit tier table (as decimal)
const monthlyRate = annualRate / 12;
const mortgageConstant = monthlyRate / (1 - Math.pow(1 + monthlyRate, -360));
const maxMortgage = (monthlyIncome * 0.28) / mortgageConstant;
const maxPrice = maxMortgage / 0.80;   // assumes 20% down payment
```
Display: `$XXX,XXX`

**Card 2 — Est. Monthly Payment:**
```js
const loanAmount = maxPrice * 0.80;
const monthlyPI = loanAmount * mortgageConstant;
const monthlyTaxes = (maxPrice * 0.012) / 12;
const monthlyInsurance = 150;
const totalMonthly = monthlyPI + monthlyTaxes + monthlyInsurance;
```
Display: `$X,XXX / mo`  
Hover tooltip shows three-line breakdown:
```
Principal & Interest:  $X,XXX
Est. Property Taxes:   $XXX
Est. Insurance:        $150
```

**Card 3 — Credit Tier:**
Display tier name + estimated annual rate + card accent color per table above.

**Data vintage note** (small muted text below all three cards):  
`"Neighborhood data sourced from U.S. Census ACS 2023 5-Year Estimates."`

### 4. Neighborhood List (populated from API response)

Shown after affordability cards. Up to 6 ZCTA rows, sorted: `best_value` → `in_range` → `near_limit`.

Each row displays:
- ZIP code (ZCTA 5-digit string)
- Area name (from `zcta-names.json`)
- Median home value (Census ACS `B25077_001E`)
- Median gross rent (Census ACS `B25064_001E`) — **not** HUD FMR
- Badge (color-coded per badge table below)

**Badge assignment (server-side, authoritative):**

| Condition | Badge | Color |
|---|---|---|
| `medianHomeValue < maxPrice * 0.75` | `best_value` → "Best Value" | Green |
| `medianHomeValue >= maxPrice * 0.75` AND `<= maxPrice` | `in_range` → "In Range" | Blue |
| `medianHomeValue > maxPrice` AND `<= maxPrice * 1.15` | `near_limit` → "Near Limit" | Amber |
| `medianHomeValue > maxPrice * 1.15` | Excluded — not returned | — |

**If fewer than 3 neighborhoods returned:** Show message:  
`"We found limited data for [City], [State]. Showing results for [countyName] — try a nearby major city for more options."`  
Where `countyName` comes from the `countyName` field in the API response.

**Error states (rendered in place of neighborhood list):**
- `city_not_found`: "We couldn't find [City], [State] in our database. Check the spelling or try the county name (e.g., 'Montgomery County')."
- `data_unavailable`: "Neighborhood data is temporarily unavailable. Please try again in a moment."

### 5. Key Considerations (footer strip)

Static navy strip with 4 tips:
1. Keep total debt-to-income ratio below 43%
2. Aim for 20% down to avoid private mortgage insurance (PMI)
3. Get pre-approved before house hunting — it strengthens your offer
4. `marketNote` from API if non-null, otherwise: "Research local market trends before making an offer."

---

## Serverless Function (`api/housing.js`)

### Request
```
GET /api/housing?state=TX&city=Austin&maxPrice=385000
```
- `state`: 2-letter uppercase state abbreviation
- `city`: city name (raw from user input; server normalizes)
- `maxPrice`: integer USD (client rounds `Math.round(rawMaxPrice)` before passing; same rounded value is displayed in Card 1)

### Logic

**Step 1 — Normalize and resolve city**
```js
const key = `${city.trim().toLowerCase()}|${state.toUpperCase()}`;
const cityData = cityFips[key]; // { stateFIPS, countyFIPS, countyName }
if (!cityData) return { error: "city_not_found" };
```

**Step 2 — Find ZCTAs in county**
- Filter `zip-county.json` for entries where `countyFIPS === cityData.stateFIPS + cityData.countyFIPS`
- Result: array of ZCTA strings (e.g., `["78702", "78722", ...]`)
- If result is empty: return `{ error: "city_not_found" }` (valid city, no ZIP data for county)

**Step 3 — Call Census ACS API**
- Fetch all ZCTAs for the state, then filter the response to those in the county ZCTA list from Step 2
- Endpoint: `https://api.census.gov/data/2023/acs/acs5?get=B25077_001E,B25064_001E&for=zip%20code%20tabulation%20area:*&in=state:${stateFIPS}&key=${CENSUS_API_KEY}`
- The Census API returns an array of arrays; first row is headers `["B25077_001E","B25064_001E","zip code tabulation area","state"]`; subsequent rows are data
- After fetching, filter rows to only those where the ZCTA value appears in the county ZCTA set from Step 2
- Auth: `CENSUS_API_KEY` env var (append `&key=...` only if env var is set; omit otherwise for unauthenticated access)
- Timeout: 4 seconds via `AbortController`
- On timeout or non-200 response: return `{ error: "data_unavailable" }`

**Step 4 — Resolve neighborhood names**
- For each ZCTA in Census results, look up `zcta-names.json`
- Fallback if not found: `"Area ${zip}"`

**Step 5 — Call HUD FMR API (best-effort; `hudFMR: null` is an acceptable permanent outcome)**
- `HUD_API_TOKEN` is optional. If missing, skip entirely: `hudFMR: null`, `marketNote: null`.
- Look up `city-cbsa.json` for the city key → `{ cbsaCode, cbsaName }`. If not found, skip.
- Endpoint: `GET https://www.huduser.gov/hudapi/public/fmr/statedata/${state}`
  - Header: `Authorization: Bearer ${HUD_API_TOKEN}`
- The HUD FMR statedata response has shape `{ data: { metroareas: [ { area_code, area_name, basicdata: [{ br2 }] }, ... ] } }`
  - Match entry where `entry.area_code === cbsaCode` (cbsaCode stored in city-cbsa.json must match HUD's `area_code` format exactly)
  - Extract `entry.basicdata[0].br2` as `hudFMR` (2-bedroom Fair Market Rent)
- **`marketNote` logic:** If `hudFMR > 1800`: `"${cbsaName} is a high-cost metro — expect strong competition and prices above the national average."` If `hudFMR <= 1800`: `"${cbsaName} offers relatively affordable rental and housing options compared to major metros."`
- On any failure (timeout, bad response, no `area_code` match, missing token): `hudFMR: null`, `marketNote: null` (non-fatal, never blocks the response)
- Timeout: 4 seconds via `AbortController`

**Step 6 — Filter, badge, sort, return**
- Exclude ZCTAs where `B25077_001E` is null, -666666666 (Census sentinel), or > `maxPrice * 1.15`
- Assign badge per badge table above
- Sort: `best_value` first, then `in_range`, then `near_limit`
- Return top 6

### Response Schema
```json
{
  "neighborhoods": [
    {
      "zip": "78702",
      "name": "East Austin, TX",
      "medianHomeValue": 310000,
      "medianRent": 1450,
      "badge": "in_range"
    }
  ],
  "countyName": "Travis County, TX",
  "hudFMR": 1680,
  "marketNote": "Austin-Round Rock, TX HUD Metro FMR Area offers relatively affordable options..."
}
```

`hudFMR` and `marketNote` may be `null`. `countyName` is always present on success.

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `CENSUS_API_KEY` | Recommended | Free at api.census.gov/sign-up.html; avoids rate limiting |
| `HUD_API_TOKEN` | Optional | Free at huduser.gov/hudapi/public/register; if absent, HUD section skipped |

---

## Deployment

- Same Vercel project as existing site
- Vercel auto-detects `/api/*.js` as serverless functions (Node.js runtime)
- Add env vars in Vercel dashboard
- No `vercel.json` needed
- GitHub push triggers auto-deploy (existing PAT workflow)

---

## Success Criteria

1. User receives affordability results within 4 seconds on a cold Vercel function start
2. Neighborhood list returns at least 1 result for any of the top 1000 US cities by population
3. All error states show plain-English messages — no raw API errors or stack traces shown
4. Page is fully usable at and below the 820px breakpoint
5. Vercel deploy completes without build errors
6. All four input fields validated on submit; no submission with missing/invalid data
