# House Advisor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `house-advisor.html` — a house-buying advisor that takes income, credit score, state, and city, then returns mortgage affordability cards and real neighborhood data from Census and HUD APIs, all deployed to Vercel.

**Architecture:** Pure HTML/CSS/JS frontend + one Vercel serverless function (`api/housing.js`). The function loads four bundled JSON data files at startup: two hand-seeded city lookups and two generated from public Census sources. No npm dependencies or build step.

**Tech Stack:** Vanilla HTML/CSS/JS, Node.js 18+ (Vercel runtime), Census ACS 5-Year API, HUD FMR API, Node.js built-in test runner (`node:test`)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `house-advisor.html` | Create | All UI: hero, form, affordability cards, neighborhood list, footer |
| `api/housing.js` | Create | Serverless function: city lookup, Census call, HUD call, badge+sort |
| `data/city-fips.json` | Create | `"city\|STATE"` → `{stateFIPS, countyFIPS, countyName}` (top 50 US cities) |
| `data/city-cbsa.json` | Create | `"city\|STATE"` → `{cbsaCode, cbsaName}` (top 50 US cities) |
| `data/zip-county.json` | Generate | ZCTA → 5-digit county FIPS (from Census ZCTA-County relationship file) |
| `data/zcta-names.json` | Generate | ZCTA → human-readable label (from Census ACS NAME variable) |
| `scripts/fetch-zip-county.js` | Create | Downloads Census file → `zip-county.json` |
| `scripts/fetch-zcta-names.js` | Create | Fetches Census ACS → `zcta-names.json` |
| `tests/housing.test.js` | Create | Unit tests for `api/housing.js` exported helpers |

---

## Chunk 1: Data Files

### Task 1: Create city-fips.json

**Files:**
- Create: `data/city-fips.json`

- [ ] **Step 1: Create data/city-fips.json with top 50 US cities**

```json
{
  "new york|NY": {"stateFIPS":"36","countyFIPS":"061","countyName":"New York County, NY"},
  "los angeles|CA": {"stateFIPS":"06","countyFIPS":"037","countyName":"Los Angeles County, CA"},
  "chicago|IL": {"stateFIPS":"17","countyFIPS":"031","countyName":"Cook County, IL"},
  "houston|TX": {"stateFIPS":"48","countyFIPS":"201","countyName":"Harris County, TX"},
  "phoenix|AZ": {"stateFIPS":"04","countyFIPS":"013","countyName":"Maricopa County, AZ"},
  "philadelphia|PA": {"stateFIPS":"42","countyFIPS":"101","countyName":"Philadelphia County, PA"},
  "san antonio|TX": {"stateFIPS":"48","countyFIPS":"029","countyName":"Bexar County, TX"},
  "san diego|CA": {"stateFIPS":"06","countyFIPS":"073","countyName":"San Diego County, CA"},
  "dallas|TX": {"stateFIPS":"48","countyFIPS":"113","countyName":"Dallas County, TX"},
  "jacksonville|FL": {"stateFIPS":"12","countyFIPS":"031","countyName":"Duval County, FL"},
  "austin|TX": {"stateFIPS":"48","countyFIPS":"453","countyName":"Travis County, TX"},
  "fort worth|TX": {"stateFIPS":"48","countyFIPS":"439","countyName":"Tarrant County, TX"},
  "columbus|OH": {"stateFIPS":"39","countyFIPS":"049","countyName":"Franklin County, OH"},
  "charlotte|NC": {"stateFIPS":"37","countyFIPS":"119","countyName":"Mecklenburg County, NC"},
  "indianapolis|IN": {"stateFIPS":"18","countyFIPS":"097","countyName":"Marion County, IN"},
  "san francisco|CA": {"stateFIPS":"06","countyFIPS":"075","countyName":"San Francisco County, CA"},
  "seattle|WA": {"stateFIPS":"53","countyFIPS":"033","countyName":"King County, WA"},
  "denver|CO": {"stateFIPS":"08","countyFIPS":"031","countyName":"Denver County, CO"},
  "nashville|TN": {"stateFIPS":"47","countyFIPS":"037","countyName":"Davidson County, TN"},
  "oklahoma city|OK": {"stateFIPS":"40","countyFIPS":"109","countyName":"Oklahoma County, OK"},
  "el paso|TX": {"stateFIPS":"48","countyFIPS":"141","countyName":"El Paso County, TX"},
  "washington|DC": {"stateFIPS":"11","countyFIPS":"001","countyName":"District of Columbia"},
  "las vegas|NV": {"stateFIPS":"32","countyFIPS":"003","countyName":"Clark County, NV"},
  "louisville|KY": {"stateFIPS":"21","countyFIPS":"111","countyName":"Jefferson County, KY"},
  "memphis|TN": {"stateFIPS":"47","countyFIPS":"157","countyName":"Shelby County, TN"},
  "portland|OR": {"stateFIPS":"41","countyFIPS":"051","countyName":"Multnomah County, OR"},
  "baltimore|MD": {"stateFIPS":"24","countyFIPS":"510","countyName":"Baltimore City, MD"},
  "milwaukee|WI": {"stateFIPS":"55","countyFIPS":"079","countyName":"Milwaukee County, WI"},
  "albuquerque|NM": {"stateFIPS":"35","countyFIPS":"001","countyName":"Bernalillo County, NM"},
  "tucson|AZ": {"stateFIPS":"04","countyFIPS":"019","countyName":"Pima County, AZ"},
  "fresno|CA": {"stateFIPS":"06","countyFIPS":"019","countyName":"Fresno County, CA"},
  "sacramento|CA": {"stateFIPS":"06","countyFIPS":"067","countyName":"Sacramento County, CA"},
  "mesa|AZ": {"stateFIPS":"04","countyFIPS":"013","countyName":"Maricopa County, AZ"},
  "kansas city|MO": {"stateFIPS":"29","countyFIPS":"095","countyName":"Jackson County, MO"},
  "atlanta|GA": {"stateFIPS":"13","countyFIPS":"121","countyName":"Fulton County, GA"},
  "omaha|NE": {"stateFIPS":"31","countyFIPS":"055","countyName":"Douglas County, NE"},
  "colorado springs|CO": {"stateFIPS":"08","countyFIPS":"041","countyName":"El Paso County, CO"},
  "raleigh|NC": {"stateFIPS":"37","countyFIPS":"183","countyName":"Wake County, NC"},
  "long beach|CA": {"stateFIPS":"06","countyFIPS":"037","countyName":"Los Angeles County, CA"},
  "virginia beach|VA": {"stateFIPS":"51","countyFIPS":"810","countyName":"Virginia Beach City, VA"},
  "minneapolis|MN": {"stateFIPS":"27","countyFIPS":"053","countyName":"Hennepin County, MN"},
  "tampa|FL": {"stateFIPS":"12","countyFIPS":"057","countyName":"Hillsborough County, FL"},
  "new orleans|LA": {"stateFIPS":"22","countyFIPS":"071","countyName":"Orleans Parish, LA"},
  "arlington|TX": {"stateFIPS":"48","countyFIPS":"439","countyName":"Tarrant County, TX"},
  "wichita|KS": {"stateFIPS":"20","countyFIPS":"173","countyName":"Sedgwick County, KS"},
  "bakersfield|CA": {"stateFIPS":"06","countyFIPS":"029","countyName":"Kern County, CA"},
  "aurora|CO": {"stateFIPS":"08","countyFIPS":"005","countyName":"Arapahoe County, CO"},
  "anaheim|CA": {"stateFIPS":"06","countyFIPS":"059","countyName":"Orange County, CA"},
  "santa ana|CA": {"stateFIPS":"06","countyFIPS":"059","countyName":"Orange County, CA"},
  "corpus christi|TX": {"stateFIPS":"48","countyFIPS":"355","countyName":"Nueces County, TX"}
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/city-fips.json','utf8')); console.log('valid, keys:', Object.keys(JSON.parse(require('fs').readFileSync('data/city-fips.json','utf8'))).length)"
```
Expected: `valid, keys: 50`

- [ ] **Step 3: Commit**

```bash
git add data/city-fips.json
git commit -m "data: add city-fips.json seed (top 50 US cities)"
```

---

### Task 2: Create city-cbsa.json

**Files:**
- Create: `data/city-cbsa.json`

**Note:** HUD's statedata API returns `area_code` values like `"METRO12420M12420"`. Verify the format with a test call before deploying: `curl "https://www.huduser.gov/hudapi/public/fmr/statedata/TX" -H "Authorization: Bearer $HUD_API_TOKEN"` and inspect the `area_code` field. Update cbsaCode values here if the format differs.

- [ ] **Step 1: Create data/city-cbsa.json**

```json
{
  "new york|NY": {"cbsaCode":"METRO35620M35620","cbsaName":"New York-Newark-Jersey City, NY-NJ-PA HUD Metro FMR Area"},
  "los angeles|CA": {"cbsaCode":"METRO31080M31080","cbsaName":"Los Angeles-Long Beach-Anaheim, CA HUD Metro FMR Area"},
  "chicago|IL": {"cbsaCode":"METRO16980M16980","cbsaName":"Chicago-Naperville-Elgin, IL-IN-WI HUD Metro FMR Area"},
  "houston|TX": {"cbsaCode":"METRO26420M26420","cbsaName":"Houston-The Woodlands-Sugar Land, TX HUD Metro FMR Area"},
  "phoenix|AZ": {"cbsaCode":"METRO38060M38060","cbsaName":"Phoenix-Mesa-Chandler, AZ HUD Metro FMR Area"},
  "philadelphia|PA": {"cbsaCode":"METRO37980M37980","cbsaName":"Philadelphia-Camden-Wilmington, PA-NJ-DE-MD HUD Metro FMR Area"},
  "san antonio|TX": {"cbsaCode":"METRO41700M41700","cbsaName":"San Antonio-New Braunfels, TX HUD Metro FMR Area"},
  "san diego|CA": {"cbsaCode":"METRO41740M41740","cbsaName":"San Diego-Chula Vista-Carlsbad, CA HUD Metro FMR Area"},
  "dallas|TX": {"cbsaCode":"METRO19100M19100","cbsaName":"Dallas-Fort Worth-Arlington, TX HUD Metro FMR Area"},
  "jacksonville|FL": {"cbsaCode":"METRO27260M27260","cbsaName":"Jacksonville, FL HUD Metro FMR Area"},
  "austin|TX": {"cbsaCode":"METRO12420M12420","cbsaName":"Austin-Round Rock-Georgetown, TX HUD Metro FMR Area"},
  "fort worth|TX": {"cbsaCode":"METRO19100M19100","cbsaName":"Dallas-Fort Worth-Arlington, TX HUD Metro FMR Area"},
  "columbus|OH": {"cbsaCode":"METRO18140M18140","cbsaName":"Columbus, OH HUD Metro FMR Area"},
  "charlotte|NC": {"cbsaCode":"METRO16740M16740","cbsaName":"Charlotte-Concord-Gastonia, NC-SC HUD Metro FMR Area"},
  "indianapolis|IN": {"cbsaCode":"METRO26900M26900","cbsaName":"Indianapolis-Carmel-Anderson, IN HUD Metro FMR Area"},
  "san francisco|CA": {"cbsaCode":"METRO41860M41860","cbsaName":"San Francisco-Oakland-Berkeley, CA HUD Metro FMR Area"},
  "seattle|WA": {"cbsaCode":"METRO42660M42660","cbsaName":"Seattle-Tacoma-Bellevue, WA HUD Metro FMR Area"},
  "denver|CO": {"cbsaCode":"METRO19740M19740","cbsaName":"Denver-Aurora-Lakewood, CO HUD Metro FMR Area"},
  "nashville|TN": {"cbsaCode":"METRO34980M34980","cbsaName":"Nashville-Davidson--Murfreesboro--Franklin, TN HUD Metro FMR Area"},
  "oklahoma city|OK": {"cbsaCode":"METRO36420M36420","cbsaName":"Oklahoma City, OK HUD Metro FMR Area"},
  "el paso|TX": {"cbsaCode":"METRO21340M21340","cbsaName":"El Paso, TX HUD Metro FMR Area"},
  "washington|DC": {"cbsaCode":"METRO47900M47900","cbsaName":"Washington-Arlington-Alexandria, DC-VA-MD-WV HUD Metro FMR Area"},
  "las vegas|NV": {"cbsaCode":"METRO29820M29820","cbsaName":"Las Vegas-Henderson-Paradise, NV HUD Metro FMR Area"},
  "louisville|KY": {"cbsaCode":"METRO31140M31140","cbsaName":"Louisville/Jefferson County, KY-IN HUD Metro FMR Area"},
  "memphis|TN": {"cbsaCode":"METRO32820M32820","cbsaName":"Memphis, TN-MS-AR HUD Metro FMR Area"},
  "portland|OR": {"cbsaCode":"METRO38900M38900","cbsaName":"Portland-Vancouver-Hillsboro, OR-WA HUD Metro FMR Area"},
  "baltimore|MD": {"cbsaCode":"METRO12580M12580","cbsaName":"Baltimore-Columbia-Towson, MD HUD Metro FMR Area"},
  "milwaukee|WI": {"cbsaCode":"METRO33340M33340","cbsaName":"Milwaukee-Waukesha, WI HUD Metro FMR Area"},
  "albuquerque|NM": {"cbsaCode":"METRO10740M10740","cbsaName":"Albuquerque, NM HUD Metro FMR Area"},
  "tucson|AZ": {"cbsaCode":"METRO46060M46060","cbsaName":"Tucson, AZ HUD Metro FMR Area"},
  "fresno|CA": {"cbsaCode":"METRO23420M23420","cbsaName":"Fresno, CA HUD Metro FMR Area"},
  "sacramento|CA": {"cbsaCode":"METRO40900M40900","cbsaName":"Sacramento-Roseville-Folsom, CA HUD Metro FMR Area"},
  "mesa|AZ": {"cbsaCode":"METRO38060M38060","cbsaName":"Phoenix-Mesa-Chandler, AZ HUD Metro FMR Area"},
  "kansas city|MO": {"cbsaCode":"METRO28140M28140","cbsaName":"Kansas City, MO-KS HUD Metro FMR Area"},
  "atlanta|GA": {"cbsaCode":"METRO12060M12060","cbsaName":"Atlanta-Sandy Springs-Alpharetta, GA HUD Metro FMR Area"},
  "omaha|NE": {"cbsaCode":"METRO36540M36540","cbsaName":"Omaha-Council Bluffs, NE-IA HUD Metro FMR Area"},
  "colorado springs|CO": {"cbsaCode":"METRO17820M17820","cbsaName":"Colorado Springs, CO HUD Metro FMR Area"},
  "raleigh|NC": {"cbsaCode":"METRO39580M39580","cbsaName":"Raleigh-Cary, NC HUD Metro FMR Area"},
  "long beach|CA": {"cbsaCode":"METRO31080M31080","cbsaName":"Los Angeles-Long Beach-Anaheim, CA HUD Metro FMR Area"},
  "virginia beach|VA": {"cbsaCode":"METRO47260M47260","cbsaName":"Virginia Beach-Norfolk-Newport News, VA-NC HUD Metro FMR Area"},
  "minneapolis|MN": {"cbsaCode":"METRO33460M33460","cbsaName":"Minneapolis-St. Paul-Bloomington, MN-WI HUD Metro FMR Area"},
  "tampa|FL": {"cbsaCode":"METRO45300M45300","cbsaName":"Tampa-St. Petersburg-Clearwater, FL HUD Metro FMR Area"},
  "new orleans|LA": {"cbsaCode":"METRO35380M35380","cbsaName":"New Orleans-Metairie, LA HUD Metro FMR Area"},
  "arlington|TX": {"cbsaCode":"METRO19100M19100","cbsaName":"Dallas-Fort Worth-Arlington, TX HUD Metro FMR Area"},
  "wichita|KS": {"cbsaCode":"METRO48620M48620","cbsaName":"Wichita, KS HUD Metro FMR Area"},
  "bakersfield|CA": {"cbsaCode":"METRO12540M12540","cbsaName":"Bakersfield, CA HUD Metro FMR Area"},
  "aurora|CO": {"cbsaCode":"METRO19740M19740","cbsaName":"Denver-Aurora-Lakewood, CO HUD Metro FMR Area"},
  "anaheim|CA": {"cbsaCode":"METRO31080M31080","cbsaName":"Los Angeles-Long Beach-Anaheim, CA HUD Metro FMR Area"},
  "santa ana|CA": {"cbsaCode":"METRO31080M31080","cbsaName":"Los Angeles-Long Beach-Anaheim, CA HUD Metro FMR Area"},
  "corpus christi|TX": {"cbsaCode":"METRO18580M18580","cbsaName":"Corpus Christi, TX HUD Metro FMR Area"}
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/city-cbsa.json','utf8')); console.log('valid')"
```
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add data/city-cbsa.json
git commit -m "data: add city-cbsa.json seed (top 50 US cities)"
```

---

### Task 3: Generate zip-county.json

**Files:**
- Create: `scripts/fetch-zip-county.js`
- Generate: `data/zip-county.json`

- [ ] **Step 1: Create scripts/fetch-zip-county.js**

```js
// Downloads Census ZCTA-to-County relationship file → data/zip-county.json
// Source: https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt
// Run: node scripts/fetch-zip-county.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node-script' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading Census ZCTA-County file (~20 MB)...');
  const text = await get(URL);
  const lines = text.trim().split('\n');
  const header = lines[0].split('|').map(h => h.trim());

  const zctaIdx = header.indexOf('ZCTA5CE20');
  const countyIdx = header.indexOf('GEOID_COUNTY_20');
  const areaIdx = header.indexOf('AREALAND_PART');

  // For each ZCTA keep the county with the largest land area overlap
  const best = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('|');
    const zcta = cols[zctaIdx]?.trim();
    const county = cols[countyIdx]?.trim();
    const area = parseInt(cols[areaIdx]?.trim() || '0', 10);
    if (!zcta || !county || zcta.length !== 5) continue;
    if (!best[zcta] || area > best[zcta].area) {
      best[zcta] = { county, area };
    }
  }

  const out = {};
  for (const [zcta, { county }] of Object.entries(best)) out[zcta] = county;

  const outPath = path.join(__dirname, '..', 'data', 'zip-county.json');
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`Written ${Object.keys(out).length} entries to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run the script**

```bash
node scripts/fetch-zip-county.js
```
Expected: `Written ~33000 entries to data/zip-county.json`

- [ ] **Step 3: Spot-check output**

```bash
node -e "
  const d = JSON.parse(require('fs').readFileSync('data/zip-county.json','utf8'));
  console.log('total ZCTAs:', Object.keys(d).length);
  console.log('78702 (Austin TX):', d['78702']);
  console.log('10001 (NYC):', d['10001']);
"
```
Expected: `78702 → 48453`, `10001 → 36061`

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-zip-county.js data/zip-county.json
git commit -m "data: add zip-county.json from Census ZCTA-County relationship file"
```

---

### Task 4: Generate zcta-names.json

**Files:**
- Create: `scripts/fetch-zcta-names.js`
- Generate: `data/zcta-names.json`

- [ ] **Step 1: Create scripts/fetch-zcta-names.js**

```js
// Fetches ZCTA names from Census ACS → data/zcta-names.json
// Run: node scripts/fetch-zcta-names.js
// Optional: set CENSUS_API_KEY env var to avoid rate limiting

const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node-script' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const key = process.env.CENSUS_API_KEY ? `&key=${process.env.CENSUS_API_KEY}` : '';
  const url = `https://api.census.gov/data/2023/acs/acs5?get=NAME&for=zip%20code%20tabulation%20area:*${key}`;
  console.log('Fetching ZCTA names from Census ACS (~10 seconds)...');
  const text = await get(url);
  const rows = JSON.parse(text);
  // rows[0] = ["NAME", "zip code tabulation area"]
  // rows[1+] = ["ZCTA5 78702, Texas", "78702"]
  const out = {};
  for (let i = 1; i < rows.length; i++) {
    const label = rows[i][0].replace(/^ZCTA5\s+/, ''); // "78702, Texas"
    const zcta = rows[i][1];
    out[zcta] = label;
  }
  const outPath = path.join(__dirname, '..', 'data', 'zcta-names.json');
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`Written ${Object.keys(out).length} entries to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Run the script**

```bash
node scripts/fetch-zcta-names.js
```
Expected: `Written ~33000 entries to data/zcta-names.json`

- [ ] **Step 3: Spot-check**

```bash
node -e "
  const d = JSON.parse(require('fs').readFileSync('data/zcta-names.json','utf8'));
  console.log('78702:', d['78702']);
  console.log('10001:', d['10001']);
"
```
Expected: `78702: "78702, Texas"`, `10001: "10001, New York"`

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-zcta-names.js data/zcta-names.json
git commit -m "data: add zcta-names.json from Census ACS"
```

---

## Chunk 2: Serverless Function (TDD)

### Task 5: Write failing tests for helper functions

**Files:**
- Create: `tests/housing.test.js`

- [ ] **Step 1: Create tests/housing.test.js**

```js
// tests/housing.test.js
// Run: node --test tests/housing.test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');

// We test the pure helper functions exported from api/housing.js
const {
  normalizeKey,
  assignBadge,
  buildMarketNote,
  parseCensusRows,
  filterAndRank,
} = require('../api/housing.js');

// --- normalizeKey ---
test('normalizeKey lowercases city and uppercases state', () => {
  assert.equal(normalizeKey('  Austin  ', 'tx'), 'austin|TX');
});

test('normalizeKey handles already-normalized input', () => {
  assert.equal(normalizeKey('austin', 'TX'), 'austin|TX');
});

// --- assignBadge ---
test('assignBadge returns best_value when < 75% of maxPrice', () => {
  assert.equal(assignBadge(74000, 100000), 'best_value');
});

test('assignBadge returns in_range when >= 75% and <= 100%', () => {
  assert.equal(assignBadge(75000, 100000), 'in_range');
  assert.equal(assignBadge(100000, 100000), 'in_range');
});

test('assignBadge returns near_limit when > 100% and <= 115%', () => {
  assert.equal(assignBadge(100001, 100000), 'near_limit');
  assert.equal(assignBadge(115000, 100000), 'near_limit');
});

test('assignBadge returns null when > 115% (excluded)', () => {
  assert.equal(assignBadge(115001, 100000), null);
});

// --- buildMarketNote ---
test('buildMarketNote returns high-cost string when hudFMR > 1800', () => {
  const note = buildMarketNote(2000, 'Austin Metro');
  assert.ok(note.includes('Austin Metro'));
  assert.ok(note.includes('high-cost'));
});

test('buildMarketNote returns affordable string when hudFMR <= 1800', () => {
  const note = buildMarketNote(1500, 'Wichita Metro');
  assert.ok(note.includes('Wichita Metro'));
  assert.ok(note.includes('affordable'));
});

test('buildMarketNote returns null when hudFMR is null', () => {
  assert.equal(buildMarketNote(null, 'Any'), null);
});

// --- parseCensusRows ---
test('parseCensusRows converts Census array-of-arrays to objects', () => {
  const raw = [
    ['B25077_001E', 'B25064_001E', 'zip code tabulation area', 'state'],
    ['310000', '1450', '78702', '48'],
    ['-666666666', '800', '78703', '48'],
    [null, '900', '78704', '48'],
  ];
  const result = parseCensusRows(raw);
  assert.equal(result.length, 1); // only valid rows
  assert.deepEqual(result[0], { zcta: '78702', medianHomeValue: 310000, medianRent: 1450 });
});

// --- filterAndRank ---
test('filterAndRank excludes ZCTAs not in countySet', () => {
  const rows = [{ zcta: '78702', medianHomeValue: 200000, medianRent: 1200 }];
  const countySet = new Set(['99999']);
  const result = filterAndRank(rows, countySet, 300000);
  assert.equal(result.length, 0);
});

test('filterAndRank assigns correct badges and sorts correctly', () => {
  const rows = [
    { zcta: '00001', medianHomeValue: 340000, medianRent: 1600 }, // near_limit
    { zcta: '00002', medianHomeValue: 200000, medianRent: 1000 }, // best_value
    { zcta: '00003', medianHomeValue: 280000, medianRent: 1300 }, // in_range
  ];
  const countySet = new Set(['00001', '00002', '00003']);
  const result = filterAndRank(rows, countySet, 300000);
  assert.equal(result[0].badge, 'best_value');
  assert.equal(result[1].badge, 'in_range');
  assert.equal(result[2].badge, 'near_limit');
});

test('filterAndRank excludes entries above 115% of maxPrice', () => {
  const rows = [{ zcta: '00001', medianHomeValue: 400000, medianRent: 1800 }];
  const countySet = new Set(['00001']);
  const result = filterAndRank(rows, countySet, 300000); // 400k > 345k (115%)
  assert.equal(result.length, 0);
});

test('filterAndRank returns at most 6 results', () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({
    zcta: String(i).padStart(5, '0'),
    medianHomeValue: 200000,
    medianRent: 1000,
  }));
  const countySet = new Set(rows.map(r => r.zcta));
  const result = filterAndRank(rows, countySet, 300000);
  assert.equal(result.length, 6);
});
```

- [ ] **Step 2: Run tests — verify they all FAIL (function not yet created)**

```bash
node --test tests/housing.test.js
```
Expected: `Error: Cannot find module '../api/housing.js'`

---

### Task 6: Implement api/housing.js

**Files:**
- Create: `api/housing.js`

- [ ] **Step 1: Create api/housing.js**

```js
// api/housing.js — Vercel serverless function
'use strict';

const path = require('path');
const cityFips = require('../data/city-fips.json');
const zipCounty = require('../data/zip-county.json');
const zctaNames = require('../data/zcta-names.json');
const cityCbsa = require('../data/city-cbsa.json');

// --- Pure helper functions (exported for testing) ---

function normalizeKey(city, state) {
  return `${city.trim().toLowerCase()}|${state.trim().toUpperCase()}`;
}

function assignBadge(medianHomeValue, maxPrice) {
  if (medianHomeValue < maxPrice * 0.75) return 'best_value';
  if (medianHomeValue <= maxPrice) return 'in_range';
  if (medianHomeValue <= maxPrice * 1.15) return 'near_limit';
  return null; // excluded
}

function buildMarketNote(hudFMR, cbsaName) {
  if (hudFMR === null || hudFMR === undefined) return null;
  if (hudFMR > 1800) {
    return `${cbsaName} is a high-cost metro — expect strong competition and prices above the national average.`;
  }
  return `${cbsaName} offers relatively affordable rental and housing options compared to major metros.`;
}

function parseCensusRows(rows) {
  // rows[0] = headers, rows[1+] = data
  const SENTINEL = -666666666;
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const [rawValue, rawRent, zcta] = rows[i];
    const medianHomeValue = parseInt(rawValue, 10);
    const medianRent = parseInt(rawRent, 10);
    if (!zcta || isNaN(medianHomeValue) || medianHomeValue === SENTINEL || medianHomeValue <= 0) continue;
    results.push({ zcta, medianHomeValue, medianRent: isNaN(medianRent) ? null : medianRent });
  }
  return results;
}

function filterAndRank(rows, countySet, maxPrice) {
  const badgeOrder = { best_value: 0, in_range: 1, near_limit: 2 };
  return rows
    .filter(r => countySet.has(r.zcta))
    .map(r => ({ ...r, badge: assignBadge(r.medianHomeValue, maxPrice) }))
    .filter(r => r.badge !== null)
    .sort((a, b) => badgeOrder[a.badge] - badgeOrder[b.badge])
    .slice(0, 6);
}

// --- Fetch helpers ---

async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCensus(stateFIPS) {
  const key = process.env.CENSUS_API_KEY ? `&key=${process.env.CENSUS_API_KEY}` : '';
  const url = `https://api.census.gov/data/2023/acs/acs5?get=B25077_001E,B25064_001E&for=zip%20code%20tabulation%20area:*&in=state:${stateFIPS}${key}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Census API ${res.status}`);
  return res.json();
}

async function fetchHUD(state, cbsaCode, cbsaName) {
  const token = process.env.HUD_API_TOKEN;
  if (!token) return { hudFMR: null, marketNote: null };
  const url = `https://www.huduser.gov/hudapi/public/fmr/statedata/${state}`;
  const res = await fetchWithTimeout(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { hudFMR: null, marketNote: null };
  const data = await res.json();
  const metro = data?.data?.metroareas?.find(m => m.area_code === cbsaCode);
  if (!metro) return { hudFMR: null, marketNote: null };
  const hudFMR = metro.basicdata?.[0]?.br2 ?? null;
  return { hudFMR, marketNote: buildMarketNote(hudFMR, cbsaName) };
}

// --- Main handler ---

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { state, city, maxPrice: maxPriceStr } = req.query;
  const maxPrice = parseInt(maxPriceStr, 10);

  if (!state || !city || isNaN(maxPrice)) {
    return res.status(400).json({ error: 'missing_params' });
  }

  // Step 1 — Resolve city
  const key = normalizeKey(city, state);
  const cityData = cityFips[key];
  if (!cityData) return res.status(200).json({ error: 'city_not_found' });
  const { stateFIPS, countyFIPS, countyName } = cityData;
  const fullCountyFIPS = stateFIPS + countyFIPS;

  // Step 2 — Find ZCTAs in county
  const countySet = new Set(
    Object.entries(zipCounty)
      .filter(([, fips]) => fips === fullCountyFIPS)
      .map(([zcta]) => zcta)
  );
  if (countySet.size === 0) return res.status(200).json({ error: 'city_not_found' });

  // Step 3 — Census ACS
  let censusRows;
  try {
    const raw = await fetchCensus(stateFIPS);
    censusRows = parseCensusRows(raw);
  } catch {
    return res.status(200).json({ error: 'data_unavailable' });
  }

  // Step 4 — Resolve names
  const rows = censusRows.map(r => ({
    ...r,
    name: zctaNames[r.zcta] || `Area ${r.zcta}`,
  }));

  // Step 5 — HUD FMR (best-effort)
  const cbsaEntry = cityCbsa[key];
  const { hudFMR, marketNote } = cbsaEntry
    ? await fetchHUD(state.toUpperCase(), cbsaEntry.cbsaCode, cbsaEntry.cbsaName).catch(() => ({ hudFMR: null, marketNote: null }))
    : { hudFMR: null, marketNote: null };

  // Step 6 — Filter, badge, rank
  const neighborhoods = filterAndRank(rows, countySet, maxPrice).map(r => ({
    zip: r.zcta,
    name: r.name,
    medianHomeValue: r.medianHomeValue,
    medianRent: r.medianRent,
    badge: r.badge,
  }));

  return res.status(200).json({ neighborhoods, countyName, hudFMR, marketNote });
};

// Export helpers for testing
module.exports.normalizeKey = normalizeKey;
module.exports.assignBadge = assignBadge;
module.exports.buildMarketNote = buildMarketNote;
module.exports.parseCensusRows = parseCensusRows;
module.exports.filterAndRank = filterAndRank;
```

- [ ] **Step 2: Run tests — all should pass**

```bash
node --test tests/housing.test.js
```
Expected: all tests pass, no failures

- [ ] **Step 3: Commit**

```bash
git add api/housing.js tests/housing.test.js
git commit -m "feat: add housing.js serverless function with unit tests"
```

---

## Chunk 3: Frontend

### Task 7: Build house-advisor.html

**Files:**
- Create: `house-advisor.html`

- [ ] **Step 1: Create house-advisor.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home Budget IQ — Should You Buy a House?</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #1a3a6b;
      --navy-dark: #122a50;
      --blue-gray: #e8edf8;
      --green: #2e7d32;
      --amber: #e65100;
      --red: #c62828;
      --blue: #1565c0;
      --white: #ffffff;
      --muted: #7a8fa8;
      --border: #c8d5e8;
      --text: #1a2a3a;
    }

    body { font-family: system-ui, -apple-system, sans-serif; color: var(--text); background: #f4f7fb; }

    /* Hero */
    .hero { background: var(--navy); color: var(--white); padding: 48px 32px; text-align: center; }
    .hero .brand { font-size: 13px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.6; margin-bottom: 12px; }
    .hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 800; margin-bottom: 12px; }
    .hero p { font-size: 16px; opacity: 0.8; max-width: 480px; margin: 0 auto; }

    /* Form section */
    .form-section { background: var(--white); padding: 32px; border-bottom: 3px solid var(--navy); }
    .form-section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--navy); margin-bottom: 16px; }
    .fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .field label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 6px; }
    .field input, .field select {
      width: 100%; padding: 10px 12px; border: 1.5px solid var(--border);
      border-radius: 6px; font-size: 14px; color: var(--text); background: var(--blue-gray);
      outline: none; transition: border-color 0.15s;
    }
    .field input:focus, .field select:focus { border-color: var(--navy); }
    .field input.error, .field select.error { border: 2px solid var(--red); }
    .field-error { font-size: 11px; color: var(--red); margin-top: 4px; }
    .btn-submit {
      background: var(--navy); color: var(--white); border: none; border-radius: 8px;
      padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 10px; transition: background 0.15s;
    }
    .btn-submit:hover { background: var(--navy-dark); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite; display: none;
    }
    .btn-submit.loading .spinner { display: block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Results */
    #results { display: none; }

    /* Affordability cards */
    .cards-section { padding: 32px; background: var(--white); border-bottom: 1px solid var(--blue-gray); }
    .cards-section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--navy); margin-bottom: 16px; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .card {
      background: var(--blue-gray); border-radius: 10px; padding: 20px;
      border-left: 4px solid var(--navy);
    }
    .card.green { border-left-color: var(--green); background: #e8f5e9; }
    .card.amber { border-left-color: var(--amber); background: #fff3e0; }
    .card.red   { border-left-color: var(--red);   background: #fce4e4; }
    .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 8px; }
    .card-value { font-size: 28px; font-weight: 800; color: var(--navy); margin-bottom: 4px; }
    .card.green .card-value { color: var(--green); }
    .card.amber .card-value { color: var(--amber); }
    .card.red   .card-value { color: var(--red); }
    .card-sub { font-size: 12px; color: var(--muted); position: relative; cursor: default; }
    .tooltip {
      display: none; position: absolute; left: 0; top: 22px; background: var(--navy);
      color: white; font-size: 11px; padding: 8px 12px; border-radius: 6px;
      white-space: nowrap; z-index: 10; line-height: 1.8;
    }
    .card-sub:hover .tooltip { display: block; }
    .vintage-note { font-size: 11px; color: var(--muted); margin-top: 12px; }

    /* Neighborhood list */
    .neighborhoods-section { padding: 32px; background: #f8faff; }
    .neighborhoods-section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--navy); margin-bottom: 16px; }
    .neighborhood-list { display: flex; flex-direction: column; gap: 8px; }
    .neighborhood-row {
      background: var(--white); border: 1px solid var(--border); border-radius: 8px;
      padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;
    }
    .neighborhood-row .row-main .row-name { font-size: 14px; font-weight: 700; color: var(--navy); }
    .neighborhood-row .row-main .row-detail { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .badge {
      font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 5px;
      white-space: nowrap;
    }
    .badge.best_value { background: #e8f5e9; color: var(--green); }
    .badge.in_range   { background: #e3f0fb; color: var(--blue); }
    .badge.near_limit { background: #fff3e0; color: var(--amber); }
    .limited-msg, .error-msg {
      background: var(--blue-gray); border-radius: 8px; padding: 16px 20px;
      font-size: 13px; color: var(--navy); line-height: 1.5;
    }
    .error-msg { background: #fce4e4; color: var(--red); }

    /* Footer tips */
    .tips-section { background: var(--navy); color: var(--white); padding: 28px 32px; }
    .tips-section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 14px; }
    .tips { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; line-height: 1.5; }
    .tips li { list-style: none; opacity: 0.9; }

    /* Responsive */
    @media (max-width: 820px) {
      .fields { grid-template-columns: 1fr 1fr; }
      .cards { grid-template-columns: 1fr; }
      .tips { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .fields { grid-template-columns: 1fr; }
      .form-section, .cards-section, .neighborhoods-section, .tips-section { padding: 20px 16px; }
    }
  </style>
</head>
<body>

<!-- Hero -->
<header class="hero">
  <p class="brand">Home Budget IQ</p>
  <h1>Should You Buy a House?</h1>
  <p>Enter your details and we'll calculate what you can afford — and where to look.</p>
</header>

<!-- Form -->
<section class="form-section">
  <h2>Your Information</h2>
  <form id="advisor-form" novalidate>
    <div class="fields">
      <div class="field">
        <label for="income">Monthly Income</label>
        <input type="number" id="income" min="1" placeholder="e.g. 7500">
        <p class="field-error" id="income-err" style="display:none"></p>
      </div>
      <div class="field">
        <label for="credit">Credit Score</label>
        <input type="number" id="credit" min="300" max="850" placeholder="300 – 850">
        <p class="field-error" id="credit-err" style="display:none"></p>
      </div>
      <div class="field">
        <label for="state">State</label>
        <select id="state">
          <option value="">Select state…</option>
          <option>AL</option><option>AK</option><option>AZ</option><option>AR</option>
          <option>CA</option><option>CO</option><option>CT</option><option>DE</option>
          <option>DC</option><option>FL</option><option>GA</option><option>HI</option>
          <option>ID</option><option>IL</option><option>IN</option><option>IA</option>
          <option>KS</option><option>KY</option><option>LA</option><option>ME</option>
          <option>MD</option><option>MA</option><option>MI</option><option>MN</option>
          <option>MS</option><option>MO</option><option>MT</option><option>NE</option>
          <option>NV</option><option>NH</option><option>NJ</option><option>NM</option>
          <option>NY</option><option>NC</option><option>ND</option><option>OH</option>
          <option>OK</option><option>OR</option><option>PA</option><option>RI</option>
          <option>SC</option><option>SD</option><option>TN</option><option>TX</option>
          <option>UT</option><option>VT</option><option>VA</option><option>WA</option>
          <option>WV</option><option>WI</option><option>WY</option>
        </select>
        <p class="field-error" id="state-err" style="display:none"></p>
      </div>
      <div class="field">
        <label for="city">City</label>
        <input type="text" id="city" placeholder="e.g. Austin">
        <p class="field-error" id="city-err" style="display:none"></p>
      </div>
    </div>
    <button type="submit" class="btn-submit" id="submit-btn">
      <span class="spinner"></span>
      <span id="btn-text">Get My Home Report →</span>
    </button>
  </form>
</section>

<!-- Results (hidden until API returns) -->
<div id="results">

  <!-- Affordability Cards -->
  <section class="cards-section">
    <h2>Your Affordability</h2>
    <div class="cards">
      <div class="card" id="card-price">
        <div class="card-label">Max Home Price</div>
        <div class="card-value" id="max-price-val">—</div>
        <div class="card-sub">Assumes 20% down payment</div>
      </div>
      <div class="card" id="card-payment">
        <div class="card-label">Est. Monthly Payment</div>
        <div class="card-value" id="monthly-val">—</div>
        <div class="card-sub">
          Hover to see breakdown
          <div class="tooltip" id="payment-tooltip"></div>
        </div>
      </div>
      <div class="card" id="card-credit">
        <div class="card-label">Credit Rating</div>
        <div class="card-value" id="credit-val">—</div>
        <div class="card-sub" id="rate-val"></div>
      </div>
    </div>
    <p class="vintage-note">Neighborhood data sourced from U.S. Census ACS 2023 5-Year Estimates.</p>
  </section>

  <!-- Neighborhoods -->
  <section class="neighborhoods-section">
    <h2 id="neighborhoods-heading">Neighborhoods</h2>
    <div id="neighborhood-list"></div>
  </section>

  <!-- Tips -->
  <section class="tips-section">
    <h2>Things to Consider</h2>
    <ul class="tips">
      <li>📊 Keep total debt-to-income ratio below 43%</li>
      <li>💰 Aim for 20% down to avoid private mortgage insurance (PMI)</li>
      <li>🏦 Get pre-approved before house hunting — it strengthens your offer</li>
      <li id="market-tip">📈 Research local market trends before making an offer.</li>
    </ul>
  </section>

</div>

<script>
// --- Credit tier lookup ---
function getCreditTier(score) {
  if (score >= 760) return { tier: 'Excellent', rate: 0.060, color: 'green' };
  if (score >= 700) return { tier: 'Good',      rate: 0.062, color: 'green' };
  if (score >= 640) return { tier: 'Fair',      rate: 0.068, color: 'amber' };
  if (score >= 580) return { tier: 'Poor',      rate: 0.075, color: 'red' };
  return                    { tier: 'Very Poor', rate: 0.085, color: 'red' };
}

// --- Affordability math ---
function calcAffordability(monthlyIncome, creditScore) {
  const { tier, rate, color } = getCreditTier(creditScore);
  const monthlyRate = rate / 12;
  const mortgageConstant = monthlyRate / (1 - Math.pow(1 + monthlyRate, -360));
  const maxMortgage = (monthlyIncome * 0.28) / mortgageConstant;
  const maxPrice = Math.round(maxMortgage / 0.80);

  const loanAmount = maxPrice * 0.80;
  const monthlyPI = loanAmount * mortgageConstant;
  const monthlyTaxes = (maxPrice * 0.012) / 12;
  const monthlyInsurance = 150;
  const totalMonthly = Math.round(monthlyPI + monthlyTaxes + monthlyInsurance);

  return { tier, rate, color, maxPrice, totalMonthly,
           monthlyPI: Math.round(monthlyPI),
           monthlyTaxes: Math.round(monthlyTaxes), monthlyInsurance };
}

// --- Formatting ---
function fmtUSD(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

// --- Validation ---
function validate() {
  let ok = true;
  const fields = [
    { el: document.getElementById('income'), err: document.getElementById('income-err'),
      check: v => parseFloat(v) > 0, msg: 'Please enter your monthly income' },
    { el: document.getElementById('credit'), err: document.getElementById('credit-err'),
      check: v => parseInt(v) >= 300 && parseInt(v) <= 850, msg: 'Enter a score between 300 and 850' },
    { el: document.getElementById('state'), err: document.getElementById('state-err'),
      check: v => v !== '', msg: 'Please select your state' },
    { el: document.getElementById('city'), err: document.getElementById('city-err'),
      check: v => v.trim() !== '', msg: 'Please enter a city name' },
  ];
  fields.forEach(({ el, err, check, msg }) => {
    el.classList.remove('error');
    err.style.display = 'none';
    if (!check(el.value)) {
      el.classList.add('error');
      err.textContent = msg;
      err.style.display = 'block';
      ok = false;
    }
  });
  return ok;
}

// --- Render affordability cards ---
function renderCards(aff) {
  document.getElementById('max-price-val').textContent = fmtUSD(aff.maxPrice);
  document.getElementById('monthly-val').textContent = fmtUSD(aff.totalMonthly) + ' / mo';
  document.getElementById('payment-tooltip').innerHTML =
    `Principal &amp; Interest: ${fmtUSD(aff.monthlyPI)}<br>` +
    `Est. Property Taxes: ${fmtUSD(aff.monthlyTaxes)}<br>` +
    `Est. Insurance: $150`;
  document.getElementById('credit-val').textContent = aff.tier;
  document.getElementById('rate-val').textContent = `Est. rate ~${(aff.rate * 100).toFixed(1)}% (30yr fixed)`;

  const colorClass = aff.color;
  ['card-price', 'card-payment', 'card-credit'].forEach(id => {
    const card = document.getElementById(id);
    card.className = 'card';
    if (id === 'card-credit') card.classList.add(colorClass);
  });
}

// --- Render neighborhoods ---
const BADGE_LABELS = { best_value: 'Best Value', in_range: 'In Range', near_limit: 'Near Limit' };

function renderNeighborhoods(data, city, state) {
  const listEl = document.getElementById('neighborhood-list');
  const headingEl = document.getElementById('neighborhoods-heading');
  headingEl.textContent = `Neighborhoods in ${city}, ${state}`;

  if (data.error === 'city_not_found') {
    listEl.innerHTML = `<div class="error-msg">We couldn't find ${city}, ${state} in our database. Check the spelling or try the county name (e.g., 'Montgomery County').</div>`;
    return;
  }
  if (data.error === 'data_unavailable') {
    listEl.innerHTML = `<div class="error-msg">Neighborhood data is temporarily unavailable. Please try again in a moment.</div>`;
    return;
  }

  const { neighborhoods = [], countyName, marketNote } = data;

  // Update market tip
  if (marketNote) document.getElementById('market-tip').textContent = '📈 ' + marketNote;

  if (neighborhoods.length === 0) {
    listEl.innerHTML = `<div class="limited-msg">We found limited data for ${city}, ${state}. Showing results for ${countyName} — try a nearby major city for more options.</div>`;
    return;
  }

  let html = '<div class="neighborhood-list">';
  neighborhoods.forEach(n => {
    html += `
      <div class="neighborhood-row">
        <div class="row-main">
          <div class="row-name">${n.name} (${n.zip})</div>
          <div class="row-detail">
            Median home: ${fmtUSD(n.medianHomeValue)}
            ${n.medianRent ? ' · Median rent: ' + fmtUSD(n.medianRent) + '/mo' : ''}
          </div>
        </div>
        <span class="badge ${n.badge}">${BADGE_LABELS[n.badge]}</span>
      </div>`;
  });

  if (neighborhoods.length < 3) {
    html += `<div class="limited-msg">We found limited data for ${city}, ${state}. Showing results for ${countyName} — try a nearby major city for more options.</div>`;
  }

  html += '</div>';
  listEl.innerHTML = html;
}

// --- Form submit ---
document.getElementById('advisor-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!validate()) return;

  const income = parseFloat(document.getElementById('income').value);
  const credit = parseInt(document.getElementById('credit').value);
  const state  = document.getElementById('state').value;
  const city   = document.getElementById('city').value.trim();

  // Client-side affordability (shown immediately)
  const aff = calcAffordability(income, credit);
  renderCards(aff);
  document.getElementById('results').style.display = 'block';

  // Loading state
  const btn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  btn.disabled = true;
  btn.classList.add('loading');
  btnText.textContent = 'Loading…';

  try {
    const params = new URLSearchParams({ state, city, maxPrice: aff.maxPrice });
    const res = await fetch(`/api/housing?${params}`);
    const data = await res.json();
    renderNeighborhoods(data, city, state);
  } catch {
    document.getElementById('neighborhood-list').innerHTML =
      '<div class="error-msg">Neighborhood data is temporarily unavailable. Please try again in a moment.</div>';
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btnText.textContent = 'Get My Home Report →';
  }
});
</script>
</body>
</html>
```

- [ ] **Step 2: Verify the HTML is well-formed**

Open `house-advisor.html` directly in a browser (file:// URL). Confirm:
- Hero renders with navy background and white text
- Form shows 4 fields in a row
- Results section is hidden
- No console errors

- [ ] **Step 3: Commit**

```bash
git add house-advisor.html
git commit -m "feat: add house-advisor.html frontend"
```

---

## Chunk 4: Deployment

### Task 8: Configure and deploy

**Files:**
- Modify: `.gitignore` (if it exists, otherwise create)

- [ ] **Step 1: Add .superpowers to .gitignore**

```bash
echo ".superpowers/" >> .gitignore
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm directory"
```

- [ ] **Step 2: Set Vercel environment variables**

In the Vercel dashboard for this project (https://vercel.com/dashboard), go to Settings → Environment Variables and add:
- `CENSUS_API_KEY` — get free key at https://api.census.gov/data/key_signup.html
- `HUD_API_TOKEN` — get free token at https://www.huduser.gov/hudapi/public/register (optional; HUD data will be skipped if absent)

- [ ] **Step 3: Push to GitHub to trigger Vercel deploy**

```bash
git push "https://<PAT>@github.com/gazelle8802-ui/claude-code-vs-chat.git" main
```
Replace `<PAT>` with your stored GitHub Personal Access Token.

- [ ] **Step 4: Verify Vercel deploy succeeds**

Check https://vercel.com/dashboard → your project → Deployments. Wait for status to show "Ready".

- [ ] **Step 5: Smoke test the live site**

Open `https://claude-code-vs-chat-opal.vercel.app/house-advisor.html`.

Test the golden path:
1. Enter income: `7500`, credit: `720`, state: `TX`, city: `Austin` → click submit
2. Confirm affordability cards appear with dollar amounts
3. Confirm neighborhood list appears with at least 1 row
4. Badges show correct colors

Test validation:
5. Submit with empty income → confirm red border + error message
6. Submit with credit score `200` → confirm error message

Test error path:
7. Enter city: `Fakecityname` → confirm "We couldn't find…" message appears

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: production smoke test corrections"
git push "https://<PAT>@github.com/gazelle8802-ui/claude-code-vs-chat.git" main
```
