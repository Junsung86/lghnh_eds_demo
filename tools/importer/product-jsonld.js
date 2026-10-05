/**
 * Product JSON-LD (schema.org) from an AEM product item, as the value of the page's
 * "json-ld" metadata. Edge Delivery renders it as <script type="application/ld+json">
 * in the page head (server-side, so crawlers that skip JavaScript still see it).
 *
 * Shared by tools/importer/import-product.js and tools/product-sync.
 *
 * Sources: `jsonldtext` (current model, list of multi-line text holding JSON) or
 * `jsonLd` (older JSON field). Invalid JSON is dropped: a page with invalid json-ld
 * metadata fails to publish.
 * @param {object} item GraphQL product item
 * @returns {string|null} minified JSON, or null when there is no valid JSON-LD
 */
export default function productJsonLd(item) {
  const texts = (item?.jsonldtext || [])
    .map((part) => (typeof part === 'string' ? part : part?.plaintext || '').trim())
    .filter(Boolean);
  let data = item?.jsonLd || null;
  if (!data && texts.length === 1) {
    try {
      data = JSON.parse(texts[0]);
    } catch (e) {
      data = null;
    }
  }
  return data && typeof data === 'object' && Object.keys(data).length ? JSON.stringify(data) : null;
}
