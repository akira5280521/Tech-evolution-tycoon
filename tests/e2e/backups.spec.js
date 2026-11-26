// Rolling save backups: a backup taken before a restore can be put back.
import { test, expect } from "@playwright/test";
import { expectClean, open, saved } from "./helpers.js";

test("a listed auto backup restores over the current save", async ({ page }) => {
  const old = { version: 12, cash: 777, lifetime: 4242, investors: 3, lastSeen: Date.now(), restartSeen: true, sawPit: true, biz: [{ owned: 5 }], tutorial: { seen: [], tips: [], tipsOff: true, done: true } };
  const seen = await open(page, "/more#settings", "mid", {
    extra: { "pc-tycoon-save-backups-v1": JSON.stringify([{ at: Date.now() - 60_000, lifetime: 4242, investors: 3, eras: 1, data: old }]) },
  });
  const box = page.locator("[data-save-backups]");
  await box.scrollIntoViewIfNeeded();
  await expect(box.locator("[data-backup]")).toHaveCount(1);
  await box.locator("[data-backup-restore]").click();
  await box.locator("[data-backup-confirm]").click();
  await expect.poll(async () => (await saved(page))?.lifetime).toBe(4242);
  // The save it replaced was kept as a new backup.
  await expect(box.locator("[data-backup]")).toHaveCount(2);
  expectClean(seen);
});
