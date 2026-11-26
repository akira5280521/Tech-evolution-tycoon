import { test } from "node:test";
import assert from "node:assert/strict";
import { BACKUP_EVERY_MS, BACKUP_MAX, nextBackups } from "../../src/lib/saveBackups.js";

const save = (n) => ({ lifetime: n, investors: n, biz: [{ owned: 1 }, { owned: n > 1 ? 1 : 0 }] });

test("backups keep the newest 3, at most one every 10 minutes", () => {
  let list = [];
  list = nextBackups(list, save(1), 0);
  assert.equal(list.length, 1);
  assert.equal(nextBackups(list, save(2), BACKUP_EVERY_MS - 1), list, "too soon: unchanged");
  for (let i = 1; i <= 4; i++) list = nextBackups(list, save(i + 1), i * BACKUP_EVERY_MS);
  assert.equal(list.length, BACKUP_MAX);
  assert.deepEqual(list.map((b) => b.lifetime), [5, 4, 3]);
  assert.equal(list[0].eras, 2);
});

test("a forced backup (before restore or reset) ignores the gap", () => {
  const list = nextBackups([], save(1), 0);
  assert.equal(nextBackups(list, save(2), 1000, true).length, 2);
});
