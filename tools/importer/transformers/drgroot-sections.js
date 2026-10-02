/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dr.Groot section breaks + Section Metadata.
 *
 * Content-driven: sections are resolved from the DOM using the selector
 * candidates in payload.template.sections (first match wins). No URL checks.
 *
 * - Non-content sections (no blocks and no default content in the template,
 *   e.g. #prdReview, #prdDetail_fixed_optionArea, #ch-plugin, #spm_banner_main,
 *   the overlay container) get no break; the cleanup transformer removes them.
 * - Section 2 (#prdRelatedWrap) is a child of section 1's element
 *   (.prdDetail_topArea), sibling of .prdDetail_infoArea / .prdDetail_optionArea
 *   (verified in live-rendered.html). The break is inserted directly before
 *   #prdRelatedWrap, i.e. inside .prdDetail_topArea, so the product summary
 *   and related products end up in separate sections.
 * - A break is only inserted if its target does not contain an earlier
 *   section's element (prevents a break landing before the content it should
 *   follow).
 *
 * Breaks are inserted in beforeTransform (before parsers replace elements);
 * Section Metadata is added in afterTransform, anchored to a marker <hr>.
 *
 * Expected result for template "product": 4 breaks (before sections 2, 3, 4, 6)
 * and 1 Section Metadata (style: secondary, section 4).
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
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

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    // Resolve all content sections first (in template order).
    const resolved = sections.map((section) => ({
      section,
      el: isContentSection(section) ? querySection(element, section.selector) : null,
    }));
    const firstIndex = resolved.findIndex((r) => r.el);

    // Reverse iteration keeps earlier element references stable.
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { section, el } = resolved[i];
      if (!el) continue;
      if (i === firstIndex && !section.style) continue; // first section: no leading break

      // Skip if this element wraps a previously resolved section (break would be misplaced).
      const wrapsEarlier = resolved.slice(0, i).some((r) => r.el && r.el !== el && el.contains(r.el));
      if (wrapsEarlier) continue;

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      el.before(hr);
      if (i === firstIndex) hr.setAttribute('data-excat-first', 'true');
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (marker.getAttribute('data-excat-first') === 'true') marker.remove();
      }
    }
    element.querySelectorAll('hr[data-excat-first]').forEach((hr) => hr.removeAttribute('data-excat-first'));
  }
}
