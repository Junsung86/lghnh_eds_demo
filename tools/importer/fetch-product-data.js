/* eslint-disable */
/**
 * Fetches product data from the AEM GraphQL persisted query for each mapped product
 * and saves a snapshot to tools/importer/data/product-info.json.
 *
 * The import runs inside a browser where the AEM publish endpoint is blocked by CORS,
 * so the snapshot is fetched here (Node, no CORS) and bundled into the import script.
 * The product-info block still fetches live data at runtime and only falls back to
 * this snapshot when the live request fails.
 *
 * Usage: node tools/importer/fetch-product-data.js
 */
const fs = require('fs');
const path = require('path');

const ENDPOINT_BASE = 'https://publish-p166217-e1771263.adobeaemcloud.com/graphql/execute.json/ref-demo-eds';

// Cafe24 product_no -> { query, path } (shared with tools/product-sync)
const { default: PRODUCTS } = require('./data/product-map.js');

(async () => {
  const out = {};
  for (const [productNo, { query, path: fragmentPath }] of Object.entries(PRODUCTS)) {
    const endpoint = `${ENDPOINT_BASE}/${query};path=${fragmentPath}`;
    // bypass the CDN cache (s-maxage 2h) so freshly published data is read
    const resp = await fetch(`${endpoint}?ck=${Date.now()}`);
    if (!resp.ok) throw new Error(`${productNo}: HTTP ${resp.status}`);
    const json = await resp.json();
    const item = json?.data?.geoProductV2ByPath?.item;
    if (!item) throw new Error(`${productNo}: no item in response`);
    out[productNo] = { endpoint, fetchedAt: new Date().toISOString(), item };
    console.log(`✓ ${productNo}: ${item.displayName}`);
  }
  const file = path.join(__dirname, 'data', 'product-info.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`Saved ${file}`);
})();
