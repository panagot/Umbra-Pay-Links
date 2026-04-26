"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV = [
  {
    href: "/",
    label: "Create link",
    description: "Private pay + agent URL",
    icon: "create",
  },
  {
    href: "/demo",
    label: "Demo center",
    description: "Recordable walkthrough",
    icon: "demo",
  },
  {
    href: "/how-it-works",
    label: "How it works",
    description: "Privacy · x402 · lifecycle",
    icon: "guide",
  },
  {
    href: "/settlement",
    label: "Settlement",
    description: "SDK calls on Umbra",
    icon: "shield",
  },
  {
    href: "/agents",
    label: "Agents & APIs",
    description: "402 resource · OpenAPI",
    icon: "agent",
  },
  {
    href: "/reference",
    label: "Reference",
    description: "Links · codebase map",
    icon: "judge",
  },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "create":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5v14M5 12h14" {...stroke} />
        </svg>
      );
    case "guide":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...stroke} />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
            {...stroke}
          />
        </svg>
      );
    case "shield":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...stroke} />
        </svg>
      );
    case "agent":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 8V4H8M8 8h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2h-4M8 8H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"
            {...stroke}
          />
          <circle cx="9" cy="15" r="1" fill="currentColor" />
          <circle cx="15" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case "judge":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M9 12h6m-6 4h6M9 8h2m4 0h2M7 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z"
            {...stroke}
          />
        </svg>
      );
    case "demo":
    default:
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden>
          <path d="M4 6h16M4 12h10M4 18h14" {...stroke} />
        </svg>
      );
  }
}

function navIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const demoWide =
    pathname === "/demo" || pathname.startsWith("/demo/");
  const mainMaxW = demoWide ? "max-w-6xl" : "max-w-4xl";
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  const linkClass = (href: string) => {
    const active = navIsActive(pathname, href);
    return [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      active
        ? "bg-teal-soft text-teal shadow-sm ring-1 ring-teal/25"
        : "text-muted hover:bg-surface hover:text-ink",
    ].join(" ");
  };

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="App">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            onClick={closeMobile}
          >
            <span className="text-faint" aria-hidden>
              <NavIcon name={item.icon} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span>{item.label}</span>
              <span className="truncate text-xs font-normal text-faint">
                {item.description}
              </span>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-panel/85 backdrop-blur-md">
        <div className="flex h-[3.25rem] items-center gap-3 px-4 lg:px-0">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted hover:border-line-strong hover:bg-panel lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            {mobileOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:pl-6">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight text-ink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-surface text-sm font-bold text-brand shadow-[var(--shadow-card)]">
                U
              </span>
              <span className="truncate">
                Umbra Pay{" "}
                <span className="hidden font-normal text-muted sm:inline">
                  Links
                </span>
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 pr-4 lg:pr-6">
            <span className="hidden rounded-full border border-line bg-teal-soft/60 px-2.5 py-1 font-mono text-[10px] text-teal sm:inline">
              Umbra privacy layer · x402-ready
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-sidebar lg:flex">
          {sidebar}
        </aside>

        {mobileOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-ink/25 lg:hidden"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <div
              id="mobile-drawer"
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-sidebar shadow-[var(--shadow-card)] lg:hidden"
            >
              <div className="flex h-[3.25rem] shrink-0 items-center border-b border-line px-4 text-sm font-semibold text-ink">
                Menu
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{sidebar}</div>
            </div>
          </>
        ) : null}

        <main className="relative flex-1 overflow-x-hidden bg-surface">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(12_92_86/0.04),transparent_55%)]"
            aria-hidden
          />
          <div
            className={`relative mx-auto min-h-[calc(100vh-3.25rem-8rem)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10 ${mainMaxW}`}
          >
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-md space-y-2">
            <p className="text-sm font-semibold text-ink">Umbra Private Pay Links</p>
            <p className="text-xs leading-relaxed text-muted">
              Financial privacy on Solana: one intent, Umbra SDK settlement, and an HTTP 402
              surface for people and agents. Built for the Umbra Side Track (Superteam
              Frontier).
            </p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-xs text-muted">
            <div className="space-y-2">
              <p className="font-medium text-ink">In this app</p>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/" className="hover:text-teal">
                    Create link
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-teal">
                    Demo center
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-teal">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/settlement" className="hover:text-teal">
                    Settlement
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="hover:text-teal">
                    Agents &amp; APIs
                  </Link>
                </li>
                <li>
                  <Link href="/reference" className="hover:text-teal">
                    Reference
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-ink">External</p>
              <ul className="space-y-1.5">
                <li>
                  <a
                    className="hover:text-teal"
                    href="https://superteam.fun/earn/listing/umbra-side-track"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Superteam listing
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-teal"
                    href="https://github.com/panagot/Umbra-Pay-Links"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub repo
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-teal"
                    href="https://github.com/panagot/Umbra-Pay-Links/blob/main/docs/SUBMISSION.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Submission checklist
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-teal"
                    href="https://sdk.umbraprivacy.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Umbra SDK
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-teal"
                    href="https://umbraprivacy.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Umbra
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-teal"
                    href="https://docs.g402.ai/docs/api/response-format"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    x402 response format
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-line py-3.5 text-center text-[11px] text-faint">
          Umbra: move value on Solana without broadcasting your financial life
        </div>
      </footer>
    </div>
  );
}
