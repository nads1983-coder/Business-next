# Business Next

Business Next is a Stage 1 SaaS foundation for first-time UK business owners who need calm, plain-English help with business administration.

## Stage 1 Includes

- Next.js App Router with TypeScript, Tailwind and local shadcn-style UI primitives
- Central product configuration for the temporary name, plans, navigation and support copy
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

Both use the password `BusinessNextDemo1!`.

## Production

Deploy on Vercel with managed PostgreSQL and these required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Stage 3 billing is a controlled Stripe test-mode foundation. Live payments are intentionally disabled. Checkout is available only when all of these server-side variables are present:

- `BUSINESS_NEXT_BILLING_ENABLED=true`
- `STRIPE_SECRET_KEY` with an `sk_test_` value
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_TEST_PRICE_ID_MONTHLY`
- `STRIPE_TEST_PRICE_ID_ANNUAL` only when annual billing is approved

Do not use `sk_live_` keys or live Stripe price IDs during the test-mode launch phase. Do not expose secret keys in client-side code.

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

Business Next stores source URLs and checked dates. Rules are designed to be reviewed and updated without changing UI code.
