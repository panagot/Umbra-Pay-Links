import type { Metadata } from "next";
import { Agent402Simulation } from "@/components/demo/agent-402-simulation";
import { DEMO_ANCHORS } from "@/components/demo/demo-anchors";
import { DemoCheckoutProvider } from "@/components/demo/demo-checkout-sync";
import { PcStoreDemo } from "@/components/demo/pc-store-demo";
import { DocHero } from "@/components/ui/content-page";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo center · Umbra Pay Links",
  description:
    "In-browser simulations: retail-style checkout and the HTTP 402 resource timeline without a wallet or RPC.",
};

export default function DemoPage() {
  return (
    <DemoCheckoutProvider>
      <div className="space-y-4 pb-6">
        <DocHero
          eyebrow="Interactive"
          eyebrowTone="teal"
          title="Demo center"
          description={
            <>
              Simulations run entirely in the browser (no wallet, no RPC). For the live
              flow,{" "}
              <Link href="/" className="font-medium text-teal hover:underline">
                create an intent
              </Link>{" "}
              on the home page, then use <code className="text-ink">/pay/&lt;id&gt;</code> and{" "}
              <code className="text-ink">/api/resources/&lt;id&gt;</code> as documented on{" "}
              <Link href="/how-it-works" className="font-medium text-teal hover:underline">
                How it works
              </Link>
              .
            </>
          }
        />
        <div className="space-y-4">
          <section id={DEMO_ANCHORS.retail} className="scroll-mt-24">
            <PcStoreDemo />
          </section>

          <Agent402Simulation />
        </div>

        <p className="text-center text-[11px] text-faint">
          Further detail:{" "}
          <Link href="/how-it-works" className="text-teal underline-offset-2 hover:underline">
            How it works
          </Link>
          {" · "}
          <Link href="/agents" className="text-teal underline-offset-2 hover:underline">
            Agents &amp; APIs
          </Link>
          {" · "}
          <Link href="/reference" className="text-teal underline-offset-2 hover:underline">
            Reference
          </Link>
          .
        </p>
      </div>
    </DemoCheckoutProvider>
  );
}
