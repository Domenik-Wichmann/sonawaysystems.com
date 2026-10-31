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

The graph has three scenarios: order cutoffs, a temporary peak-week context, and staff/customer views of returns rules. Every card shows its effective value and the rule it inherits. Visitors can change the company default, the warehouse department override or Warehouse C’s site exception. Warehouses A and B inherit from warehouse core; C starts with its own exception. Field operations inherit from the company; support has a separate department override. Changes are computed from these relationships, rather than updating every card indiscriminately. Visitors can remove an override to restore inheritance. Ending the peak-week context restores the original example.

The guided intake follows a deterministic branching conversation. No external language model is called. The calculator exposes all assumptions and shows potential released capacity, not promised cash savings.

## Contact flow

`contact.html` generates a visible project brief. The visitor can copy it or select an explicit `mailto:` link to open their email client. Nothing is submitted or sent automatically. The contact address is `domenik@sonaway.com`.

No database, form collection service, analytics or marketing cookies are included. Google Fonts is requested externally; system font fallbacks are configured. A backend form or booking service can be added separately if needed.

## Editing

- Page structure and copy: the individual HTML files.
- Styles and responsive layout: `assets/styles.css` and `assets/refinements.css`.
- All interactions and demo data: `assets/site.js`.
- Editorial-style photography and generation prompts: see `ASSETS.md`.
- Brand icon: `assets/favicon.svg`.
- Social image: `assets/social-card.svg` and `assets/social-card.png`.
- Canonical URLs, sitemap and social image URLs target `https://sonawaysystems.com/`.

## Verification

Checked in the browser: policy-change review and propagation, local exception preservation, temporary context, customer-safe view, branching intake, calculator at 0% and 90%, mobile menu, mobile graph controls, contact brief and copy behavior. The mobile layout was checked inside a 390px iframe; document overflow remained contained to the intentionally scrollable graph.

Static checks: JavaScript syntax, one H1 per page, unique IDs, local links and anchors. Native email-client delivery is not tested or handled by this site.
