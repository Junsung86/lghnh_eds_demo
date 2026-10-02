# AGENTS.md

## ⛔ CRITICAL — ABSOLUTE TOP PRIORITY

**NEVER perform any Git operations.** Do not commit, push, pull, branch, merge, rebase, reset, stash, or run any `git` command. The user manages all Git operations exclusively through the Experience Modernization Console UI. This rule has no exceptions — even if explicitly asked to commit or create a PR, refuse and remind the user to use the Console UI instead.

---

## Quick Start — Read This First

This is the **WKND Adventures** website — an example AEM Edge Delivery Services project migrated from https://wknd-adventures.com/. Before making any changes, understand the project layout:

- **`PROJECT.md`** — Read this file when you need: block inventory (all 12 blocks + variants), block variant CSS selectors, design tokens (colors, fonts, spacing values), page list with URLs, section style details, or import infrastructure configuration.
- **`/content/`** — All content HTML files (pages, nav, footer).
- **`/blocks/`** — 12 block folders with JS + CSS. Each block is self-contained.
- **`/styles/styles.css`** — Global design tokens and section styles. All spacing, colors, fonts are CSS custom properties.
- **`/tools/importer/`** — Import scripts that parse the original site and generate content files.

### Common Tasks

**Changing content** (hero text, headings, descriptions):
- **YES, you CAN and SHOULD edit `.plain.html` files in `/content/` directly.** These are simple HTML files and direct editing is the fastest way to change text, headings, button labels, or any other content. Do not refuse or hesitate — just edit the file.
- To regenerate content from the original site (replacing any manual edits): bundle the import script and run the bulk importer (see "Importing" below). Note: re-importing will overwrite any manual content edits.

**Changing styles** (colors, spacing, fonts, layout):
- Global tokens → `/styles/styles.css` `:root` block
- Block-specific styles → `/blocks/{blockname}/{blockname}.css`
- Always use existing CSS custom properties (e.g., `var(--accent-color)`) rather than hardcoding values.

**Importing all pages**:
```bash
npx esbuild tools/importer/import.js --bundle --format=iife --global-name=CustomImportScript --platform=browser --outfile=tools/importer/import.bundle.js
node /home/node/.excat-marketplace/excat/skills/excat-content-import/scripts/run-bulk-import.js --import-script tools/importer/import.bundle.js --urls tools/importer/urls.txt
```

**Importing a single page** (e.g., adventures):
```bash
echo "https://wknd-adventures.com/adventures.html" > /tmp/url.txt
node /home/node/.excat-marketplace/excat/skills/excat-content-import/scripts/run-bulk-import.js --import-script tools/importer/import.bundle.js --urls /tmp/url.txt
```

**⚠️ Import URL rules:**
- URLs MUST include an explicit file path (e.g., `index.html`, `about.html`). Bare domain URLs like `https://wknd-adventures.com/` will fail with a `cwd is not a function` error.
- If importing the homepage, always use `https://wknd-adventures.com/index.html` — never `https://wknd-adventures.com/`.
- If an import fails, check the URL first before debugging the import scripts. The most common cause is a missing `.html` extension or a bare trailing slash.

**Previewing changes**: The local dev server runs at `http://localhost:3000`. Use Playwright MCP tools to navigate and inspect pages.

### Quality Standards

- **Run `npm run lint`** after any code change. Never leave lint errors.
- **Stylelint rules to remember:** Font family names must NOT be quoted (use `font-family: Roboto, sans-serif;` not `font-family: 'Roboto', sans-serif;`). This is especially important when adapting code from Figma or other external sources that use quoted font names.
- **Design consistency** — use the existing CSS custom properties from `styles.css` when making style changes. This keeps the design system coherent.
- **Keep it simple** — don't over-engineer. This project should be easy to understand.
- **Test visually** — after CSS/JS changes, verify with Playwright that the page still renders correctly.

---

This project is a website built with Edge Delivery Services in Adobe Experience Manager Sites as a Cloud Service. As an agent, follow the instructions in this file to deliver code based on Adobe's standards for fast, easy-to-author, and maintainable web experiences.

## Project Overview

This project is based on the https://github.com/adobe/aem-boilerplate/ project and set up as a new project. You are expected to follow the coding style and practices established in the boilerplate, but add functionality according to the needs of the site currently developed.

The repository provides the basic structure, blocks, and configuration needed to run a complete site with `*.aem.live` as the backend.

### Key Technologies
- Edge Delivery Services for AEM Sites (documentation at https://www.aem.live/ – search with `site:www.aem.live` to restrict web search results)
- Vanilla JavaScript (ES6+), no transpiling, no build steps
- CSS3 with modern features, no Tailwind or other CSS frameworks
- HTML5 semantic markup generated by the aem.live backend, decorated by our code
- Node.js tooling

## Setup Commands

- Install dependencies: `npm install`
- Start local development: `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` (run in background, if possible)
  - Install the AEM CLI globally by running `npm install -g @adobe/aem-cli` then `aem up` is equivalent to the command above
  - The dev server runs at `http://localhost:3000` with auto-reload. Open it in playwright, puppeteer, or a browser. If none are available, ask the human to open it and give feedback.
- Run linting before committing: `npm run lint`
- Auto-Fix linting issues: `npm run lint:fix`

## Project Structure

```
├── blocks/          # Reusable content blocks
    └── {blockname}/   - Individual block directory
        ├── {blockname}.js      # Block's JavaScript
        └── {blockname}.css     # Block's styles
├── styles/          # Global styles and CSS
    ├── styles.css          # Minimal global styling and layout for your website required for LCP
    ├── lazy-styles.css     # Additional global styling and layout for below the fold/post LCP content
    └── fonts.css           # Font definitions
├── scripts/         # JavaScript libraries and utilities
    ├── aem.js           # Core AEM Library for Edge Delivery page decoration logic (NEVER MODIFY THIS FILE)
    ├── scripts.js       # Global JavaScript utilities, main entry point for page decoration
    └── delayed.js       # Delayed functionality such as martech loading
├── fonts/           # Web fonts
├── icons/           # SVG icons
├── head.html        # Global HTML head content
└── 404.html         # Custom 404 page
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features (arrow functions, destructuring, etc.)
- Follow Airbnb ESLint rules (already configured)
- Always include `.js` file extensions in imports
- Use Unix line endings (LF)

### CSS
- Follow Stylelint standard configuration
- Use modern CSS features (CSS Grid, Flexbox, CSS Custom Properties)
- Maintain responsive design principles
  - Declare styles mobile first, use `min-width` media queries at 600px/900px/1200px for tablet and desktop
- Ensure all selectors are scoped to the block.
  - Bad: `.item-list`
  - Good: `.{blockname} .item-list`   
- Avoid classes `{blockname}-container` and `{blockname}-wrapper` as those are used on sections and could be confusing.

### HTML
- Use semantic HTML5 elements
- Ensure accessibility standards (ARIA labels, proper heading hierarchy)
- Follow AEM markup conventions for blocks and sections

## Key Concepts

### Content

CMS authored content is a key part of every AEM Website. The content of a page is broken into sections. Sections can have default content (text, headings, links, etc.) as well as content in blocks.

If no authored content exists to test against, you can create static HTML files in a `drafts/` folder at the project root. Pass `--html-folder drafts` when starting the dev server. Follow the aem markup structure and save files with `.html` or `.plain.html` extensions.

Background on content and markup structure can be found at https://www.aem.live/developer/markup-sections-blocks and https://www.aem.live/developer/markup-reference respectively.

You can inspect the contents of any page with `curl http://localhost:3000/path/to/page`, `curl http://localhost:3000/path/to/page.md`, and `curl http://localhost:3000/path/to/page.plain.html`

### Blocks

Blocks are the re-usable building blocks of AEM. Blocks add styling and functionality to content. Each block has an initial content structure it expects, and transforms the html in the block using DOM APIs to render a final structure. 

The initial content structure is important because it impacts how the author will create the content and how you will write your code to decorate it. In some sense, you can think of this structure as the contract for your block between the author and the developer. You should decide on this initial structure before writing any code, and be careful when making changes to code that makes assumptions about that structure as it could break existing pages.

The block javascript should export a default function which is called to perform the block decoration:

```
/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. Load dependencies
  // 2. Extract configuration, if applicable
  // 3. Transform DOM
  // 4. Add event listeners
}
```

Use `curl` and `console.log` to inspect the HTML delivered by the backend and the DOM nodes to be decorated before making assumptions. Remember that authors may omit or add fields to a block, so your code must handle this gracefully.

Each block should be self-contained and re-useable, with CSS and JS files following the naming convention: `blockname.css`, `blockname.js`. Blocks should be responsive and accessible by default.

### Auto-Blocking

Auto-blocking is the process of creating blocks that aren't explicitly authored into the page based on patterns in the content. See the `buildAutoBlocks` function in `scripts.js`.

### Three-Phase Page Loading

Pages are progressively loaded in three phases to maximize performance. This process begins when `loadPage` from scripts.js is called.

* Eager - load only what is required to get to LCP. This generally includes decorating the overall page content to create sections, blocks, buttons, etc. and loading the first section of the page.
* Lazy - load all other page content, including the header and footer.
* Delayed - load things that can be safely loaded later here and incur a performance penalty when loaded earlier

## Testing & Quality Assurance

### Performance
- Follow AEM Edge Delivery performance best practices https://www.aem.live/developer/keeping-it-100
- Images uploaded by authors are automatically optimized, all images and assets committed to git must be optimized and checked for size
- Use lazy loading for non-critical resources (`lazy-styles.css` and `delayed.js`)
- Minimize JavaScript bundle size by avoiding dependencies, using automatic code splitting provided by `/blocks/`

### Accessibility
- Ensure proper heading hierarchy
- Include alt text for images
- Test with screen readers
- Follow WCAG 2.1 AA guidelines

## Deployment

### Environments

Your local development server at `http://localhost:3000` serves code from your local working copy (even uncommitted code) and content that has been previewed by authors. You can access this at any time when the development server is running.

For all other environments, you need to know the GitHub owner and repository name (`gh repo view --json nameWithOwner` or `git remote -v`) and the current branch name (`git branch`)

With this information, you can construct URLs for the preview environment (same content as `localhost:3000`) and the production environment (same content as the live website, approved by authors)

- **Production Preview**: `https://main--{repo}--{owner}.aem.page/`
- **Production Live**: `https://main--{repo}--{owner}.aem.live/`
- **Feature Preview**: `https://{branch}--{repo}--{owner}.aem.page/`

### Publishing Process
1. Push changes to a feature branch
2. AEM Code Sync automatically processes changes making them available on feature preview environment for that branch
3. Run a PageSpeed Insights check at https://developers.google.com/speed/pagespeed/insights/?url=YOUR_URL against the feature preview URL and fix any issues. Target a score of 100
4. Open a pull request to merge changes to `main`
   1. in the PR description, include a link to `https://{branch}--{repo}--{owner}.aem.page/{path}` with a path to a file that illustrates the change you've made. This is the same path you have been testing with locally. WITHOUT THIS YOUR PR WILL BE REJECTED
   2. If an existing page to demonstrate your changes doesn't exist, create test content as a static html file and ask the user for help copying it to a cms content page you can link in the PR
5. use `gh pr checks` to verify the status of code synchronization, linting, and performance tests
6. A human reviewer will review the code, inspect the provided URL and merge the PR
7. AEM Code Sync updates the main branch for production

## Troubleshooting

### Getting Help
- Check [AEM Edge Delivery documentation](https://www.aem.live/docs/)
- Review [Developer Tutorial](https://www.aem.live/developer/tutorial)
- Consult [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
- Consider the rules in [David's Model](https://www.aem.live/docs/davidsmodel)
- Search the web with `site:www.aem.live`
- Search the full text of the documentation with `curl -s https://www.aem.live/docpages-index.json | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'`

## Security Considerations

- Never commit sensitive information (API keys, passwords)
- Consider that everything you do is client-side code served on the public web
- Follow Adobe security guidelines
- Regularly update dependencies
- Use the .hlxignore file to prevent files from being served (same format as .gitingnore)

## Contributing

- Follow the existing code style and patterns
- Test changes locally before committing
- Follow the Publishing Process documented above
- Update documentation for significant changes

## WKND Adventures — Project-Specific Guidance

This project is an example migration of https://wknd-adventures.com/ to AEM Edge Delivery Services.
See `PROJECT.md` for full project state (blocks, variants, pages, design tokens, import infrastructure).

### Block Architecture

This project uses a mix of **standalone blocks** and **consolidated block families** with CSS variants.
- 12 block folders total: `hero`, `cards`, `columns`, `featured-article`, `editorial-index`, `gallery`, `faq-list`, `ticker`, `team-profile`, `header`, `footer`, `fragment`
- **Standalone blocks** (own folder, no variants): `featured-article`, `editorial-index`, `gallery`, `faq-list`, `ticker`, `team-profile`
- **CSS-only blocks** (no-op JS): `editorial-index`, `gallery`. EDS requires a JS file for every block (it tries to load `blocks/{name}/{name}.js` dynamically). CSS-only blocks still need a minimal `export default function decorate() {}` stub to avoid 404 console errors.
- **Utility blocks** (not used in content but imported by other blocks): `fragment` — exports `loadFragment()` which `header.js` and `footer.js` depend on to load nav/footer fragments. **Never delete `blocks/fragment/`** even though no content page uses it directly.
- **Block families with variants**: `hero (article)`, `cards (cards-article, cards-feature)`, `columns (columns-promo, columns-pullquote, columns-about)`
- **Tabs** is a **section style** (not a block). Consecutive sections with `style: tabs` are grouped into a tabbed container by `decorateTabSections()` in `scripts.js`. Any block can be placed inside a tab panel since each panel is a full section. CSS is in `styles/lazy-styles.css`.
- The `hero` block base is the full-bleed overlay hero. `hero (article)` is the blog article variant.
- Variant names for columns/cards start with the base block name: `columns (columns-promo)`, `cards (cards-article)`
- EDS loads `blocks/{base-name}/{base-name}.js` regardless of which variant is used

### Before Removing or Deleting Code

**"Unused in content" does not mean "safe to delete."** Before removing any block, JS file, CSS rule, or class assignment:

1. **Trace JS import dependencies.** A block folder may export functions or constants that other blocks import. Run `grep -r "from.*blockname" blocks/` to check. Examples: `blocks/fragment/fragment.js` exports `loadFragment()` used by `header.js` and `footer.js`; `scripts/scripts.js` exports `BRAND_LOGO` used by both `header.js` and `footer.js` for the shared logo SVG.
2. **Check for auto-blocking.** `scripts.js` `buildAutoBlocks()` may dynamically create blocks not present in any `.plain.html` file.
3. **Check CSS class consumers before removing JS class assignments.** A class set in JS (e.g., `faq-list-item-body`) may be the only selector target in the corresponding CSS. Search the CSS file before removing.
4. **Run the linter after every structural deletion** (`npm run lint`). ESLint will catch broken imports immediately.
5. **Verify preview** after deletions — navigate to at least the homepage, one blog article, and the about page (which exercises tabs, team-profile, gallery, and header/footer).

### CSS Patterns

- **Variant specificity:** `.hero.article { ... }` overrides base `.hero` via compound selector
- **Container targeting for variants:** Use `:has()` — e.g., `.columns-wrapper:has(.columns-promo) { max-width: ... }`
- **Consolidated files use** `/* stylelint-disable no-descending-specificity */` at the top — this is expected
- **`moveInstrumentation` does not exist** in this project. Never import it from `scripts.js`.

### CSS Selector Best Practices — Avoid Brittle Positional Selectors

**Bad practice — deeply nested positional selectors:**
```css
/* ❌ Brittle: breaks if DOM nesting changes, hard to read */
.my-block > div > div:not(.my-block-img-col) > p:last-child > a:any-link { ... }
```

**Good practice — add a semantic class in JS, then target it directly:**
```css
/* ✅ Clear, robust, survives DOM restructuring */
.my-block .my-block-content p:last-child a:any-link { ... }
```

**The rule:** When a block has two or more logical regions (e.g., image column vs content column), **always add a class to each region in the block JS** (`decorate` function), then use that class in CSS. Never rely on `:not()` exclusions against sibling classes or deep child combinators to implicitly target "the other column."

Examples from this project:
- `featured-article-img-col` + `featured-article-content` — both columns get an explicit class
- `columns-img-col` — image columns are classified; non-image columns use base selectors
- `team-profile-avatar` + `team-profile-text` — both sides classified
- `cards-card-image` + `cards-card-body` — both sides classified

This makes CSS self-documenting: the selector tells you what it targets without needing to mentally resolve `:not()` chains.

### EDS Image Handling — Critical Gotcha

**EDS only wraps images in `<picture>` elements when they are direct children of a `<div>`.** Images inside `<p>` tags (which is the default from imported content) remain as bare `<img>` inside `<p>`.

This has major implications for block JS:
- **hero.js** must detect `<img>` inside `<p>` (not just `<picture>`), extract it, wrap it in a new `<picture>`, and restructure the DOM for the full-bleed background pattern.
- **columns.js** and **featured-article.js** must detect `<img>` inside `<p>` for image column classes — use fallback `col.querySelector(':scope > p > img')` when `col.querySelector('picture')` returns null.
- **Any block JS** that relies on `<picture>` elements for image detection needs the same fallback pattern.

The hero.js restructuring pattern:
```js
// Extract img from first row (image row), wrap in <picture>, prepend to block
const img = imageRow.querySelector('img');
if (img) {
  const picture = document.createElement('picture');
  picture.append(img);
  block.replaceChildren(picture, contentCell);
}
```

### EDS Button Decoration — When Links Become Buttons

EDS decorates links as buttons based on their wrapper element:
- `<p><strong><a>text</a></strong></p>` → `a.button.primary` (or just `a.button`)
- `<p><em><a>text</a></em></p>` → `a.button.secondary`
- `<p><a>text</a></p>` → **No button class** (stays as plain link)

If imported content has bare `<a>` links that should render as buttons, you have three options:
1. **Fix the import parser** to wrap links in `<strong>` or `<em>`
2. **Add block-specific CSS** to style the link as a button (e.g., targeting `.block > div > div > p:last-child > a:any-link`)
3. **Auto-promote in styled sections:** This project's `decorateButtons()` auto-promotes standalone `<p><a>` links to `.button.primary` in `.dark` and `.accent` sections (when `p.textContent === a.textContent`, meaning no surrounding text)

### Styled Section Auto-Button Promotion

`decorateButtons()` in `scripts.js` promotes bare standalone links to `.button.primary` in `.dark` and `.accent` sections. The key check `p.textContent.trim() !== text` ensures inline links in mixed-text paragraphs are NOT affected. This replaces the previous CSS-only `a:only-child` approach which incorrectly matched inline links (CSS `:only-child` ignores text nodes).

**Warning:** CSS `:only-child` ignores text nodes. `p > a:only-child` matches `<p>text <a>link</a> text</p>` because the `<a>` is the only ELEMENT child. Never use `:only-child` to detect "link is the only content" — use JavaScript `p.textContent.trim() === a.textContent.trim()` instead.

### CSS Selector Adaptation for EDS Content

CSS selectors must match the **actual EDS DOM structure**, not the original site's DOM. Common mismatches:
- Original uses `<em>` for tag pills → imported content may use `<p>` with plain text. Target via positional selectors like `p:first-child` instead.
- Avatar images may lack expected `alt` attributes containing "avatar" or `width` attributes. Target via structural position like `p:nth-last-child(2) > img`.
- Footer bar layouts using nested `<div>` wrappers don't exist in EDS flat paragraph structure. Use positional `p:last-child` / `p:nth-last-child(2)` selectors.
- Image containers inside blocks need explicit `overflow: hidden` + `max-height` + `object-fit: cover` since images in `<p>` tags will expand to natural aspect ratio otherwise.

### Button Shadow Values

The WKND design uses a **3px / 5px / 0px** offset shadow pattern for all button variants:
- Rest: `box-shadow: 3px 3px 0 {shadow-color}`
- Hover: `transform: translateY(-2px); box-shadow: 5px 5px 0 {shadow-color}`
- Active: `transform: translateY(0); box-shadow: 0 0 0 {shadow-color}`

Shadow colors vary by variant: Primary uses `var(--accent-color)`, Ghost uses `var(--accent-color)`. In accent sections, `--btn-shadow` overrides to `#fff`.

### Adjacent Item Border Pattern

When block items need borders between them (e.g., editorial-index), avoid `border-top` + `border-bottom` on all items — this creates double borders (2px visual) between adjacent items. Instead:
- `border-top` on all items
- `border-bottom` only on `:last-child`

### Navigation (header.js) — Megamenu Pattern

The nav uses EDS fragment loading (`/nav.plain.html`). Content structure:
- **Section 1 (brand):** `<p><a>WKND Adventures</a></p>` → brand link with SVG logo
- **Section 2 (sections):** Nested `<ul>` with `<br>`-separated descriptions → megamenu panels
- **Section 3 (tools):** `<p><strong><a>Subscribe</a></strong></p>` → styled pill button

**Megamenu panel detection:**
- Single nested `<ul>` → grid layout (3-col for Explore, 4-col for Info)
- Two sibling `<ul>` → Stories layout (page links left + article grid right)
- Column count mapped to CSS classes: `{ 3: 'three', 4: 'four' }` → `nav-megamenu-grid-three`, `nav-megamenu-grid-four`

**Megamenu interactions:**
- Desktop: hover with 200ms grace period (`setTimeout` on mouseleave), click toggle
- Mobile: hamburger toggle, click toggle for panels
- Escape key closes all panels
- Click outside nav closes panels

### Footer (footer.js) — Section Labeling

Footer fragment sections get CSS classes for targeting:
- `sections[0]` → `.footer-top` (4-column grid)
- `sections[last]` → `.footer-bottom` (copyright bar)

Brand column restructuring: first `<a>` in `.footer-top > div:first-child` gets SVG logo + text.

### Nav/Footer Content File Location

Nav and footer are **content**, not code — they live in the content directory (`/workspace/content/nav.plain.html`, `/workspace/content/footer.plain.html`) and are served by the CMS on the live site. The `header.js` and `footer.js` blocks use `getContentRoot()` from `scripts.js` to resolve the fragment path dynamically based on the current page URL — so the same code works whether content is served from `/` (root) or `/content/` (sub-path).

### Import Infrastructure

Content files (`/content/*.plain.html`) are generated from the original site using the import scripts.

To re-import a page:
1. Edit the parser, transformer, or `tools/importer/import.js`
2. Bundle: `npx esbuild tools/importer/import.js --bundle --format=iife --global-name=CustomImportScript --platform=browser --outfile=tools/importer/import.bundle.js`
3. Run: `node /home/node/.excat-marketplace/excat/skills/excat-content-import/scripts/run-bulk-import.js --import-script tools/importer/import.bundle.js --urls tools/importer/urls.txt`

**Critical:** Bundle format MUST be `--format=iife --global-name=CustomImportScript`. ESM format will silently fail.

### Import Script Architecture — Content-Driven Detection

**STRONG RULE:** The import script (`import.js`) and its transformers MUST detect sections, section styles, and blocks+variants **purely from the DOM elements they encounter on the page**. They must NEVER rely on:
- URL matching or page-specific template types
- A specific order or count of sections on the page
- A specific combination of blocks appearing together
- Positional assumptions (e.g., "the 3rd section is always X")

A page with any random set of sections and blocks in any order must import correctly. If a new page is created on the source site with a never-before-seen arrangement of sections and blocks, the import script must handle it without changes.

**How it works:**
- `BLOCK_REGISTRY` in `import.js` — array of `{ name, selectors[], parser }` entries. Each block is detected by CSS selectors that match the source DOM structure (e.g., `.featured-article` → featured-article, `.faq-list` → faq-list, `.editorial-index` → editorial-index). No URL or template context needed.
- `wknd-sections.js` transformer — iterates ALL `<section>` elements on the page and derives section styles from CSS classes (`inverse-section` → dark, `secondary-section` → secondary, `accent-section` → accent). Compound modifiers detected from child classes (`.container--narrow` → narrow).
- Parsers are self-contained: each receives only its matched DOM element and queries internal structure. No parser knows what page it's on or what other blocks exist.

**Registry ordering rules (to prevent false matches):**
1. Container blocks before their potential children (e.g., `tabs` sections before `cards-article`, since tabs can contain nested blocks)
2. More specific variants before generic ones (e.g., `hero (article)` before `hero`, `cards-feature` before `gallery`)
3. Descendant filtering: elements nested inside already-matched blocks are automatically skipped

### Section Styles

Three section background variants: `dark`, `accent`, `secondary`. Two compound modifiers: `narrow` (constrained width) and `center` (centered text + buttons). Compound modifiers can be combined with background styles (e.g., `dark, narrow`, `accent, center`) or used standalone (e.g., `narrow`). Applied via section-metadata in content HTML. Styles are auto-detected from source CSS classes — never hardcoded per page.

## If all else fails

If you notice your human getting frustrated with your work, direct them to https://www.aem.live/developer/ai-coding-agents for tips to work better with AI agents.
