# Product Info

Highlights chip, summary and accordions (상세 정보 / 사용 방법 / 성분) for a product, driven by an AEM GraphQL persisted query.

## Content model

| Product Info | |
|---|---|
| GraphQL | `https://publish-…/graphql/execute.json/…;path=/content/dam/…/product` |
| 하이라이트 | list of highlight labels |
| 요약 | summary paragraph(s) |
| 상세 정보 | description + spec list (`**label** value`) |
| 사용 방법 | list |
| 성분 | list |

- Rows after the GraphQL row are read **in this order**; their first cell is used as the heading/label.
- The block fetches the endpoint at runtime. On success it re-renders from live data (`data-source="live"`); on failure (CORS, network, 4s timeout) it shows the authored rows (`data-source="snapshot"`).
- Rich-text fields are rendered from `plaintext` only — no CMS HTML is injected.
- Placed directly after a `Columns (columns-product)` block in the same section, it moves itself under the product summary text.

## Live data requirement

AEM publish must send `Access-Control-Allow-Origin` for the site origins (`*.aem.page`, `*.aem.live`, production domain, `localhost:3000`) — configure the CORS policy (`com.adobe.granite.cors.impl.CORSPolicyImpl`) on the publish tier. Until then the snapshot is shown.

## Import

`tools/importer/fetch-product-data.js` saves the snapshot to `tools/importer/data/product-info.json` (keyed by Cafe24 `product_no`); the `drgroot-product-info` transformer inserts the block during `import-product.js`. Re-run the fetch script, re-bundle and re-import to refresh the snapshot.
