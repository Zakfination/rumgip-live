# Rumgip Live Architecture

## Production stack

- Next.js App Router
- Neon PostgreSQL
- Midtrans Snap/API for payments
- YouTube Unlisted for live video
- Protected `/live` room for access control

## Security model

YouTube is the video transport, not the authorization layer. Authorization is enforced by Rumgip:

1. Customer authenticates.
2. Customer creates an order.
3. Midtrans payment is verified server-side through webhook/status verification.
4. Only a verified paid order creates an entitlement.
5. `/live` checks an active entitlement before rendering the player.
6. The YouTube video ID is never exposed on public landing pages.

Unlisted YouTube URLs can still be shared if discovered. This is accepted for the MVP. A future signed-video provider can replace YouTube without changing the entitlement model.

## Data flow

`Next.js -> Neon -> Midtrans webhook -> entitlement -> protected live room -> YouTube embed`
