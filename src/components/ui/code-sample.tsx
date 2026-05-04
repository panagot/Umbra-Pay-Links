"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";

export type CodeSample = {
  id: string;
  label: string;
  language: string;
  code: string;
};

type CodeSampleTabsProps = {
  samples: CodeSample[];
  className?: string;
  /** Show a small caption above the tabs. */
  caption?: string;
};

/**
 * Tabbed code sample panel with copy-to-clipboard. Pure presentation:
 * no syntax highlighting (keeps bundle slim and renders the same offline).
 */
export function CodeSampleTabs({
  samples,
  className,
  caption,
}: CodeSampleTabsProps) {
  const [active, setActive] = useState(samples[0]?.id ?? "");
  const current = samples.find((s) => s.id === active) ?? samples[0];
  if (!current) return null;

  return (
    <div
      className={[
        "overflow-hidden rounded-xl border border-line bg-canvas/95 shadow-inner",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/80 bg-panel/60 px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {samples.map((s) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={[
                  "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition",
                  on
                    ? "bg-teal-soft text-teal ring-1 ring-teal/25"
                    : "text-muted hover:text-ink",
                ].join(" ")}
                aria-pressed={on}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {caption ? (
            <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
              {caption}
            </span>
          ) : null}
          <CopyButton text={current.code} label="Copy" copiedLabel="Copied" />
        </div>
      </div>
      <pre className="max-h-72 overflow-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-ink sm:text-xs">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
