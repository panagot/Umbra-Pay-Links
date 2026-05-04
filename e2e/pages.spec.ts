import { test, expect } from "@playwright/test";

const staticPaths = [
  "/",
  "/demo",
  "/demo/developer",
  "/how-it-works",
  "/settlement",
  "/agents",
  "/playground",
  "/reference",
] as const;

for (const path of staticPaths) {
  test(`GET ${path} renders (200)`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });
}

test("GET /openapi.json returns OpenAPI document", async ({ request }) => {
  const res = await request.get("/openapi.json");
  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { openapi?: string };
  expect(json.openapi).toMatch(/^3\./);
});

test("GET /favicon.ico returns bytes", async ({ request }) => {
  const res = await request.get("/favicon.ico");
  expect(res.status()).toBe(200);
  expect((await res.body()).byteLength).toBeGreaterThan(0);
});
