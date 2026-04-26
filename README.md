# Umbra Pay Links

Private payment links for people and software on Solana. Each intent gets a human checkout URL and a machine-readable resource URL: the API returns **HTTP 402** with payment instructions until settlement is recorded, then **200**. Settlement runs through the **Umbra SDK** (receiver-claimable UTXO from public USDC in this build), not a mocked transfer.

| | |
| --- | --- |
| **Live app** | [umbra-pay-links.vercel.app](https://umbra-pay-links.vercel.app/) |
| **Repository** | [github.com/panagot/-Umbra-Pay-Links](https://github.com/panagot/-Umbra-Pay-Links) |
| **Track** | [Umbra Side Track (Superteam)](https://superteam.fun/earn/listing/umbra-side-track) |

---

## Why this exists

Typical “pay me” flows on Solana leave a **public graph** of who paid whom and for how much. Merchants and payers often want **transactional privacy**. At the same time, backends and agents need a **predictable protocol** (not only a browser QR flow).

**Who it helps**

| Audience | What they get |
| -------- | --------------- |
| **Merchants, creators, SaaS** | Shareable links: **opaque id in the URL**, not the recipient address in the path. |
| **Payers** | Familiar checkout: open link, connect wallet, pay; value moves on **Umbra’s confidential rails** toward the merchant. |
| **Builders of agents and platforms** | One **GET** on the resource URL returns **402 + JSON** until paid, then **200**, in line with common **x402-style** client expectations, with **Umbra** handling the real settlement. |

---

## Umbra SDK in this repo

Settlement is **real Umbra SDK usage**, not a server-side stand-in or a plain SPL shortcut.

**Dependencies (high level):** `@umbra-privacy/sdk`, `@umbra-privacy/web-zk-prover`, Wallet Standard (`@wallet-standard/*`), `@solana/kit` for typed addresses.

**Browser checkout (`PayWithUmbra`), in order**

1. `createSignerFromWalletAccount`: Wallet Standard to Umbra signer  
2. `getUmbraClient`: network, RPC, WebSocket subscriptions, Umbra indexer  
3. `getUserAccountQuerierFunction` / `getUserRegistrationFunction`: Umbra identity when needed  
4. `getPublicBalanceToReceiverClaimableUtxoCreatorFunction` + `getCreateReceiverClaimableUtxoFromPublicBalanceProver`: **public USDC to receiver-claimable UTXO** for the merchant  

**Headless path:** `scripts/agent-pay.mjs` uses `createSignerFromPrivateKeyBytes` with the same pipeline so automation matches the browser.

**Server:** Persists intents, serves **402** resources, optional on-chain confirm gate (`REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE`), optional webhooks. Umbra programs are reached **through the SDK** from the client; this app does not ship its own Umbra program.

Viewing keys, selective disclosure, and private swaps are part of Umbra’s wider roadmap. This prototype focuses on **private pay links** and an **x402-shaped** agent surface, aligned with the track’s private payments and x402 prompts.

---

## In the app

1. **Human pay link:** `/pay/<id>` (wallet checkout with Umbra).  
2. **Agent resource:** `/api/resources/<id>` (**402** until paid, then **200** with JSON).  
3. Optional **webhook** on first successful settlement.  
4. **How it works**, **Settlement**, **Agents & APIs**, and **Demo center** (simulations plus links into the live flow).

---

## Local development

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an intent, complete payment on the pay link, then hit the resource URL again (or run `npm run agent:pay` with a funded keypair; see `.env.example` and the script header).

**Tests**

| Command | Purpose |
| ------- | ------- |
| `npm run test` / `npm run test:unit` | Vitest (helpers, rate limits, RPC verify) |
| `npm run test:e2e` | Playwright: main pages, OpenAPI, intent flow and **402** |
| `npm run test:smoke` | Quick `fetch` smoke (expects server at `BASE_URL`) |
| `npm run test:all` | Unit + E2E |

First-time Playwright: `npx playwright install chromium`

---

## Deploy (e.g. Vercel)

1. Import the GitHub repo in [Vercel](https://vercel.com/).  
2. Set **`NEXT_PUBLIC_APP_URL`** to your production URL so generated links are correct.  
3. **Storage:** this demo stores intents under `data/`. **Ephemeral disk on serverless** is not durable; use a database for production.

---

## References

- [Umbra SDK](https://sdk.umbraprivacy.com/) · [Quickstart](https://sdk.umbraprivacy.com/quickstart)  
- [Umbra](https://umbraprivacy.com/)  
- [x402 response format (concept)](https://docs.g402.ai/docs/api/response-format)  
- OpenAPI in this app: `/openapi.json`

---

## License

MIT
