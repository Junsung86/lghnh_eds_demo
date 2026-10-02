/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dr.Groot (drgroot.co.kr, Cafe24 skin) cleanup.
 *
 * Removes non-authorable site chrome, commerce widgets, third-party plugins
 * and tracking from the product detail page, and resolves lazy-loaded images.
 *
 * All selectors verified against migration-work/live-rendered.html
 * (live Playwright DOM) and migration-work/cleaned.html.
 *
 * IMPORTANT: the columns-product parser matches
 * `.prdDetail_topArea > .prdDetail_infoArea` and reads product data
 * (name, #discount_ratio, .base_prc_sell, .base_prc_custom, .delivery_price,
 * `.infoArea .cate_path a`, crema score) from the sibling
 * `.prdDetail_optionArea`. Therefore beforeTransform only removes purely
 * interactive pieces inside `.prdDetail_topArea`; the remaining option area
 * and hidden helper elements there are removed in afterTransform.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const DEFAULT_ORIGIN = 'https://drgroot.co.kr';

function getOrigin(payload) {
  try {
    const url = payload && payload.params && payload.params.originalURL;
    if (url) return new URL(url).origin;
  } catch (e) {
    // ignore, fall back to default origin
  }
  return DEFAULT_ORIGIN;
}

function toAbsolute(src, origin) {
  if (!src) return src;
  const value = src.trim();
  if (value.startsWith('data:')) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${origin}${value}`;
  if (/^https?:/i.test(value)) return value;
  try {
    return new URL(value, `${origin}/`).href;
  } catch (e) {
    return value;
  }
}

function isInProductSummary(el) {
  return !!el.closest('.prdDetail_topArea');
}

export default function transform(hookName, element, payload) {
  const origin = getOrigin(payload);

  if (hookName === TransformHook.beforeTransform) {
    // 1. Lazy images: Cafe24 editor images use ec-data-src (and data-src)
    //    with a 1x1 data: placeholder in src. Promote the real URL to src.
    //    Found: #prdDetail > .cont > .content img[ec-data-src="/web/upload/NNEditor/..."]
    element.querySelectorAll('img[ec-data-src], img[data-src]').forEach((img) => {
      const real = img.getAttribute('ec-data-src') || img.getAttribute('data-src');
      if (real) img.setAttribute('src', toAbsolute(real, origin));
      img.removeAttribute('ec-data-src');
      img.removeAttribute('data-src');
    });
    // Make every remaining image URL absolute (protocol-relative // and root-relative /)
    element.querySelectorAll('img[src]').forEach((img) => {
      img.setAttribute('src', toAbsolute(img.getAttribute('src'), origin));
    });

    // 2. Global chrome, overlays, popups, plugins (body-level in captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#base_header_container', // global header (header.iv_sticky)
      '#base_footer_container', // global footer
      '#base_sidebar_container', // slide-out sidebar menu
      '#base_search_container', // search layer
      '#base_fixedButton_container', // floating go-top buttons
      '#iv_memberChk_nomember', // login state helper
      '#progressPaybar',
      '.xans-layout-multishopshipping',
      '#frm_image_zoom',
      '#multi_option',
      '#image_zoom_small',
      '#modalBackpanel', // overlay backdrop
      '#modalContainer', // modal popup layer
      '#ec_async_basket_layer_hover',
      '#_NBCHATLAYOUT', // NB chat widget
      '#ch-plugin', // Channel.io chat plugin
      '#spm_banner_main', // Snapfit banner
      '#spm_page_type',
      '#sf_isdetail_page',
      '#fbe_common_top_script', // Facebook tracking containers
      '#fbe_product_detail_script',
      '#kmp_common_top_script', // Kakao tracking containers
      '#kmp_product_detail_script',
      'span[itemtype*="schema.org/Organization"]',
    ]);

    // 3. Non-content product page parts
    WebImporter.DOMUtils.remove(element, [
      '#prdReview', // Crema review board (backend widget)
      '#prdQnA', // Q&A board (hidden)
      '#prdDetail_fixed_optionArea', // fixed bottom option bar
      '#prdDetail_additional_tab1', // in-page tab bars
      '#prdDetail_additional_tab2',
      '#prdDetail_additional_tab3',
      '#prdDetail_additional_tab4',
      '.ec-base-tab > ul.menu',
      '#prdDetail > .cont > h3.title', // tab-panel heading "상품안내" (not in authored content)
      '.crema-product-reviews', // Crema review iframes (not .crema-product-reviews-score)
      '.xans-product-detail .infoAreaBox', // IFDO analytics data
    ]);

    // 4. Purely interactive commerce widgets inside .prdDetail_optionArea.
    //    Product info (.prdDetail_infoBox, .infoArea .cate_path) is kept for the parser.
    WebImporter.DOMUtils.remove(element, [
      '.prdDetail_optionArea .prdDetail_option_select', // option / quantity tables
      '#iv_totalProducts', // #totalProducts, #totalPrice, action buttons, easy pay, Naver pay
      '.prdDetail_optionArea .iv_actionButton_area',
      '#easyPaymentBox',
      '#NaverChk_Button',
      '.prdDetail_infoBox .iv_share_area', // share / wishlist icons in product name
      '#btn_all_coupondown',
      // zoom guide / zoom layer
      '#zoomGuideImage',
      '#zoomMouseGiude',
      '#zoom_wrap',
    ]);

    // 5. Hidden elements (.displaynone) outside the product summary area.
    //    Inside .prdDetail_topArea they are deferred to afterTransform so the
    //    columns-product parser sees the original structure.
    element.querySelectorAll('.displaynone').forEach((el) => {
      if (!isInProductSummary(el)) el.remove();
    });

    // 6. Scripts, styles, iframes, noscript (tracking pixels live in noscript)
    WebImporter.DOMUtils.remove(element, ['script', 'style', 'noscript', 'iframe', 'link']);

    // 7. Tracking pixels (1x1 images)
    element.querySelectorAll('img[width="1"][height="1"], img[src*="facebook.com/tr"]').forEach((img) => img.remove());

    // 8. Crema review widgets that the importer turned into plain links (iframe → <a>)
    element.querySelectorAll('[id^="crema-product-reviews"], a[href*="cre.ma/"]').forEach((el) => el.remove());

    // 9. Make link URLs absolute (root-relative links would break on the new site)
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && !/^(#|javascript:|mailto:|tel:)/i.test(href.trim())) {
        a.setAttribute('href', toAbsolute(href, origin));
      }
    });

    // 10. Section-title CTA (e.g. "제품 더 보기") → primary button (<strong><a>)
    element.querySelectorAll('.iv_section_title .iv_button a').forEach((a) => {
      const doc = element.ownerDocument;
      const p = doc.createElement('p');
      const strong = doc.createElement('strong');
      a.replaceWith(p);
      strong.append(a);
      p.append(strong);
    });

    // 11. Related products title is a section heading after the page h1 → h2
    element.querySelectorAll('.relation > h3.title').forEach((h3) => {
      const h2 = element.ownerDocument.createElement('h2');
      h2.textContent = h3.textContent.trim();
      h3.replaceWith(h2);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remaining option area (data already consumed by columns-product parser)
    WebImporter.DOMUtils.remove(element, [
      '.prdDetail_optionArea',
      '#IV_ForFIndPrdDetailInfo',
      '.prdDetail_thumbnail .listImg',
      '.restImg',
      '.layout-hidden',
      '#go_crema_review_tab',
      '.swiper-notification',
      '.base_swiper_scrollbar',
    ]);

    // Any hidden leftovers
    element.querySelectorAll('.displaynone, [style*="display:none"], [style*="display: none"]').forEach((el) => el.remove());

    WebImporter.DOMUtils.remove(element, ['script', 'style', 'noscript', 'iframe', 'link', 'form', 'input', 'button', 'svg']);

    // Crema review widget links (late-injected review iframes become links on import)
    element.querySelectorAll('a[href*="cre.ma/"]').forEach((a) => {
      const p = a.parentElement;
      a.remove();
      if (p && p.tagName === 'P' && !p.textContent.trim() && !p.querySelector('img')) p.remove();
    });

    // Crema's "smart install" keeps re-injecting review iframes into the live DOM
    // after the transform has run (before the result is serialized). Guard against it.
    const win = element.ownerDocument && element.ownerDocument.defaultView;
    if (win && win.MutationObserver) {
      const observer = new win.MutationObserver((mutations) => {
        mutations.forEach((m) => m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches('iframe, [class*="crema"], [id^="crema-"]')) node.remove();
          else node.querySelectorAll('iframe, [class*="crema"], [id^="crema-"]').forEach((el) => el.remove());
        }));
      });
      observer.observe(element, { childList: true, subtree: true });
      win.setTimeout(() => observer.disconnect(), 30000);
    }

    // Attribute cleanup
    element.querySelectorAll('[onclick], [data-scroll-id], [ec-data-src], [data-src]').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-scroll-id');
      el.removeAttribute('ec-data-src');
      el.removeAttribute('data-src');
    });
  }
}
