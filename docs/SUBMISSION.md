# Hackathon submission pack (Umbra Side Track)

Use this file when submitting to [Build with Umbra Side Track for $10,000](https://superteam.fun/earn/listing/umbra-side-track) on Superteam Earn.

## Links (fill if you fork or rename)

| Item | URL |
|------|-----|
| Live demo | https://umbra-pay-links.vercel.app/ (in-app reference: `/reference`) |
| Source code | https://github.com/panagot/Umbra-Pay-Links |
| Umbra SDK | https://sdk.umbraprivacy.com/ |
| Contact (listing) | https://t.me/abbasshaikh01 (from Superteam listing) |

## Official rubric (you must copy from the site)

The public HTML for the listing does not always expose the full **Details** / judging criteria in a machine-readable way. **Before you submit:**

1. Open the listing → **Details** (and any PDF / Luma / Discord brief from Umbra).
2. Paste each explicit requirement into a checklist below and mark **Met** with a pointer to code, page, or screenshot.

### Checklist (fill manually)

| # | Requirement (quote from sponsor) | Met? | Evidence |
|---|----------------------------------|------|----------|
| 1 | | ☐ | |
| 2 | | ☐ | |
| 3 | | ☐ | |

### Inferred must-haves (until the Details tab contradicts them)

These follow from the listing type (Frontier hackathon, Umbra sponsor, blockchain + backend + frontend) and from what judges typically expect:

- **Working product URL** — SPA or app that loads; core flow demo-able without only slides.
- **Umbra usage** — Not a mock: settlement path uses `@umbra-privacy/sdk` (see `src/components/pay-with-umbra.tsx`, `scripts/agent-pay.mjs`).
- **Clarity** — What is product vs what is Umbra infrastructure; README + Settlement page.
- **Reproducibility** — README + `.env.example`; tests (`npm run test:all`).

### Nice-to-have (only if rubric weights them)

- Deeper **x402** interop with a named reference client (you ship an x402-shaped 402 + `extra.settlement`).
- **Persistence** beyond file store for multi-day public demos (see **Persistence** below).
- Extra Umbra primitives (viewing keys, swaps): large scope; only if the track asks.

## Demo video (suggested 2–4 minutes)

Record against the **live demo** (or localhost with ngrok if needed).

1. **0:00–0:30** — Problem in one sentence: public payer graphs on Solana; this app uses Umbra + opaque pay links.
2. **0:30–1:15** — **Demo center**: retail simulation and/or 402 → pay → 200 timeline without a real wallet if applicable.
3. **1:15–2:45** — **Live flow**: create intent → show human URL vs **opaque** id in paths → pay with Umbra (or show confirm step) → `GET` agent resource URL until **200**; show JSON `content` on 200 (unlocked payload).
4. **2:45–3:30** — **Code**: GitHub → `PayWithUmbra` / `getUmbraClient` / receiver-claimable UTXO creator; mention OpenAPI `/openapi.json`.
5. **3:30–end** — **Impact**: one link for people and agents; HTTP 402 as machine gate; Umbra as settlement.

## Written submission (paste into Superteam)

Short template (adapt tone to form limits):

> **What we built**  
> Umbra Pay Links: create a payment intent, share a human checkout URL (`/pay/<id>`), and the same bill to software via `GET /api/resources/<id>` (HTTP **402** + JSON until paid, then **200** with an unlocked `content` payload). Public routes use an opaque id, not the merchant address in the path.  
>
> **Umbra integration**  
> Settlement is the real Umbra SDK path: public USDC → **receiver-claimable UTXO** toward the merchant (`getPublicBalanceToReceiverClaimableUtxoCreatorFunction` + `@umbra-privacy/web-zk-prover`), in the browser and in `npm run agent:pay` for headless parity. Confirmation posts signatures to `/api/intents/<id>/confirm`; optional `REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE` for RPC verification.  
>
> **Links**  
> Live: [umbra-pay-links.vercel.app](https://umbra-pay-links.vercel.app/) · Repo: [github.com/panagot/Umbra-Pay-Links](https://github.com/panagot/Umbra-Pay-Links) · SDK: [sdk.umbraprivacy.com](https://sdk.umbraprivacy.com/)

## Umbra SDK callouts (for judges skimming the repo)

| Area | File / entry |
|------|----------------|
| Browser settlement | `src/components/pay-with-umbra.tsx` |
| 402 resource + `extra.settlement` | `src/app/api/resources/[id]/route.ts` |
| Confirm + optional on-chain verify | `src/app/api/intents/[id]/confirm/route.ts`, `src/lib/solana-verify-signatures.ts` |
| Headless payer | `scripts/agent-pay.mjs` |
| Docs | `src/app/settlement/page.tsx`, `src/app/agents/page.tsx` |

## Persistence (file store vs database)

Intents are stored in `data/intents.json` on the server filesystem. That is **fine for local dev and simple demos**.

On **Vercel** (and similar serverless hosts), filesystem storage is **ephemeral**: instances and deploys can reset data. For a hackathon, calling that out in the submission is often enough. If judges need a **stable** public demo across days:

- Move intents to a managed store (e.g. Vercel KV, Postgres, Supabase) behind the same API in `src/lib/intents.ts`.
- Keep PII out of logs; webhooks stay optional and best-effort.

No database is **required** for the Umbra integration story itself; it is an **operational** upgrade.
