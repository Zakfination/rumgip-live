# RUMGIP LIVE

Paid live-streaming platform for Rumgip Championship.

## Stack

- Next.js App Router + TypeScript
- Neon PostgreSQL
- Midtrans Snap (sandbox first, production-ready adapter)
- Resend transactional email for OTP
- YouTube Unlisted protected by the Rumgip entitlement layer

## User flow

1. User signs in with email OTP.
2. User selects Daily Pass or Full Event Pass.
3. Server creates the order using the price stored in Neon.
4. Server creates a Midtrans Snap transaction.
5. Midtrans calls `/api/webhooks/midtrans` after status changes.
6. Server verifies the Midtrans signature, amount and status.
7. A paid order creates one entitlement idempotently.
8. `/live` checks the authenticated user and active entitlement before returning the YouTube video ID.

Midtrans recommends signature verification and idempotent notification handling; this implementation follows that model. See the official Midtrans webhook guidance: https://docs.midtrans.com/docs/https-notification-webhooks

## Local setup

```bash
npm install
cp .env.example .env.local
npm run db:migrate
# apply db/seed.sql once to seed the event and passes
npm run dev
```

Required environment variables are documented in `.env.example`.

### Resend

Use a verified sending domain for `RESEND_FROM_EMAIL`. Do not put the Resend API key in Git.

### Midtrans

Use Sandbox credentials first and set `MIDTRANS_IS_PRODUCTION=false`. Configure the Midtrans notification URL to:

`https://YOUR_DOMAIN/api/webhooks/midtrans`

For local development, expose the endpoint through an HTTPS tunnel. Midtrans documents this approach for local notification handlers.

### Neon

Set `DATABASE_URL` to your Neon connection string. The migration runner executes `db/schema.sql`; seed data is in `db/seed.sql`.

## Tests

```bash
npm run typecheck
npm run test
```

The real Midtrans sandbox test is automatically skipped when `MIDTRANS_SERVER_KEY` is absent.

## Production checklist

- Configure Neon and run migrations.
- Configure a verified Resend domain and `RESEND_FROM_EMAIL`.
- Configure Midtrans Sandbox and complete a test payment.
- Set the Midtrans notification URL to the deployed HTTPS endpoint.
- Configure an active YouTube Unlisted live stream from the admin control room.
- Set an admin user's `role` to `admin` directly in Neon.
- Rotate `AUTH_SECRET` and `OTP_PEPPER` before production.
- Never commit `.env.local` or payment/email credentials.
