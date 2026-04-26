import type { Metadata } from "next";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
  DocSection,
} from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "Agents & APIs · Umbra Pay Links",
  description:
    "x402-shaped HTTP 402, extra.settlement for Umbra, unlocked JSON on 200, OpenAPI 3.1, and npm run agent:pay headless parity.",
};

export default function AgentsPage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Automation"
        eyebrowTone="teal"
        title="Agents & APIs"
        description="Private machine-to-machine payments: agents poll one URL, receive standard 402 + JSON, run the same Umbra settlement as a human, then read the unlocked response with structured content. Uses a common x402-style envelope without defining a separate payment protocol."
      />

      <DocSection title="Resource URL">
        <p>
          <code className="!block !break-all !rounded-xl !border-line !bg-canvas/80 !p-3 !text-xs !text-teal">
            GET /api/resources/&lt;intent-id&gt;
          </code>
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong>402</strong> while open: JSON includes <code>x402Version</code>,{" "}
            <code>accepts[]</code>, and <code>extra.settlement</code> ={" "}
            <code>umbra-receiver-claimable-utxo</code> so clients route work to the Umbra
            SDK instead of treating <code>payTo</code> as a plain public SPL send.
          </li>
          <li>
            <strong>200</strong> after the intent is marked settled: JSON includes{" "}
            <code>content</code> (<code>umbra-pay-links.unlocked</code>) as the unlocked
            machine payload, plus <code>settledAt</code> and receipt fields.
          </li>
        </ul>
      </DocSection>

      <DocSection title="Example 200 body (shape)">
        <p className="mb-3 text-sm text-muted">
          Abbreviated; see <DocNavLink href="/openapi.json">OpenAPI</DocNavLink> for full
          fields. <code>settledAt</code> is written on first confirm; older rows may fall
          back to <code>createdAt</code> in the resource response only when needed.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-line bg-canvas/80 p-4 text-[11px] leading-relaxed text-ink sm:text-xs">
          {`{
  "unlocked": true,
  "intentId": "…",
  "label": "Invoice / product name",
  "settledAt": "2026-04-24T12:00:00.000Z",
  "amountAtomic": "1000000",
  "mint": "EPjF…",
  "message": "Payment recorded. This JSON is the unlocked resource…",
  "content": {
    "type": "umbra-pay-links.unlocked",
    "version": 1,
    "title": "Invoice / product name",
    "body": "Access is granted for this intent…",
    "receipt": {
      "settlement": "umbra-receiver-claimable-utxo",
      "amountAtomic": "1000000",
      "mint": "EPjF…"
    }
  }
}`}
        </pre>
      </DocSection>

      <DocSection title="Headless payer">
        <p>
          <code>npm run agent:pay</code> runs <code>scripts/agent-pay.mjs</code>: load a
          keypair, read 402, run the same Umbra + UTXO path as the browser, POST confirm,
          re-fetch the resource. Environment variables are in <code>README.md</code> and{" "}
          <code>.env.example</code>.
        </p>
      </DocSection>

      <DocSection title="Umbra SDK parity (browser vs agent)">
        <p>
          Both paths call <code>getUmbraClient</code>, optional registration, then{" "}
          <code>getPublicBalanceToReceiverClaimableUtxoCreatorFunction</code> with the same
          browser ZK prover package. The only deliberate difference is the signer: Wallet
          Standard in React vs private key bytes in Node. Same settlement path, not a
          server-side fake payment.
        </p>
      </DocSection>

      <DocSection title="OpenAPI">
        <p>
          Machine-readable contract:{" "}
          <DocNavLink href="/openapi.json">/openapi.json</DocNavLink> (OpenAPI 3.1). Import
          into Postman, Insomnia, or codegen tools so your platform can treat intents as
          first-class resources.
        </p>
      </DocSection>

      <DocSection title="REST surface">
        <p className="mb-3 text-sm text-muted">
          Routes are rate-limited per client IP (see <code>README.md</code>).{" "}
          <code>POST /api/intents</code> validates Solana addresses with{" "}
          <code>@solana/kit</code> <code>address()</code>.
        </p>
        <dl>
          <div>
            <dt className="font-mono text-xs font-semibold text-brand">POST /api/intents</dt>
            <dd className="mt-1">
              Create intent; returns pay URL and resource URL. Optional{" "}
              <code>webhookUrl</code> for a server POST on first settlement.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-brand">
              GET /api/intents/&lt;id&gt;
            </dt>
            <dd className="mt-1">Intent fields for the checkout UI.</dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-brand">
              POST /api/intents/&lt;id&gt;/confirm
            </dt>
            <dd className="mt-1">
              Mark settled with an array of transaction signatures. Idempotent if signatures
              match an already-settled intent. Optional RPC verification when{" "}
              <code>REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE</code> is enabled.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-teal">
              GET /api/resources/&lt;id&gt;
            </dt>
            <dd className="mt-1">402 paywall or 200 when paid.</dd>
          </div>
        </dl>
      </DocSection>

      <DocSection title="Umbra documentation">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <a
              className="font-medium text-teal hover:underline"
              href="https://sdk.umbraprivacy.com/quickstart"
              target="_blank"
              rel="noopener noreferrer"
            >
              Umbra SDK quickstart
            </a>
          </li>
          <li>
            <a
              className="font-medium text-teal hover:underline"
              href="https://umbraprivacy.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Umbra (product)
            </a>
          </li>
          <li>
            <a
              className="font-medium text-teal hover:underline"
              href="https://docs.g402.ai/docs/api/response-format"
              target="_blank"
              rel="noopener noreferrer"
            >
              x402 response format (reference)
            </a>
          </li>
        </ul>
      </DocSection>

      <DocFooterNav>
        <DocNavLink href="/reference">Reference</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/settlement">Settlement details</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/how-it-works">How it works</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/demo">Demo center</DocNavLink>
      </DocFooterNav>
    </ContentPageShell>
  );
}
