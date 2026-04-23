// tests/housing.test.js
// Run: node --test tests/housing.test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');

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
  assert.equal(result.length, 1);
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
  const result = filterAndRank(rows, countySet, 300000);
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
