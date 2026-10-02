import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { BRAND_LOGO, getContentRoot } from '../../scripts/scripts.js';

const isDesktop = window.matchMedia('(min-width: 1024px)');

function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-megamenu-trigger').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', 'false');
  });
  nav.querySelectorAll('.nav-megamenu').forEach((panel) => {
    panel.hidden = true;
  });
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (expanded) closeAllPanels(nav);
}

/**
 * Builds a single megamenu link element from a <li> with <a><br>description.
 */
function buildMegamenuLink(li, compact = false) {
  const link = li.querySelector('a');
  if (!link) return li;

  const wrapper = document.createElement('a');
  wrapper.href = link.href;
  wrapper.className = compact ? 'nav-megamenu-article-link' : 'nav-megamenu-link';

  const title = document.createElement('span');
  title.className = compact ? 'nav-megamenu-article-title' : 'nav-megamenu-link-title';
  title.textContent = link.textContent;
  wrapper.append(title);

  // Extract description text after the <br>
  const br = li.querySelector('br');
  if (br && br.nextSibling) {
    const desc = document.createElement('span');
    desc.className = compact ? 'nav-megamenu-article-desc' : 'nav-megamenu-link-desc';
    desc.textContent = br.nextSibling.textContent.trim();
    wrapper.append(desc);
  }

  return wrapper;
}

/**
 * Builds a megamenu panel from a nav <li> with nested <ul> content.
 * Parses links with <br>-separated descriptions.
 */
function buildMegamenuPanel(navItem) {
  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';
  panel.hidden = true;

  const container = document.createElement('div');
  container.className = 'nav-megamenu-container';

  const sublists = navItem.querySelectorAll(':scope > ul');

  // Determine layout from number of primary links
  const primaryList = sublists[0];
  const primaryItems = primaryList ? [...primaryList.children] : [];
  const linkCount = primaryItems.length;

  // Check if there's a second <ul> (used for Stories articles section)
  const hasArticles = sublists.length > 1;

  if (hasArticles) {
    // Stories-style layout: page links left + articles right
    const pagesCol = document.createElement('div');
    pagesCol.className = 'nav-megamenu-pages';

    primaryItems.forEach((li) => {
      pagesCol.append(buildMegamenuLink(li));
    });

    const articlesCol = document.createElement('div');
    articlesCol.className = 'nav-megamenu-articles';

    const secondList = sublists[1];
    const articleParent = secondList.querySelector(':scope > li');
    if (articleParent) {
      // Extract label text (text before nested ul)
      const labelText = articleParent.childNodes[0]?.textContent?.trim();
      if (labelText) {
        const label = document.createElement('p');
        label.className = 'nav-megamenu-label';
        label.textContent = labelText;
        articlesCol.append(label);
      }

      const articleGrid = document.createElement('div');
      articleGrid.className = 'nav-megamenu-article-grid';

      const articleList = articleParent.querySelector(':scope > ul');
      if (articleList) {
        [...articleList.children].forEach((li) => {
          articleGrid.append(buildMegamenuLink(li, true));
        });
      }
      articlesCol.append(articleGrid);
    }

    container.classList.add('nav-megamenu-stories');
    container.append(pagesCol, articlesCol);
  } else {
    // Grid layout (Explore 3-col, Info 4-col)
    const grid = document.createElement('div');
    const colNames = { 3: 'three', 4: 'four' };
    const colClass = colNames[linkCount] || linkCount;
    grid.className = `nav-megamenu-grid nav-megamenu-grid-${colClass}`;

    primaryItems.forEach((li) => {
      grid.append(buildMegamenuLink(li));
    });

    container.append(grid);
  }

  panel.append(container);
  return panel;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Dr.Groot pages (theme: drgroot) use their own header module and nav fragment
  if (document.body.classList.contains('drgroot')) {
    const { default: decorateDrGroot } = await import('./drgroot-header.js');
    await decorateDrGroot(block);
    return;
  }

  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${getContentRoot()}/nav`;
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: strip button classes from the brand link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-wrapper')?.classList.remove('button-wrapper');
    }
    // Restructure brand: create logo icon + text
    const brandAnchor = navBrand.querySelector('a');
    if (brandAnchor) {
      brandAnchor.className = 'nav-brand-link';
      brandAnchor.innerHTML = BRAND_LOGO;
    }
  }

  // Sections: convert to megamenu triggers + panels
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const menuList = document.createElement('ul');
    menuList.className = 'nav-menu-list';

    const topItems = navSections.querySelectorAll(':scope .default-content-wrapper > ul > li');
    topItems.forEach((item) => {
      const menuItem = document.createElement('li');
      menuItem.className = 'nav-menu-item';

      const hasSubmenu = item.querySelector('ul');
      if (hasSubmenu) {
        // Get the trigger label — may be bare text or wrapped in <p> by CMS
        const firstChild = item.firstElementChild;
        const label = (firstChild && firstChild.tagName !== 'UL' ? firstChild.textContent : item.childNodes[0]?.textContent)?.trim() || '';

        const trigger = document.createElement('button');
        trigger.className = 'nav-megamenu-trigger';
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.innerHTML = `<span>${label}</span><span class="nav-caret" aria-hidden="true"></span>`;

        menuItem.append(trigger);

        // Build megamenu panel
        const panel = buildMegamenuPanel(item);
        menuItem.append(panel);

        // Desktop: hover with grace period
        let hoverTimeout;
        menuItem.addEventListener('mouseenter', () => {
          if (!isDesktop.matches) return;
          clearTimeout(hoverTimeout);
          closeAllPanels(nav);
          trigger.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        });
        menuItem.addEventListener('mouseleave', () => {
          if (!isDesktop.matches) return;
          hoverTimeout = setTimeout(() => {
            trigger.setAttribute('aria-expanded', 'false');
            panel.hidden = true;
          }, 200);
        });

        // Click toggle (mobile + desktop)
        trigger.addEventListener('click', () => {
          const expanded = trigger.getAttribute('aria-expanded') === 'true';
          closeAllPanels(nav);
          if (!expanded) {
            trigger.setAttribute('aria-expanded', 'true');
            panel.hidden = false;
          }
        });
      } else {
        // Simple link item
        const link = item.querySelector('a') || document.createElement('span');
        menuItem.append(link);
      }

      menuList.append(menuItem);
    });

    // Replace the default content with our megamenu structure
    navSections.textContent = '';
    navSections.append(menuList);
  }

  // Tools: strip button wrapper classes, keep the link styled
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const toolLink = navTools.querySelector('a');
    if (toolLink) {
      toolLink.className = 'nav-subscribe';
      // Remove button-wrapper wrapper
      const wrapper = toolLink.closest('.button-wrapper');
      if (wrapper) wrapper.className = '';
    }
  }

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Escape to close
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllPanels(nav);
      if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
        toggleMenu(nav);
      }
    }
  });

  // Close panels when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeAllPanels(nav);
    }
  });

  // Handle resize
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, isDesktop.matches);
    closeAllPanels(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
