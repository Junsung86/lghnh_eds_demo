# Product sync (AEM content fragment → DA)

Adobe I/O Runtime action that keeps the **Product Info** block of DA product pages in sync with
the AEM product content fragments.

```
AEM author: publish product fragment
  → AEM event aem.sites.contentFragment.published (Adobe I/O Events)
  → product-sync/sync action
      1. map fragment path → product_no (tools/importer/data/product-map.js)
      2. read published data (persisted query, CDN cache bypassed, retried)
      3. GET DA page /product/detail-{product_no}, replace only the Product Info block
         (inserted after the product summary if missing), skip if unchanged
      4. POST the page back to DA, then preview it (admin.hlx.page). Publishing stays manual.
```

The block HTML mirrors `tools/importer/transformers/drgroot-product-info.js`. Keep the two in sync.

## Add a product

Add an entry to `tools/importer/data/product-map.js` (`query` = persisted query name, `path` =
fragment path), import the page, then redeploy this action. Fragments under
`/content/dam/drgroot/...` need the `geo-product-by-path` query. `lghnh_demo` cannot read them.

## Setup

1. **Adobe Developer Console**: create a project (App Builder template) in the org of the AEM
   environment `p166217-e1771263`, add an **OAuth Server-to-Server** credential and copy client
   id, secret and scopes into `.env` (see `.env.example`).
2. **AEM eventing**: make sure AEM Eventing is enabled for the environment, then in the project
   add the event provider for `author-p166217-e1771263` and subscribe to
   *Content Fragment Published*. As the delivery method choose **Runtime action** →
   `product-sync/sync`.
3. **DA permissions**: give the technical account (its `…@techacct.adobe.com` id) write
   access to `/junsung86/lghnh-eds-demo` in the DA org permissions configuration.
4. **Preview permission**: create an admin API key for site `junsung86/lghnh-eds-demo` and put it
   in `HLX_ADMIN_API_KEY`, or give the technical account the publish/admin role in the site config.
5. Deploy from this folder: `aio login`, `aio app use` (select the project), `aio app deploy`.

## Test

```sh
# local dry run (no writes), prints status: updated/unchanged/skipped/dry-run
IMS_ACCESS_TOKEN=<token> npm run dry-run -- /content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/product

# deployed action
aio rt action invoke product-sync/sync -r -p path /content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/product -p dryRun true
aio rt activation list product-sync/sync
```

Notes:
- Only the Product Info block is rewritten. Labels are reset to the defaults (하이라이트, 요약, …).
- The 주요 특징 / 효능 근거 rows come from the referenced `featureSet` / `claimSet` fragments. They are
  only added when the persisted query returns them (`geo-product-by-path` must select the
  `... on GeoFeatureSetModel` / `... on GeoClaimSetModel` fields). Marketing copy is not synced.
- Variant fragments (`…/variants/variant-NNNN`) are not mapped, so their events are skipped.
