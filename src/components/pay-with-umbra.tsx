"use client";

import Link from "next/link";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import {
  StandardConnect,
  type StandardConnectMethod,
} from "@wallet-standard/features";
import { getWallets } from "@wallet-standard/app";
import {
  createSignerFromWalletAccount,
  getPublicBalanceToReceiverClaimableUtxoCreatorFunction,
  getUmbraClient,
  getUserRegistrationFunction,
  getUserAccountQuerierFunction,
} from "@umbra-privacy/sdk";
import { address } from "@solana/kit";
import { assertU64 } from "@umbra-privacy/sdk/types";
import { getCreateReceiverClaimableUtxoFromPublicBalanceProver } from "@umbra-privacy/web-zk-prover";
import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import {
  getIndexerUrl,
  getPublicUmbraNetwork,
  getRpcSubscriptionsUrl,
  getRpcUrl,
} from "@/lib/umbra-config";
import { InfoTip } from "@/components/ui/tooltip";

/**
 * Browser checkout: Wallet Standard + Umbra SDK pipeline used here (no substitute path):
 * `createSignerFromWalletAccount` → `getUmbraClient` → `getUserAccountQuerierFunction` /
 * `getUserRegistrationFunction` → `getPublicBalanceToReceiverClaimableUtxoCreatorFunction`
 * with `getCreateReceiverClaimableUtxoFromPublicBalanceProver` (same stack as
 * `scripts/agent-pay.mjs` for headless payers).
 */
export type IntentPayload = {
  id: string;
  label: string;
  amountAtomic: string;
  mint: string;
  merchantAddress: string;
  status: string;
};

function pickSolanaWallet(): Wallet | null {
  const { get } = getWallets();
  return (
    get().find((w) => {
      const keys = Object.keys(w.features);
      return (
        keys.includes("solana:signTransaction") &&
        keys.includes("solana:signMessage") &&
        keys.includes(StandardConnect)
      );
    }) ?? null
  );
}

export function PayWithUmbra({
  intent,
  agentResourceUrl,
}: {
  intent: IntentPayload;
  /** Same intent’s 402 resource; shown after settlement for agent testing. */
  agentResourceUrl?: string;
}) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  /** Checkout progress: 0 none, 1 wallet, 2 Umbra client + registration, 3 UTXO, 4 server confirm. */
  const [payStep, setPayStep] = useState(0);

  const displayStep =
    intent.status === "settled" ? 4 : Math.max(payStep, account ? 1 : 0);
  const pipelineDone = intent.status === "settled" || payStep >= 4;

  const append = useCallback((line: string) => {
    setLog((prev) => [...prev, line]);
  }, []);

  const network = useMemo(() => getPublicUmbraNetwork(), []);

  const connect = useCallback(async () => {
    setError(null);
    const w = pickSolanaWallet();
    if (!w) {
      setError(
        "No Wallet Standard wallet found. Install Phantom (or similar) and refresh.",
      );
      return;
    }
    const connectPort = w.features[
      StandardConnect as keyof typeof w.features
    ] as { connect: StandardConnectMethod } | undefined;
    const connectFn = connectPort?.connect;
    if (!connectFn) {
      setError("Wallet does not support standard:connect");
      return;
    }
    const { accounts } = await connectFn({ silent: false });
    const acc = accounts[0];
    if (!acc) {
      setError("Wallet returned no accounts");
      return;
    }
    setWallet(w);
    setAccount(acc);
    append(`Connected: ${acc.address}`);
  }, [append]);

  const pay = useCallback(async () => {
    if (!wallet || !account) {
      setError("Connect a wallet first");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const signer = createSignerFromWalletAccount(wallet, account);
      setPayStep(1);
      append("Opening Umbra client (you may be prompted to sign the Umbra consent message)…");
      const client = await getUmbraClient({
        signer,
        network,
        rpcUrl: getRpcUrl(),
        rpcSubscriptionsUrl: getRpcSubscriptionsUrl(),
        indexerApiEndpoint: getIndexerUrl(),
        deferMasterSeedSignature: true,
      });

      const fetchUser = getUserAccountQuerierFunction({ client });
      const regStatus = await fetchUser(signer.address);
      if (regStatus.state === "non_existent") {
        append("Registering Umbra identity (on-chain, costs SOL)…");
        const register = getUserRegistrationFunction({ client });
        await register({ confidential: true, anonymous: true });
        append("Registered with Umbra.");
      } else {
        append("Umbra account already exists; skipping registration.");
      }
      setPayStep(2);

      const zkProver = getCreateReceiverClaimableUtxoFromPublicBalanceProver();
      const createUtxo = getPublicBalanceToReceiverClaimableUtxoCreatorFunction(
        { client },
        { zkProver },
      );

      const rawAmount = BigInt(intent.amountAtomic);
      assertU64(rawAmount);
      append(
        `Creating receiver-claimable UTXO to merchant (private settlement)…`,
      );
      const utxoResult = await createUtxo({
        destinationAddress: address(intent.merchantAddress),
        mint: address(intent.mint),
        amount: rawAmount,
      });
      const settlementSignatures = [
        utxoResult.createProofAccountSignature,
        utxoResult.createUtxoSignature,
        ...(utxoResult.closeProofAccountSignature
          ? [utxoResult.closeProofAccountSignature]
          : []),
      ];
      append(
        `UTXO flow submitted. Signatures: ${settlementSignatures.join(", ")}`,
      );
      setPayStep(3);

      const confirmRes = await fetch(`/api/intents/${intent.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatures: settlementSignatures }),
      });
      if (!confirmRes.ok) {
        const j = await confirmRes.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? confirmRes.statusText);
      }
      append("Intent marked settled. Agent can now GET the same resource URL and receive 200.");
      setPayStep(4);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      append(`Error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }, [wallet, account, intent, append, network]);

  const usdc = Number(intent.amountAtomic) / 1_000_000;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-line bg-panel p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line/80 pb-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Due now
            <InfoTip
              label="Amount visibility"
              content="Checkout shows the amount clearly for the payer. On-chain, Umbra separates that UX from what indexers can trivially infer."
            />
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">
            {usdc.toFixed(2)}{" "}
            <span className="text-lg font-medium text-teal">USDC</span>
          </p>
          <p className="mt-1 text-sm text-muted">{intent.label}</p>
        </div>
        {intent.status === "settled" ? (
          <span className="rounded-full border border-teal-muted/60 bg-teal-soft px-3 py-1 text-xs font-medium text-teal">
            Settled
          </span>
        ) : (
          <span className="rounded-full border border-line-strong/80 bg-brand-soft/50 px-3 py-1 text-xs font-medium text-brand">
            Awaiting payment
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line/60 pb-4 text-[11px] text-muted">
        <span className="rounded-full border border-teal-muted/40 bg-teal-soft/50 px-2.5 py-1 font-mono font-semibold uppercase tracking-wide text-teal">
          Umbra · {network}
        </span>
        <span className="text-faint">
          RPC + indexer from app env; proofs via{" "}
          <code className="text-muted">@umbra-privacy/web-zk-prover</code>
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted">
        Settlement uses Umbra&apos;s{" "}
        <span className="inline-flex items-center gap-1 font-medium text-ink">
          receiver-claimable UTXO
          <InfoTip
            label="Receiver-claimable UTXO"
            content={
              <>
                Tokens move into the mixer with a proof tied to the merchant&apos;s
                keys. Claiming can land in an encrypted balance, not a trivial
                public transfer row on an explorer.
              </>
            }
          />
        </span>{" "}
        path from the SDK quickstart.
      </p>

      <ol className="grid gap-2 sm:grid-cols-2" aria-label="Payment progress">
        {(
          [
            { step: 1, label: "Wallet connected" },
            { step: 2, label: "Umbra client & account" },
            { step: 3, label: "Private UTXO on-chain" },
            { step: 4, label: "Server confirmed" },
          ] as const
        ).map(({ step, label }) => {
          const done =
            displayStep > step || (step === 4 && pipelineDone);
          const current = !done && displayStep === step;
          return (
            <li
              key={step}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                done
                  ? "border-teal-muted/60 bg-teal-soft/35 text-teal"
                  : current
                    ? "border-brand/40 bg-brand-soft/40 text-ink"
                    : "border-line/80 bg-canvas/50 text-faint"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  done
                    ? "border-teal bg-teal text-panel"
                    : current
                      ? "border-brand bg-brand text-panel"
                      : "border-line-strong text-muted"
                }`}
                aria-hidden
              >
                {done ? "✓" : step}
              </span>
              <span className="font-medium leading-snug">{label}</span>
            </li>
          );
        })}
      </ol>

      {intent.status === "settled" && agentResourceUrl ? (
        <div className="rounded-xl border border-teal-muted/50 bg-teal-soft/35 p-4 text-sm shadow-sm">
          <p className="font-semibold text-ink">Paid: agent URL returns 200</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Poll or GET once: unlocked JSON payload. Use the same URL you copied at intent
            creation.
          </p>
          <div className="mt-3 flex flex-wrap items-start gap-2">
            <code className="max-h-20 min-w-0 flex-1 overflow-auto break-all rounded-lg border border-line/70 bg-panel px-2 py-1.5 font-mono text-[10px] text-teal">
              {agentResourceUrl}
            </code>
            <CopyButton text={agentResourceUrl} label="Copy" />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-teal">
            <Link href="/agents" className="hover:underline">
              Agents &amp; APIs →
            </Link>
            <Link href="/reference" className="hover:underline">
              Reference →
            </Link>
          </div>
        </div>
      ) : null}

      {!account ? (
        <button
          type="button"
          onClick={() => void connect()}
          disabled={busy}
          className="rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-sm hover:bg-panel disabled:opacity-50"
        >
          Connect Solana wallet
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="truncate font-mono text-xs text-faint">{account.address}</p>
          <button
            type="button"
            onClick={() => void pay()}
            disabled={busy || intent.status === "settled"}
            className="rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-panel shadow-[var(--shadow-card)] hover:bg-teal-hover disabled:opacity-50"
          >
            {intent.status === "settled"
              ? "Already settled"
              : busy
                ? "Working…"
                : "Pay with Umbra"}
          </button>
        </div>
      )}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {log.length > 0 ? (
        <pre className="max-h-52 overflow-auto rounded-xl border border-line bg-canvas/80 p-4 font-mono text-[11px] leading-relaxed text-teal">
          {log.join("\n")}
        </pre>
      ) : null}
    </div>
  );
}
