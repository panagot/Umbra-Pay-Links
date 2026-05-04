import Link from "next/link";
import { CreateIntentForm } from "@/components/create-intent-form";
import { HomeStatsBanner } from "@/components/home/home-stats";
import { ContentPageShell } from "@/components/ui/content-page";

export default function Home() {
  return (
    <ContentPageShell>
      <div className="space-y-6">
        <div className="max-w-xl">
          <CreateIntentForm />
        </div>

        <HomeStatsBanner />

        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-xs text-muted"
          aria-label="Docs shortcuts"
        >
          <Link href="/settlement" className="font-medium text-teal hover:underline">
            Settlement
          </Link>
          <Link href="/agents" className="font-medium text-teal hover:underline">
            Agents &amp; APIs
          </Link>
          <Link href="/openapi.json" className="font-medium text-teal hover:underline">
            OpenAPI
          </Link>
        </nav>
      </div>
    </ContentPageShell>
  );
}
