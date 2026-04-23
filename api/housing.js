// api/housing.js — Vercel serverless function
'use strict';

const cityFips = require('../data/city-fips.json');
const zipCounty = require('../data/zip-county.json');
const zctaNames = require('../data/zcta-names.json');
const cityCbsa = require('../data/city-cbsa.json');

// --- Pure helper functions (exported for testing) ---

function normalizeKey(city, state) {
  return `${city.trim().toLowerCase()}|${state.trim().toUpperCase()}`;
}

function assignBadge(medianHomeValue, maxPrice) {
  if (medianHomeValue < Math.round(maxPrice * 0.75)) return 'best_value';
  if (medianHomeValue <= maxPrice) return 'in_range';
  if (medianHomeValue <= Math.round(maxPrice * 1.15)) return 'near_limit';
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

module.exports.normalizeKey = normalizeKey;
module.exports.assignBadge = assignBadge;
module.exports.buildMarketNote = buildMarketNote;
module.exports.parseCensusRows = parseCensusRows;
module.exports.filterAndRank = filterAndRank;
