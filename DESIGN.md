# CABE website design

The homepage follows the approved `CABE-site-preview-v6.html` visual and copy reference. The specification index, technical documents, and supporting pages share its light appearance. The policy simulator remains a separate application under `/game/`.

## Colour and typography

`src/styles/site.css` defines the shared tokens: white background, `#181a1d` text, `#5f6670` secondary text, `#68717c` quiet text, `#e1e5e9` borders, and `#f7f8fa` panels. Links and small accents use `#265f99`; pale blue panels use `#f1f6fc`. Worked decisions retain green `#176543` and red `#a33636`, with explicit permitted/refused and ALLOW/DENY labels.

Use the system sans-serif stack for headings and prose, and the system monospace stack for code and identifiers. No remote font dependency is needed. Body text is 15px with generous leading; document titles scale from 32px to 48px. The homepage retains its approved larger headline and section-specific sizes. Links in document prose are underlined.

## Space and structure

The shared content frame is at most 1160px wide, with 40px desktop gutters, 28px below 1050px, and 18px below 620px. Thin rules, 6–8px corners, and restrained panel backgrounds provide separation. Common interior pages use 42px body spacing and 60px top spacing on desktop, reduced on smaller screens.

`Layout.astro` owns the only document shell, skip link, `Nav.astro`, and `Footer.astro`. Shared navigation points to home sections and the software/specification routes; the footer also exposes FAQ and get-involved pages. Internal links work from every route. Mobile navigation supports Escape, outside-click dismissal, and focus return; without JavaScript, links remain visible.

`home.css` is loaded only by the homepage and scoped to `.home-page`. It contains the approved homepage presentation, not legacy site styling. `spec.css` is loaded only by specification documents. Supporting-page styles remain local to their pages, using the common tokens.

## Logo and favicon

`public/CABE-bound-wordmark.svg` is an unchanged copy of the supplied vector artwork, including the descriptor. `public/cabe-mark.svg` contains the same three wordmark paths with only the descriptor omitted and the viewBox tightened. All three path geometries were compared directly with the supplied asset. Preserve their proportions and original `#003B7A` fill; never recreate the lettering with a font. The navigation displays the compact mark at 112px wide (96px on mobile), and the footer at 82px. The favicon isolates the canonical A: its upper contour comes from `interlocking-cab` and its inner stroke is the unchanged `a-feather` path. Only the two shared joins are closed, between (90,134) and (80,103) on the C side and between (316,103) and (311,134) on the B side. Preserve those contours, the square viewBox, optical clear space and original colour; add no tile or ornament. `favicon.svg`, the 32px PNG and the ICO (16/32/48px) depict the same artwork and are referenced by the shared document head. Raster fallbacks were rendered locally from that SVG without adding a project dependency.

## Technical documents

The specification index retains its existing grouping, descriptions, and draft status. Documents retain all source text, metadata, heading IDs, cross-references, examples, and ordering from `src/spec/**`.

Desktop documents pair a sticky, independently scrollable contents panel with a prose column of at most 790px. At 800px and below, contents becomes an in-flow native disclosure with a bounded list. Code and tables scroll within their containers, with keyboard-accessible scroll regions; tables also have a CSS-only overflow fallback. Diagrams scale within the prose column. Print styles hide navigation and contents, wrap long code, expand table containers, repeat table headings, and preserve readable text.

## Accessibility and copy conventions

Use semantic navigation, visible keyboard focus, a working skip link, descriptive image alternatives, and text labels alongside decision colours. Reduced-motion preferences disable smooth scrolling and transitions. The copy control announces success or a selection fallback. Closing the simulator removes its iframe and returns focus to its launcher; reopening creates a fresh iframe. The direct `/game/` link remains available without JavaScript.

Retain “key service” and “key access”, the shared-broker/two-consumer example, separate application scenarios, and the approved explanation of khaled's pluggable policy languages and Cedar support. Specification wording is maintained in the source documents, not rewritten by presentation code. Do not restore the white paper, editorial tools, theme switch, or hero metadata rail.

The homepage's JSON example uses `<code is:raw>` so Astro treats its braces as literal text. This single change resolved the reproduced `Expected "}" but found ":"` build error; `define:vars={{}}` was unnecessary and has been removed. Build, deployment, dependency, and project configuration files are unchanged.

Copy uses British English and the specification’s capitalisation for defined concepts (for example, Message, Envelope, Principal, Claims, Lease, Key Service and Key Server). Keep open compounds such as “key service” and “key access”, with case determined by context and explicitly approved labels preserved. Name the participant, mechanism and consequence; distinguish specified behaviour from architectural inference and implementation-specific support. The Security model keeps its trust boundary visible before five disclosures, separating intermediary compromise, access decisions, key possession, federation and producer attribution. Put setup prerequisites behind existing documentation links. Software cards carry no availability/status badges.

## Scenarios

The homepage’s Applications section retains `#applications` and uses numbered semantic articles: a linked title on the left and a concrete paragraph on the right, stacked on mobile. Every row links to an expanded section on the single `/scenarios/` page. `src/data/scenarios.ts` supplies the titles, homepage paragraphs, expanded copy and source links for both views. Keep live voice and video and delegated requests visible alongside the other applications. The old `#delegated-access` anchor belongs to the linked application row; do not duplicate it in an integration disclosure. Keep the foundational broker example and the common Security model on the homepage. Scenario setups state their particular identity, key and federation arrangements; they describe system designs, not verified deployments. Prefer “does not need” to “need not” in explanatory prose.

`ScenarioDiagram.astro` renders the explicit nodes and paths in `scenario-diagrams.ts`: solid lines carry encrypted Envelopes, dashed lines represent key access, and labelled dotted lines carry task/reference traffic or show time. Domain outlines describe logical Key Services, not physical networks. Make plaintext processors and permission decisions explicit. Keep diagrams visible, with descriptive titles and captions. At 800px and below, readable HTML flows replace the desktop SVGs; they preserve the participants and access decisions instead of shrinking labels. The contents list moves into normal document flow on smaller screens.
