# Resource centre analytics

Business Sorted uses Plausible on public pages and internal database analytics for pricing and billing events. Resource-centre analytics should use Plausible custom events so no Prisma schema migration is needed for public reading behaviour.

## Event taxonomy

| Event | When it fires | Safe properties |
| --- | --- | --- |
| `resource_viewed` | `/resources` loads | `link_location` |
| `resource_category_viewed` | a resource category page loads | `category` |
| `resource_article_viewed` | a resource article loads | `article_slug`, `article_category`, `article_group` |
| `resource_cta_clicked` | an end-of-article CTA is clicked | `article_slug`, `article_category`, `cta_variant`, `destination_type`, `link_location` |
| `resource_related_article_clicked` | a related, featured or contextual resource link is clicked | `article_slug`, `article_category`, `target_slug`, `link_location` |
| `resource_product_link_clicked` | a non-resource product/support/home link is clicked from resource context | `article_slug`, `article_category`, `destination_type`, `link_location` |
| `resource_registration_clicked` | a registration link is clicked from resource context | `article_slug`, `article_category`, `cta_variant`, `link_location` |
| `resource_pricing_clicked` | a pricing link is clicked from resource context | `article_slug`, `article_category`, `cta_variant`, `link_location` |
| `resource_navigation_link_clicked` | a resource hub/category navigation link is clicked | `category`, `link_location` |
| `resource_source_clicked` | an official GOV.UK or Companies House source link is clicked | `article_slug`, `article_category`, `source_domain`, `link_location` |

Do not send article body text, query strings, email addresses, company numbers, names, payment data or unrestricted free-text values.

## Duplicate-event guard

Page-view events are fired by a tiny client component with a stable `eventKey`, so hydration and re-renders do not emit duplicate view events for the same page instance. Click events fire once from the clicked link handler.
