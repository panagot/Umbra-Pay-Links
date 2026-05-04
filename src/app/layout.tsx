import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Umbra Pay Links — private payments for people & agents",
  description:
    "Superteam Frontier / Umbra Side Track: shareable pay links with opaque ids, Umbra SDK receiver-claimable UTXO settlement, and an x402-shaped HTTP 402 resource for agents. OpenAPI, Playwright, and headless payer parity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AppShell>{children}</AppShell>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!rounded-xl !border !border-line !bg-panel !text-ink !shadow-[var(--shadow-card)]",
              title: "!font-semibold",
              description: "!text-muted",
            },
          }}
        />
      </body>
    </html>
  );
}
