var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-product.js
  var import_product_exports = {};
  __export(import_product_exports, {
    default: () => import_product_default
  });

  // tools/importer/parsers/columns-product.js
  var ORIGIN = "https://drgroot.co.kr";
  function absUrl(url) {
    if (!url) return "";
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function cleanText(node) {
    return node ? node.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim() : "";
  }
  function parse(element, { document }) {
    const optionArea = element.parentElement && element.parentElement.querySelector(".prdDetail_optionArea") || document.querySelector(".prdDetail_optionArea");
    const scope = optionArea || element;
    const imageCell = document.createElement("div");
    const srcImg = element.querySelector(".keyImg img.BigImage") || element.querySelector(".keyImg img:not(#zoomGuideImage):not(#zoom_image)") || element.querySelector("img.BigImage");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.src = absUrl(srcImg.getAttribute("src"));
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.append(img);
    }
    const textCell = document.createElement("div");
    const cateLink = scope.querySelector('.infoArea .cate_path a[href]:not([href^="javascript"])') || scope.querySelector('.cate_path li:last-child a[href]:not([href^="javascript"])');
    if (cateLink && cleanText(cateLink)) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = absUrl(cateLink.getAttribute("href"));
      a.textContent = cleanText(cateLink);
      p.append(a);
      textCell.append(p);
    }
    const nameEl = scope.querySelector(".prdDetail_info.name .desc > span") || scope.querySelector(".prd_head h2");
    let name = cleanText(nameEl);
    if (nameEl && nameEl.matches("h2")) {
      const code = nameEl.querySelector(".product_code");
      if (code) name = cleanText(nameEl).replace(cleanText(code), "").trim();
    }
    if (name) {
      const h1 = document.createElement("h1");
      h1.textContent = name;
      textCell.append(h1);
    }
    const ratingEl = scope.querySelector(".crema-product-reviews-score");
    if (ratingEl) {
      const full = ratingEl.querySelectorAll('[class*="star_wrapper--full"]').length;
      const half = ratingEl.querySelectorAll('[class*="star_wrapper--half"]').length;
      const score = full + half * 0.5;
      const countEl = ratingEl.querySelector(".review_start_wrap > span:not(.star)");
      let count = cleanText(countEl);
      if (!count) {
        const m = cleanText(ratingEl).match(/\((\d[\d,]*)\)/);
        if (m) [, count] = m;
      }
      if (score > 0 || count) {
        const p = document.createElement("p");
        const parts = ["\u2605"];
        if (score > 0) parts.push(Number.isInteger(score) ? score.toFixed(1) : String(score));
        if (count) parts.push(`(${count})`);
        p.textContent = parts.join(" ");
        textCell.append(p);
      }
    }
    const discount = cleanText(scope.querySelector("#discount_ratio .desc"));
    const sale = cleanText(scope.querySelector(".base_prc_sell"));
    const original = cleanText(scope.querySelector(".base_prc_custom"));
    const withWon = (v) => /원$/.test(v) ? v : `${v}\uC6D0`;
    if (sale || original) {
      const p = document.createElement("p");
      if (discount) p.append(document.createTextNode(`${discount} `));
      if (sale) {
        const strong = document.createElement("strong");
        strong.textContent = withWon(sale);
        p.append(strong);
      }
      if (original && original !== sale) {
        if (sale) p.append(document.createTextNode(" "));
        const del = document.createElement("del");
        del.textContent = withWon(original);
        p.append(del);
      }
      textCell.append(p);
    }
    const delivery = scope.querySelector(".delivery_price");
    if (delivery) {
      const label = cleanText(delivery.querySelector(".title")) || "\uBC30\uC1A1\uBE44";
      const value = cleanText(delivery.querySelector(".desc"));
      if (value) {
        const p = document.createElement("p");
        p.textContent = `${label} ${value}`;
        textCell.append(p);
      }
    }
    if (!imageCell.children.length && !textCell.children.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (columns-product)", cells });
    element.replaceWith(block);
    if (optionArea) optionArea.remove();
  }

  // tools/importer/parsers/cards-product.js
  var ORIGIN2 = "https://drgroot.co.kr";
  function absUrl2(url) {
    if (!url) return "";
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN2}${u}`;
    return u;
  }
  function cleanText2(node) {
    return node ? node.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim() : "";
  }
  function isHidden(el) {
    return !!el.closest(".displaynone");
  }
  function parse2(element, { document }) {
    let slides = [...element.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)")];
    if (!slides.length) {
      slides = [...element.querySelectorAll(".description")].map((d) => d.parentElement.closest("li, div") || d.parentElement);
    }
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      const link = slide.querySelector("a[href]");
      const href = link ? absUrl2(link.getAttribute("href")) : "";
      const nameEl = slide.querySelector(".description .name, .name, .description strong");
      const name = cleanText2(nameEl);
      const key = `${href}|${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = document.createElement("div");
      const srcImg = slide.querySelector(".thumbnail img") || slide.querySelector("img");
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = absUrl2(srcImg.getAttribute("src"));
        img.alt = srcImg.getAttribute("alt") || name;
        imageCell.append(img);
      }
      const bodyCell = document.createElement("div");
      if (name) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = name;
          p.append(a);
        } else {
          p.textContent = name;
        }
        bodyCell.append(p);
      }
      let priceEls = [...slide.querySelectorAll(".price_wrap > li")];
      if (!priceEls.length) priceEls = [...slide.querySelectorAll('.price, [class*="Price"]:not(ul)')];
      const prices = [];
      priceEls.filter((el) => !isHidden(el) && cleanText2(el)).forEach((el) => {
        const t = cleanText2(el);
        if (!prices.includes(t)) prices.push(t);
      });
      if (prices.length) {
        const p = document.createElement("p");
        p.textContent = prices.join(" ");
        bodyCell.append(p);
      }
      if (!imageCell.children.length && !bodyCell.children.length) return;
      cells.push([imageCell, bodyCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (cards-product)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-brandline.js
  var ORIGIN3 = "https://drgroot.co.kr";
  function absUrl3(url) {
    if (!url) return "";
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN3}${u}`;
    return u;
  }
  function cleanText3(node) {
    return node ? node.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim() : "";
  }
  function usableHref(a) {
    const h = a ? (a.getAttribute("href") || "").trim() : "";
    if (!h || h === "#" || h.startsWith("#none") || h.startsWith("javascript")) return "";
    return absUrl3(h);
  }
  function parse3(element, { document }) {
    let slides = [...element.querySelectorAll(".slide-ivBanner:not(.swiper-slide-duplicate)")];
    if (!slides.length) slides = [...element.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)")];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      const srcImg = slide.querySelector(".img_box img") || slide.querySelector("img");
      const imgLink = slide.querySelector(".img_box a[href]");
      const nameEl = slide.querySelector(".text_box .p3, .p3");
      const name = cleanText3(nameEl);
      const src = srcImg ? absUrl3(srcImg.getAttribute("src")).replace(/[?&]date=\d+$/, "") : "";
      const key = `${src}|${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = document.createElement("div");
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = srcImg.getAttribute("alt") || name;
        imageCell.append(img);
      }
      const bodyCell = document.createElement("div");
      const taglineEl = slide.querySelector(".text_box .p5, .p5");
      if (taglineEl) {
        const raw = taglineEl.innerHTML.replace(/<br\s*\/?>/gi, "\n");
        const tmp = document.createElement("div");
        tmp.innerHTML = raw;
        const lines = tmp.textContent.replace(/ /g, " ").split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
        if (lines.length) {
          const p = document.createElement("p");
          lines.forEach((line, i) => {
            if (i) p.append(document.createElement("br"));
            p.append(document.createTextNode(line));
          });
          bodyCell.append(p);
        }
      }
      if (name) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = name;
        p.append(strong);
        bodyCell.append(p);
      }
      const btn = slide.querySelector(".iv_button a");
      const href = usableHref(btn) || usableHref(imgLink);
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = cleanText3(btn) || "\uC790\uC138\uD788 \uBCF4\uAE30";
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
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (cards-brandline)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-info.js
  var ORIGIN4 = "https://drgroot.co.kr";
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "DIV", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "TR", "SECTION", "ARTICLE", "BLOCKQUOTE"]);
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "INPUT", "BUTTON", "SVG", "IMG"]);
  function absUrl4(url) {
    if (!url) return "";
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN4}${u}`;
    return u;
  }
  function norm(text) {
    return (text || "").replace(/ /g, " ").replace(/\s+/g, " ");
  }
  function isHidden2(el) {
    return !!(el.closest && el.closest(".displaynone"));
  }
  function flattenToParagraphs(root, document) {
    const paragraphs = [];
    let current = [];
    const flush = () => {
      while (current.length && current[0].nodeType === 3 && !current[0].textContent.trim()) current.shift();
      while (current.length && current[current.length - 1].nodeType === 3 && !current[current.length - 1].textContent.trim()) current.pop();
      const text = current.map((n) => n.textContent).join("").trim();
      if (text) {
        const p = document.createElement("p");
        current.forEach((n, i) => {
          if (n.nodeType === 3) {
            let t = n.textContent;
            if (i === 0) t = t.replace(/^\s+/, "");
            if (i === current.length - 1) t = t.replace(/\s+$/, "");
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
        if (SKIP_TAGS.has(tag) || isHidden2(child)) return;
        if (tag === "BR") {
          flush();
          return;
        }
        if (tag === "WBR") return;
        if (tag === "A" && child.getAttribute("href")) {
          const text = norm(child.textContent).trim();
          if (text) {
            const a = document.createElement("a");
            a.href = absUrl4(child.getAttribute("href"));
            a.textContent = text;
            current.push(a);
          }
          return;
        }
        if (tag === "STRONG" || tag === "B") {
          const text = norm(child.textContent).trim();
          if (text) {
            const s = document.createElement("strong");
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
        walk(child);
      });
    };
    walk(root);
    flush();
    return paragraphs;
  }
  function convertLabelList(list2, document) {
    const ul = document.createElement("ul");
    const extras = [];
    [...list2.children].forEach((li) => {
      if (isHidden2(li)) return;
      const label = li.querySelector(":scope > h4, :scope > strong, :scope > .title");
      if (label) {
        const labelText = norm(label.textContent).replace(/\s*:\s*$/, "").trim();
        const valueText = [...li.childNodes].filter((n) => n !== label).map((n) => n.textContent).join(" ");
        const value = norm(valueText).trim();
        if (!labelText && !value) return;
        const item = document.createElement("li");
        const strong = document.createElement("strong");
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
  function parse4(element, { document }) {
    const toggles = [...element.querySelectorAll(".base_form_toggle")].filter((t) => !t.classList.contains("displaynone"));
    const row = [];
    toggles.forEach((toggle) => {
      const content = toggle.querySelector(":scope > .content") || toggle.querySelector(".content");
      if (!content || !norm(content.textContent).trim()) return;
      const cell = document.createElement("div");
      const titleEl = toggle.querySelector(".title h3 span") || toggle.querySelector(".title h3, .title");
      const title = titleEl ? norm(titleEl.textContent).trim() : "";
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        cell.append(h3);
      }
      const labelLists = [...content.querySelectorAll("ul")].filter((ul) => ul.querySelector(":scope > li > h4"));
      if (labelLists.length) {
        labelLists.forEach((list2) => {
          const { ul, extras } = convertLabelList(list2, document);
          if (ul) cell.append(ul);
          cell.append(...extras);
          list2.remove();
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
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (columns-info)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/drgroot-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var DEFAULT_ORIGIN = "https://drgroot.co.kr";
  function getOrigin(payload) {
    try {
      const url = payload && payload.params && payload.params.originalURL;
      if (url) return new URL(url).origin;
    } catch (e) {
    }
    return DEFAULT_ORIGIN;
  }
  function toAbsolute(src, origin) {
    if (!src) return src;
    const value = src.trim();
    if (value.startsWith("data:")) return value;
    if (value.startsWith("//")) return `https:${value}`;
    if (value.startsWith("/")) return `${origin}${value}`;
    if (/^https?:/i.test(value)) return value;
    try {
      return new URL(value, `${origin}/`).href;
    } catch (e) {
      return value;
    }
  }
  function isInProductSummary(el) {
    return !!el.closest(".prdDetail_topArea");
  }
  function transform(hookName, element, payload) {
    const origin = getOrigin(payload);
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll("img[ec-data-src], img[data-src]").forEach((img) => {
        const real = img.getAttribute("ec-data-src") || img.getAttribute("data-src");
        if (real) img.setAttribute("src", toAbsolute(real, origin));
        img.removeAttribute("ec-data-src");
        img.removeAttribute("data-src");
      });
      element.querySelectorAll("img[src]").forEach((img) => {
        img.setAttribute("src", toAbsolute(img.getAttribute("src"), origin));
      });
      WebImporter.DOMUtils.remove(element, [
        "#base_header_container",
        // global header (header.iv_sticky)
        "#base_footer_container",
        // global footer
        "#base_sidebar_container",
        // slide-out sidebar menu
        "#base_search_container",
        // search layer
        "#base_fixedButton_container",
        // floating go-top buttons
        "#iv_memberChk_nomember",
        // login state helper
        "#progressPaybar",
        ".xans-layout-multishopshipping",
        "#frm_image_zoom",
        "#multi_option",
        "#image_zoom_small",
        "#modalBackpanel",
        // overlay backdrop
        "#modalContainer",
        // modal popup layer
        "#ec_async_basket_layer_hover",
        "#_NBCHATLAYOUT",
        // NB chat widget
        "#ch-plugin",
        // Channel.io chat plugin
        "#spm_banner_main",
        // Snapfit banner
        "#spm_page_type",
        "#sf_isdetail_page",
        "#fbe_common_top_script",
        // Facebook tracking containers
        "#fbe_product_detail_script",
        "#kmp_common_top_script",
        // Kakao tracking containers
        "#kmp_product_detail_script",
        'span[itemtype*="schema.org/Organization"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#prdReview",
        // Crema review board (backend widget)
        "#prdQnA",
        // Q&A board (hidden)
        "#prdDetail_fixed_optionArea",
        // fixed bottom option bar
        "#prdDetail_additional_tab1",
        // in-page tab bars
        "#prdDetail_additional_tab2",
        "#prdDetail_additional_tab3",
        "#prdDetail_additional_tab4",
        ".ec-base-tab > ul.menu",
        "#prdDetail > .cont > h3.title",
        // tab-panel heading "상품안내" (not in authored content)
        ".crema-product-reviews",
        // Crema review iframes (not .crema-product-reviews-score)
        ".xans-product-detail .infoAreaBox"
        // IFDO analytics data
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".prdDetail_optionArea .prdDetail_option_select",
        // option / quantity tables
        "#iv_totalProducts",
        // #totalProducts, #totalPrice, action buttons, easy pay, Naver pay
        ".prdDetail_optionArea .iv_actionButton_area",
        "#easyPaymentBox",
        "#NaverChk_Button",
        ".prdDetail_infoBox .iv_share_area",
        // share / wishlist icons in product name
        "#btn_all_coupondown",
        // zoom guide / zoom layer
        "#zoomGuideImage",
        "#zoomMouseGiude",
        "#zoom_wrap"
      ]);
      element.querySelectorAll(".displaynone").forEach((el) => {
        if (!isInProductSummary(el)) el.remove();
      });
      WebImporter.DOMUtils.remove(element, ["script", "style", "noscript", "iframe", "link"]);
      element.querySelectorAll('img[width="1"][height="1"], img[src*="facebook.com/tr"]').forEach((img) => img.remove());
      element.querySelectorAll('[id^="crema-product-reviews"], a[href*="cre.ma/"]').forEach((el) => el.remove());
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (href && !/^(#|javascript:|mailto:|tel:)/i.test(href.trim())) {
          a.setAttribute("href", toAbsolute(href, origin));
        }
      });
      element.querySelectorAll(".iv_section_title .iv_button a").forEach((a) => {
        const doc = element.ownerDocument;
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        a.replaceWith(p);
        strong.append(a);
        p.append(strong);
      });
      element.querySelectorAll(".relation > h3.title").forEach((h3) => {
        const h2 = element.ownerDocument.createElement("h2");
        h2.textContent = h3.textContent.trim();
        h3.replaceWith(h2);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".prdDetail_optionArea",
        "#IV_ForFIndPrdDetailInfo",
        ".prdDetail_thumbnail .listImg",
        ".restImg",
        ".layout-hidden",
        "#go_crema_review_tab",
        ".swiper-notification",
        ".base_swiper_scrollbar"
      ]);
      element.querySelectorAll('.displaynone, [style*="display:none"], [style*="display: none"]').forEach((el) => el.remove());
      WebImporter.DOMUtils.remove(element, ["script", "style", "noscript", "iframe", "link", "form", "input", "button", "svg"]);
      element.querySelectorAll('a[href*="cre.ma/"]').forEach((a) => {
        const p = a.parentElement;
        a.remove();
        if (p && p.tagName === "P" && !p.textContent.trim() && !p.querySelector("img")) p.remove();
      });
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
        win.setTimeout(() => observer.disconnect(), 3e4);
      }
      element.querySelectorAll("[onclick], [data-scroll-id], [ec-data-src], [data-src]").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-scroll-id");
        el.removeAttribute("ec-data-src");
        el.removeAttribute("data-src");
      });
    }
  }

  // tools/importer/transformers/drgroot-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list2 = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list2) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function isContentSection(section) {
    const blocks = section.blocks || [];
    const defaults = section.defaultContent || [];
    return blocks.length > 0 || defaults.length > 0 || !!section.style;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => ({
        section,
        el: isContentSection(section) ? querySection(element, section.selector) : null
      }));
      const firstIndex = resolved.findIndex((r) => r.el);
      for (let i = resolved.length - 1; i >= 0; i -= 1) {
        const { section, el } = resolved[i];
        if (!el) continue;
        if (i === firstIndex && !section.style) continue;
        const wrapsEarlier = resolved.slice(0, i).some((r) => r.el && r.el !== el && el.contains(r.el));
        if (wrapsEarlier) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        el.before(hr);
        if (i === firstIndex) hr.setAttribute("data-excat-first", "true");
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (marker.getAttribute("data-excat-first") === "true") marker.remove();
        }
      }
      element.querySelectorAll("hr[data-excat-first]").forEach((hr) => hr.removeAttribute("data-excat-first"));
    }
  }

  // tools/importer/transformers/drgroot-product-info.js
  var TransformHook2 = { afterTransform: "afterTransform" };
  var plain = (field) => (typeof field === "string" ? field : field && field.plaintext || "").trim();
  function list(document, items) {
    const ul = document.createElement("ul");
    items.filter(Boolean).forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.append(li);
    });
    return ul;
  }
  function paras(document, text) {
    return text.split(/\n+/).map((t) => t.trim()).filter(Boolean).map((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      return p;
    });
  }
  function titledList(document, entries) {
    const ul = document.createElement("ul");
    entries.forEach(([title, text]) => {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = title;
      li.append(strong);
      if (text) li.append(document.createTextNode(` ${text}`));
      ul.append(li);
    });
    return ul;
  }
  function featureEntries(item) {
    const set = item.featureSet || item.features || {};
    const summaries = set.featureSummaries || [];
    return (set.featureTitles || []).map((title, i) => [title, plain(summaries[i])]).filter(([t]) => t);
  }
  function claimEntries(item) {
    const set = item.claimSet || item.claims || {};
    const filled = (v) => v && v.trim() !== "-";
    return (set.statements || []).map((statement, i) => [
      statement,
      [(set.claimValues || [])[i], (set.conditions || [])[i], plain((set.footnotes || [])[i])].filter(filled).join(" \xB7 ")
    ]).filter(([s]) => s);
  }
  function buildCells(document, { endpoint, item }) {
    const link = document.createElement("a");
    link.href = endpoint;
    link.textContent = endpoint;
    const specs = document.createElement("ul");
    [
      ["\uC6A9\uB7C9", item.volume],
      ["\uAE30\uB2A5\uC131", item.functionalCosmetic],
      ["\uCD94\uCC9C \uB450\uD53C", (item.recommendedFor || []).join(", ")],
      ["pH", item.ph],
      ["\uD5A5", [item.scent, (item.scentNotes || []).join(" / ")].filter(Boolean).join(" \u2014 ")],
      ["\uC0AC\uC6A9\uAE30\uD55C", item.shelfLife],
      ["\uC81C\uC870\uC0AC", item.manufacturer]
    ].filter(([, v]) => v).forEach(([k, v]) => {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = k;
      li.append(strong, document.createTextNode(` ${v}`));
      specs.append(li);
    });
    const rows = [
      ["Product Info"],
      ["GraphQL", link],
      ["\uD558\uC774\uB77C\uC774\uD2B8", list(document, [plain(item.functionalCosmetic).replace(/\s*\(.*\)\s*$/, "")])],
      ["\uC694\uC57D", paras(document, plain(item.summary))],
      ["\uC0C1\uC138 \uC815\uBCF4", [...paras(document, plain(item.description) || plain(item.definition)), specs]],
      ["\uC0AC\uC6A9 \uBC29\uBC95", list(document, (item.howToUse && item.howToUse.length ? item.howToUse : item.routine) || [])],
      ["\uC131\uBD84", list(document, item.keyIngredients || [])]
    ];
    const features = featureEntries(item);
    const claims = claimEntries(item);
    if (features.length || claims.length) {
      rows.push(["\uC8FC\uC694 \uD2B9\uC9D5", titledList(document, features)], ["\uD6A8\uB2A5 \uADFC\uAC70", titledList(document, claims)]);
    }
    return rows;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    let productNo = null;
    try {
      productNo = new URL(payload.params.originalURL).searchParams.get("product_no");
    } catch (e) {
    }
    const data = productNo && payload.productData && payload.productData[productNo];
    if (!data) return;
    const blockName = (t) => ((t.querySelector("th, td") || {}).textContent || "").toLowerCase().replace(/[\s-]+/g, "-");
    const summary = [...element.querySelectorAll("table")].find((t) => blockName(t).includes("columns-product"));
    if (!summary) return;
    const { document } = payload;
    const block = WebImporter.Blocks.createBlock(document, { name: "Product Info", cells: buildCells(document, data).slice(1) });
    summary.after(block);
  }

  // tools/importer/data/product-info.json
  var product_info_default = {
    "1119": {
      endpoint: "https://publish-p166217-e1771263.adobeaemcloud.com/graphql/execute.json/ref-demo-eds/lghnh_demo;path=/content/dam/ref-demo-eds/geo-pilot/drgroot-bioexosome-shampoo-400ml/product",
      fetchedAt: "2026-10-05T14:18:22.011Z",
      item: {
        _path: "/content/dam/ref-demo-eds/geo-pilot/drgroot-bioexosome-shampoo-400ml/product",
        name: "\uB9AC\uC5D4 \uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478",
        displayName: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uB450\uD53C\uAC15\uD654 \uCEA1\uC290\uC0F4\uD478 [\uBAA8\uB4E0 \uB450\uD53C\uC6A9]",
        brand: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 (Dr.Groot)",
        line: "\uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880",
        category: "\uD5E4\uC5B4\uCF00\uC5B4 > \uC0F4\uD478 > \uD0C8\uBAA8\xB7\uB450\uD53C",
        volume: "330ml",
        functionalCosmetic: "\uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488 (\uC2DD\uC57D\uCC98 \uC2EC\uC0AC \uB610\uB294 \uBCF4\uACE0 \uD544\uD568)",
        recommendedFor: [
          "\uBAA8\uB4E0 \uB450\uD53C",
          "\uC9C0\uC131 \uB450\uD53C",
          "\uAC74\uC131 \uB450\uD53C",
          "\uBCF5\uD569\uC131 \uB450\uD53C"
        ],
        keyIngredients: [
          "\uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4 20,000ppm",
          "\uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880",
          "\uB77D\uD1A0\uBC14\uC2E4\uB7EC\uC2A4\uBC1C\uD6A8\uC6A9\uD574\uBB3C",
          "3\uC885 \uD788\uC54C\uB8E8\uB860\uC0B0(\uACE0\xB7\uC800\xB7\uCD08\uC800\uBD84\uC790)",
          "\uB098\uC774\uC544\uC2E0\uC544\uB9C8\uC774\uB4DC",
          "\uBE44\uC624\uD2F4",
          "\uB9E5\uC8FC\uD6A8\uBAA8\uCD94\uCD9C\uBB3C",
          "\uCE74\uD398\uC778",
          "\uC0B4\uB9AC\uC2E4\uB9AD\uC560\uC528\uB4DC",
          "\uBA58\uD1A8"
        ],
        ph: "\uC57D\uC0B0\uC131",
        scent: "\uD504\uB808\uC2DC \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4",
        scentNotes: [
          "Top: Orange",
          "Middle: Geranium, Rose, Lavender",
          "Base: White musk, Sandalwood"
        ],
        definition: {
          html: "<p>\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 LG\uC0DD\uD65C\uAC74\uAC15\uC774 \uB9CC\uB4E0 400ml \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uC0F4\uD478\uB85C, \uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>",
          markdown: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 LG\uC0DD\uD65C\uAC74\uAC15\uC774 \uB9CC\uB4E0 400ml \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uC0F4\uD478\uB85C, \uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\n",
          plaintext: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 LG\uC0DD\uD65C\uAC74\uAC15\uC774 \uB9CC\uB4E0 400ml \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uC0F4\uD478\uB85C, \uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
          json: [
            {
              nodeType: "paragraph",
              content: [
                {
                  nodeType: "text",
                  value: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 LG\uC0DD\uD65C\uAC74\uAC15\uC774 \uB9CC\uB4E0 400ml \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uC0F4\uD478\uB85C, \uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
                }
              ]
            }
          ]
        },
        summary: {
          html: "<p>\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4\uC640 \uC720\uC0B0\uADE0 \uBC1C\uD6A8 \uC131\uBD84\uC73C\uB85C \uC57D\uD574\uC9C4 \uB450\uD53C \uC7A5\uBCBD\uC744 \uAD00\uB9AC\uD558\uB294 \uB450\uD53C \uADFC\uBCF8 \uCF00\uC5B4 \uC0F4\uD478\uC774\uBA70, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4.</p>",
          markdown: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4\uC640 \uC720\uC0B0\uADE0 \uBC1C\uD6A8 \uC131\uBD84\uC73C\uB85C \uC57D\uD574\uC9C4 \uB450\uD53C \uC7A5\uBCBD\uC744 \uAD00\uB9AC\uD558\uB294 \uB450\uD53C \uADFC\uBCF8 \uCF00\uC5B4 \uC0F4\uD478\uC774\uBA70, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4.\n",
          plaintext: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4\uC640 \uC720\uC0B0\uADE0 \uBC1C\uD6A8 \uC131\uBD84\uC73C\uB85C \uC57D\uD574\uC9C4 \uB450\uD53C \uC7A5\uBCBD\uC744 \uAD00\uB9AC\uD558\uB294 \uB450\uD53C \uADFC\uBCF8 \uCF00\uC5B4 \uC0F4\uD478\uC774\uBA70, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4.",
          json: [
            {
              nodeType: "paragraph",
              content: [
                {
                  nodeType: "text",
                  value: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uB9C8\uC774\uD06C\uB85C\uBC14\uC774\uC634 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4\uC640 \uC720\uC0B0\uADE0 \uBC1C\uD6A8 \uC131\uBD84\uC73C\uB85C \uC57D\uD574\uC9C4 \uB450\uD53C \uC7A5\uBCBD\uC744 \uAD00\uB9AC\uD558\uB294 \uB450\uD53C \uADFC\uBCF8 \uCF00\uC5B4 \uC0F4\uD478\uC774\uBA70, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4."
                }
              ]
            }
          ]
        },
        description: {
          html: "<p>\uC774 \uC0F4\uD478\uB294 \uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm)\uB97C \uB2F4\uC740 \uC57D\uC0B0\uC131 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4. \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C 2\uC8FC \uC0AC\uC6A9 \uD6C4 \uB450\uD53C \uAC01\uC9C8, \uBD89\uC740\uAE30, \uAC00\uB824\uC6C0, \uC720\uBD84, \uC218\uBD84 \uC9C0\uD45C\uAC00 \uAC1C\uC120\uB418\uC5C8\uC2B5\uB2C8\uB2E4(\uC2DC\uD5D8 \uC870\uAC74\uC740 Claim Set \uCC38\uACE0). \uD5A5\uC740 \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4\uC774\uBA70, \uAC19\uC740 \uB77C\uC778\uC758 \uCEE8\uB514\uC154\uB108, \uC570\uD50C \uD2B8\uB9AC\uD2B8\uBA3C\uD2B8, \uD1A0\uB2C9\uACFC \uD568\uAED8 \uC4F0\uB294 \uB8E8\uD2F4\uC744 \uC81C\uC548\uD569\uB2C8\uB2E4.</p>",
          markdown: "\uC774 \uC0F4\uD478\uB294 \uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm)\uB97C \uB2F4\uC740 \uC57D\uC0B0\uC131 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4. \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C 2\uC8FC \uC0AC\uC6A9 \uD6C4 \uB450\uD53C \uAC01\uC9C8, \uBD89\uC740\uAE30, \uAC00\uB824\uC6C0, \uC720\uBD84, \uC218\uBD84 \uC9C0\uD45C\uAC00 \uAC1C\uC120\uB418\uC5C8\uC2B5\uB2C8\uB2E4(\uC2DC\uD5D8 \uC870\uAC74\uC740 Claim Set \uCC38\uACE0). \uD5A5\uC740 \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4\uC774\uBA70, \uAC19\uC740 \uB77C\uC778\uC758 \uCEE8\uB514\uC154\uB108, \uC570\uD50C \uD2B8\uB9AC\uD2B8\uBA3C\uD2B8, \uD1A0\uB2C9\uACFC \uD568\uAED8 \uC4F0\uB294 \uB8E8\uD2F4\uC744 \uC81C\uC548\uD569\uB2C8\uB2E4.\n",
          plaintext: "\uC774 \uC0F4\uD478\uB294 \uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm)\uB97C \uB2F4\uC740 \uC57D\uC0B0\uC131 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4. \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C 2\uC8FC \uC0AC\uC6A9 \uD6C4 \uB450\uD53C \uAC01\uC9C8, \uBD89\uC740\uAE30, \uAC00\uB824\uC6C0, \uC720\uBD84, \uC218\uBD84 \uC9C0\uD45C\uAC00 \uAC1C\uC120\uB418\uC5C8\uC2B5\uB2C8\uB2E4(\uC2DC\uD5D8 \uC870\uAC74\uC740 Claim Set \uCC38\uACE0). \uD5A5\uC740 \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4\uC774\uBA70, \uAC19\uC740 \uB77C\uC778\uC758 \uCEE8\uB514\uC154\uB108, \uC570\uD50C \uD2B8\uB9AC\uD2B8\uBA3C\uD2B8, \uD1A0\uB2C9\uACFC \uD568\uAED8 \uC4F0\uB294 \uB8E8\uD2F4\uC744 \uC81C\uC548\uD569\uB2C8\uB2E4.",
          json: [
            {
              nodeType: "paragraph",
              content: [
                {
                  nodeType: "text",
                  value: "\uC774 \uC0F4\uD478\uB294 \uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm)\uB97C \uB2F4\uC740 \uC57D\uC0B0\uC131 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4. \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C 2\uC8FC \uC0AC\uC6A9 \uD6C4 \uB450\uD53C \uAC01\uC9C8, \uBD89\uC740\uAE30, \uAC00\uB824\uC6C0, \uC720\uBD84, \uC218\uBD84 \uC9C0\uD45C\uAC00 \uAC1C\uC120\uB418\uC5C8\uC2B5\uB2C8\uB2E4(\uC2DC\uD5D8 \uC870\uAC74\uC740 Claim Set \uCC38\uACE0). \uD5A5\uC740 \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4\uC774\uBA70, \uAC19\uC740 \uB77C\uC778\uC758 \uCEE8\uB514\uC154\uB108, \uC570\uD50C \uD2B8\uB9AC\uD2B8\uBA3C\uD2B8, \uD1A0\uB2C9\uACFC \uD568\uAED8 \uC4F0\uB294 \uB8E8\uD2F4\uC744 \uC81C\uC548\uD569\uB2C8\uB2E4."
                }
              ]
            }
          ]
        },
        routine: [
          "Daily Care: \uC0F4\uD478 \u2192 \uCEE8\uB514\uC154\uB108 \u2192 \uD1A0\uB2C9",
          "Special Care: \uC0F4\uD478 \u2192 \uC570\uD50C \uD2B8\uB9AC\uD2B8\uBA3C\uD2B8 \u2192 \uD1A0\uB2C9"
        ],
        faqQuestions: [
          "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uBC14\uC774\uC624\uC5D1\uC18C\uC880 \uC0F4\uD478\uB294 \uD0C8\uBAA8 \uAE30\uB2A5\uC131 \uC81C\uD488\uC778\uAC00\uC694?",
          "\uC5B4\uB5A4 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uB098\uC694?",
          "\uC8FC\uC694 \uC131\uBD84\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?",
          "\uC5B4\uB5A4 \uD5A5\uC778\uAC00\uC694?",
          "\uC0AC\uC6A9\uAE30\uD55C\uC740 \uC5BC\uB9C8\uB098 \uB418\uB098\uC694?"
        ],
        faqAnswers: [
          {
            html: "<p>\uB124, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC2DD\uC57D\uCC98 \uC2EC\uC0AC(\uB610\uB294 \uBCF4\uACE0)\uB97C \uAC70\uCCE4\uC2B5\uB2C8\uB2E4.</p>",
            markdown: "\uB124, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC2DD\uC57D\uCC98 \uC2EC\uC0AC(\uB610\uB294 \uBCF4\uACE0)\uB97C \uAC70\uCCE4\uC2B5\uB2C8\uB2E4.\n",
            plaintext: "\uB124, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC2DD\uC57D\uCC98 \uC2EC\uC0AC(\uB610\uB294 \uBCF4\uACE0)\uB97C \uAC70\uCCE4\uC2B5\uB2C8\uB2E4.",
            json: [
              {
                nodeType: "paragraph",
                content: [
                  {
                    nodeType: "text",
                    value: "\uB124, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC2DD\uC57D\uCC98 \uC2EC\uC0AC(\uB610\uB294 \uBCF4\uACE0)\uB97C \uAC70\uCCE4\uC2B5\uB2C8\uB2E4."
                  }
                ]
              }
            ]
          },
          {
            html: "<p>\uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC57D\uC0B0\uC131 \uC800\uC790\uADF9 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4.</p>",
            markdown: "\uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC57D\uC0B0\uC131 \uC800\uC790\uADF9 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4.\n",
            plaintext: "\uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC57D\uC0B0\uC131 \uC800\uC790\uADF9 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4.",
            json: [
              {
                nodeType: "paragraph",
                content: [
                  {
                    nodeType: "text",
                    value: "\uBAA8\uB4E0 \uB450\uD53C \uD0C0\uC785\uC5D0 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC57D\uC0B0\uC131 \uC800\uC790\uADF9 \uB370\uC77C\uB9AC \uC0F4\uD478\uC785\uB2C8\uB2E4."
                  }
                ]
              }
            ]
          },
          {
            html: "<p>\uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm), 3\uC885 \uD788\uC54C\uB8E8\uB860\uC0B0, \uB098\uC774\uC544\uC2E0\uC544\uB9C8\uC774\uB4DC, \uBE44\uC624\uD2F4 \uB4F1\uC774 \uB4E4\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p>",
            markdown: "\uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm), 3\uC885 \uD788\uC54C\uB8E8\uB860\uC0B0, \uB098\uC774\uC544\uC2E0\uC544\uB9C8\uC774\uB4DC, \uBE44\uC624\uD2F4 \uB4F1\uC774 \uB4E4\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.\n",
            plaintext: "\uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm), 3\uC885 \uD788\uC54C\uB8E8\uB860\uC0B0, \uB098\uC774\uC544\uC2E0\uC544\uB9C8\uC774\uB4DC, \uBE44\uC624\uD2F4 \uB4F1\uC774 \uB4E4\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
            json: [
              {
                nodeType: "paragraph",
                content: [
                  {
                    nodeType: "text",
                    value: "\uBE44\uD3F4\uB80C \uC5D1\uC18C\uC880\uACFC \uC720\uC0B0\uADE0\uBC1C\uD6A8\uC6A9\uD574\uBB3C\uC744 \uC870\uD569\uD55C \uBC14\uC774\uC624\uC5D1\uC18C\uC880\u2122 \uCF64\uD50C\uB809\uC2A4(20,000ppm), 3\uC885 \uD788\uC54C\uB8E8\uB860\uC0B0, \uB098\uC774\uC544\uC2E0\uC544\uB9C8\uC774\uB4DC, \uBE44\uC624\uD2F4 \uB4F1\uC774 \uB4E4\uC5B4 \uC788\uC2B5\uB2C8\uB2E4."
                  }
                ]
              }
            ]
          },
          {
            html: "<p>\uC624\uB80C\uC9C0(top), \uC81C\uB77C\uB284\xB7\uB85C\uC988\xB7\uB77C\uBCA4\uB354(middle), \uD654\uC774\uD2B8\uBA38\uC2A4\uD06C\xB7\uC0CC\uB2EC\uC6B0\uB4DC(base)\uB85C \uAD6C\uC131\uB41C \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4 \uD5A5\uC785\uB2C8\uB2E4.</p>",
            markdown: "\uC624\uB80C\uC9C0(top), \uC81C\uB77C\uB284\xB7\uB85C\uC988\xB7\uB77C\uBCA4\uB354(middle), \uD654\uC774\uD2B8\uBA38\uC2A4\uD06C\xB7\uC0CC\uB2EC\uC6B0\uB4DC(base)\uB85C \uAD6C\uC131\uB41C \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4 \uD5A5\uC785\uB2C8\uB2E4.\n",
            plaintext: "\uC624\uB80C\uC9C0(top), \uC81C\uB77C\uB284\xB7\uB85C\uC988\xB7\uB77C\uBCA4\uB354(middle), \uD654\uC774\uD2B8\uBA38\uC2A4\uD06C\xB7\uC0CC\uB2EC\uC6B0\uB4DC(base)\uB85C \uAD6C\uC131\uB41C \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4 \uD5A5\uC785\uB2C8\uB2E4.",
            json: [
              {
                nodeType: "paragraph",
                content: [
                  {
                    nodeType: "text",
                    value: "\uC624\uB80C\uC9C0(top), \uC81C\uB77C\uB284\xB7\uB85C\uC988\xB7\uB77C\uBCA4\uB354(middle), \uD654\uC774\uD2B8\uBA38\uC2A4\uD06C\xB7\uC0CC\uB2EC\uC6B0\uB4DC(base)\uB85C \uAD6C\uC131\uB41C \uD5C8\uBC8C \uC2DC\uD2B8\uB7EC\uC2A4 \uD5A5\uC785\uB2C8\uB2E4."
                  }
                ]
              }
            ]
          },
          {
            html: "<p>\uAC1C\uBD09 \uD6C4 12\uAC1C\uC6D4\uC785\uB2C8\uB2E4. \uC81C\uC870\uC77C\uB85C\uBD80\uD130 36\uAC1C\uC6D4 \uC774\uB0B4 \uC81C\uD488\uB9CC \uD310\uB9E4\uD569\uB2C8\uB2E4.</p>",
            markdown: "\uAC1C\uBD09 \uD6C4 12\uAC1C\uC6D4\uC785\uB2C8\uB2E4. \uC81C\uC870\uC77C\uB85C\uBD80\uD130 36\uAC1C\uC6D4 \uC774\uB0B4 \uC81C\uD488\uB9CC \uD310\uB9E4\uD569\uB2C8\uB2E4.\n",
            plaintext: "\uAC1C\uBD09 \uD6C4 12\uAC1C\uC6D4\uC785\uB2C8\uB2E4. \uC81C\uC870\uC77C\uB85C\uBD80\uD130 36\uAC1C\uC6D4 \uC774\uB0B4 \uC81C\uD488\uB9CC \uD310\uB9E4\uD569\uB2C8\uB2E4.",
            json: [
              {
                nodeType: "paragraph",
                content: [
                  {
                    nodeType: "text",
                    value: "\uAC1C\uBD09 \uD6C4 12\uAC1C\uC6D4\uC785\uB2C8\uB2E4. \uC81C\uC870\uC77C\uB85C\uBD80\uD130 36\uAC1C\uC6D4 \uC774\uB0B4 \uC81C\uD488\uB9CC \uD310\uB9E4\uD569\uB2C8\uB2E4."
                  }
                ]
              }
            ]
          }
        ],
        shelfLife: "\uAC1C\uBD09 \uD6C4 12\uAC1C\uC6D4 (\uC81C\uC870\uC77C\uB85C\uBD80\uD130 36\uAC1C\uC6D4 \uC774\uB0B4 \uC81C\uD488\uB9CC \uD310\uB9E4)",
        manufacturer: "\u321C\uC5D8\uC9C0\uC0DD\uD65C\uAC74\uAC15 / \uB300\uD55C\uBBFC\uAD6D",
        cautions: {
          html: "<p>1. \uD654\uC7A5\uD488 \uC0AC\uC6A9 \uC2DC \uB610\uB294 \uC0AC\uC6A9 \uD6C4 \uC9C1\uC0AC\uAD11\uC120\uC5D0 \uC758\uD558\uC5EC \uC0AC\uC6A9 \uBD80\uC704\uAC00 \uBD89\uC740 \uBC18\uC810, \uBD80\uC5B4\uC624\uB984 \uB610\uB294 \uAC00\uB824\uC6C0\uC99D \uB4F1\uC758 \uC774\uC0C1 \uC99D\uC0C1\uC774\uB098 \uBD80\uC791\uC6A9\uC774 \uC788\uB294 \uACBD\uC6B0 \uC804\uBB38\uC758 \uB4F1\uACFC \uC0C1\uB2F4\uD560 \uAC83. 2. \uC0C1\uCC98\uAC00 \uC788\uB294 \uBD80\uC704 \uB4F1\uC5D0\uB294 \uC0AC\uC6A9\uC744 \uC790\uC81C\uD560 \uAC83. 3. \uBCF4\uAD00 \uBC0F \uCDE8\uAE09 \uC2DC\uC758 \uC8FC\uC758\uC0AC\uD56D \uAC00. \uC5B4\uB9B0\uC774\uC758 \uC190\uC774 \uB2FF\uC9C0 \uC54A\uB294 \uACF3\uC5D0 \uBCF4\uAD00\uD560 \uAC83. \uB098. \uC9C1\uC0AC\uAD11\uC120\uC744 \uD53C\uD574\uC11C \uBCF4\uAD00\uD560 \uAC83. 4. \uB208\uC5D0 \uB4E4\uC5B4\uAC14\uC744 \uB54C\uC5D0\uB294 \uC989\uC2DC \uC53B\uC5B4\uB0BC \uAC83. 5. \uC0AC\uC6A9 \uD6C4 \uBB3C\uB85C \uC53B\uC5B4\uB0B4\uC9C0 \uC54A\uC73C\uBA74 \uD0C8\uBAA8 \uB610\uB294 \uD0C8\uC0C9\uC758 \uC6D0\uC778\uC774 \uB420 \uC218 \uC788\uC73C\uBBC0\uB85C \uC8FC\uC758\uD560 \uAC83. 6. \uC2DC\uAC04\uC774 \uACBD\uACFC\uD568\uC5D0 \uB530\uB77C \uB0B4\uC6A9\uBB3C \uBCC0\uC0C9\uC774 \uC788\uC744 \uC218 \uC788\uC73C\uB098 \uC81C\uD488\uC758 \uD488\uC9C8\uC5D0\uB294 \uC774\uC0C1\uC774 \uC5C6\uC74C</p>",
          markdown: "1. \uD654\uC7A5\uD488 \uC0AC\uC6A9 \uC2DC \uB610\uB294 \uC0AC\uC6A9 \uD6C4 \uC9C1\uC0AC\uAD11\uC120\uC5D0 \uC758\uD558\uC5EC \uC0AC\uC6A9 \uBD80\uC704\uAC00 \uBD89\uC740 \uBC18\uC810, \uBD80\uC5B4\uC624\uB984 \uB610\uB294 \uAC00\uB824\uC6C0\uC99D \uB4F1\uC758 \uC774\uC0C1 \uC99D\uC0C1\uC774\uB098 \uBD80\uC791\uC6A9\uC774 \uC788\uB294 \uACBD\uC6B0 \uC804\uBB38\uC758 \uB4F1\uACFC \uC0C1\uB2F4\uD560 \uAC83. 2. \uC0C1\uCC98\uAC00 \uC788\uB294 \uBD80\uC704 \uB4F1\uC5D0\uB294 \uC0AC\uC6A9\uC744 \uC790\uC81C\uD560 \uAC83. 3. \uBCF4\uAD00 \uBC0F \uCDE8\uAE09 \uC2DC\uC758 \uC8FC\uC758\uC0AC\uD56D \uAC00. \uC5B4\uB9B0\uC774\uC758 \uC190\uC774 \uB2FF\uC9C0 \uC54A\uB294 \uACF3\uC5D0 \uBCF4\uAD00\uD560 \uAC83. \uB098. \uC9C1\uC0AC\uAD11\uC120\uC744 \uD53C\uD574\uC11C \uBCF4\uAD00\uD560 \uAC83. 4. \uB208\uC5D0 \uB4E4\uC5B4\uAC14\uC744 \uB54C\uC5D0\uB294 \uC989\uC2DC \uC53B\uC5B4\uB0BC \uAC83. 5. \uC0AC\uC6A9 \uD6C4 \uBB3C\uB85C \uC53B\uC5B4\uB0B4\uC9C0 \uC54A\uC73C\uBA74 \uD0C8\uBAA8 \uB610\uB294 \uD0C8\uC0C9\uC758 \uC6D0\uC778\uC774 \uB420 \uC218 \uC788\uC73C\uBBC0\uB85C \uC8FC\uC758\uD560 \uAC83. 6. \uC2DC\uAC04\uC774 \uACBD\uACFC\uD568\uC5D0 \uB530\uB77C \uB0B4\uC6A9\uBB3C \uBCC0\uC0C9\uC774 \uC788\uC744 \uC218 \uC788\uC73C\uB098 \uC81C\uD488\uC758 \uD488\uC9C8\uC5D0\uB294 \uC774\uC0C1\uC774 \uC5C6\uC74C\n",
          plaintext: "1. \uD654\uC7A5\uD488 \uC0AC\uC6A9 \uC2DC \uB610\uB294 \uC0AC\uC6A9 \uD6C4 \uC9C1\uC0AC\uAD11\uC120\uC5D0 \uC758\uD558\uC5EC \uC0AC\uC6A9 \uBD80\uC704\uAC00 \uBD89\uC740 \uBC18\uC810, \uBD80\uC5B4\uC624\uB984 \uB610\uB294 \uAC00\uB824\uC6C0\uC99D \uB4F1\uC758 \uC774\uC0C1 \uC99D\uC0C1\uC774\uB098 \uBD80\uC791\uC6A9\uC774 \uC788\uB294 \uACBD\uC6B0 \uC804\uBB38\uC758 \uB4F1\uACFC \uC0C1\uB2F4\uD560 \uAC83. 2. \uC0C1\uCC98\uAC00 \uC788\uB294 \uBD80\uC704 \uB4F1\uC5D0\uB294 \uC0AC\uC6A9\uC744 \uC790\uC81C\uD560 \uAC83. 3. \uBCF4\uAD00 \uBC0F \uCDE8\uAE09 \uC2DC\uC758 \uC8FC\uC758\uC0AC\uD56D \uAC00. \uC5B4\uB9B0\uC774\uC758 \uC190\uC774 \uB2FF\uC9C0 \uC54A\uB294 \uACF3\uC5D0 \uBCF4\uAD00\uD560 \uAC83. \uB098. \uC9C1\uC0AC\uAD11\uC120\uC744 \uD53C\uD574\uC11C \uBCF4\uAD00\uD560 \uAC83. 4. \uB208\uC5D0 \uB4E4\uC5B4\uAC14\uC744 \uB54C\uC5D0\uB294 \uC989\uC2DC \uC53B\uC5B4\uB0BC \uAC83. 5. \uC0AC\uC6A9 \uD6C4 \uBB3C\uB85C \uC53B\uC5B4\uB0B4\uC9C0 \uC54A\uC73C\uBA74 \uD0C8\uBAA8 \uB610\uB294 \uD0C8\uC0C9\uC758 \uC6D0\uC778\uC774 \uB420 \uC218 \uC788\uC73C\uBBC0\uB85C \uC8FC\uC758\uD560 \uAC83. 6. \uC2DC\uAC04\uC774 \uACBD\uACFC\uD568\uC5D0 \uB530\uB77C \uB0B4\uC6A9\uBB3C \uBCC0\uC0C9\uC774 \uC788\uC744 \uC218 \uC788\uC73C\uB098 \uC81C\uD488\uC758 \uD488\uC9C8\uC5D0\uB294 \uC774\uC0C1\uC774 \uC5C6\uC74C",
          json: [
            {
              nodeType: "paragraph",
              content: [
                {
                  nodeType: "text",
                  value: "1. \uD654\uC7A5\uD488 \uC0AC\uC6A9 \uC2DC \uB610\uB294 \uC0AC\uC6A9 \uD6C4 \uC9C1\uC0AC\uAD11\uC120\uC5D0 \uC758\uD558\uC5EC \uC0AC\uC6A9 \uBD80\uC704\uAC00 \uBD89\uC740 \uBC18\uC810, \uBD80\uC5B4\uC624\uB984 \uB610\uB294 \uAC00\uB824\uC6C0\uC99D \uB4F1\uC758 \uC774\uC0C1 \uC99D\uC0C1\uC774\uB098 \uBD80\uC791\uC6A9\uC774 \uC788\uB294 \uACBD\uC6B0 \uC804\uBB38\uC758 \uB4F1\uACFC \uC0C1\uB2F4\uD560 \uAC83. 2. \uC0C1\uCC98\uAC00 \uC788\uB294 \uBD80\uC704 \uB4F1\uC5D0\uB294 \uC0AC\uC6A9\uC744 \uC790\uC81C\uD560 \uAC83. 3. \uBCF4\uAD00 \uBC0F \uCDE8\uAE09 \uC2DC\uC758 \uC8FC\uC758\uC0AC\uD56D \uAC00. \uC5B4\uB9B0\uC774\uC758 \uC190\uC774 \uB2FF\uC9C0 \uC54A\uB294 \uACF3\uC5D0 \uBCF4\uAD00\uD560 \uAC83. \uB098. \uC9C1\uC0AC\uAD11\uC120\uC744 \uD53C\uD574\uC11C \uBCF4\uAD00\uD560 \uAC83. 4. \uB208\uC5D0 \uB4E4\uC5B4\uAC14\uC744 \uB54C\uC5D0\uB294 \uC989\uC2DC \uC53B\uC5B4\uB0BC \uAC83. 5. \uC0AC\uC6A9 \uD6C4 \uBB3C\uB85C \uC53B\uC5B4\uB0B4\uC9C0 \uC54A\uC73C\uBA74 \uD0C8\uBAA8 \uB610\uB294 \uD0C8\uC0C9\uC758 \uC6D0\uC778\uC774 \uB420 \uC218 \uC788\uC73C\uBBC0\uB85C \uC8FC\uC758\uD560 \uAC83. 6. \uC2DC\uAC04\uC774 \uACBD\uACFC\uD568\uC5D0 \uB530\uB77C \uB0B4\uC6A9\uBB3C \uBCC0\uC0C9\uC774 \uC788\uC744 \uC218 \uC788\uC73C\uB098 \uC81C\uD488\uC758 \uD488\uC9C8\uC5D0\uB294 \uC774\uC0C1\uC774 \uC5C6\uC74C"
                }
              ]
            }
          ]
        },
        verified: false,
        lastVerified: "2026-10-02",
        jsonLd: null
      }
    },
    "1218": {
      endpoint: "https://publish-p166217-e1771263.adobeaemcloud.com/graphql/execute.json/ref-demo-eds/geo-product-by-path;path=/content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/product",
      fetchedAt: "2026-10-05T14:18:23.322Z",
      item: {
        _path: "/content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/product",
        name: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329",
        displayName: "PDRN \uBCFC\uB968 \uB450\uD53C \uD5E4\uC5B4\uD329",
        brand: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 (Dr.Groot)",
        line: "PDRN\u207A",
        category: "\uD5E4\uC5B4\uCF00\uC5B4 > \uD5E4\uC5B4\uD329\xB7\uD2B8\uB9AC\uD2B8\uBA3C\uD2B8 > \uB450\uD53C\xB7\uBCFC\uB968",
        barcode: "8800335743281",
        volume: "180ml",
        functionalCosmetic: "\uD0C8\uBAA8 \uC99D\uC0C1\uC758 \uC644\uD654\uC5D0 \uB3C4\uC6C0\uC744 \uC8FC\uB294 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488 (\uC9C8\uBCD1\uC758 \uC608\uBC29 \uBC0F \uCE58\uB8CC\uB97C \uC704\uD55C \uC758\uC57D\uD488 \uC544\uB2D8)",
        recommendedFor: [
          "\uBFCC\uB9AC \uBCFC\uB968\uC774 \uC27D\uAC8C \uAC00\uB77C\uC549\uB294 \uBAA8\uBC1C",
          "\uAC1C\uC6B4\uD558\uC9C0 \uC54A\uC740 \uB450\uD53C",
          "\uC5D0\uC13C\uC2A4\uB97C \uBC1C\uB77C\uB3C4 \uBFCC\uB9AC\uBD80\uD130 \uCC98\uC9C0\uB294 \uBAA8\uBC1C",
          "\uB450\uD53C\xB7\uC5BC\uAD74 \uD2B8\uB7EC\uBE14\uC774 \uAC71\uC815\uB418\uB294 \uACBD\uC6B0"
        ],
        keyIngredients: [
          "\uC18C\uB4D0\uB514\uC5D4\uC5D0\uC774 (PDRN)",
          "\uBFCC\uB9AC \uBCFC\uB968 \uD2B9\uD5C8 \uC131\uBD84 (\uD2B9\uD5C8 \uC81C10-2505580\uD638)",
          "\uB85C\uC988\uB9C8\uB9AC\uC78E\uC624\uC77C",
          "\uBCD1\uD480\uC78E\uCD94\uCD9C\uBB3C (\uC13C\uD154\uB77C)",
          "\uC0B4\uB9AC\uC2E4\uB9AD\uC560\uC528\uB4DC",
          "\uB098\uC774\uC544\uC2E0\uC544\uB9C8\uC774\uB4DC",
          "\uBC14\uC774\uC624\uD2F4",
          "\uCE74\uD398\uC778",
          "\uD558\uC774\uB4DC\uB864\uB77C\uC774\uC988\uB4DC\uCF5C\uB77C\uAC90",
          "\uD310\uD14C\uB180",
          "\uBA58\uD1A8"
        ],
        scent: "\uD50C\uB85C\uB7F4",
        scentNotes: [
          "Top: \uB85C\uC988\uC5D0\uC13C\uC2A4, \uADF8\uB9B0 \uC544\uC774\uBE44",
          "Middle: \uBE14\uB799\uCEE4\uB7F0\uD2B8 \uC2F9, \uBAA8\uC2A4(\uC774\uB07C)",
          "Base: \uC0CC\uB2EC\uC6B0\uB4DC, \uD1B5\uCE74\uBE48"
        ],
        definition: {
          plaintext: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 LG\uC0DD\uD65C\uAC74\uAC15\uC774 \uB9CC\uB4E0 180ml \uB450\uD53C \uC804\uC6A9 \uBCFC\uB968 \uD5E4\uC5B4\uD329\uC73C\uB85C, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4."
        },
        summary: {
          plaintext: "\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 \uBAA8\uBC1C \uB05D\uC774 \uC544\uB2CC \uB450\uD53C\uC640 \uBAA8\uBC1C \uBFCC\uB9AC\uC5D0 \uBC14\uB974\uB294 180ml \uB450\uD53C \uC804\uC6A9 \uBCFC\uB968 \uD5E4\uC5B4\uD329\uC774\uBA70, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4."
        },
        description: {
          plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC740 PDRN(\uC18C\uB4D0\uB514\uC5D4\uC5D0\uC774), \uB85C\uC988\uB9C8\uB9AC\uC78E\uC624\uC77C, \uBCD1\uD480\uC78E\uCD94\uCD9C\uBB3C\uACFC \uBFCC\uB9AC \uBCFC\uB968 \uD2B9\uD5C8 \uC131\uBD84\uC744 \uB2F4\uC740 \uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00 \uC81C\uD615\uC785\uB2C8\uB2E4. \uD758\uB7EC\uB0B4\uB9AC\uC9C0 \uC54A\uB294 \uCAC0\uB4DD\uD55C \uC5D0\uC5B4\uB9AC \uC81C\uD615\uC774 \uB450\uD53C\uC5D0 \uBC00\uCC29\uD574 \uAC01\uC9C8, \uB178\uD3D0\uBB3C, \uC720\uBD84\uC744 \uD761\uCC29\uD558\uBA70, \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C \uC0AC\uC6A9 \uC9C1\uD6C4 \uB450\uD53C \uAC01\uC9C8\uACFC \uD53C\uC9C0 \uC9C0\uD45C\uAC00, 2\uC8FC \uC0AC\uC6A9 \uD6C4 \uD0C8\uB77D \uBAA8\uBC1C \uC218\uAC00 \uAC1C\uC120\uB418\uC5C8\uC2B5\uB2C8\uB2E4(\uC2DC\uD5D8 \uC870\uAC74\uC740 Claim Set \uCC38\uACE0). \uD5A5\uC740 \uB85C\uC988\uC5D0\uC13C\uC2A4\uB97C \uD0D1\uB178\uD2B8\uB85C \uD55C \uD50C\uB85C\uB7F4 \uD5A5\uC785\uB2C8\uB2E4."
        },
        howToUse: [
          "\uC0F4\uD478 \uD6C4 \uC628\uC218\uB85C \uBAA8\uBC1C\uACFC \uB450\uD53C\uB97C \uCDA9\uBD84\uD788 \uC801\uC2ED\uB2C8\uB2E4.",
          "\uC801\uB2F9\uB7C9\uC744 \uBAA8\uBC1C\uACFC \uB450\uD53C\uC5D0 \uACE8\uACE0\uB8E8 \uBC14\uB985\uB2C8\uB2E4.",
          "\uBAA8\uBC1C\uACFC \uB450\uD53C\uB97C \uB9C8\uC0AC\uC9C0\uD569\uB2C8\uB2E4.",
          "\uBB3C\uB85C \uAE68\uB057\uC774 \uD5F9\uAD7D\uB2C8\uB2E4."
        ],
        routine: [
          "PDRN\u207A 3\uB2E8\uACC4 \uB450\uD53C & \uBCFC\uB968 \uCF00\uC5B4: \uBCFC\uB968 \uBD80\uC2A4\uD305 \uC570\uD50C \uC0F4\uD478(\uB450\uD53C \uBAA8\uACF5 \uD0C4\uB825) \u2192 \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329(\uC7A5\uBCBD & \uBCFC\uB968 \uAC15\uD654) \u2192 \uB450\uD53C \uC601\uC591 \uD1A0\uB2C9(\uB450\uD53C \uC7A5\uBCBD \uAC15\uD654)",
          "\uD0C8\uBAA8 \uC9D1\uC911 \uCF00\uC5B4: \uD5E4\uC5B4\uB77C\uC778 \uBD80\uC2A4\uD130\uC0F7 \uC570\uD50C",
          "\uBC14\uB974\uACE0 \uC57D 3\uBD84 \uAE30\uB2E4\uB9AC\uB294 \uB3D9\uC548 \uC591\uCE58\xB7\uC81C\uBAA8 \uB4F1 \uB2E4\uB978 \uCF00\uC5B4\uB97C \uBCD1\uD589\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
        ],
        faqQuestions: [
          "\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC778\uAC00\uC694?",
          "PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 \uC5B4\uB5BB\uAC8C \uC0AC\uC6A9\uD558\uB098\uC694?",
          "\uC774 \uD5E4\uC5B4\uD329\uC5D0 \uC2E4\uB9AC\uCF58\uC774 \uB4E4\uC5B4 \uC788\uB098\uC694?",
          "\uC5B4\uB5A4 \uACE0\uBBFC\uC774 \uC788\uC744 \uB54C \uC4F0\uBA74 \uC88B\uC740\uAC00\uC694?",
          "\uC5B4\uB5A4 \uD5A5\uC778\uAC00\uC694?",
          "\uC6A9\uB7C9\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?"
        ],
        faqAnswers: [
          {
            plaintext: "\uB124, \uD0C8\uBAA8 \uC99D\uC0C1\uC758 \uC644\uD654\uC5D0 \uB3C4\uC6C0\uC744 \uC8FC\uB294 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC9C8\uBCD1\uC758 \uC608\uBC29\uC774\uB098 \uCE58\uB8CC\uB97C \uC704\uD55C \uC758\uC57D\uD488\uC740 \uC544\uB2D9\uB2C8\uB2E4."
          },
          {
            plaintext: "\uC0F4\uD478 \uD6C4 \uC628\uC218\uB85C \uBAA8\uBC1C\uACFC \uB450\uD53C\uB97C \uCDA9\uBD84\uD788 \uC801\uC2DC\uACE0, \uC801\uB2F9\uB7C9\uC744 \uBAA8\uBC1C\uACFC \uB450\uD53C\uC5D0 \uACE8\uACE0\uB8E8 \uBC14\uB978 \uB4A4 \uB9C8\uC0AC\uC9C0\uD558\uACE0 \uBB3C\uB85C \uAE68\uB057\uC774 \uD5F9\uAD7D\uB2C8\uB2E4."
          },
          {
            plaintext: "\uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00 \uC81C\uD615\uC785\uB2C8\uB2E4."
          },
          {
            plaintext: "\uBFCC\uB9AC \uBCFC\uB968\uC774 \uC27D\uAC8C \uAC00\uB77C\uC549\uAC70\uB098, \uB450\uD53C\uAC00 \uAC1C\uC6B4\uD558\uC9C0 \uC54A\uAC70\uB098, \uBAA8\uBC1C \uB05D\uC5D0\uB9CC \uC4F0\uB294 \uD329\uC73C\uB85C\uB294 \uBFCC\uB9AC \uBCFC\uB968\uC774 \uC720\uC9C0\uB418\uC9C0 \uC54A\uC744 \uB54C \uC4F0\uB294 \uB450\uD53C \uC804\uC6A9 \uBCFC\uB968\uD329\uC785\uB2C8\uB2E4."
          },
          {
            plaintext: "\uB85C\uC988\uC5D0\uC13C\uC2A4\uC640 \uADF8\uB9B0 \uC544\uC774\uBE44(top), \uBE14\uB799\uCEE4\uB7F0\uD2B8 \uC2F9\uACFC \uBAA8\uC2A4(middle), \uC0CC\uB2EC\uC6B0\uB4DC\uC640 \uD1B5\uCE74\uBE48(base)\uC73C\uB85C \uAD6C\uC131\uB41C \uD50C\uB85C\uB7F4 \uD5A5\uC785\uB2C8\uB2E4."
          },
          {
            plaintext: "180ml(6.5 fl oz)\uC785\uB2C8\uB2E4."
          }
        ],
        relatedProducts: [
          "PDRN\u207A \uBCFC\uB968 \uBD80\uC2A4\uD305 \uC570\uD50C \uC0F4\uD478",
          "PDRN\u207A \uB450\uD53C \uC601\uC591 \uD1A0\uB2C9",
          "PDRN\u207A \uD5E4\uC5B4\uB77C\uC778 \uBD80\uC2A4\uD130\uC0F7 \uC570\uD50C"
        ],
        cautions: {
          plaintext: "1. \uD654\uC7A5\uD488 \uC0AC\uC6A9 \uC2DC \uB610\uB294 \uC0AC\uC6A9 \uD6C4 \uC9C1\uC0AC\uAD11\uC120\uC5D0 \uC758\uD558\uC5EC \uC0AC\uC6A9\uBD80\uC704\uAC00 \uBD89\uC740 \uBC18\uC810, \uBD80\uC5B4\uC624\uB984 \uB610\uB294 \uAC00\uB824\uC6C0\uC99D \uB4F1\uC758 \uC774\uC0C1 \uC99D\uC0C1\uC774\uB098 \uBD80\uC791\uC6A9\uC774 \uC788\uB294 \uACBD\uC6B0\uC5D0\uB294 \uC804\uBB38\uC758 \uB4F1\uACFC \uC0C1\uB2F4\uD560 \uAC83. 2. \uC0C1\uCC98\uAC00 \uC788\uB294 \uBD80\uC704 \uB4F1\uC5D0\uB294 \uC0AC\uC6A9\uC744 \uC790\uC81C\uD560 \uAC83. 3. \uBCF4\uAD00 \uBC0F \uCDE8\uAE09 \uC2DC \uC8FC\uC758\uC0AC\uD56D \uAC00) \uC5B4\uB9B0\uC774\uC758 \uC190\uC774 \uB2FF\uC9C0 \uC54A\uB294 \uACF3\uC5D0 \uBCF4\uAD00\uD560 \uAC83 \uB098) \uC9C1\uC0AC\uAD11\uC120\uC744 \uD53C\uD574\uC11C \uBCF4\uAD00\uD560 \uAC83. 4. \uB208\uC5D0 \uB4E4\uC5B4\uAC14\uC744 \uB54C\uC5D0\uB294 \uC989\uC2DC \uC53B\uC5B4\uB0BC \uAC83. 5. \uC0AC\uC6A9 \uD6C4 \uBB3C\uB85C \uC53B\uC5B4\uB0B4\uC9C0 \uC54A\uC73C\uBA74 \uD0C8\uBAA8 \uB610\uB294 \uD0C8\uC0C9\uC758 \uC6D0\uC778\uC774 \uB420 \uC218 \uC788\uC73C\uBBC0\uB85C \uC8FC\uC758\uD560 \uAC83. \u203B \uBCF8 \uC81C\uD488\uC740 \uC6A9\uB3C4 \uC774\uC678\uC5D0\uB294 \uC0AC\uC6A9\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624. \uC2DC\uAC04\uC774 \uACBD\uACFC\uD558\uBA74\uC11C \uB0B4\uC6A9\uBB3C\uC774 \uBCC0\uC0C9\uB420 \uC218 \uC788\uC73C\uB098 \uC81C\uD488\uC758 \uD488\uC9C8\uC5D0\uB294 \uC774\uC0C1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uBCF8 \uC81C\uD488\uC740 \uACF5\uC815\uAC70\uB798\uC704\uC6D0\uD68C \uACE0\uC2DC\uC5D0 \uC758\uAC70 \uAD50\uD658 \uB610\uB294 \uBCF4\uC0C1\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uAE30\uB2A5\uC131\uD654\uC7A5\uD488: \uC9C8\uBCD1\uC758 \uC608\uBC29 \uBC0F \uCE58\uB8CC\uB97C \uC704\uD55C \uC758\uC57D\uD488\uC774 \uC544\uB2D8."
        },
        manufacturer: "\u321C\uC5D8\uC9C0\uC0DD\uD65C\uAC74\uAC15 / \uACF5\uC7A5: \uCDA9\uCCAD\uBD81\uB3C4 \uCCAD\uC8FC\uC2DC \uD765\uB355\uAD6C 2\uC21C\uD658\uB85C 765, \uBCF8\uC0AC: \uC11C\uC6B8\uC2DC \uC911\uAD6C \uD6C4\uC554\uB85C 98 / MADE IN KOREA",
        customerService: "\uC81C\uD488\uC0C1\uB2F4\xB7\uD488\uC9C8\uBD88\uD3B8 080-023-7007 (\uC218\uC2E0\uC790 \uBD80\uB2F4, \uD3C9\uC77C 09:00~17:30), \uC8FC\uBB38\xB7\uCDE8\uC18C\xB7\uBC30\uC1A1 080-858-9685 (\uD3C9\uC77C 09:00~18:00), www.DrGroot.co.kr",
        featureSet: {
          _path: "/content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/features",
          featureTitles: [
            "\uB450\uD53C\uC5D0 \uBC14\uB974\uB294 \uBFCC\uB9AC \uBCFC\uB968\uD329",
            "\uB450\uD53C \uAC01\uC9C8\xB7\uC720\uBD84 \uCF00\uC5B4",
            "\uB450\uD53C \uC7A5\uBCBD \uCF00\uC5B4",
            "\uBFCC\uB9AC \uBCFC\uB968 \uD2B9\uD5C8 \uC131\uBD84",
            "\uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131",
            "\uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00 \uC800\uC790\uADF9 \uB370\uC77C\uB9AC \uD329",
            "\uD758\uB7EC\uB0B4\uB9AC\uC9C0 \uC54A\uB294 \uC81C\uD615\uACFC \uD50C\uB85C\uB7F4 \uD5A5"
          ],
          featureSummaries: [
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC740 \uBAA8\uBC1C \uB05D\uC774 \uC544\uB2CC \uB450\uD53C\uC640 \uBFCC\uB9AC\uBD80\uD130 \uBC14\uB974\uB294 \uC2A4\uCE7C\uD504 & \uD5E4\uC5B4 \uD329\uC785\uB2C8\uB2E4."
            },
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC758 \uBC00\uCC29 \uC81C\uD615\uC740 \uB450\uD53C\uC758 \uBB35\uC740 \uAC01\uC9C8, \uB178\uD3D0\uBB3C, \uC720\uBD84\uC744 \uD761\uCC29\uD569\uB2C8\uB2E4. \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C \uC0AC\uC6A9 \uC9C1\uD6C4 \uB450\uD53C \uAC01\uC9C8 94.7%, \uB450\uD53C \uD53C\uC9C0 95.4% \uAC1C\uC120\uC774 \uD655\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
            },
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC740 PDRN(\uC18C\uB4D0\uB514\uC5D4\uC5D0\uC774), \uB85C\uC988\uB9C8\uB9AC\uC78E\uC624\uC77C, \uBCD1\uD480\uC78E\uCD94\uCD9C\uBB3C(\uC13C\uD154\uB77C)\uC774 \uD568\uC720\uB41C \uC81C\uD615\uC73C\uB85C \uB450\uD53C \uC7A5\uBCBD\uC744 \uCF00\uC5B4\uD569\uB2C8\uB2E4."
            },
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC5D0\uB294 \uBFCC\uB9AC \uBCFC\uB968 \uD2B9\uD5C8 \uC131\uBD84(\uD2B9\uD5C8 \uC81C10-2505580\uD638)\uC774 \uB4E4\uC5B4 \uC788\uC73C\uBA70, \uC778\uBAA8 \uAC00\uBC1C \uC2DC\uD5D8\uC5D0\uC11C 1\uD68C \uC0AC\uC6A9 \uD6C4 24\uC2DC\uAC04 \uBFCC\uB9AC \uBCFC\uB968 \uC9C0\uC18D\uC774 \uD655\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
            },
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC740 \uD0C8\uBAA8 \uC99D\uC0C1\uC758 \uC644\uD654\uC5D0 \uB3C4\uC6C0\uC744 \uC8FC\uB294 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC778\uCCB4\uC801\uC6A9\uC2DC\uD5D8\uC5D0\uC11C 2\uC8FC \uC0AC\uC6A9 \uD6C4 \uBE57\uC9C8(\uB04A\uC5B4\uC9D0)\uC5D0 \uC758\uD55C \uD0C8\uB77D \uBAA8\uBC1C \uC218\uAC00 74.3% \uAC10\uC18C\uD588\uC2B5\uB2C8\uB2E4."
            },
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC740 \uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00 \uC81C\uD615\uC774\uBA70, 48\uC2DC\uAC04 \uCCA9\uD3EC\uC2DC\uD5D8\uC5D0\uC11C \uC720\uC758\uD55C \uC218\uC900\uC758 \uD53C\uBD80\uC790\uADF9\uC774 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4."
            },
            {
              plaintext: "\uC774 \uD5E4\uC5B4\uD329\uC740 \uD758\uB7EC\uB0B4\uB9AC\uC9C0 \uC54A\uB294 \uCAC0\uB4DD\uD55C \uC5D0\uC5B4\uB9AC \uC81C\uD615\uC774\uBA70, \uB85C\uC988\uC5D0\uC13C\uC2A4 \uD0D1\uB178\uD2B8\uC758 \uD50C\uB85C\uB7F4 \uD5A5\uC785\uB2C8\uB2E4."
            }
          ],
          featureTypes: [
            "usage",
            "benefit",
            "benefit",
            "ingredient",
            "functional",
            "safety",
            "texture"
          ],
          marketingCopy: [
            "\uBFCC\uB9AC\uBD80\uD130 \uCAC0\uB4DD\uD558\uAC8C \uC0B4\uC544\uB098\uB294 \uBCFC\uB968 \uC790\uC2E0\uAC10",
            "\uC2A4\uD30C\uC5D0 \uB2E4\uB140\uC628 \uB4EF \uAC1C\uC6B4\uD558\uAC8C",
            "\uB2FF\uC544\uB3C4 OK, \uBD80\uB2F4 ZERO",
            "3\uBD84, \uC790\uC720\uB85C\uC6CC\uC9C0\uC138\uC694",
            "\uB450\uD53C\uAE4C\uC9C0 \uCF00\uC5B4\uD558\uB294 \uD5E4\uC5B4\uD329\uC73C\uB85C \uBCFC\uB968\uC758 \uAE30\uC900\uC744 \uBC14\uAFD4\uBCF4\uC138\uC694",
            "\uC7AC\uAD6C\uB9E4\uC728 1\uC704 (\uADFC\uAC70 \uBBF8\uC81C\uC2DC)",
            "\uD0C8\uBAA8\uC99D\uC0C1 \uCF00\uC5B4 \uC804\uBB38",
            "\uCAC0\uB4DD \uBC00\uCC29 X \uCAC0\uCAC0 \uD38C\uD551"
          ]
        },
        claimSet: {
          _path: "/content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/claims",
          statements: [
            "\uBFCC\uB9AC \uBCFC\uB968 \uC9C0\uC18D",
            "\uBFCC\uB9AC \uBCFC\uB968 \uC99D\uAC00",
            "\uB450\uD53C \uAC01\uC9C8 \uAC1C\uC120",
            "\uB450\uD53C \uD53C\uC9C0 \uAC1C\uC120",
            "\uBE57\uC9C8(\uB04A\uC5B4\uC9D0)\uC5D0 \uC758\uD55C \uD0C8\uB77D \uBAA8\uBC1C \uC218 \uAC10\uC18C",
            "\uB450\uD53C \uC7A5\uBCBD \uAC1C\uC120\xB7\uAC15\uD654",
            "\uBAA8\uACF5 \uAC01\uC9C8 \uD761\uCC29",
            "\uD53C\uBD80 \uC790\uADF9 \uD14C\uC2A4\uD2B8 \uC644\uB8CC",
            "\uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00"
          ],
          claimValues: [
            "24\uC2DC\uAC04",
            "15.7%",
            "94.7%",
            "95.4%",
            "74.3%",
            "-",
            "-",
            "\uC720\uC758\uD55C \uD53C\uBD80\uC790\uADF9 \uC5C6\uC74C",
            "-"
          ],
          conditions: [
            "1\uD68C \uC0AC\uC6A9 (\uC778\uBAA8 \uAC00\uBC1C \uC2DC\uD5D8)",
            "\uC0AC\uC6A9 \uC9C1\uD6C4 (\uC778\uBAA8 \uAC00\uBC1C \uC2DC\uD5D8)",
            "\uC0AC\uC6A9 \uC9C1\uD6C4",
            "\uC0AC\uC6A9 \uC9C1\uD6C4",
            "\uC0AC\uC6A9 2\uC8FC \uD6C4",
            "-",
            "-",
            "\uB4F1 \uBD80\uC704, 48\uC2DC\uAC04 \uD3D0\uC1C4\uD615 \uCCA9\uD3EC\uC2DC\uD5D8, \uAC1C\uC778\uCC28 \uC788\uC74C",
            "-"
          ],
          footnotes: [
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC778\uBAA8 \uAC00\uBC1C 30\uAC1C, \uC2DC\uD5D8\uAE30\uAC04 2026.03.03~2026.03.04"
            },
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC778\uBAA8 \uAC00\uBC1C 30\uAC1C, \uC2DC\uD5D8\uAE30\uAC04 2026.03.03~2026.03.04"
            },
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC5EC\uC131 30\uBA85, \uC2DC\uD5D8\uAE30\uAC04 2026.03.09~2026.03.26"
            },
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC5EC\uC131 30\uBA85, \uC2DC\uD5D8\uAE30\uAC04 2026.03.09~2026.03.26"
            },
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC5EC\uC131 30\uBA85, \uC2DC\uD5D8\uAE30\uAC04 2026.03.09~2026.03.26"
            },
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC5EC\uC131 30\uBA85, \uC2DC\uD5D8\uAE30\uAC04 2026.03.09~2026.03.26"
            },
            {
              plaintext: "(\uC8FC)\uC5D8\uB9AC\uB4DC, \uC5EC\uC131 30\uBA85, \uC2DC\uD5D8\uAE30\uAC04 2026.03.09~2026.03.26"
            },
            {
              plaintext: "(\uC8FC)\uC5D0\uCF54\uB364, \uC2DC\uD5D8\uC778\uC6D0 30\uBA85, 2026.02.02~2026.02.06"
            },
            {
              plaintext: "\uCC98\uBC29 \uD45C\uAE30 (\uC804\uC131\uBD84\uC0C1 \uC2E4\uB9AC\uCF58 \uACC4\uC5F4 \uC131\uBD84 \uC5C6\uC74C \u2014 \uAC80\uC218 \uD655\uC778 \uD544\uC694)"
            }
          ],
          evidenceTypes: [
            "in-vitro-test (\uC778\uBAA8 \uAC00\uBC1C)",
            "in-vitro-test (\uC778\uBAA8 \uAC00\uBC1C)",
            "human-application-test",
            "human-application-test",
            "human-application-test",
            "human-application-test",
            "human-application-test",
            "patch-test",
            "formulation"
          ]
        },
        jsonldtext: [
          {
            plaintext: '{"@context":"https://schema.org","@graph":[{"@type":"ProductGroup","name":"\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329","alternateName":["PDRN \uBCFC\uB968 \uB450\uD53C \uD5E4\uC5B4\uD329","Dr.Groot Hair & Scalp Volume Mask","PDRN\u207A Volume Boosting Scalp & Hair Mask"],"brand":{"@type":"Brand","name":"\uB2E5\uD130\uADF8\uB8E8\uD2B8"},"manufacturer":{"@type":"Organization","name":"\u321C\uC5D8\uC9C0\uC0DD\uD65C\uAC74\uAC15"},"description":"\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 \uBAA8\uBC1C \uB05D\uC774 \uC544\uB2CC \uB450\uD53C\uC640 \uBAA8\uBC1C \uBFCC\uB9AC\uC5D0 \uBC14\uB974\uB294 180ml \uB450\uD53C \uC804\uC6A9 \uBCFC\uB968 \uD5E4\uC5B4\uD329\uC774\uBA70, \uD0C8\uBAA8 \uC99D\uC0C1 \uC644\uD654 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4.","variesBy":"https://schema.org/size","additionalProperty":[{"@type":"PropertyValue","name":"\uAE30\uB2A5\uC131","value":"\uD0C8\uBAA8 \uC99D\uC0C1\uC758 \uC644\uD654\uC5D0 \uB3C4\uC6C0"},{"@type":"PropertyValue","name":"\uBB34\uCCA8\uAC00","value":"\uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00"},{"@type":"PropertyValue","name":"\uD5A5","value":"\uD50C\uB85C\uB7F4"}],"hasVariant":[{"@type":"Product","name":"PDRN \uBCFC\uB968 \uB450\uD53C \uD5E4\uC5B4\uD329 180ml","size":"180ml","gtin13":"8800335743281","productID":"1218","url":"https://drgroot.co.kr/product/pdrn-\uBCFC\uB968-\uB450\uD53C-\uD5E4\uC5B4\uD329/1218/"}]},{"@type":"HowTo","name":"PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329 \uC0AC\uC6A9\uBC95","step":[{"@type":"HowToStep","position":1,"text":"\uC0F4\uD478 \uD6C4 \uC628\uC218\uB85C \uBAA8\uBC1C\uACFC \uB450\uD53C\uB97C \uCDA9\uBD84\uD788 \uC801\uC2ED\uB2C8\uB2E4."},{"@type":"HowToStep","position":2,"text":"\uC801\uB2F9\uB7C9\uC744 \uBAA8\uBC1C\uACFC \uB450\uD53C\uC5D0 \uACE8\uACE0\uB8E8 \uBC14\uB985\uB2C8\uB2E4."},{"@type":"HowToStep","position":3,"text":"\uBAA8\uBC1C\uACFC \uB450\uD53C\uB97C \uB9C8\uC0AC\uC9C0\uD569\uB2C8\uB2E4."},{"@type":"HowToStep","position":4,"text":"\uBB3C\uB85C \uAE68\uB057\uC774 \uD5F9\uAD7D\uB2C8\uB2E4."}]},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"\uB2E5\uD130\uADF8\uB8E8\uD2B8 PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC778\uAC00\uC694?","acceptedAnswer":{"@type":"Answer","text":"\uB124, \uD0C8\uBAA8 \uC99D\uC0C1\uC758 \uC644\uD654\uC5D0 \uB3C4\uC6C0\uC744 \uC8FC\uB294 \uAE30\uB2A5\uC131 \uD654\uC7A5\uD488\uC785\uB2C8\uB2E4. \uC9C8\uBCD1\uC758 \uC608\uBC29\uC774\uB098 \uCE58\uB8CC\uB97C \uC704\uD55C \uC758\uC57D\uD488\uC740 \uC544\uB2D9\uB2C8\uB2E4."}},{"@type":"Question","name":"PDRN\u207A \uD5E4\uC5B4\uC5D4 \uC2A4\uCE7C\uD504 \uBCFC\uB968\uD329\uC740 \uC5B4\uB5BB\uAC8C \uC0AC\uC6A9\uD558\uB098\uC694?","acceptedAnswer":{"@type":"Answer","text":"\uC0F4\uD478 \uD6C4 \uC628\uC218\uB85C \uBAA8\uBC1C\uACFC \uB450\uD53C\uB97C \uCDA9\uBD84\uD788 \uC801\uC2DC\uACE0, \uC801\uB2F9\uB7C9\uC744 \uBAA8\uBC1C\uACFC \uB450\uD53C\uC5D0 \uACE8\uACE0\uB8E8 \uBC14\uB978 \uB4A4 \uB9C8\uC0AC\uC9C0\uD558\uACE0 \uBB3C\uB85C \uAE68\uB057\uC774 \uD5F9\uAD7D\uB2C8\uB2E4."}},{"@type":"Question","name":"\uC774 \uD5E4\uC5B4\uD329\uC5D0 \uC2E4\uB9AC\uCF58\uC774 \uB4E4\uC5B4 \uC788\uB098\uC694?","acceptedAnswer":{"@type":"Answer","text":"\uC2E4\uB9AC\uCF58 \uBB34\uCCA8\uAC00 \uC81C\uD615\uC785\uB2C8\uB2E4."}},{"@type":"Question","name":"\uC5B4\uB5A4 \uACE0\uBBFC\uC774 \uC788\uC744 \uB54C \uC4F0\uBA74 \uC88B\uC740\uAC00\uC694?","acceptedAnswer":{"@type":"Answer","text":"\uBFCC\uB9AC \uBCFC\uB968\uC774 \uC27D\uAC8C \uAC00\uB77C\uC549\uAC70\uB098, \uB450\uD53C\uAC00 \uAC1C\uC6B4\uD558\uC9C0 \uC54A\uAC70\uB098, \uBAA8\uBC1C \uB05D\uC5D0\uB9CC \uC4F0\uB294 \uD329\uC73C\uB85C\uB294 \uBFCC\uB9AC \uBCFC\uB968\uC774 \uC720\uC9C0\uB418\uC9C0 \uC54A\uC744 \uB54C \uC4F0\uB294 \uB450\uD53C \uC804\uC6A9 \uBCFC\uB968\uD329\uC785\uB2C8\uB2E4."}},{"@type":"Question","name":"\uC5B4\uB5A4 \uD5A5\uC778\uAC00\uC694?","acceptedAnswer":{"@type":"Answer","text":"\uB85C\uC988\uC5D0\uC13C\uC2A4\uC640 \uADF8\uB9B0 \uC544\uC774\uBE44(top), \uBE14\uB799\uCEE4\uB7F0\uD2B8 \uC2F9\uACFC \uBAA8\uC2A4(middle), \uC0CC\uB2EC\uC6B0\uB4DC\uC640 \uD1B5\uCE74\uBE48(base)\uC73C\uB85C \uAD6C\uC131\uB41C \uD50C\uB85C\uB7F4 \uD5A5\uC785\uB2C8\uB2E4."}},{"@type":"Question","name":"\uC6A9\uB7C9\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?","acceptedAnswer":{"@type":"Answer","text":"180ml(6.5 fl oz)\uC785\uB2C8\uB2E4."}}]}]}'
          }
        ],
        verified: false,
        lastVerified: "2026-10-05"
      }
    }
  };

  // tools/importer/import-product.js
  var parsers = {
    "columns-product": parse,
    "cards-product": parse2,
    "cards-brandline": parse3,
    "columns-info": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "product",
    "description": "Cafe24 product detail page (PDP) \u2013 static content migration; commerce widgets excluded",
    "urls": [
      "https://drgroot.co.kr/product/detail.html?product_no=1119&cate_no=195&display_group=1"
    ],
    "blocks": [
      {
        "name": "columns-product",
        "instances": [
          ".prdDetail_topArea > .prdDetail_infoArea"
        ]
      },
      {
        "name": "cards-product",
        "instances": [
          ".xans-product-relationlist.base_prd_list"
        ]
      },
      {
        "name": "cards-brandline",
        "instances": [
          ".base_layout_wrapper .prdDetail_banner_container"
        ]
      },
      {
        "name": "columns-info",
        "instances": [
          ".prdInfo_contents"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "Product summary",
        "selector": [
          ".prdDetail_topArea"
        ],
        "style": null,
        "blocks": [
          "columns-product"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "Related products",
        "selector": [
          "#prdRelatedWrap",
          ".prdDetail_additionalArea"
        ],
        "style": null,
        "blocks": [
          "cards-product"
        ],
        "defaultContent": [
          ".relation h3.title"
        ]
      },
      {
        "id": "3",
        "name": "Product detail images",
        "selector": [
          "#prdDetail > .cont > .content"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "#prdDetail > .cont > .content img"
        ]
      },
      {
        "id": "4",
        "name": "Brand line promo",
        "selector": [
          "#prdDetail > .base_layout_wrapper",
          ".base_layout_wrapper"
        ],
        "style": "secondary",
        "blocks": [
          "cards-brandline"
        ],
        "defaultContent": [
          ".base_layout_wrapper .iv_section_title p",
          ".base_layout_wrapper .iv_section_title h2",
          ".base_layout_wrapper .iv_section_title a"
        ]
      },
      {
        "id": "5",
        "name": "Reviews (excluded \u2013 backend widget)",
        "selector": [
          "#prdReview"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "6",
        "name": "Purchase information",
        "selector": [
          "#prdInfo"
        ],
        "style": null,
        "blocks": [
          "columns-info"
        ],
        "defaultContent": []
      },
      {
        "id": "7",
        "name": "Fixed option bar (excluded)",
        "selector": [
          "#prdDetail_fixed_optionArea"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "8",
        "name": "Overlay / popup container (excluded)",
        "selector": [
          "body > div:nth-of-type(17)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "9",
        "name": "Chat plugin (excluded)",
        "selector": [
          "#ch-plugin"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "10",
        "name": "Snapfit banner (excluded)",
        "selector": [
          "#spm_banner_main"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = { ...payload, template: PAGE_TEMPLATE, productData: product_info_default };
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for ${blockDef.name}: ${selector}`, e);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_product_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const originalURL = params.originalURL || url;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      const meta = WebImporter.Blocks.getMetadata(document) || {};
      meta.theme = "drgroot";
      main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, originalURL);
      const u = new URL(originalURL);
      let rawPath = u.pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const productNo = u.searchParams.get("product_no");
      if (productNo) rawPath = `${rawPath}-${productNo}`;
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_product_exports);
})();
