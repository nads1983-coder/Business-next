# Email notifications

Business Sorted sends internal operational notifications through the existing Resend email integration.

## Environment variables

Set these in Vercel for Production, Preview and Development as appropriate:

- `RESEND_API_KEY`: server-side Resend API key
- `EMAIL_FROM`: verified sender, for example `Business Sorted <notifications@businesssorted.uk>`
- `EMAIL_REPLY_TO`: default reply-to mailbox, for example `support@businesssorted.uk`
- `NOTIFICATION_EMAIL`: internal notification recipient

The production value for `NOTIFICATION_EMAIL` should be the approved internal operations recipient.

Do not expose `NOTIFICATION_EMAIL` through `NEXT_PUBLIC_` variables, client components, API responses or page source.

## Trigger points

Sign-up notifications are attempted in `src/app/(auth)/register/actions.ts` after:

1. registration form validation passes
2. duplicate email checks pass
3. the user and free subscription records are created
4. the verification token and verification email flow complete

Support enquiry notifications are attempted in `src/app/support/actions.ts` after the enquiry form is validated and accepted by the server.

## Reliability

Notification failures are logged with `eventType`, `recordId` and a provider error message. The logs must not include passwords, tokens, full session data or full enquiry message bodies.

Resend idempotency keys are deterministic for sign-ups (`signup-{userId}`) and per accepted enquiry (`enquiry-{enquiryId}`), so provider retries do not intentionally create duplicate sends for the same event.

## Form protection

The public support form uses server-side validation and a hidden honeypot field. Submissions that fill the honeypot receive the generic success response and do not send an email.
