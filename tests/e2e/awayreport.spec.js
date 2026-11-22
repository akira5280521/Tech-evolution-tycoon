// Welcome Back says which material ran short while away, and for how long.
import { test, expect } from "@playwright/test";
import { expectClean, open } from "./helpers.js";
import { BUSINESSES } from "../../src/lib/gameConfig.js";

const COUNTS = { timber: 52, paper: 10, loom: 10, punchcards: 10 };
test("23 minutes away with paper running out: the report names paper and the rows that paid less", async ({ page }) => {
  const far = Date.now() + 9e9;
  const save = {
    version: 12, cash: 0, lifetime: 1e6, investors: 0, lastSeen: Date.now() - 23 * 60_000, restartSeen: true, sawPit: true, starterGranted: true, hubSeen: true,
    tutorial: { seen: [], tips: [], tipsOff: true, done: true }, nextWindfallAt: far, nextDilemmaAt: far, nextBubbleAt: far, nextShortageAt: far,
    supply: { wood: 3490, paper: 1361 },
    biz: BUSINESSES.map((b) => ({ id: b.id, owned: COUNTS[b.id] || 0, manager: !!COUNTS[b.id] })),
  };
  const seen = await open(page, "/", save);
  const dialog = page.getByRole("dialog", { name: "Offline earnings" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-offline-short='paper']")).toContainText(/Paper ran short for \d+ min: .*Jacquard Loom.* paid less\./);
  await dialog.locator("[data-offline-collect]").click();
  expectClean(seen);
});
