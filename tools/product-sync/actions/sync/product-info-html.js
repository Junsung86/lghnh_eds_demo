/**
 * Builds the Product Info block as DA document HTML from a GraphQL product item and swaps
 * it into a DA page. Mirrors tools/importer/transformers/drgroot-product-info.js (keep the
 * rows in sync) so a synced page matches a freshly imported one.
 */

const plain = (field) => (typeof field === 'string' ? field : field?.plaintext || '').trim();

const esc = (text) => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function list(items) {
  const lis = items.filter(Boolean).map((t) => `<li>${esc(t)}</li>`).join('');
  return lis ? `<ul>${lis}</ul>` : '';
}

const paras = (text) => text.split(/\n+/).map((t) => t.trim()).filter(Boolean)
  .map((t) => `<p>${esc(t)}</p>`)
  .join('');

const row = (label, content) => `<div><div><p>${esc(label)}</p></div><div>${content}</div></div>`;

function titledList(entries) {
  const lis = entries.map(([title, text]) => `<li><strong>${esc(title)}</strong>${text ? ` ${esc(text)}` : ''}</li>`).join('');
  return lis ? `<ul>${lis}</ul>` : '';
}

// referenced fragments: featureSet/claimSet (current model) or features/claims (older queries)
function featureEntries(item) {
  const set = item.featureSet || item.features || {};
  const summaries = set.featureSummaries || [];
  return (set.featureTitles || []).map((title, i) => [title, plain(summaries[i])])
    .filter(([t]) => t);
}

function claimEntries(item) {
  const set = item.claimSet || item.claims || {};
  const filled = (v) => v && v.trim() !== '-';
  return (set.statements || []).map((statement, i) => [
    statement,
    [set.claimValues?.[i], set.conditions?.[i], plain(set.footnotes?.[i])].filter(filled).join(' · '),
  ]).filter(([s]) => s);
}

/**
 * @param {object} item GraphQL product item
 * @param {string} endpoint persisted-query URL the block fetches at runtime
 * @returns {string} block HTML
 */
export function buildProductInfoBlock(item, endpoint) {
  const specs = [
    ['용량', item.volume],
    ['기능성', item.functionalCosmetic],
    ['추천 두피', (item.recommendedFor || []).join(', ')],
    ['pH', item.ph],
    ['향', [item.scent, (item.scentNotes || []).join(' / ')].filter(Boolean).join(' — ')],
    ['사용기한', item.shelfLife],
    ['제조사', item.manufacturer],
  ].filter(([, v]) => v).map(([k, v]) => `<li><strong>${esc(k)}</strong> ${esc(v)}</li>`).join('');

  const howTo = item.howToUse?.length ? item.howToUse : item.routine || [];

  const rows = [
    row('GraphQL', `<p><a href="${esc(endpoint)}">${esc(endpoint)}</a></p>`),
    row('하이라이트', list([plain(item.functionalCosmetic).replace(/\s*\(.*\)\s*$/, '')])),
    row('요약', paras(plain(item.summary))),
    row('상세 정보', paras(plain(item.description) || plain(item.definition)) + (specs ? `<ul>${specs}</ul>` : '')),
    row('사용 방법', list(howTo)),
    row('성분', list(item.keyIngredients || [])),
  ];
  // optional trailing rows: only when the product has feature / claim sets
  const features = featureEntries(item);
  const claims = claimEntries(item);
  if (features.length || claims.length) {
    rows.push(row('주요 특징', titledList(features)), row('효능 근거', titledList(claims)));
  }

  return `<div class="product-info">${rows.join('')}</div>`;
}

/** Finds the <div> starting with openTag and its matching </div> */
function findDiv(html, openTag) {
  const start = html.indexOf(openTag);
  if (start < 0) return null;
  const tags = /<(\/?)div\b[^>]*>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let m = tags.exec(html); m; m = tags.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return { start, end: m.index + m[0].length };
  }
  return null;
}

/**
 * Replaces the page's Product Info block, or inserts it after the product summary
 * (columns-product) block. Everything else in the page is left untouched.
 * @returns {string|null} updated page HTML, or null if neither block is found
 */
export function replaceProductInfo(html, blockHtml) {
  const existing = findDiv(html, '<div class="product-info">');
  if (existing) return html.slice(0, existing.start) + blockHtml + html.slice(existing.end);
  const summary = findDiv(html, '<div class="columns columns-product">');
  if (summary) return html.slice(0, summary.end) + blockHtml + html.slice(summary.end);
  return null;
}

/** Compares markup ignoring whitespace between tags (DA may reformat on save) */
export const sameMarkup = (a, b) => {
  const norm = (s) => s.replace(/>\s+</g, '><').trim();
  return norm(a) === norm(b);
};
