"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STATS = [
  {
    label: "SDK call path",
    value: "Real",
    helper: "Public USDC → receiver-claimable UTXO",
  },
  {
    label: "Agent contract",
    value: "x402",
    helper: "402 + accepts[] · 200 + content",
  },
  {
    label: "REST routes",
    value: "4",
    helper: "intents · resources · confirm · OpenAPI",
  },
  {
    label: "Test layers",
    value: "Vitest + Playwright",
    helper: "Unit + e2e on every PR",
  },
];

const ACTIONS = [
  { href: "/playground", label: "Try the API" },
  { href: "/demo", label: "Demo center" },
  { href: "/demo/developer", label: "Platform sim" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/reference", label: "Reference" },
];

export function HomeStatsBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4 border-t border-line pt-5"
      aria-label="At a glance"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-teal">
            <span
              aria-hidden
              className="umbra-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-teal"
            />
            Superteam Frontier · Umbra Side Track
          </p>
          <p className="max-w-2xl text-xs leading-snug text-muted sm:text-sm">
            <span className="font-medium text-ink">Private pay link</span> plus the same
            bill for machines as an HTTP 402 resource until Umbra settlement, then{" "}
            <span className="font-medium text-ink">200 with structured content</span>.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {ACTIONS.map((a, i) => (
            <Link
              key={a.href}
              href={a.href}
              className={[
                "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                i === 0
                  ? "border border-teal-muted bg-teal-soft text-teal hover:bg-teal-soft/70"
                  : "border border-line bg-canvas text-ink hover:border-teal/40 hover:text-teal",
              ].join(" ")}
            >
              {a.label} →
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
            className="rounded-xl border border-line bg-panel px-3 py-3 shadow-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              {s.label}
            </p>
            <p className="mt-1 text-base font-bold tracking-tight text-ink">
              {s.value}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted">{s.helper}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
