/* eslint-disable */
/* global WebImporter */

// Import script for template "product" (Dr.Groot product detail pages).
// Static content migration: commerce widgets are removed by drgroot-cleanup.

// PARSER IMPORTS
import columnsProductParser from './parsers/columns-product.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsBrandlineParser from './parsers/cards-brandline.js';
import columnsInfoParser from './parsers/columns-info.js';

// TRANSFORMER IMPORTS (Dr.Groot only — WKND transformers do not apply to this site)
import drgrootCleanupTransformer from './transformers/drgroot-cleanup.js';
import drgrootSectionsTransformer from './transformers/drgroot-sections.js';
import drgrootProductInfoTransformer from './transformers/drgroot-product-info.js';

// GraphQL product data snapshot (node tools/importer/fetch-product-data.js), keyed by product_no
import PRODUCT_DATA from './data/product-info.json';

// PARSER REGISTRY
const parsers = {
  'columns-product': columnsProductParser,
  'cards-product': cardsProductParser,
  'cards-brandline': cardsBrandlineParser,
  'columns-info': columnsInfoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "product",
  "description": "Cafe24 product detail page (PDP) – static content migration; commerce widgets excluded",
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
      "name": "Reviews (excluded – backend widget)",
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

// TRANSFORMER REGISTRY - cleanup first, then sections
const transformers = [
  drgrootCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [drgrootSectionsTransformer] : []),
  drgrootProductInfoTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE, productData: PRODUCT_DATA };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const originalURL = params.originalURL || url;

    const main = document.body;

    // 1. beforeTransform (cleanup, lazy images, section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks (skip elements already detached by an earlier parser)
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

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    // Page metadata + "Theme: drgroot" so the page loads the Dr.Groot theme (styles/drgroot.css)
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    meta.theme = 'drgroot';
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, originalURL);

    // 6. Path: product pages share /product/detail.html, so append product_no
    //    (from the query string) to keep one document per product.
    const u = new URL(originalURL);
    let rawPath = u.pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const productNo = u.searchParams.get('product_no');
    if (productNo) rawPath = `${rawPath}-${productNo}`;
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
