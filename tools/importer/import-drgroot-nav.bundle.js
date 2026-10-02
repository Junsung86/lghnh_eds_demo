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

  // tools/importer/import-drgroot-nav.js
  var import_drgroot_nav_exports = {};
  __export(import_drgroot_nav_exports, {
    default: () => import_drgroot_nav_default
  });
  var ORIGIN = "https://drgroot.co.kr";
  function absUrl(href) {
    if (!href || /^(#|javascript:)/i.test(href.trim())) return "";
    try {
      return new URL(href.trim(), ORIGIN).href;
    } catch (e) {
      return href;
    }
  }
  function text(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
  }
  function onclickUrl(el) {
    const holder = el && el.closest("[onclick]");
    const m = holder && holder.getAttribute("onclick").match(/clickCount\([^,]*,\s*'([^']+)'/);
    return m ? absUrl(m[1].replace(/&amp;/g, "&")) : "";
  }
  function link(document, label, href) {
    const a = document.createElement("a");
    a.href = href || ORIGIN;
    a.textContent = label;
    return a;
  }
  function para(document, child) {
    const p = document.createElement("p");
    p.append(child);
    return p;
  }
  function menuItem(document, li) {
    const a = li.querySelector(":scope > a");
    const out = document.createElement("li");
    const href = absUrl(a && a.getAttribute("href"));
    if (href) out.append(link(document, text(a), href));
    else out.append(document.createTextNode(text(a)));
    const sub = li.querySelector(":scope > ul");
    if (sub) {
      const ul = document.createElement("ul");
      sub.querySelectorAll(":scope > li").forEach((s) => ul.append(menuItem(document, s)));
      if (ul.children.length) out.append(ul);
    }
    return out;
  }
  var import_drgroot_nav_default = {
    transform: ({ document }) => {
      const header = document.querySelector("#base_header_container");
      if (!header) return [];
      const result = document.createElement("div");
      const hr = () => result.append(document.createElement("hr"));
      const ALT = ["\uAC00\uC744\uB9DE\uC774 \uAE30\uD68D\uC804 \uB2E5\uD130\uADF8\uB8E8\uD2B8 \uBCA0\uC2A4\uD2B8\uC140\uB7EC ~45%", "4\uCC9C\uB9CC\uBCD1 \uD310\uB9E4 \uAE30\uB150 \uD2B9\uBCC4 \uAE30\uD68D\uC804 ~50%"];
      const slides = [...header.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)")].filter((s) => s.querySelector("img"));
      slides.forEach((s, i) => {
        const img = document.createElement("img");
        img.src = absUrl(s.querySelector("img").getAttribute("src"));
        img.alt = s.querySelector("img").getAttribute("alt") || ALT[i] || "\uB2E5\uD130\uADF8\uB8E8\uD2B8 \uAE30\uD68D\uC804";
        const href = onclickUrl(s.querySelector("img"));
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.append(img);
          result.append(para(document, a));
        } else {
          result.append(para(document, img));
        }
      });
      hr();
      const logo = header.querySelector(".xans-layout-logotop a, h1 a");
      result.append(para(document, link(document, "Dr.Groot", absUrl(logo && logo.getAttribute("href")) || `${ORIGIN}/`)));
      hr();
      const menu = header.querySelector(".base_menu_wrapper > ul.menu_1ul:not(.util_wrapper)");
      const sections = document.createElement("ul");
      if (menu) menu.querySelectorAll(":scope > li").forEach((li) => sections.append(menuItem(document, li)));
      result.append(sections);
      hr();
      const tools = document.createElement("ul");
      const util = header.querySelector("ul.util_wrapper");
      const LABELS = { search_button: "\uAC80\uC0C9", basket_button: "\uC7A5\uBC14\uAD6C\uB2C8" };
      if (util) {
        util.querySelectorAll(":scope > li").forEach((li) => {
          if (li.classList.contains("sidebar_button")) return;
          const a = li.querySelector(":scope > a");
          const key = Object.keys(LABELS).find((k) => li.classList.contains(k));
          const label = LABELS[key] || "\uB9C8\uC774\uD398\uC774\uC9C0";
          const item = document.createElement("li");
          if (key === "search_button") {
            item.append(link(document, label, `${ORIGIN}/product/search.html`));
            const keywords = [...document.querySelectorAll('#base_search_container a[href*="keyword="]')];
            if (keywords.length) {
              const ul = document.createElement("ul");
              const title = document.querySelector("#base_search_container .title, #base_search_container strong");
              const head = document.createElement("li");
              head.textContent = text(title) || "\uC778\uAE30\uAC80\uC0C9\uC5B4";
              ul.append(head);
              keywords.forEach((k) => {
                const kli = document.createElement("li");
                kli.append(link(document, `#${text(k).replace(/^#/, "")}`, absUrl(k.getAttribute("href"))));
                ul.append(kli);
              });
              item.append(ul);
            }
          } else {
            const fallback = key ? "" : `${ORIGIN}/myshop/index.html`;
            item.append(link(document, label, absUrl(a && a.getAttribute("href")) || fallback));
            const sub = li.querySelector(":scope > ul");
            if (sub) {
              const ul = document.createElement("ul");
              sub.querySelectorAll(":scope > li").forEach((s) => ul.append(menuItem(document, s)));
              item.append(ul);
            }
          }
          tools.append(item);
        });
      }
      result.append(tools);
      return [{
        element: result,
        path: "/drgroot/nav"
      }];
    }
  };
  return __toCommonJS(import_drgroot_nav_exports);
})();
