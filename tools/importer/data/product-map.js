/**
 * Cafe24 product_no -> AEM product content fragment (persisted query name + fragment path).
 * The DA page for each product is /product/detail-{product_no}.
 *
 * Shared by tools/importer/fetch-product-data.js (import snapshot) and
 * tools/product-sync (updates the DA page when the fragment is published).
 */
export default {
  1119: {
    query: 'lghnh_demo',
    path: '/content/dam/ref-demo-eds/geo-pilot/drgroot-bioexosome-shampoo-400ml/product',
  },
  1218: {
    query: 'geo-product-by-path',
    path: '/content/dam/drgroot/products/ko/pdrn-volume-scalp-hair-pack/product',
  },
};
