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
    // Census NAME format: "ZCTA5 78702" — keep as "ZIP 78702" for display
    const zcta = rows[i][1];
    out[zcta] = `ZIP ${zcta}`;
  }
  const outPath = path.join(__dirname, '..', 'data', 'zcta-names.json');
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`Written ${Object.keys(out).length} entries to ${outPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
