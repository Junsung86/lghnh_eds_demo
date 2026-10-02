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

const ENDPOINT_BASE = 'https://publish-p166217-e1771263.adobeaemcloud.com/graphql/execute.json/ref-demo-eds/lghnh_demo';

// Cafe24 product_no -> AEM content fragment path
const PRODUCTS = {
  1119: '/content/dam/ref-demo-eds/geo-pilot/drgroot-bioexosome-shampoo-400ml/product',
};

(async () => {
  const out = {};
  for (const [productNo, fragmentPath] of Object.entries(PRODUCTS)) {
    const endpoint = `${ENDPOINT_BASE};path=${fragmentPath}`;
    const resp = await fetch(endpoint);
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
