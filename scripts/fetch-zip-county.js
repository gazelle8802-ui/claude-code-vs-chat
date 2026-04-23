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
  const header = lines[0].replace(/^\uFEFF/, '').split('|').map(h => h.trim());

  const zctaIdx = header.indexOf('GEOID_ZCTA5_20');
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
