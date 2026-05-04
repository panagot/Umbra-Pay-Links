"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FieldLabel } from "@/components/app/field-label";
import { CodeSampleTabs, type CodeSample } from "@/components/ui/code-sample";
import { CopyButton } from "@/components/ui/copy-button";
import { InfoTip } from "@/components/ui/tooltip";

/** Loose Solana base58 sanity check; server still authoritative via @solana/kit. */
function looksLikeSolanaAddress(value: string): boolean {
  const v = value.trim();
  if (v.length < 32 || v.length > 44) return false;
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(v);
}

function looksLikeUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function buildCodeSamples(opts: {
  payUrl: string;
  agentResourceUrl: string;
  intentId: string;
}): CodeSample[] {
  const { payUrl, agentResourceUrl, intentId } = opts;
  const fetchSnippet = `// Poll the gated resource (402 until paid, then 200)
const res = await fetch(${JSON.stringify(agentResourceUrl)});
if (res.status === 402) {
  const required = await res.json();
  // required.accepts[0].extra.settlement === "umbra-receiver-claimable-utxo"
  // Drive the Umbra SDK to settle, then POST signatures to the confirm URL.
}
if (res.status === 200) {
  const unlocked = await res.json();
  console.log(unlocked.content); // structured payload
}`;

  const curlSnippet = `# 1. Try the resource (returns 402 with x402 JSON until settled)
curl -i ${agentResourceUrl}

# 2. Pay through Umbra (browser): open the human pay link
open ${payUrl}

# 3. Once settled, the same GET returns 200 with content
curl -s ${agentResourceUrl} | jq .content`;

  const agentSnippet = `# Headless agent — same Umbra path as the browser
INTENT_ID=${intentId} \\
RESOURCE_URL=${agentResourceUrl} \\
KEYPAIR=./agent-keypair.json \\
npm run agent:pay`;

  return [
    { id: "fetch", label: "fetch (JS)", language: "ts", code: fetchSnippet },
    { id: "curl", label: "curl", language: "bash", code: curlSnippet },
    { id: "agent", label: "agent:pay", language: "bash", code: agentSnippet },
  ];
}

export function CreateIntentForm() {
  const [label, setLabel] = useState("Coffee");
  const [amountUsdc, setAmountUsdc] = useState("1");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    payUrl: string;
    agentResourceUrl: string;
    intentId: string;
  } | null>(null);

  const merchantInvalid =
    merchantAddress.trim().length > 0 && !looksLikeSolanaAddress(merchantAddress);
  const webhookInvalid = !looksLikeUrl(webhookUrl);
  const amountInvalid =
    amountUsdc.trim().length > 0 &&
    !/^\d+(\.\d+)?$/.test(amountUsdc.trim());

  const formInvalid =
    !label.trim() ||
    !amountUsdc.trim() ||
    !merchantAddress.trim() ||
    merchantInvalid ||
    webhookInvalid ||
    amountInvalid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formInvalid) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          amountUsdc,
          merchantAddress,
          ...(webhookUrl.trim() ? { webhookUrl: webhookUrl.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? res.statusText);
      }
      const next = {
        payUrl: data.payUrl as string,
        agentResourceUrl: data.agentResourceUrl as string,
        intentId: (data.intent?.id as string) ?? "",
      };
      setResult(next);
      toast.success("Payment intent created", {
        description: "Both URLs ready: human checkout + agent 402 resource.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error("Could not create intent", { description: msg });
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-2 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-teal-muted focus:ring-2 focus:ring-teal-soft";

  const samples = useMemo(
    () => (result ? buildCodeSamples(result) : []),
    [result],
  );

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-panel p-6 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.02] sm:p-8"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">New payment intent</h1>
          <p className="mt-1 text-sm text-muted">
            One record: human checkout URL and machine resource URL.
          </p>
        </div>
        <InfoTip
          label="What is an intent?"
          content={
            <>
              Server-side row: label, USDC amount, mint, merchant recipient, status.
              Public links use an opaque id, not the merchant address in the path.
            </>
          }
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="intent-label"
          label="Label"
          tip="Shown on checkout — invoice title, product, or campaign name."
        />
        <input
          id="intent-label"
          className={input}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
      </div>
      <div>
        <FieldLabel
          htmlFor="intent-amount"
          label="Amount (USDC)"
          tip="Decimal USDC. Stored in smallest units (6 decimals) for SPL."
        />
        <input
          id="intent-amount"
          type="text"
          inputMode="decimal"
          aria-invalid={amountInvalid}
          className={`${input} ${amountInvalid ? "border-danger/60 focus:ring-danger-soft" : ""}`}
          value={amountUsdc}
          onChange={(e) => setAmountUsdc(e.target.value)}
          required
        />
        {amountInvalid ? (
          <p className="mt-1.5 text-xs text-danger">
            Use a decimal number (e.g. <code>1</code>, <code>0.5</code>, <code>49.99</code>).
          </p>
        ) : null}
      </div>
      <div>
        <FieldLabel
          htmlFor="intent-merchant"
          label="Merchant Solana address"
          tip="Wallet that receives the Umbra receiver-claimable UTXO. Must be Umbra-ready to claim."
        />
        <input
          id="intent-merchant"
          aria-invalid={merchantInvalid}
          className={`${input} font-mono text-xs ${
            merchantInvalid ? "border-danger/60 focus:ring-danger-soft" : ""
          }`}
          placeholder="Base58 public key (32–44 chars)"
          value={merchantAddress}
          onChange={(e) => setMerchantAddress(e.target.value)}
          required
        />
        {merchantInvalid ? (
          <p className="mt-1.5 text-xs text-danger">
            Doesn’t look like a base58 Solana address — server will reject with 400.
          </p>
        ) : null}
      </div>
      <div>
        <FieldLabel
          htmlFor="intent-webhook"
          label="Webhook URL (optional)"
          tip="https URL — server POSTs JSON intent.settled once after first successful confirm. Leave empty to skip."
        />
        <input
          id="intent-webhook"
          type="url"
          aria-invalid={webhookInvalid}
          className={`${input} font-mono text-xs ${
            webhookInvalid ? "border-danger/60 focus:ring-danger-soft" : ""
          }`}
          placeholder="https://your-server.example/hooks/umbra"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-faint">
          Must be <code className="text-muted">http:</code> or{" "}
          <code className="text-muted">https:</code>. Invalid URLs are rejected with 400.
        </p>
      </div>
      <button
        type="submit"
        disabled={busy || formInvalid}
        className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-panel shadow-[var(--shadow-card)] transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-panel/40 border-t-panel" />
            Creating private payment link…
          </span>
        ) : (
          "Create private payment link"
        )}
      </button>
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-soft/60 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-4 rounded-xl border border-teal-muted/50 bg-teal-soft/40 p-4 text-sm"
        >
          <div>
            <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
              <span className="flex items-center gap-2">
                Human pay link
                <InfoTip
                  label="Human pay link"
                  content="For people: open in a browser, connect wallet, run Umbra checkout."
                />
              </span>
              <CopyButton text={result.payUrl} label="Copy URL" />
            </span>
            <a
              href={result.payUrl}
              className="mt-2 block break-all rounded-lg border border-line/60 bg-panel px-3 py-2 font-mono text-xs text-teal hover:border-teal-muted"
            >
              {result.payUrl}
            </a>
          </div>
          <div>
            <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-teal">
              <span className="flex items-center gap-2">
                Agent resource (402)
                <InfoTip
                  label="Agent resource URL"
                  content="Automation GETs this. 402 + requirements until settled, then 200 + payload."
                />
              </span>
              <CopyButton text={result.agentResourceUrl} label="Copy URL" />
            </span>
            <code className="mt-2 block break-all rounded-lg border border-line/60 bg-panel px-3 py-2 font-mono text-[11px] text-ink">
              {result.agentResourceUrl}
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">
              Drop-in code
            </p>
            <CodeSampleTabs samples={samples} caption="Use the agent URL" />
          </div>
        </motion.div>
      ) : null}
    </form>
  );
}
