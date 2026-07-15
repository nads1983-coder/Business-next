# Business Sorted

Business Sorted is a Stage 1 SaaS foundation for first-time UK business owners who need calm, plain-English help with business administration.

## Stage 1 Includes

- Next.js App Router with TypeScript, Tailwind and local shadcn-style UI primitives
- Central product configuration for the product name, plans, navigation and support copy
- PostgreSQL data model with Prisma for users, businesses, profiles, tasks, deadlines, reminders, sources, rules, subscriptions and audit logs
- Email/password authentication with protected app routes
- One-question-at-a-time business onboarding
- Personalised starter task generation
- Dashboard shell answering what to do next, when it is due, what happens if ignored and what is needed
- Seed data for sole trader and limited company examples

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` to a PostgreSQL database, set `DIRECT_URL` when your provider uses a separate direct connection for migrations, and set `AUTH_SECRET` to a long random value.

4. Apply migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Demo users created by the seed script:

- `sole-trader@example.com`
- `limited-company@example.com`

Both use the password `BusinessSortedDemo1!`.

## Production

Deploy on Vercel with managed PostgreSQL and these required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Stage 3 billing supports a controlled Stripe launch gate. Checkout remains owner-restricted through `BUSINESS_NEXT_TEST_EMAIL` until public activation is explicitly approved.

For controlled test-mode billing, set these server-side variables:

- `BUSINESS_NEXT_BILLING_ENABLED=true`
- `BUSINESS_NEXT_STRIPE_MODE=test`
- `STRIPE_SECRET_KEY` with an `sk_test_` value
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_TEST_PRICE_ID_MONTHLY`
- `BUSINESS_NEXT_TEST_EMAIL` set to the single approved test purchaser email

For controlled live billing, set these Production-only variables through Vercel's secure environment controls:

- `BUSINESS_NEXT_BILLING_ENABLED=true`
- `BUSINESS_NEXT_STRIPE_MODE=live`
- `STRIPE_SECRET_KEY` with an `sk_live_` value
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_LIVE_PRODUCT_ID`
- `STRIPE_LIVE_PRICE_ID_MONTHLY`
- `BUSINESS_NEXT_APPROVED_APP_URL=https://businesssorted.uk`
- `NEXT_PUBLIC_APP_URL=https://businesssorted.uk`
- `NEXTAUTH_URL=https://businesssorted.uk`
- `BUSINESS_NEXT_TEST_EMAIL` set to the approved owner purchaser email
- `BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED=true`
- `BUSINESS_NEXT_TERMS_VERSION_ACCEPTED`
- `BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED`
- `BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED`

The controlled MVP offer is Business Sorted at £9 per month in GBP, monthly recurring billing only, with no annual plan and no free trial. Do not set `STRIPE_TEST_PRICE_ID_ANNUAL` or create an annual price for this phase.

Do not mix test and live Stripe keys or price IDs. Do not expose secret keys in client-side code.

### Controlled Live Stripe Launch

The current reviewed legal version is centralised in `src/config/legal.ts`:

- `stage-3-live-owner-draft-2026-07-15`

The Terms, Privacy Notice, Subscription Terms, Checkout legal gate and recorded legal acceptances must all use that same version. Checkout remains closed unless every non-secret gate matches exactly:

- `BUSINESS_NEXT_BILLING_ENABLED` is lowercase `true`
- `BUSINESS_NEXT_LEGAL_OWNER_ACCEPTED` is lowercase `true`
- `BUSINESS_NEXT_TERMS_VERSION_ACCEPTED` matches the current legal version
- `BUSINESS_NEXT_PRIVACY_VERSION_ACCEPTED` matches the current legal version
- `BUSINESS_NEXT_SUBSCRIPTION_TERMS_VERSION_ACCEPTED` matches the current legal version
- `BUSINESS_NEXT_STRIPE_MODE` is `live`
- `BUSINESS_NEXT_APPROVED_APP_URL` is `https://businesssorted.uk`
- the Vercel runtime environment is Production
- `STRIPE_LIVE_PRICE_ID_MONTHLY` is present

Live Stripe secrets, product IDs, price IDs and webhook secrets must be scoped to Vercel Production only. Preview must not have live Stripe variables capable of creating live charges, and the server-side live Checkout gate also requires `VERCEL_ENV=production`. During the controlled launch, Checkout is additionally restricted to the email in `BUSINESS_NEXT_TEST_EMAIL`.

The safe Checkout gate diagnostic is available at `/api/billing/checkout-gate`. It reports only gate category names and public plan facts. It must never return configured values, connection strings, Stripe IDs, email addresses, API keys or webhook secrets.

Before production deployment:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npx prisma migrate deploy
```

## Official Sources

Seeded official sources are from GOV.UK and were checked on 13 July 2026:

- https://www.gov.uk/become-sole-trader
- https://www.gov.uk/running-a-limited-company
- https://www.gov.uk/file-your-confirmation-statement-with-companies-house
- https://www.gov.uk/register-for-vat

Business Sorted stores source URLs and checked dates. Rules are designed to be reviewed and updated without changing UI code.
