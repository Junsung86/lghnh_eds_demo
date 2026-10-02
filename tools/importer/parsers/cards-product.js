/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product variant.
 * Base: cards. Source: https://drgroot.co.kr/product/detail.html?product_no=1119
 * Selector: .xans-product-relationlist.base_prd_list
 * Each .swiper-slide -> row [image] | [p > a name, p price]
 * Iterates the slide wrappers (block-level divs), not the inner product anchors.
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
  return node ? node.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function isHidden(el) {
  return !!el.closest('.displaynone');
}

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')];
  if (!slides.length) {
    // Fallback: non-swiper list markup
    slides = [...element.querySelectorAll('.description')].map((d) => d.parentElement.closest('li, div') || d.parentElement);
  }

  const cells = [];
  const seen = new Set();
  slides.forEach((slide) => {
    const link = slide.querySelector('a[href]');
    const href = link ? absUrl(link.getAttribute('href')) : '';
    const nameEl = slide.querySelector('.description .name, .name, .description strong');
    const name = cleanText(nameEl);
    const key = `${href}|${name}`;
    if (seen.has(key)) return;
    seen.add(key);

    // Image cell
    const imageCell = document.createElement('div');
    const srcImg = slide.querySelector('.thumbnail img') || slide.querySelector('img');
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = absUrl(srcImg.getAttribute('src'));
      img.alt = srcImg.getAttribute('alt') || name;
      imageCell.append(img);
    }

    // Body cell
    const bodyCell = document.createElement('div');
    if (name) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = name;
        p.append(a);
      } else {
        p.textContent = name;
      }
      bodyCell.append(p);
    }

    // Price: first visible price entry (skip .displaynone labels)
    let priceEls = [...slide.querySelectorAll('.price_wrap > li')];
    if (!priceEls.length) priceEls = [...slide.querySelectorAll('.price, [class*="Price"]:not(ul)')];
    const prices = [];
    priceEls
      .filter((el) => !isHidden(el) && cleanText(el))
      .forEach((el) => {
        const t = cleanText(el);
        if (!prices.includes(t)) prices.push(t);
      });
    if (prices.length) {
      const p = document.createElement('p');
      p.textContent = prices.join(' ');
      bodyCell.append(p);
    }

    if (!imageCell.children.length && !bodyCell.children.length) return;
    cells.push([imageCell, bodyCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (cards-product)', cells });
  element.replaceWith(block);
}
