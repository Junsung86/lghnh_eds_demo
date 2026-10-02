/* eslint-disable */

/**
 * Dr.Groot nav fragment importer (drgroot.co.kr, Cafe24 skin).
 * Parses the global header (#base_header_container) and produces the fragment at /drgroot/nav:
 *   Section 1 (promo):    promo strip slides — <p><a><img></a></p> per slide
 *   Section 2 (brand):    <p><a>Dr.Groot</a></p> (logo SVG is rendered by drgroot-header.js)
 *   Section 3 (sections): nested <ul> — top menu > dropdown items > 3rd-level categories
 *   Section 4 (tools):    <ul> account (+ sub links), search (+ popular keywords), cart
 * Detection is DOM-driven; the result only depends on the header markup.
 */

const ORIGIN = 'https://drgroot.co.kr';

function absUrl(href) {
  if (!href || /^(#|javascript:)/i.test(href.trim())) return '';
  try { return new URL(href.trim(), ORIGIN).href; } catch (e) { return href; }
}

function text(el) {
  return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
}

/** Cafe24 banners keep their target URL in an onclick="clickCount(id, 'url', ...)" handler */
function onclickUrl(el) {
  const holder = el && el.closest('[onclick]');
  const m = holder && holder.getAttribute('onclick').match(/clickCount\([^,]*,\s*'([^']+)'/);
  return m ? absUrl(m[1].replace(/&amp;/g, '&')) : '';
}

function link(document, label, href) {
  const a = document.createElement('a');
  a.href = href || ORIGIN;
  a.textContent = label;
  return a;
}

function para(document, child) {
  const p = document.createElement('p');
  p.append(child);
  return p;
}

/** Builds <li><a>label</a><ul>…</ul></li> recursively from a Cafe24 menu <li> */
function menuItem(document, li) {
  const a = li.querySelector(':scope > a');
  const out = document.createElement('li');
  const href = absUrl(a && a.getAttribute('href'));
  // javascript:void(0) triggers have no target — keep the label as plain text
  if (href) out.append(link(document, text(a), href));
  else out.append(document.createTextNode(text(a)));
  const sub = li.querySelector(':scope > ul');
  if (sub) {
    const ul = document.createElement('ul');
    sub.querySelectorAll(':scope > li').forEach((s) => ul.append(menuItem(document, s)));
    if (ul.children.length) out.append(ul);
  }
  return out;
}

export default {
  transform: ({ document }) => {
    const header = document.querySelector('#base_header_container');
    if (!header) return [];
    const result = document.createElement('div');
    const hr = () => result.append(document.createElement('hr'));

    // === Section 1: Promo strip slides (skip swiper duplicates) ===
    const ALT = ['가을맞이 기획전 닥터그루트 베스트셀러 ~45%', '4천만병 판매 기념 특별 기획전 ~50%'];
    const slides = [...header.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')]
      .filter((s) => s.querySelector('img'));
    slides.forEach((s, i) => {
      const img = document.createElement('img');
      img.src = absUrl(s.querySelector('img').getAttribute('src'));
      img.alt = s.querySelector('img').getAttribute('alt') || ALT[i] || '닥터그루트 기획전';
      const href = onclickUrl(s.querySelector('img'));
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.append(img);
        result.append(para(document, a));
      } else {
        result.append(para(document, img));
      }
    });
    hr();

    // === Section 2: Brand ===
    const logo = header.querySelector('.xans-layout-logotop a, h1 a');
    result.append(para(document, link(document, 'Dr.Groot', absUrl(logo && logo.getAttribute('href')) || `${ORIGIN}/`)));
    hr();

    // === Section 3: Main menu ===
    const menu = header.querySelector('.base_menu_wrapper > ul.menu_1ul:not(.util_wrapper)');
    const sections = document.createElement('ul');
    if (menu) menu.querySelectorAll(':scope > li').forEach((li) => sections.append(menuItem(document, li)));
    result.append(sections);
    hr();

    // === Section 4: Tools (account, search + popular keywords, cart) ===
    const tools = document.createElement('ul');
    const util = header.querySelector('ul.util_wrapper');
    const LABELS = { search_button: '검색', basket_button: '장바구니' };
    if (util) {
      util.querySelectorAll(':scope > li').forEach((li) => {
        if (li.classList.contains('sidebar_button')) return; // hamburger is built in JS
        const a = li.querySelector(':scope > a');
        const key = Object.keys(LABELS).find((k) => li.classList.contains(k));
        const label = LABELS[key] || '마이페이지';
        const item = document.createElement('li');
        if (key === 'search_button') {
          item.append(link(document, label, `${ORIGIN}/product/search.html`));
          const keywords = [...document.querySelectorAll('#base_search_container a[href*="keyword="]')];
          if (keywords.length) {
            const ul = document.createElement('ul');
            const title = document.querySelector('#base_search_container .title, #base_search_container strong');
            const head = document.createElement('li');
            head.textContent = text(title) || '인기검색어';
            ul.append(head);
            keywords.forEach((k) => {
              const kli = document.createElement('li');
              kli.append(link(document, `#${text(k).replace(/^#/, '')}`, absUrl(k.getAttribute('href'))));
              ul.append(kli);
            });
            item.append(ul);
          }
        } else {
          const fallback = key ? '' : `${ORIGIN}/myshop/index.html`;
          item.append(link(document, label, absUrl(a && a.getAttribute('href')) || fallback));
          const sub = li.querySelector(':scope > ul');
          if (sub) {
            const ul = document.createElement('ul');
            sub.querySelectorAll(':scope > li').forEach((s) => ul.append(menuItem(document, s)));
            item.append(ul);
          }
        }
        tools.append(item);
      });
    }
    result.append(tools);

    return [{
      element: result,
      path: '/drgroot/nav',
    }];
  },
};
