/**
 * Adobe I/O Runtime action: keeps DA product pages in sync with AEM product content fragments.
 *
 * Triggered by the AEM event "aem.sites.contentFragment.published" (delivered by I/O Events).
 * For a mapped fragment it reads the published data, replaces the Product Info block in the
 * DA page /product/detail-{product_no} and previews the page. Publishing stays manual.
 *
 * Manual run: aio rt action invoke product-sync/sync -r -p path <fragment path> [-p dryRun true]
 */
// shared with the importer; bundled into the action by aio at deploy time
// eslint-disable-next-line import/no-relative-packages
import PRODUCTS from '../../../importer/data/product-map.js';
import { buildProductInfoBlock, replaceProductInfo, sameMarkup } from './product-info-html.js';

const DA_ADMIN = 'https://admin.da.live';
const HLX_ADMIN = 'https://admin.hlx.page';
const RETRY_DELAY = 5000;

const done = (status, details = {}) => ({ statusCode: 200, body: { status, ...details } });
const fail = (statusCode, error) => ({ statusCode, body: { status: 'error', error } });

/** IMS access token of the technical account (OAuth Server-to-Server credential) */
async function getImsToken(params) {
  if (params.IMS_ACCESS_TOKEN) return params.IMS_ACCESS_TOKEN;
  if (!params.IMS_CLIENT_ID) return null;
  const resp = await fetch(`${params.IMS_ENDPOINT || 'https://ims-na1.adobelogin.com'}/ims/token/v3`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: params.IMS_CLIENT_ID,
      client_secret: params.IMS_CLIENT_SECRET,
      scope: params.IMS_SCOPES,
    }),
  });
  if (!resp.ok) throw new Error(`IMS token request failed: HTTP ${resp.status}`);
  return (await resp.json()).access_token;
}

/**
 * Reads the product item from the persisted query. Publish responses are CDN-cached for
 * up to 2 hours, so the cache is bypassed; retries cover replication lag right after publish.
 */
async function fetchItem(endpoint, attempts = 3) {
  const resp = await fetch(`${endpoint}?ck=${Date.now()}`);
  const json = resp.ok ? await resp.json() : {};
  const item = Object.values(json.data || {})[0]?.item;
  if (item || attempts <= 1) return item || null;
  await new Promise((resolve) => { setTimeout(resolve, RETRY_DELAY); });
  return fetchItem(endpoint, attempts - 1);
}

// eslint-disable-next-line import/prefer-default-export
export async function main(params) {
  // I/O Events webhook verification
  if (params.challenge) return { statusCode: 200, body: { challenge: params.challenge } };

  // event type: aem.sites.<contentType>.<eventName>
  const [, , contentType, eventName] = (params.type || '').split('.');
  const eventNames = (params.EVENT_NAMES || 'published').split(',').map((e) => e.trim());
  if (params.type && (contentType !== 'contentFragment' || !eventNames.includes(eventName))) {
    return done('skipped', { reason: `event ${params.type} is not handled` });
  }

  const cfPath = params.data?.path || params.path;
  const entry = Object.entries(PRODUCTS).find(([, product]) => product.path === cfPath);
  if (!entry) return done('skipped', { reason: `no product mapped to ${cfPath}` });
  const [productNo, { query }] = entry;
  const page = `/product/detail-${productNo}`;

  const endpoint = `${params.GRAPHQL_BASE}/${query};path=${cfPath}`;
  const item = await fetchItem(endpoint);
  if (!item) return fail(502, `no product data at ${endpoint}`);

  const token = await getImsToken(params);
  const auth = token ? { Authorization: `Bearer ${token}` } : {};
  const source = `${DA_ADMIN}/source/${params.DA_ORG}/${params.DA_REPO}${page}.html`;

  const docResp = await fetch(source, { headers: auth });
  if (docResp.status === 404) return done('skipped', { page, reason: 'DA page not found, import it first' });
  if (!docResp.ok) return fail(502, `DA read ${page}: HTTP ${docResp.status}`);
  const doc = await docResp.text();

  const updated = replaceProductInfo(doc, buildProductInfoBlock(item, endpoint));
  if (!updated) return done('skipped', { page, reason: 'page has no product summary block' });
  if (sameMarkup(doc, updated)) return done('unchanged', { page });
  if (params.dryRun) return done('dry-run', { page, html: updated });

  const form = new FormData();
  form.append('data', new Blob([updated], { type: 'text/html' }), `detail-${productNo}.html`);
  const saveResp = await fetch(source, { method: 'POST', headers: auth, body: form });
  if (!saveResp.ok) return fail(502, `DA save ${page}: HTTP ${saveResp.status}`);

  const owner = params.HLX_OWNER || params.DA_ORG;
  const site = params.HLX_SITE || params.DA_REPO;
  const previewResp = await fetch(`${HLX_ADMIN}/preview/${owner}/${site}/${params.HLX_REF || 'main'}${page}`, {
    method: 'POST',
    headers: params.HLX_ADMIN_API_KEY ? { Authorization: `token ${params.HLX_ADMIN_API_KEY}` } : auth,
  });
  if (!previewResp.ok) return fail(502, `DA saved, preview ${page} failed: HTTP ${previewResp.status}`);

  return done('updated', { page, fragment: cfPath });
}
