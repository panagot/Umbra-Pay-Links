import type { Metadata } from "next";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
  DocSection,
} from "@/components/ui/content-page";

const REPO = "https://github.com/panagot/Umbra-Pay-Links";
const LIVE = "https://umbra-pay-links.vercel.app/";
const TRACK = "https://superteam.fun/earn/listing/umbra-side-track";
const SUBMISSION_MD = `${REPO}/blob/main/docs/SUBMISSION.md`;

export const metadata: Metadata = {
  title: "Reference · Umbra Pay Links",
  description:
    "Links, product summary, and primary source files for Umbra SDK integration and the HTTP 402 resource API.",
};

export default function ReferencePage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Reference"
        eyebrowTone="teal"
        title="Technical summary"
        description="Consolidated links and entry points into the codebase for Umbra settlement, the gated resource API, and related documentation."
      />

      <DocSection title="Links">
        <ul className="list-inside list-disc space-y-1.5 text-sm text-muted">
          <li>
            <a className="font-medium text-teal hover:underline" href={LIVE}>
              Live app
            </a>{" "}
            (create an intent, pay, poll the resource URL)
          </li>
          <li>
            <a className="font-medium text-teal hover:underline" href={REPO}>
              Source on GitHub
            </a>{" "}
            (README, OpenAPI, tests, <code className="text-ink">scripts/agent-pay.mjs</code>)
          </li>
          <li>
            <a className="font-medium text-teal hover:underline" href={TRACK}>
              Superteam Earn listing
            </a>
          </li>
          <li>
            <a className="font-medium text-teal hover:underline" href={SUBMISSION_MD}>
              docs/SUBMISSION.md (repository)
            </a>
          </li>
        </ul>
      </DocSection>

      <DocSection title="What we ship (product)">
        <ol className="list-inside list-decimal space-y-2 text-sm text-muted">
          <li>
            <strong className="text-ink">Human pay link</strong>{" "}
            <code className="text-ink">/pay/&lt;opaque-id&gt;</code>: Wallet Standard + Umbra
            SDK checkout.
          </li>
          <li>
            <strong className="text-ink">Agent resource</strong>{" "}
            <code className="text-ink">GET /api/resources/&lt;id&gt;</code>: HTTP{" "}
            <strong>402</strong> with x402-shaped JSON until settled, then{" "}
            <strong>200</strong> with a structured <code>content</code> payload (see{" "}
            <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>).
          </li>
          <li>
            <strong className="text-ink">No mock settlement</strong>: value move is the
            Umbra receiver-claimable UTXO path from public USDC, same in browser and headless
            script.
          </li>
        </ol>
      </DocSection>

      <DocSection title="Where to verify Umbra (code)">
        <dl className="space-y-3 text-sm text-muted">
          <div>
            <dt className="font-mono text-xs font-semibold text-teal">
              src/components/pay-with-umbra.tsx
            </dt>
            <dd className="mt-1">
              Browser: <code>getUmbraClient</code>, optional registration,{" "}
              <code>getPublicBalanceToReceiverClaimableUtxoCreatorFunction</code> + web ZK
              prover.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-teal">scripts/agent-pay.mjs</dt>
            <dd className="mt-1">
              Headless parity: same pipeline, <code>createSignerFromPrivateKeyBytes</code>.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-semibold text-teal">
              src/app/api/resources/[id]/route.ts
            </dt>
            <dd className="mt-1">
              402 body sets <code>extra.settlement: umbra-receiver-claimable-utxo</code> so
              clients do not treat <code>payTo</code> as a raw public SPL instruction.
            </dd>
          </div>
        </dl>
      </DocSection>

      <DocFooterNav>
        <DocNavLink href="/">Create link</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/demo">Demo center</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/how-it-works">How it works</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/settlement">Settlement</DocNavLink>
      </DocFooterNav>
    </ContentPageShell>
  );
}
