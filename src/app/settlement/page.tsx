import type { Metadata } from "next";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
  DocSection,
} from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "Settlement · Umbra Pay Links",
  description:
    "Umbra SDK surface: getUmbraClient, receiver-claimable UTXO from public USDC, web ZK prover, confirm + optional on-chain verify.",
};

export default function SettlementPage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Umbra"
        eyebrowTone="teal"
        title="Settlement"
        description="Think of Umbra as Solana’s privacy layer: hidden amounts, shielded balances, viewing keys when you need audits, and more. This prototype zooms in on one flow the SDK already ships: pulling public USDC through a receiver-claimable UTXO so merchants get paid without us faking settlement in app code."
      />

      <DocSection title="SDK calls (browser checkout)">
        <p>
          The pay page wires these in order. There is no alternate SPL-only fast path:
        </p>
        <dl className="space-y-3 text-xs sm:text-sm">
          <div>
            <dt className="font-mono font-semibold text-teal">createSignerFromWalletAccount</dt>
            <dd className="mt-1">
              Wallet Standard wallet → Umbra-compatible signer (same entry point as Umbra
              quickstart).
            </dd>
          </div>
          <div>
            <dt className="font-mono font-semibold text-teal">getUmbraClient</dt>
            <dd className="mt-1">
              Network, RPC HTTP + WebSocket subscriptions, and Umbra indexer. All three are
              required for proofs and state.
            </dd>
          </div>
          <div>
            <dt className="font-mono font-semibold text-teal">getUserAccountQuerierFunction</dt>
            <dd className="mt-1">Skip redundant registration when the payer already exists.</dd>
          </div>
          <div>
            <dt className="font-mono font-semibold text-teal">getUserRegistrationFunction</dt>
            <dd className="mt-1">First-time Umbra identity (costs SOL) when needed.</dd>
          </div>
          <div>
            <dt className="font-mono font-semibold text-teal">
              getPublicBalanceToReceiverClaimableUtxoCreatorFunction
            </dt>
            <dd className="mt-1">
              Core value move: public SPL USDC → receiver-claimable UTXO toward the merchant
              address on the intent, using{" "}
              <code className="text-ink">getCreateReceiverClaimableUtxoFromPublicBalanceProver</code>{" "}
              from <code className="text-ink">@umbra-privacy/web-zk-prover</code>.
            </dd>
          </div>
        </dl>
      </DocSection>

      <DocSection title="SDK calls (headless agent)">
        <p>
          <code>scripts/agent-pay.mjs</code> mirrors the browser stack with{" "}
          <code>createSignerFromPrivateKeyBytes</code> and the same UTXO creator + prover,
          so headless automation exercises the same Umbra pipeline as the browser, with a
          different signer only.
        </p>
      </DocSection>

      <DocSection title="Confirm and verification">
        <p>
          After UTXO creation, the client POSTs Solana transaction signatures to{" "}
          <code>/api/intents/&lt;id&gt;/confirm</code>. For demos, confirmation can proceed
          without landed txs. For production-like runs, set{" "}
          <code>REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE=true</code> so the server calls{" "}
          <code>getSignatureStatuses</code> on your RPC before marking the intent settled.
        </p>
      </DocSection>

      <DocSection title="Merchant prerequisites">
        <p>
          The merchant address must be able to use Umbra as a recipient (registered, able
          to scan and claim UTXOs per SDK docs). If the recipient is not set up, payer
          flows can fail. We call that out on purpose.
        </p>
      </DocSection>

      <DocSection title="Verification">
        <ul className="list-inside list-disc space-y-2 text-sm text-muted">
          <li>
            Confirm there is <strong className="text-ink">no SPL-only shortcut</strong> in
            the pay UI: search the repo for{" "}
            <code className="text-ink">getPublicBalanceToReceiverClaimableUtxoCreatorFunction</code>.
          </li>
          <li>
            Compare browser checkout to{" "}
            <code className="text-ink">scripts/agent-pay.mjs</code> (same functions, different
            signer).
          </li>
          <li>
            Read <code className="text-ink">extra.settlement</code> on the 402 response in{" "}
            <code className="text-ink">src/app/api/resources/[id]/route.ts</code>.
          </li>
          <li>
            Optional: enable <code>REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE</code> and re-run a pay
            flow to see RPC-backed confirmation.
          </li>
        </ul>
      </DocSection>

      <DocSection title="Where this could grow (Umbra roadmap)">
        <p>
          Umbra also supports <strong>viewing keys</strong>, selective disclosure, private
          swaps, and deeper wallet experiences. This submission is intentionally narrow:
          <strong> payment links + agent 402</strong>, yet it sits on the same SDK and
          network as those primitives, so payroll-style flows, richer compliance, or
          shielded inventory could extend the same intent model later.
        </p>
      </DocSection>

      <DocFooterNav>
        <DocNavLink href="/reference">Reference</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>
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
