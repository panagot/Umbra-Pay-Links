import type { Metadata } from "next";
import Link from "next/link";
import { ApiPlayground } from "@/components/playground/api-playground";
import {
  ContentPageShell,
  DocFooterNav,
  DocHero,
  DocNavLink,
} from "@/components/ui/content-page";

export const metadata: Metadata = {
  title: "API playground · Umbra Pay Links",
  description:
    "Live REST playground hitting the real /api/intents and /api/resources routes. Walk create → 402 → confirm → 200 in one click.",
};

export default function PlaygroundPage() {
  return (
    <ContentPageShell>
      <DocHero
        eyebrow="Playground"
        eyebrowTone="teal"
        title="API playground"
        description={
          <>
            Hit this app’s real REST routes from the browser. Use{" "}
            <strong className="text-ink">Run all</strong> for a one-click walkthrough of{" "}
            <code className="text-ink">create → 402 → confirm → 200</code>, or step through
            each request manually. Same contract as{" "}
            <Link href="/openapi.json" className="font-medium text-teal hover:underline">
              /openapi.json
            </Link>
            .
          </>
        }
      />
      <ApiPlayground />
      <DocFooterNav>
        <DocNavLink href="/agents">Agents &amp; APIs</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/demo/developer">Platform sim</DocNavLink>
        <span className="text-line-strong" aria-hidden>
          ·
        </span>
        <DocNavLink href="/reference">Reference</DocNavLink>
      </DocFooterNav>
    </ContentPageShell>
  );
}
