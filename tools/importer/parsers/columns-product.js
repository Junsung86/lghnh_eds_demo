/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-product variant.
 * Base: columns. Source: https://drgroot.co.kr/product/detail.html?product_no=1119
 * Selector: .prdDetail_topArea > .prdDetail_infoArea
 * Product data lives in the sibling .prdDetail_optionArea, which is removed afterwards.
 * Output: 1 row x 2 cells — [image] | [category link, h1 name, rating, price, shipping]
 * Generated: 2026-10-02
 */
const ORIGIN = 'https://drgroot.co.kr';

function absUrl(url) {
  if (!url) return '';
  const u = url.trim();
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function cleanText(node) {
  return node ? node.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : '';
}

export default function parse(element, { document }) {
  const optionArea = (element.parentElement && element.parentElement.querySelector('.prdDetail_optionArea'))
    || document.querySelector('.prdDetail_optionArea');
  const scope = optionArea || element;

  // --- Image cell ---
  const imageCell = document.createElement('div');
  const srcImg = element.querySelector('.keyImg img.BigImage')
    || element.querySelector('.keyImg img:not(#zoomGuideImage):not(#zoom_image)')
    || element.querySelector('img.BigImage');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = absUrl(srcImg.getAttribute('src'));
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.append(img);
  }

  // --- Text cell ---
  const textCell = document.createElement('div');

  // Category link (prefer the infoArea category path, fall back to header breadcrumb)
  const cateLink = scope.querySelector('.infoArea .cate_path a[href]:not([href^="javascript"])')
    || scope.querySelector('.cate_path li:last-child a[href]:not([href^="javascript"])');
  if (cateLink && cleanText(cateLink)) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = absUrl(cateLink.getAttribute('href'));
    a.textContent = cleanText(cateLink);
    p.append(a);
    textCell.append(p);
  }

  // Product name (first span in the name desc; ignore share/wishlist buttons)
  const nameEl = scope.querySelector('.prdDetail_info.name .desc > span')
    || scope.querySelector('.prd_head h2');
  let name = cleanText(nameEl);
  if (nameEl && nameEl.matches('h2')) {
    const code = nameEl.querySelector('.product_code');
    if (code) name = cleanText(nameEl).replace(cleanText(code), '').trim();
  }
  if (name) {
    const h1 = document.createElement('h1');
    h1.textContent = name;
    textCell.append(h1);
  }

  // Rating: derive star value from crema star wrappers, review count from text
  const ratingEl = scope.querySelector('.crema-product-reviews-score');
  if (ratingEl) {
    const full = ratingEl.querySelectorAll('[class*="star_wrapper--full"]').length;
    const half = ratingEl.querySelectorAll('[class*="star_wrapper--half"]').length;
    const score = full + half * 0.5;
    const countEl = ratingEl.querySelector('.review_start_wrap > span:not(.star)');
    let count = cleanText(countEl);
    if (!count) {
      const m = cleanText(ratingEl).match(/\((\d[\d,]*)\)/);
      if (m) [, count] = m;
    }
    if (score > 0 || count) {
      const p = document.createElement('p');
      const parts = ['★'];
      if (score > 0) parts.push(Number.isInteger(score) ? score.toFixed(1) : String(score));
      if (count) parts.push(`(${count})`);
      p.textContent = parts.join(' ');
      textCell.append(p);
    }
  }

  // Price: discount + sale (strong) + original (del)
  const discount = cleanText(scope.querySelector('#discount_ratio .desc'));
  const sale = cleanText(scope.querySelector('.base_prc_sell'));
  const original = cleanText(scope.querySelector('.base_prc_custom'));
  const withWon = (v) => (/원$/.test(v) ? v : `${v}원`);
  if (sale || original) {
    const p = document.createElement('p');
    if (discount) p.append(document.createTextNode(`${discount} `));
    if (sale) {
      const strong = document.createElement('strong');
      strong.textContent = withWon(sale);
      p.append(strong);
    }
    if (original && original !== sale) {
      if (sale) p.append(document.createTextNode(' '));
      const del = document.createElement('del');
      del.textContent = withWon(original);
      p.append(del);
    }
    textCell.append(p);
  }

  // Shipping
  const delivery = scope.querySelector('.delivery_price');
  if (delivery) {
    const label = cleanText(delivery.querySelector('.title')) || '배송비';
    const value = cleanText(delivery.querySelector('.desc'));
    if (value) {
      const p = document.createElement('p');
      p.textContent = `${label} ${value}`;
      textCell.append(p);
    }
  }

  // Empty-block guard
  if (!imageCell.children.length && !textCell.children.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[imageCell, textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (columns-product)', cells });
  element.replaceWith(block);

  // Remove the option area so its leftovers are not imported as default content
  if (optionArea) optionArea.remove();
}
