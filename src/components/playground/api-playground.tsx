"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/ui/copy-button";

const TEST_MERCHANT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

type Method = "GET" | "POST";

type RecipeId = "create" | "resource" | "confirm";

type Recipe = {
  id: RecipeId;
  label: string;
  method: Method;
  /** Path with optional `{id}` placeholder. */
  path: string;
  /** When method = POST, JSON body editor seeded with this. */
  defaultBody?: string;
  helpText: string;
};

const RECIPES: Recipe[] = [
  {
    id: "create",
    label: "1 · Create intent",
    method: "POST",
    path: "/api/intents",
    defaultBody: JSON.stringify(
      {
        label: "Playground intent",
        amountUsdc: "0.5",
        merchantAddress: TEST_MERCHANT,
      },
      null,
      2,
    ),
    helpText:
      "Stores an intent and returns the human pay URL plus the agent resource URL.",
  },
  {
    id: "resource",
    label: "2 · GET resource",
    method: "GET",
    path: "/api/resources/{id}",
    helpText:
      "402 + x402-shaped JSON until the intent is marked settled. After confirm, returns 200 with a structured `content` payload.",
  },
  {
    id: "confirm",
    label: "3 · Confirm (signatures)",
    method: "POST",
    path: "/api/intents/{id}/confirm",
    defaultBody: JSON.stringify({ signatures: ["playground-mock-sig"] }, null, 2),
    helpText:
      "In production this is set after Umbra UTXO creation succeeds. With REQUIRE_ONCHAIN_CONFIRM_FOR_SETTLE off (dev), placeholders are accepted to walk the flow.",
  },
];

type ResponseSlot = {
  status: number;
  ok: boolean;
  ms: number;
  headers: [string, string][];
  body: string;
};

function statusTone(status: number): {
  tone: "ok" | "wait" | "fail";
  label: string;
} {
  if (status === 200) return { tone: "ok", label: "200 OK" };
  if (status === 402) return { tone: "wait", label: "402 Payment Required" };
  if (status >= 200 && status < 300) return { tone: "ok", label: `${status} OK` };
  return { tone: "fail", label: `${status}` };
}

function StatusPill({ status }: { status: number }) {
  const { tone, label } = statusTone(status);
  const cls =
    tone === "ok"
      ? "border-teal-muted/50 bg-teal-soft text-teal"
      : tone === "wait"
        ? "border-brand/40 bg-brand-soft text-brand"
        : "border-danger/40 bg-danger-soft text-danger";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${cls}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "ok"
            ? "bg-teal"
            : tone === "wait"
              ? "bg-brand"
              : "bg-danger"
        }`}
      />
      {label}
    </span>
  );
}

function tryFormatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function ApiPlayground() {
  const [active, setActive] = useState<RecipeId>("create");
  const [intentId, setIntentId] = useState<string>("");
  const [bodies, setBodies] = useState<Record<RecipeId, string>>(() => {
    const out: Record<RecipeId, string> = {
      create: RECIPES[0].defaultBody ?? "",
      resource: "",
      confirm: RECIPES[2].defaultBody ?? "",
    };
    return out;
  });
  const [responses, setResponses] = useState<Record<RecipeId, ResponseSlot | null>>({
    create: null,
    resource: null,
    confirm: null,
  });
  const [busy, setBusy] = useState<RecipeId | "sequence" | null>(null);

  const recipe = useMemo(
    () => RECIPES.find((r) => r.id === active)!,
    [active],
  );

  const resolvedPath = useMemo(() => {
    return recipe.path.replace("{id}", intentId || "<intentId>");
  }, [recipe.path, intentId]);

  const runRecipe = useCallback(
    async (id: RecipeId): Promise<ResponseSlot | null> => {
      const r = RECIPES.find((x) => x.id === id)!;
      const url = r.path.replace("{id}", intentId);
      if (id !== "create" && !intentId) {
        toast.error("Run step 1 first or paste an intent id");
        return null;
      }
      setBusy(id);
      const t0 = performance.now();
      try {
        const init: RequestInit = { method: r.method };
        if (r.method === "POST") {
          init.headers = { "Content-Type": "application/json" };
          init.body = bodies[id] ?? "{}";
        }
        const res = await fetch(url, init);
        const ms = Math.max(1, Math.round(performance.now() - t0));
        const text = await res.text();
        const formatted = tryFormatJson(text);
        const headers: [string, string][] = [];
        res.headers.forEach((v, k) => headers.push([k, v]));
        const slot: ResponseSlot = {
          status: res.status,
          ok: res.ok,
          ms,
          headers,
          body: formatted,
        };
        setResponses((prev) => ({ ...prev, [id]: slot }));

        if (id === "create" && res.ok) {
          try {
            const json = JSON.parse(text) as { intent?: { id?: string } };
            const newId = json.intent?.id ?? "";
            if (newId) {
              setIntentId(newId);
              toast.success("Intent created", {
                description: "Resource and confirm steps now resolve to this id.",
              });
            }
          } catch {
            /* ignore */
          }
        } else if (id === "resource") {
          if (res.status === 402)
            toast.message("402 Payment Required", {
              description: "x402-shaped body. Run confirm to flip to 200.",
            });
          if (res.status === 200)
            toast.success("200 OK", {
              description: "Unlocked content payload.",
            });
        } else if (id === "confirm" && res.ok) {
          toast.success("Confirmed", { description: "Resource will now return 200." });
        } else if (!res.ok) {
          toast.error(`${res.status} ${res.statusText || "Error"}`);
        }
        return slot;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error("Network error", { description: msg });
        return null;
      } finally {
        setBusy(null);
      }
    },
    [bodies, intentId],
  );

  const runSequence = useCallback(async () => {
    setBusy("sequence");
    setResponses({ create: null, resource: null, confirm: null });
    const created = await runRecipe("create");
    if (!created || !created.ok) {
      setBusy(null);
      return;
    }
    let newId = "";
    try {
      const j = JSON.parse(created.body) as { intent?: { id?: string } };
      newId = j.intent?.id ?? "";
    } catch {
      /* ignore */
    }
    if (!newId) {
      setBusy(null);
      return;
    }
    setIntentId(newId);
    await new Promise((r) => setTimeout(r, 300));
    setActive("resource");
    await runRecipe("resource");
    await new Promise((r) => setTimeout(r, 300));
    setActive("confirm");
    await runRecipe("confirm");
    await new Promise((r) => setTimeout(r, 300));
    setActive("resource");
    await runRecipe("resource");
    setBusy(null);
  }, [runRecipe]);

  const currentResponse = responses[active];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-4 shadow-sm sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal">
            Live · same origin
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-xl">
            API playground
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-muted sm:text-sm">
            Calls hit this app’s real REST routes. Use{" "}
            <strong className="text-ink">Run all</strong> to walk{" "}
            <span className="font-mono text-[11px] text-teal">create → 402 → confirm → 200</span>{" "}
            in one click.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runSequence()}
          disabled={busy !== null}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "sequence" ? "Running flow…" : "Run all (create → 402 → confirm → 200)"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,_22rem)_minmax(0,_1fr)]">
        <div className="space-y-3 rounded-2xl border border-line bg-panel p-4 shadow-sm">
          <div className="flex flex-wrap gap-1.5">
            {RECIPES.map((r) => {
              const on = r.id === active;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActive(r.id)}
                  className={[
                    "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition",
                    on
                      ? "bg-teal-soft text-teal ring-1 ring-teal/25"
                      : "text-muted hover:text-ink",
                  ].join(" ")}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-line bg-canvas/80 p-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                  recipe.method === "POST"
                    ? "bg-brand-soft text-brand"
                    : "bg-teal-soft text-teal"
                }`}
              >
                {recipe.method}
              </span>
              <code className="break-all font-mono text-[11px] text-ink">{resolvedPath}</code>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">{recipe.helpText}</p>
          </div>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              Intent id
            </span>
            <input
              value={intentId}
              onChange={(e) => setIntentId(e.target.value)}
              placeholder="run step 1, or paste an existing id"
              className="mt-1.5 w-full rounded-lg border border-line bg-panel px-2.5 py-2 font-mono text-[11px] text-ink outline-none transition focus:border-teal-muted focus:ring-2 focus:ring-teal-soft"
            />
          </label>

          {recipe.method === "POST" ? (
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                Request body
              </span>
              <textarea
                value={bodies[active]}
                onChange={(e) =>
                  setBodies((prev) => ({ ...prev, [active]: e.target.value }))
                }
                rows={recipe.id === "create" ? 8 : 4}
                spellCheck={false}
                className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 font-mono text-[11px] text-ink outline-none transition focus:border-teal-muted focus:ring-2 focus:ring-teal-soft"
              />
            </label>
          ) : null}

          <button
            type="button"
            onClick={() => void runRecipe(active)}
            disabled={busy !== null}
            className="w-full rounded-xl border border-teal-muted bg-teal-soft px-3 py-2 text-sm font-semibold text-teal shadow-sm transition hover:bg-teal-soft/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === active ? "Running…" : `Run ${recipe.method} ${recipe.path}`}
          </button>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                Response
              </span>
              {currentResponse ? <StatusPill status={currentResponse.status} /> : null}
              {currentResponse ? (
                <span className="font-mono text-[11px] text-muted">
                  {currentResponse.ms} ms
                </span>
              ) : null}
            </div>
            {currentResponse ? (
              <CopyButton text={currentResponse.body} label="Copy body" />
            ) : null}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active + (currentResponse?.status ?? "idle")}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-3 space-y-3"
            >
              {currentResponse ? (
                <>
                  <details className="rounded-xl border border-line bg-canvas/70 p-3">
                    <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-faint">
                      Headers ({currentResponse.headers.length})
                    </summary>
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-muted">
                      {currentResponse.headers
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("\n")}
                    </pre>
                  </details>
                  <pre className="max-h-[28rem] overflow-auto rounded-xl border border-line bg-canvas/90 p-4 font-mono text-[11px] leading-relaxed text-ink shadow-inner">
                    {currentResponse.body}
                  </pre>
                </>
              ) : (
                <p className="rounded-xl border border-dashed border-line bg-canvas/50 px-4 py-12 text-center text-sm text-muted">
                  Run a request, or click <strong className="text-ink">Run all</strong> for the
                  full flow.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
