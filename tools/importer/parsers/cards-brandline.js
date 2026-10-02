/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-brandline variant.
 * Base: cards. Source: https://drgroot.co.kr/product/detail.html?product_no=1119
 * Selector: .base_layout_wrapper .prdDetail_banner_container
 * Each .slide-ivBanner -> row [image] | [p tagline (br-separated), p > strong name, p > a CTA]
 * Iterates slide wrappers (block-level divs); swiper duplicate slides are skipped.
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

function usableHref(a) {
  const h = a ? (a.getAttribute('href') || '').trim() : '';
  if (!h || h === '#' || h.startsWith('#none') || h.startsWith('javascript')) return '';
  return absUrl(h);
}

export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.slide-ivBanner:not(.swiper-slide-duplicate)')];
  if (!slides.length) slides = [...element.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')];

  const cells = [];
  const seen = new Set();
  slides.forEach((slide) => {
    const srcImg = slide.querySelector('.img_box img') || slide.querySelector('img');
    const imgLink = slide.querySelector('.img_box a[href]');
    const nameEl = slide.querySelector('.text_box .p3, .p3');
    const name = cleanText(nameEl);
    // drop the per-request "?date=" cache-buster so re-imports stay stable
    const src = srcImg ? absUrl(srcImg.getAttribute('src')).replace(/[?&]date=\d+$/, '') : '';
    const key = `${src}|${name}`;
    if (seen.has(key)) return;
    seen.add(key);

    // Image cell
    const imageCell = document.createElement('div');
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = srcImg.getAttribute('alt') || name;
      imageCell.append(img);
    }

    // Body cell
    const bodyCell = document.createElement('div');

    // Tagline: preserve line breaks (newlines in source text or <br>)
    const taglineEl = slide.querySelector('.text_box .p5, .p5');
    if (taglineEl) {
      const raw = taglineEl.innerHTML.replace(/<br\s*\/?>/gi, '\n');
      const tmp = document.createElement('div');
      tmp.innerHTML = raw;
      const lines = tmp.textContent.replace(/ /g, ' ').split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
      if (lines.length) {
        const p = document.createElement('p');
        lines.forEach((line, i) => {
          if (i) p.append(document.createElement('br'));
          p.append(document.createTextNode(line));
        });
        bodyCell.append(p);
      }
    }

    if (name) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = name;
      p.append(strong);
      bodyCell.append(p);
    }

    // CTA: button link, falling back to the image link href
    const btn = slide.querySelector('.iv_button a');
    const href = usableHref(btn) || usableHref(imgLink);
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = cleanText(btn) || '자세히 보기';
      p.append(a);
      bodyCell.append(p);
    }

    if (!imageCell.children.length && !bodyCell.children.length) return;
    cells.push([imageCell, bodyCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (cards-brandline)', cells });
  element.replaceWith(block);
}
