"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/** Standard vertical rhythm for marketing / docs routes. */
export function ContentPageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-8 pb-4">{children}</div>;
}

type DocHeroProps = {
  eyebrow: string;
  eyebrowTone?: "brand" | "teal";
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
};

export function DocHero({
  eyebrow,
  eyebrowTone = "brand",
  title,
  description,
  actions,
}: DocHeroProps) {
  const tone = eyebrowTone === "teal" ? "text-teal" : "text-brand";
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-panel px-5 py-5 shadow-sm ring-1 ring-ink/[0.02] sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgb(12_92_86/0.08),transparent_60%)]"
      />
      <div className="relative min-w-0 flex-1 space-y-2">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${tone}`}>
          {eyebrow}
        </p>
        <div className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</div>
        <div className="max-w-2xl text-sm leading-relaxed text-muted sm:text-[0.95rem]">
          {description}
        </div>
      </div>
      {actions ? (
        <div className="relative flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {actions}
        </div>
      ) : null}
    </motion.header>
  );
}

type DocSectionProps = {
  title: string;
  id?: string;
  children: ReactNode;
};

export function DocSection({ title, id, children }: DocSectionProps) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-line bg-panel p-5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.02] sm:p-6"
    >
      <h2 className="text-base font-semibold tracking-tight text-ink sm:text-lg">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted [&_code]:rounded [&_code]:border [&_code]:border-line/80 [&_code]:bg-canvas [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[11px] [&_code]:text-ink sm:[&_code]:text-xs [&_dl]:space-y-4 [&_strong]:font-semibold [&_strong]:text-ink [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:space-y-2 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

export function DocFooterNav({ children }: { children: ReactNode }) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-line pt-6 text-sm text-muted"
      aria-label="Related pages"
    >
      {children}
    </nav>
  );
}

export function DocNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-teal transition hover:text-teal-hover hover:underline hover:underline-offset-2"
    >
      {children}
    </Link>
  );
}
