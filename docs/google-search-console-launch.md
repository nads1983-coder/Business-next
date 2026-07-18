# Google Search Console launch checklist

Use this checklist when you are ready to monitor the Business Sorted resource centre in Google Search Console.

## 1. Open the right property

Open Google Search Console and choose the property for `businesssorted.uk`. If both a Domain property and a URL-prefix property exist, prefer the Domain property because it covers all protocols and subdomains for the domain.

## 2. Confirm the canonical site

Check that the live site uses `https://businesssorted.uk` as the canonical version. The pages should not point to localhost, a Vercel preview URL or a `www` version.

## 3. Submit the sitemap

In Search Console, open **Sitemaps** and submit:

```text
https://businesssorted.uk/sitemap.xml
```

The sitemap should include `/resources`, `/resources/companies-house` and the 19 published Companies House article URLs.

## 4. Inspect priority URLs first

Start with a small number of cornerstone URLs:

- `https://businesssorted.uk/resources`
- `https://businesssorted.uk/resources/companies-house`
- `https://businesssorted.uk/resources/confirmation-statement-guide`
- `https://businesssorted.uk/resources/annual-accounts-guide`
- `https://businesssorted.uk/resources/first-year-companies-house-checklist`
- `https://businesssorted.uk/resources/directors-responsibilities-checklist`

Use **URL inspection** to confirm Google can access the page, sees the intended canonical and can render the page.

## 5. Request indexing carefully

Request indexing for a small number of priority pages after checking that each page is live, useful and canonical. Do not request indexing for all 19 pages at once unless there is a clear launch reason. Google can discover the rest through the sitemap and internal links.

Avoid repeatedly requesting indexing when no meaningful page changes have been made.

## 6. Check the canonical selected by Google

In URL inspection, compare:

- **User-declared canonical**
- **Google-selected canonical**

They should normally match `https://businesssorted.uk/...`. If Google selects a different URL, check for duplicate content, redirects, incorrect links or old preview URLs.

## 7. Monitor coverage and performance

Review these Search Console areas weekly during launch:

- indexed pages
- discovered pages
- crawled pages
- pages marked `Crawled - currently not indexed`
- impressions
- clicks
- click-through rate
- average position
- Core Web Vitals

If a useful page is `Crawled - currently not indexed`, check whether the title, description, direct answer, internal links and source quality are strong enough. Improve the page before asking Google to recrawl it.

## 8. Keep changes meaningful

When updating a resource article, record the factual review date only when sources or content have genuinely been reviewed. Avoid changing dates purely to make pages look fresh.
