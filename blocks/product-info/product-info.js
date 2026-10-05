/**
 * Product info: highlights, summary and accordions (details / features / how to use /
 * ingredients / claims / FAQ) driven by an AEM GraphQL persisted query.
 *
 * Authored rows (label | content):
 *   1. endpoint row — content cell holds the persisted-query URL (link or text)
 *   2–9. snapshot rows in this order: highlights, summary, details, how to use, ingredients,
 *        features, claims, faq (the last three are optional).
 *        Labels are shown as headings; contents are the fallback when the live request fails
 *        (e.g. CORS not yet allowed on AEM publish).
 *
 * The block fetches live data on load and, on success, re-renders from it using the
 * authored labels. Rich-text fields are read as plaintext — no CMS HTML is injected.
 * If the product-summary columns block sits before it in the section, the block moves
 * itself under the summary text (below the shipping note).
 */

// row order is the authoring contract; new rows are only ever appended
const KEYS = ['highlights', 'summary', 'details', 'howto', 'ingredients', 'features', 'claims', 'faq'];
const DEFAULT_LABELS = {
  highlights: '하이라이트',
  summary: '요약',
  details: '상세 정보',
  howto: '사용 방법',
  ingredients: '성분',
  features: '주요 특징',
  claims: '효능 근거',
  faq: '자주 묻는 질문',
};
const ACCORDION_KEYS = ['details', 'features', 'howto', 'ingredients', 'claims', 'faq'];
const FETCH_TIMEOUT = 4000;

const plain = (field) => (typeof field === 'string' ? field : field?.plaintext || '').trim();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function list(items) {
  const ul = el('ul');
  items.filter(Boolean).forEach((item) => ul.append(el('li', '', item)));
  return ul;
}

function paragraphs(text) {
  const frag = document.createDocumentFragment();
  text.split(/\n+/).map((t) => t.trim()).filter(Boolean).forEach((t) => frag.append(el('p', '', t)));
  return frag;
}

/** list of "<strong>title</strong> text" items */
function titledList(entries) {
  const ul = el('ul');
  entries.forEach(([title, text]) => {
    const li = el('li');
    li.append(el('strong', '', title));
    if (text) li.append(document.createTextNode(` ${text}`));
    ul.append(li);
  });
  return ul;
}

// referenced fragments: featureSet/claimSet (current model) or features/claims (older queries)
function featureEntries(item) {
  const set = item.featureSet || item.features || {};
  const summaries = set.featureSummaries || [];
  return (set.featureTitles || []).map((title, i) => [title, plain(summaries[i])])
    .filter(([t]) => t);
}

// "statement: value · condition · footnote"; '-' marks an empty value in the claim set
function claimEntries(item) {
  const set = item.claimSet || item.claims || {};
  const filled = (v) => v && v.trim() !== '-';
  return (set.statements || []).map((statement, i) => [
    statement,
    [set.claimValues?.[i], set.conditions?.[i], plain(set.footnotes?.[i])].filter(filled).join(' · '),
  ]).filter(([s]) => s);
}

// FAQ: question / answer pairs (also published as FAQPage in the page JSON-LD)
function faqEntries(item) {
  const answers = item.faqAnswers || [];
  return (item.faqQuestions || []).map((q, i) => [q, plain(answers[i])]).filter(([q]) => q);
}

/** Maps a GraphQL product item to content nodes per section key */
export function contentFromItem(item) {
  const specs = el('ul', 'product-info-specs');
  [
    ['용량', item.volume],
    ['기능성', item.functionalCosmetic],
    ['추천 두피', (item.recommendedFor || []).join(', ')],
    ['pH', item.ph],
    ['향', [item.scent, (item.scentNotes || []).join(' / ')].filter(Boolean).join(' — ')],
    ['사용기한', item.shelfLife],
    ['제조사', item.manufacturer],
  ].filter(([, v]) => v).forEach(([k, v]) => {
    const li = el('li');
    li.append(el('strong', '', k), document.createTextNode(` ${v}`));
    specs.append(li);
  });

  const details = document.createDocumentFragment();
  details.append(paragraphs(plain(item.description) || plain(item.definition)), specs);

  return {
    // highlight chip: functional claim without the parenthetical note
    highlights: list([plain(item.functionalCosmetic).replace(/\s*\(.*\)\s*$/, '')]),
    summary: paragraphs(plain(item.summary)),
    details,
    // step-by-step usage when the model provides it, otherwise the care routine
    howto: list(item.howToUse?.length ? item.howToUse : item.routine || []),
    ingredients: list(item.keyIngredients || []),
    features: titledList(featureEntries(item)),
    claims: titledList(claimEntries(item)),
    faq: titledList(faqEntries(item)),
  };
}

/** Reads authored rows into { endpoint, labels, content } */
function readAuthored(block) {
  const rows = [...block.children];
  const endpointRow = rows.find((r) => /graphql|endpoint/i.test(r.firstElementChild?.textContent || ''));
  const endpointCell = endpointRow?.lastElementChild;
  const endpoint = endpointCell?.querySelector('a')?.href || endpointCell?.textContent.trim() || '';
  const labels = { ...DEFAULT_LABELS };
  const content = {};
  rows.filter((r) => r !== endpointRow).forEach((row, i) => {
    const key = KEYS[i];
    if (!key) return;
    const [labelCell, valueCell] = row.children;
    if (labelCell?.textContent.trim()) labels[key] = labelCell.textContent.trim();
    if (valueCell) {
      const frag = document.createDocumentFragment();
      frag.append(...valueCell.childNodes);
      content[key] = frag;
    }
  });
  return { endpoint, labels, content };
}

function render(block, labels, content) {
  const wrap = document.createDocumentFragment();

  // sections without data (e.g. a fragment with only a few fields filled) are skipped
  const chips = el('ul', 'product-info-chips');
  content.highlights?.querySelectorAll?.('li, p').forEach((item) => {
    const text = item.textContent.trim();
    if (!text) return;
    const chip = el('li', 'product-info-chip');
    chip.append(el('span', 'product-info-chip-icon'), el('span', 'product-info-chip-label', text));
    chips.append(chip);
  });
  if (chips.children.length) {
    const sec = el('div', 'product-info-section product-info-highlights');
    sec.append(el('h2', 'product-info-heading', labels.highlights), chips);
    wrap.append(sec);
  }

  if (content.summary?.textContent.trim()) {
    const sec = el('div', 'product-info-section product-info-summary');
    sec.append(el('h2', 'product-info-heading', labels.summary), content.summary);
    wrap.append(sec);
  }

  const accordions = el('div', 'product-info-accordions');
  ACCORDION_KEYS.filter((k) => content[k]?.textContent.trim()).forEach((key) => {
    const details = el('details', `product-info-item product-info-${key}`);
    details.append(el('summary', 'product-info-item-label', labels[key]));
    const body = el('div', 'product-info-item-body');
    body.append(content[key]);
    details.append(body);
    accordions.append(details);
  });
  if (accordions.children.length) wrap.append(accordions);

  block.replaceChildren(wrap);
}

async function fetchItem(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const resp = await fetch(endpoint, { signal: controller.signal });
    if (!resp.ok) return null;
    const json = await resp.json();
    return json?.data && Object.values(json.data)[0]?.item;
  } catch (e) {
    return null; // CORS / network / timeout: keep the authored snapshot
  } finally {
    clearTimeout(timer);
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const { endpoint, labels, content } = readAuthored(block);

  // place under the product summary text when a columns-product block precedes it
  const target = block.closest('.section')?.querySelector('.columns-product .columns-text-col');
  const wrapper = block.closest('.product-info-wrapper');
  if (target && wrapper) target.append(wrapper);

  render(block, labels, content);
  block.dataset.source = 'snapshot';

  if (endpoint) {
    const item = await fetchItem(endpoint);
    if (item) {
      render(block, labels, contentFromItem(item));
      block.dataset.source = 'live';
    }
  }
}
