# Business Compliance Hub

The `/resources` page is the parent Business Compliance Hub for BusinessSorted.uk. It introduces the main areas of UK limited-company compliance, routes readers to the live Companies House cluster and provides an honest roadmap for future clusters.

## Current live category

Companies House is the only live resource category. It has a real category route at `/resources/companies-house` and 19 published article routes beneath `/resources/[slug]`.

Future hub cards can be shown on `/resources`, but they must not be added to `resourceCategories`, the sitemap or the route tree until a substantive category page exists.

## Planned route convention

Future clusters should follow this pattern:

- `/resources/corporation-tax`
- `/resources/vat`
- `/resources/paye`
- `/resources/directors`
- `/resources/starting-a-limited-company`
- `/resources/running-a-limited-company`

Only create one of these routes when it can launch as a useful indexable page with enough source-checked content.

## Minimum threshold before a category page goes live

A future category should normally have:

- at least four published, source-checked guides
- a clear category introduction that explains the scope without claiming advice
- official GOV.UK, HMRC or Companies House sources for each article
- unique metadata and canonical URLs
- visible internal links between the hub, category and article pages
- JSON-LD that matches visible page content
- sitemap coverage for the category and published article routes only
- resource validation and SEO tests updated before deployment

Do not create empty category pages, placeholder article pages, fake article counts or indexable pages that merely say content is coming soon.

## Adding a category card

Add the card to `businessComplianceHubCategories` in `src/content/resources.ts`.

For a planned category:

- set `status` to `coming-soon`
- include a concise description of what the future category will cover
- do not add `destination`
- do not add the slug to `resourceCategories`

For a live category:

- set `status` to `live`
- add a real `destination`
- add an accessible CTA label
- ensure the category route exists and returns `200`
- add the category to `resourceCategories`
- update sitemap and SEO tests

## Sitemap rules

`src/app/sitemap.ts` reads live categories from `resourceCategories`. Planned hub cards are not included in the sitemap because they do not have public routes. Resource article `lastModified` values should continue to use the article `lastReviewedDate`.

## Analytics

The hub uses Plausible-only custom events documented in `docs/resource-analytics.md`. Do not send personal data, company numbers, query strings, body text or unrestricted free text.

## Editorial standards

Future clusters should use UK English, explain what official sources say, record source checked dates and avoid legal, accounting or tax advice claims. BusinessSorted can be described as helping users organise important company tasks and deadlines, but content must not claim that BusinessSorted files submissions or guarantees compliance.
