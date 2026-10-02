/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-info variant.
 * Base: columns. Source: https://drgroot.co.kr/product/detail.html?product_no=1119
 * Selector: .prdInfo_contents
 * Each visible, non-empty .base_form_toggle -> one cell: h3 title + cleaned body.
 * Output: 1 row x N cells.
 * Body cleaning: rich-text soup (nested span/div/p, br runs, wbr, nbsp) is flattened
 * into plain <p> lines; label/value lists (ul.delivery) become <ul><li><strong>label</strong> value</li></ul>.
 * Generated: 2026-10-02
 */
const ORIGIN = 'https://drgroot.co.kr';

const BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'TR', 'SECTION', 'ARTICLE', 'BLOCKQUOTE']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'INPUT', 'BUTTON', 'SVG', 'IMG']);

function absUrl(url) {
  if (!url) return '';
  const u = url.trim();
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function norm(text) {
  return (text || '').replace(/ /g, ' ').replace(/\s+/g, ' ');
}

function isHidden(el) {
  return !!(el.closest && el.closest('.displaynone'));
}

/**
 * Flattens arbitrary rich-text markup into an array of <p> elements.
 * Lines break at block elements and <br>; empty lines are dropped. Links are kept.
 */
function flattenToParagraphs(root, document) {
  const paragraphs = [];
  let current = [];

  const flush = () => {
    // trim leading/trailing whitespace across the collected inline nodes
    while (current.length && current[0].nodeType === 3 && !current[0].textContent.trim()) current.shift();
    while (current.length && current[current.length - 1].nodeType === 3 && !current[current.length - 1].textContent.trim()) current.pop();
    const text = current.map((n) => n.textContent).join('').trim();
    if (text) {
      const p = document.createElement('p');
      current.forEach((n, i) => {
        if (n.nodeType === 3) {
          let t = n.textContent;
          if (i === 0) t = t.replace(/^\s+/, '');
          if (i === current.length - 1) t = t.replace(/\s+$/, '');
          if (t) p.append(document.createTextNode(t));
        } else {
          p.append(n);
        }
      });
      paragraphs.push(p);
    }
    current = [];
  };

  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        const t = norm(child.textContent);
        if (t) current.push(document.createTextNode(t));
        return;
      }
      if (child.nodeType !== 1) return;
      const tag = child.tagName.toUpperCase();
      if (SKIP_TAGS.has(tag) || isHidden(child)) return;
      if (tag === 'BR') { flush(); return; }
      if (tag === 'WBR') return;
      if (tag === 'A' && child.getAttribute('href')) {
        const text = norm(child.textContent).trim();
        if (text) {
          const a = document.createElement('a');
          a.href = absUrl(child.getAttribute('href'));
          a.textContent = text;
          current.push(a);
        }
        return;
      }
      if (tag === 'STRONG' || tag === 'B') {
        const text = norm(child.textContent).trim();
        if (text) {
          const s = document.createElement('strong');
          s.textContent = text;
          current.push(s);
        }
        return;
      }
      if (BLOCK_TAGS.has(tag)) {
        flush();
        walk(child);
        flush();
        return;
      }
      walk(child); // inline wrapper (span, font, em, ...)
    });
  };

  walk(root);
  flush();
  return paragraphs;
}

/** Converts a label/value list (li > h4 label + value) into a clean ul; returns extra paragraphs. */
function convertLabelList(list, document) {
  const ul = document.createElement('ul');
  const extras = [];
  [...list.children].forEach((li) => {
    if (isHidden(li)) return;
    const label = li.querySelector(':scope > h4, :scope > strong, :scope > .title');
    if (label) {
      const labelText = norm(label.textContent).replace(/\s*:\s*$/, '').trim();
      const valueText = [...li.childNodes]
        .filter((n) => n !== label)
        .map((n) => n.textContent)
        .join(' ');
      const value = norm(valueText).trim();
      if (!labelText && !value) return;
      const item = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = labelText;
      item.append(strong);
      if (value) item.append(document.createTextNode(` ${value}`));
      ul.append(item);
    } else {
      extras.push(...flattenToParagraphs(li, document));
    }
  });
  return { ul: ul.children.length ? ul : null, extras };
}

export default function parse(element, { document }) {
  const toggles = [...element.querySelectorAll('.base_form_toggle')].filter((t) => !t.classList.contains('displaynone'));

  const row = [];
  toggles.forEach((toggle) => {
    const content = toggle.querySelector(':scope > .content') || toggle.querySelector('.content');
    if (!content || !norm(content.textContent).trim()) return;

    const cell = document.createElement('div');

    const titleEl = toggle.querySelector('.title h3 span') || toggle.querySelector('.title h3, .title');
    const title = titleEl ? norm(titleEl.textContent).trim() : '';
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      cell.append(h3);
    }

    // Label/value lists (e.g. 배송안내 ul.delivery) get list treatment; the rest is flattened.
    const labelLists = [...content.querySelectorAll('ul')].filter((ul) => ul.querySelector(':scope > li > h4'));
    if (labelLists.length) {
      labelLists.forEach((list) => {
        const { ul, extras } = convertLabelList(list, document);
        if (ul) cell.append(ul);
        cell.append(...extras);
        list.remove();
      });
    }
    cell.append(...flattenToParagraphs(content, document));

    if (cell.children.length > (title ? 1 : 0)) row.push(cell);
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (columns-info)', cells });
  element.replaceWith(block);
}
