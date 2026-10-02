/**
 * Dr.Groot header (theme: drgroot).
 * Loaded by header.js only on pages whose body has the `drgroot` theme class, so the
 * WKND header keeps its own code path. All copy, links and images come from the
 * /drgroot/nav fragment; this module only builds structure, icons and behaviour.
 *
 * Fragment sections: 1 promo slides · 2 brand · 3 main menu (nested ul) · 4 tools
 */
import { loadCSS } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getContentRoot } from '../../scripts/scripts.js';

const isDesktop = window.matchMedia('(width >= 1200px)');
const ICONS = `${window.hlx.codeBasePath}/icons`;
const PROMO_INTERVAL = 4000;

let uid = 0;
const nextId = (prefix) => {
  uid += 1;
  return `${prefix}-${uid}`;
};

function icon(name, alt = '') {
  const img = document.createElement('img');
  img.src = `${ICONS}/drgroot-${name}.svg`;
  img.alt = alt;
  img.width = 24;
  img.height = 24;
  img.className = 'drg-icon';
  return img;
}

/** Remove EDS button decoration that loadFragment may add to standalone links */
function stripButtons(root) {
  root.querySelectorAll('a.button').forEach((a) => {
    a.className = '';
    a.closest('.button-wrapper')?.classList.remove('button-wrapper');
  });
}

/** Label node of a menu <li>: its own <a> or text (inside an optional <p>) */
function itemLabel(li) {
  const own = li.querySelector(':scope > a, :scope > p > a');
  if (own) return { link: own, text: own.textContent.trim() };
  const p = li.querySelector(':scope > p');
  const text = (p || li).childNodes[0]?.textContent?.trim() || '';
  return { link: null, text };
}

/* ---------- promo strip ---------- */

function buildPromo(section) {
  const slides = [...section.querySelectorAll(':scope p')].filter((p) => p.querySelector('img'));
  const promo = document.createElement('div');
  promo.className = 'drg-promo';
  if (!slides.length) return promo;
  promo.setAttribute('role', 'region');
  promo.setAttribute('aria-roledescription', 'carousel');
  promo.setAttribute('aria-label', '기획전');
  const track = document.createElement('div');
  track.className = 'drg-promo-track';
  slides.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'drg-promo-slide';
    slide.setAttribute('aria-roledescription', 'slide');
    if (i > 0) slide.setAttribute('aria-hidden', 'true');
    slide.append(...p.childNodes);
    track.append(slide);
  });
  promo.append(track);

  if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let current = 0;
    let timer;
    const show = (n) => {
      const all = [...track.children];
      current = (n + all.length) % all.length;
      all.forEach((s, i) => {
        s.classList.toggle('is-active', i === current);
        s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
        s.querySelectorAll('a').forEach((a) => { a.tabIndex = i === current ? 0 : -1; });
      });
    };
    const start = () => { timer = setInterval(() => show(current + 1), PROMO_INTERVAL); };
    const stop = () => clearInterval(timer);
    show(0);
    start();
    promo.addEventListener('mouseenter', stop);
    promo.addEventListener('mouseleave', start);
    promo.addEventListener('focusin', stop);
    promo.addEventListener('focusout', start);
  } else {
    track.firstElementChild.classList.add('is-active');
  }
  return promo;
}

/* ---------- main menu with hover dropdowns ---------- */

function closeDropdowns(header, except) {
  header.querySelectorAll('.drg-menu-item.is-open').forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    li.querySelector('.drg-menu-trigger')?.setAttribute('aria-expanded', 'false');
  });
}

function buildMenu(section, header) {
  const nav = document.createElement('nav');
  nav.className = 'drg-menu';
  nav.setAttribute('aria-label', '주 메뉴');
  const list = document.createElement('ul');
  list.className = 'drg-menu-list';

  const source = section.querySelector(':scope ul');
  [...(source?.children || [])].forEach((srcLi) => {
    const { link, text } = itemLabel(srcLi);
    const sub = srcLi.querySelector(':scope > ul');
    const li = document.createElement('li');
    li.className = 'drg-menu-item';

    let trigger;
    if (link) {
      trigger = document.createElement('a');
      trigger.href = link.href;
    } else {
      trigger = document.createElement('button');
      trigger.type = 'button';
    }
    trigger.className = 'drg-menu-trigger';
    trigger.textContent = text;
    li.append(trigger);

    if (sub) {
      const panel = document.createElement('ul');
      panel.className = 'drg-dropdown';
      panel.id = nextId('drg-dropdown');
      [...sub.children].forEach((subLi) => {
        const { link: subLink, text: subText } = itemLabel(subLi);
        const item = document.createElement('li');
        if (subLink) {
          const a = document.createElement('a');
          a.href = subLink.href;
          a.textContent = subText;
          item.append(a);
        } else {
          item.textContent = subText;
        }
        panel.append(item);
      });
      li.append(panel);
      li.classList.add('has-dropdown');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', panel.id);

      const open = () => {
        if (!isDesktop.matches) return;
        closeDropdowns(header, li);
        // align dropdown items with the first menu item (as on the source site)
        const first = list.querySelector('.drg-menu-trigger');
        header.style.setProperty('--drg-dropdown-offset', `${Math.round(first.getBoundingClientRect().left)}px`);
        li.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      };
      let leaveTimer;
      li.addEventListener('mouseenter', () => { clearTimeout(leaveTimer); open(); });
      li.addEventListener('mouseleave', () => { leaveTimer = setTimeout(() => closeDropdowns(header), 150); });
      li.addEventListener('focusin', open);
      if (!link) {
        trigger.addEventListener('click', () => {
          if (li.classList.contains('is-open')) closeDropdowns(header);
          else open();
        });
      }
    }
    list.append(li);
  });
  nav.append(list);
  return nav;
}

/* ---------- full menu (hamburger) ---------- */

function buildAllMenu(section) {
  const panel = document.createElement('div');
  panel.className = 'drg-allmenu';
  panel.id = 'drg-allmenu';
  panel.hidden = true;
  const nav = document.createElement('nav');
  nav.className = 'drg-allmenu-nav';
  nav.setAttribute('aria-label', '전체 메뉴');

  const build = (srcUl, depth) => {
    const ul = document.createElement('ul');
    ul.className = `drg-allmenu-list drg-allmenu-depth-${depth}`;
    [...srcUl.children].forEach((srcLi) => {
      const { link, text } = itemLabel(srcLi);
      const li = document.createElement('li');
      const label = link ? document.createElement('a') : document.createElement('span');
      if (link) label.href = link.href;
      label.textContent = text;
      label.className = 'drg-allmenu-label';
      const row = document.createElement('div');
      row.className = 'drg-allmenu-row';
      row.append(label);
      li.append(row);
      const sub = srcLi.querySelector(':scope > ul');
      if (sub) {
        const child = build(sub, depth + 1);
        li.append(child);
        if (depth >= 1) {
          // 3rd level collapses behind a +/- toggle
          child.id = nextId('drg-allmenu-sub');
          child.hidden = true;
          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'drg-allmenu-toggle';
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-controls', child.id);
          toggle.setAttribute('aria-label', `${text} 하위 메뉴`);
          toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            child.hidden = expanded;
          });
          row.append(toggle);
        }
      }
      ul.append(li);
    });
    return ul;
  };
  const source = section.querySelector(':scope ul');
  if (source) nav.append(build(source, 0));
  panel.append(nav);
  return panel;
}

/* ---------- tools: account, search, cart, hamburger ---------- */

function buildSearch(item) {
  const panel = document.createElement('div');
  panel.className = 'drg-search';
  panel.id = 'drg-search';
  panel.hidden = true;
  const { link } = itemLabel(item);

  const form = document.createElement('form');
  form.className = 'drg-search-form';
  form.action = link?.href || '/';
  form.method = 'get';
  form.setAttribute('role', 'search');
  const label = document.createElement('label');
  label.className = 'drg-visually-hidden';
  label.htmlFor = 'drg-search-input';
  label.textContent = link?.textContent.trim() || '검색';
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'drg-search-input';
  input.name = 'keyword';
  input.placeholder = '검색어를 입력해주세요';
  input.autocomplete = 'off';
  const order = document.createElement('input');
  order.type = 'hidden';
  order.name = 'order_by';
  order.value = 'favor';
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'drg-search-clear';
  clear.setAttribute('aria-label', '검색어 지우기');
  clear.append(icon('close'));
  clear.addEventListener('click', () => { input.value = ''; input.focus(); });
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'drg-search-submit';
  submit.setAttribute('aria-label', label.textContent);
  submit.append(icon('search'));
  form.append(label, input, order, clear, submit);
  panel.append(form);

  // popular keywords: first <li> without a link is the heading
  const kw = item.querySelector(':scope > ul');
  if (kw) {
    const box = document.createElement('div');
    box.className = 'drg-search-keywords';
    [...kw.children].forEach((li) => {
      const a = li.querySelector('a');
      if (a) {
        const k = document.createElement('a');
        k.href = a.href;
        k.textContent = a.textContent.trim();
        box.append(k);
      } else {
        const strong = document.createElement('strong');
        strong.textContent = li.textContent.trim();
        box.append(strong);
      }
    });
    panel.append(box);
  }
  return panel;
}

function buildTools(section, header, panels) {
  const tools = document.createElement('ul');
  tools.className = 'drg-tools';
  const items = [...(section.querySelector(':scope ul')?.children || [])];
  const ICON_BY_INDEX = ['account', 'search', 'cart'];

  const setPanel = (name) => {
    // only one overlay panel (search / all menu) at a time
    Object.entries(panels).forEach(([key, {
      panel, button, iconName, label,
    }]) => {
      const on = key === name && panel.hidden;
      panel.hidden = !on;
      button.setAttribute('aria-expanded', String(on));
      button.setAttribute('aria-label', on ? `${label} 닫기` : label);
      button.querySelector('.drg-icon').src = `${ICONS}/drgroot-${on ? 'close' : iconName}.svg`;
    });
    const anyOpen = Object.values(panels).some(({ panel }) => !panel.hidden);
    header.classList.toggle('is-panel-open', anyOpen);
    header.classList.toggle('is-allmenu-open', !panels.allmenu.panel.hidden);
    document.body.style.overflowY = !panels.allmenu.panel.hidden ? 'hidden' : '';
    closeDropdowns(header);
    if (name === 'search' && !panels.search.panel.hidden) panels.search.panel.querySelector('input').focus();
  };

  items.forEach((src, i) => {
    const { link, text } = itemLabel(src);
    const li = document.createElement('li');
    const name = ICON_BY_INDEX[i] || 'account';
    li.className = `drg-tool drg-tool-${name}`;
    if (name === 'search') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'drg-tool-button';
      button.setAttribute('aria-controls', 'drg-search');
      button.append(icon('search'));
      panels.search = {
        panel: buildSearch(src), button, iconName: 'search', label: text,
      };
      button.addEventListener('click', () => setPanel('search'));
      li.append(button);
    } else {
      const a = document.createElement('a');
      a.href = link?.href || '/';
      a.className = 'drg-tool-button';
      a.setAttribute('aria-label', text);
      a.append(icon(name));
      li.append(a);
      const sub = src.querySelector(':scope > ul');
      if (sub) {
        const menu = document.createElement('ul');
        menu.className = 'drg-tool-menu';
        [...sub.children].forEach((s) => {
          const { link: sl, text: st } = itemLabel(s);
          const item = document.createElement('li');
          const sa = document.createElement('a');
          sa.href = sl?.href || '/';
          sa.textContent = st;
          item.append(sa);
          menu.append(item);
        });
        li.append(menu);
        li.classList.add('has-menu');
      }
    }
    tools.append(li);
  });

  // hamburger: opens the full menu panel
  const li = document.createElement('li');
  li.className = 'drg-tool drg-tool-menu-toggle';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'drg-tool-button';
  button.setAttribute('aria-controls', 'drg-allmenu');
  button.append(icon('menu'));
  li.append(button);
  tools.append(li);
  panels.allmenu.button = button;
  panels.allmenu.iconName = 'menu';
  panels.allmenu.label = '전체 메뉴';
  button.addEventListener('click', () => setPanel('allmenu'));

  // initial aria state
  Object.values(panels).forEach(({ button: b, label }) => {
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', label);
  });
  return { tools, closePanels: () => setPanel(null) };
}

/**
 * loads and decorates the Dr.Groot header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const [fragment] = await Promise.all([
    loadFragment(`${getContentRoot()}/drgroot/nav`),
    loadCSS(`${window.hlx.codeBasePath}/blocks/header/drgroot-header.css`),
  ]);
  block.textContent = '';
  if (!fragment) return;
  stripButtons(fragment);
  const [promoSec, brandSec, menuSec, toolsSec] = [...fragment.children];

  const header = document.createElement('div');
  header.className = 'drg-header';

  const bar = document.createElement('div');
  bar.className = 'drg-bar';

  const brandLink = brandSec?.querySelector('a');
  const logo = document.createElement('a');
  logo.className = 'drg-logo';
  logo.href = brandLink?.href || '/';
  const logoImg = document.createElement('img');
  logoImg.src = `${ICONS}/drgroot-logo.svg`;
  logoImg.alt = brandLink?.textContent.trim() || '';
  logoImg.width = 126;
  logoImg.height = 24;
  logo.append(logoImg);

  const panels = { allmenu: { panel: buildAllMenu(menuSec || document.createElement('div')) } };
  const menu = buildMenu(menuSec || document.createElement('div'), header);
  const { tools, closePanels } = buildTools(toolsSec || document.createElement('div'), header, panels);

  bar.append(logo, menu, tools);
  header.append(buildPromo(promoSec || document.createElement('div')), bar);
  if (panels.search) header.append(panels.search.panel);
  header.append(panels.allmenu.panel);
  block.append(header);

  // close on Escape / outside click; reset when crossing the desktop breakpoint
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeDropdowns(header);
    if (header.classList.contains('is-panel-open')) closePanels();
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      closeDropdowns(header);
      if (header.classList.contains('is-panel-open')) closePanels();
    }
  });
  isDesktop.addEventListener('change', () => {
    closeDropdowns(header);
    if (header.classList.contains('is-panel-open')) closePanels();
  });
}
