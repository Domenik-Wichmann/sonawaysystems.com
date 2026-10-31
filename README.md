# Sonaway Systems

A responsive, buildless website for Sonaway Systems: custom operational knowledge systems, consulting, implementation and optional managed services.

## Run or deploy

The repository root is the website root. No Node.js, dependency installation, build command, database or AI API key is required.

- Open `index.html` locally, or serve this directory with any static HTTP server.
- For Hostinger conventional static web hosting, deploy the contents of the repository into the website's `public_html` directory. Select the `main` branch in the Git integration.
- If Hostinger requires an empty deployment directory, remove or back up the default placeholder through hPanel before connecting deployment. Do not remove unrelated files.
- Domain and DNS configuration are separate. This commit does not connect or change any domain.

## Pages

- `index.html`: full overview, interactive knowledge graph, guided-intake example, time-value calculator, FAQs.
- `services.html`: six capability areas and the boundaries of ongoing management.
- `approach.html`: discovery, implementation, verification, ownership and handoff.
- `about.html`: founder and working principles.
- `contact.html`: local project brief generator and email draft link.
- `privacy.html`: website behavior and external font requests.

## Interactive demonstrations

All examples use fictional data and run entirely in the visitor's browser. They are illustrative interfaces, not a deployed Sonaway knowledge backend.

The graph has three existing scenarios: order cutoffs, a peak-week context and returns rules. Every node is editable directly: click a node, choose a value, and the change propagates immediately in this browser-only demonstration. There is no separate node selector, Apply step or approval modal. Any non-root node can restore its parent rule using the first option in its inline editor. Undo and Reset are included.

Node and connector colors identify the effective rule source. The business default and its inheriting views are green; warehouse core, A and B start purple; support and the customer website start blue; warehouse C’s independent exception starts amber. Removing an override changes the effective value and source color together. Creating a new override gives that node its own source color.

The demonstration is sized to the viewport and does not require internal scrolling. Its full hierarchy is visible on desktop and phone layouts. The header hides when scrolling down and returns when scrolling up.

The guided intake follows a deterministic branching conversation. No external language model is called. The calculator exposes all assumptions and shows potential released capacity, not promised cash savings.

## Contact flow

`contact.html` generates a visible project brief. The visitor can copy it or select an explicit `mailto:` link to open their email client. Nothing is submitted or sent automatically. The contact address is `domenik@sonaway.com`.

No database, form collection service, analytics or marketing cookies are included. Google Fonts is requested externally; system font fallbacks are configured. A backend form or booking service can be added separately if needed.

## Editing

- Page structure and copy: the individual HTML files.
- Styles and responsive layout: `assets/styles.css`, `assets/refinements.css` and `assets/compact-demo.css`.
- All interactions and demo data: `assets/site.js`.
- Editorial-style photography and generation prompts: see `ASSETS.md`.
- Brand icon: `assets/favicon.svg`.
- Social image: `assets/social-card.svg` and `assets/social-card.png`.
- Canonical URLs, sitemap and social image URLs target `https://sonawaysystems.com/`.

## Verification

Checked in the browser: direct node edits, scoped propagation, local overrides, restoring inheritance, matching source colors, Undo, and header hiding/return by scroll direction. The complete demo fits a 936px desktop viewport, a 700px desktop iframe and a 740px phone iframe; the phone page has no horizontal overflow. Previous checks also covered branching intake, calculator bounds, contact brief and copying. The graph has no horizontal or internal scrolling.

Static checks: JavaScript syntax, one H1 per page, unique IDs, local links and anchors. Native email-client delivery is not tested or handled by this site.
