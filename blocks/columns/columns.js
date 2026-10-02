/**
 * Adds semantic region classes to the text column of the columns-product variant:
 * category link, product name, rating, price (discount / sale / original) and shipping note.
 */
function decorateProductText(col) {
  const items = [...col.children];
  const heading = items.find((el) => /^H[1-6]$/.test(el.tagName));
  if (heading) heading.classList.add('columns-product-name');
  const headingIndex = heading ? items.indexOf(heading) : -1;
  items.forEach((el, i) => {
    if (el === heading || el.tagName !== 'P') return;
    const text = el.textContent.trim();
    if (headingIndex > -1 && i < headingIndex) {
      el.classList.add('columns-product-category');
    } else if (el.querySelector('del, s') || (el.querySelector('strong') && /\d/.test(text))) {
      el.classList.add('columns-product-price');
      // discount percentage: leading text such as "10%"
      const first = el.firstChild;
      if (first && first.nodeType === Node.TEXT_NODE && /^\s*\d+\s*%/.test(first.textContent)) {
        const [match] = first.textContent.match(/^\s*\d+\s*%/);
        const span = document.createElement('span');
        span.className = 'columns-product-discount';
        span.textContent = match.trim();
        first.textContent = first.textContent.slice(match.length);
        el.insertBefore(span, first);
      }
    } else if (/[★☆]/.test(text)) {
      el.classList.add('columns-product-rating');
    } else {
      el.classList.add('columns-product-note');
    }
  });
}

export default function decorate(block) {
  const isProduct = block.classList.contains('columns-product');
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const img = col.querySelector(':scope > p > img');
      if ((pic && col.children.length === 1) || (img && col.children.length === 1)) {
        col.classList.add('columns-img-col');
      } else {
        col.classList.add('columns-text-col');
        if (isProduct) decorateProductText(col);
      }
    });
  });
}
