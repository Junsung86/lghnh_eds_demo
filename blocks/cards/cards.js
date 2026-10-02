import { createOptimizedPicture } from '../../scripts/aem.js';

/* variants whose cards carry product-style semantics (image may be linked, no tag pill) */
const PRODUCT_VARIANTS = ['cards-product', 'cards-brandline'];

/**
 * Detects an image-only cell, including images wrapped in a link
 * (<p><a><img></a></p> or <a><picture></a>) as used by product-style variants.
 */
function isLinkedImageCell(div) {
  return div.children.length === 1
    && !!div.querySelector(':scope > p > a > img, :scope > a > picture, :scope > a > img, :scope > p > a > picture')
    && !div.textContent.trim();
}

/**
 * Adds semantic region classes to the body of product-style cards.
 * Runs before the full-card link is built so the original link positions are known.
 */
function classifyProductBody(body, isBrandline) {
  const items = [...body.children];
  const linkItems = items.filter((el) => el.querySelector('a'));
  if (isBrandline) {
    // tagline | bold name | text link
    const cta = linkItems[linkItems.length - 1];
    if (cta) cta.classList.add('cards-card-cta');
    const title = items.find((el) => el !== cta
      && (/^H[1-6]$/.test(el.tagName) || el.querySelector(':scope > strong, :scope > b')));
    if (title) title.classList.add('cards-card-title');
    items.forEach((el) => {
      if (!el.classList.length) el.classList.add('cards-card-tagline');
    });
  } else {
    // name link | price
    const title = linkItems[0] || items.find((el) => /^H[1-6]$/.test(el.tagName));
    if (title) title.classList.add('cards-card-title');
    items.forEach((el) => {
      if (!el.classList.length) el.classList.add('cards-card-price');
    });
  }
}

export default function decorate(block) {
  const isProductVariant = PRODUCT_VARIANTS.some((c) => block.classList.contains(c));
  const isBrandline = block.classList.contains('cards-brandline');
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1
        && (div.querySelector('picture') || div.querySelector(':scope > p > img'))) {
        div.className = 'cards-card-image';
      } else if (isProductVariant && isLinkedImageCell(div)) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        if (isProductVariant) {
          classifyProductBody(div, isBrandline);
        } else {
          const tag = div.querySelector(':scope > p:first-child');
          if (tag && !tag.querySelector('a, img')) tag.classList.add('tag-pill');
        }
      }
    });
    // Wrap entire card in its link for full-surface clickability
    const link = li.querySelector('.cards-card-body a')
      || (isProductVariant ? li.querySelector('.cards-card-image a') : null);
    if (link) {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.className = 'cards-card-link';
      while (li.firstChild) wrapper.append(li.firstChild);
      // Remove the original link from the heading to avoid nested <a>
      if (isProductVariant) {
        // product-style cards may hold several links (image, name, CTA) — unwrap all in place
        wrapper.querySelectorAll('a').forEach((innerLink) => {
          innerLink.replaceWith(...innerLink.childNodes);
        });
      } else {
        const innerLink = wrapper.querySelector('.cards-card-body a');
        if (innerLink) {
          const parent = innerLink.parentElement;
          while (innerLink.firstChild) parent.append(innerLink.firstChild);
          innerLink.remove();
        }
      }
      li.append(wrapper);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
