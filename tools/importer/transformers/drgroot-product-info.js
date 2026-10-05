/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: adds a Product Info block (GraphQL endpoint + snapshot rows) right after
 * the product summary (Columns (columns-product)) block.
 *
 * Product data comes from payload.productData — the snapshot in tools/importer/data/product-info.json
 * (fetched with fetch-product-data.js, keyed by Cafe24 product_no) passed in by import-product.js. The block fetches live data at
 * runtime; these rows are the authored fallback. Pages without a snapshot are left as is.
 */
const TransformHook = { afterTransform: 'afterTransform' };

const plain = (field) => (typeof field === 'string' ? field : (field && field.plaintext) || '').trim();

function list(document, items) {
  const ul = document.createElement('ul');
  items.filter(Boolean).forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.append(li);
  });
  return ul;
}

function paras(document, text) {
  return text.split(/\n+/).map((t) => t.trim()).filter(Boolean).map((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    return p;
  });
}

function titledList(document, entries) {
  const ul = document.createElement('ul');
  entries.forEach(([title, text]) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = title;
    li.append(strong);
    if (text) li.append(document.createTextNode(` ${text}`));
    ul.append(li);
  });
  return ul;
}

// referenced fragments: featureSet/claimSet (current model) or features/claims (older queries)
function featureEntries(item) {
  const set = item.featureSet || item.features || {};
  const summaries = set.featureSummaries || [];
  return (set.featureTitles || []).map((title, i) => [title, plain(summaries[i])]).filter(([t]) => t);
}

function claimEntries(item) {
  const set = item.claimSet || item.claims || {};
  const filled = (v) => v && v.trim() !== '-';
  // "statement: value · condition · footnote"; '-' marks an empty value in the claim set
  return (set.statements || []).map((statement, i) => [
    statement,
    [(set.claimValues || [])[i], (set.conditions || [])[i], plain((set.footnotes || [])[i])].filter(filled).join(' · '),
  ]).filter(([s]) => s);
}

function buildCells(document, { endpoint, item }) {
  const link = document.createElement('a');
  link.href = endpoint;
  link.textContent = endpoint;

  const specs = document.createElement('ul');
  [
    ['용량', item.volume],
    ['기능성', item.functionalCosmetic],
    ['추천 두피', (item.recommendedFor || []).join(', ')],
    ['pH', item.ph],
    ['향', [item.scent, (item.scentNotes || []).join(' / ')].filter(Boolean).join(' — ')],
    ['사용기한', item.shelfLife],
    ['제조사', item.manufacturer],
  ].filter(([, v]) => v).forEach(([k, v]) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = k;
    li.append(strong, document.createTextNode(` ${v}`));
    specs.append(li);
  });

  const rows = [
    ['Product Info'],
    ['GraphQL', link],
    ['하이라이트', list(document, [plain(item.functionalCosmetic).replace(/\s*\(.*\)\s*$/, '')])],
    ['요약', paras(document, plain(item.summary))],
    ['상세 정보', [...paras(document, plain(item.description) || plain(item.definition)), specs]],
    ['사용 방법', list(document, (item.howToUse && item.howToUse.length ? item.howToUse : item.routine) || [])],
    ['성분', list(document, item.keyIngredients || [])],
  ];
  // optional trailing rows: only when the product has feature / claim sets
  const features = featureEntries(item);
  const claims = claimEntries(item);
  if (features.length || claims.length) {
    rows.push(['주요 특징', titledList(document, features)], ['효능 근거', titledList(document, claims)]);
  }
  return rows;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;
  let productNo = null;
  try { productNo = new URL(payload.params.originalURL).searchParams.get('product_no'); } catch (e) { /* no url */ }
  const data = productNo && payload.productData && payload.productData[productNo];
  if (!data) return;

  // the product summary block table; the importer writes its name as "Columns (columns Product)"
  const blockName = (t) => ((t.querySelector('th, td') || {}).textContent || '').toLowerCase().replace(/[\s-]+/g, '-');
  const summary = [...element.querySelectorAll('table')].find((t) => blockName(t).includes('columns-product'));
  if (!summary) return;

  const { document } = payload;
  const block = WebImporter.Blocks.createBlock(document, { name: 'Product Info', cells: buildCells(document, data).slice(1) });
  summary.after(block);
}
