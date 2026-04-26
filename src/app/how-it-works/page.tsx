import type { Metadata } from "next";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
  DocSection,
} from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "How it works · Umbra Pay Links",
  description:
    "Opaque pay links, Umbra SDK settlement, x402-shaped HTTP 402 for agents, confirm path, and unlocked JSON on 200.",
};

export default function HowItWorksPage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Product story"
        title="How it works"
        description="Umbra exists so value can move on Solana without turning every counterparty into a public graph. Here that shows up as a pay link people already know how to use, plus one URL agents can poll the same way they would any other gated API."
      />

      <DocSection title="Product scope">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <strong className="text-ink">Private payment links</strong>: share a URL with
            an <strong>opaque id</strong>; your merchant pubkey is not in the path, and
            value settles through Umbra’s confidential machinery instead of a trivial
            public transfer row for every payer.
          </li>
          <li>
            <strong className="text-ink">X402-style private machine payments</strong>: the
            agent URL speaks HTTP <code>402</code> + structured <code>accepts[]</code> until
            the Umbra flow completes, then <code>200</code>. Same mental model as emerging
            x402 clients; settlement is explicitly <code>umbra-receiver-claimable-utxo</code>{" "}
            in JSON so tools don’t mis-implement a raw SPL send.
          </li>
        </ul>
      </DocSection>

      <div className="grid gap-5 lg:grid-cols-2">
        <DocSection title="Payment intent">
          <p>
            When you submit the form on the home page, the app stores an{" "}
            <strong>intent</strong>: label, USDC amount, SPL mint, merchant Solana address,
            and status (<code>open</code> or <code>settled</code>). The public link only
            contains an <strong>opaque id</strong> (not the merchant address in the path),
            which reduces trivial link-scraping of “who earns here.”
          </p>
        </DocSection>

        <DocSection title="Human payer">
          <p>
            The <code className="text-brand">/pay/&lt;id&gt;</code> page loads that intent,
            connects a Wallet Standard wallet, and runs the Umbra SDK: registration if
            needed, then{" "}
            <code>getPublicBalanceToReceiverClaimableUtxoCreatorFunction</code> so USDC
            moves through Umbra&apos;s receiver-claimable UTXO path toward the merchant you
            configured. That uses the same privacy primitives Umbra documents for builders.
          </p>
        </DocSection>
      </div>

      <DocSection title="What payers see vs what chain observers see">
        <p>
          The checkout UI shows the <strong>amount and label</strong> so humans know what
          they&apos;re paying, which keeps checkout honest. On-chain, Umbra separates{" "}
          <strong>who paid whom from a trivial public graph</strong>: value commits into
          Umbra&apos;s structure toward the merchant&apos;s keys; claiming can land in
          private balances per Umbra&apos;s model. This prototype does not replace Umbra
          with a custodial ledger.
        </p>
      </DocSection>

      <DocSection title="x402 shape vs Umbra settlement">
        <p>
          The <strong>402 response</strong> follows the familiar x402 pattern:{" "}
          <code>x402Version</code>, <code>accepts[]</code>, <code>maxAmountRequired</code>,{" "}
          <code>payTo</code>, and <code>asset</code> so generic agents can parse the bill.
          Umbra is <em>not</em> “only” a plain SPL transfer to <code>payTo</code>: the{" "}
          <code>extra.settlement</code> field is <code>umbra-receiver-claimable-utxo</code>,
          and <code>extra</code> includes <code>humanPayUrl</code>, <code>confirmUrl</code>,
          and SDK docs so implementers route funds through the Umbra proof flow.
        </p>
      </DocSection>

      <DocSection title="Agent client">
        <p>
          The same intent id backs <code>GET /api/resources/&lt;id&gt;</code>. While the
          intent is open, the response is <strong>402</strong> with JSON shaped like common
          x402 examples, plus an <code>extra</code> block that names Umbra as the settlement
          mechanism. After the payer (human or script) completes Umbra and the app records
          settlement signatures via{" "}
          <code>POST /api/intents/&lt;id&gt;/confirm</code>, the same GET returns{" "}
          <strong>200</strong> with machine-readable <code>content</code> (see{" "}
          <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>).
        </p>
        <p className="text-faint">
          API tables and scripts:{" "}
          <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>.
        </p>
      </DocSection>

      <DocSection title="Lifecycle checklist">
        <ol className="list-inside list-decimal space-y-2 text-muted">
          <li>Create intent → copy human pay URL + agent resource URL.</li>
          <li>Human or agent settles via Umbra SDK; client POSTs signatures to confirm.</li>
          <li>Resource GET flips from 402 to 200. One id feeds CRM, webhooks, and ledgers.</li>
        </ol>
      </DocSection>

      <DocFooterNav>
        <DocNavLink href="/settlement">Settlement &amp; Umbra</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/demo">Demo center</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>
      </DocFooterNav>
    </ContentPageShell>
  );
}
