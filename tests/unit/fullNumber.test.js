import { test } from "node:test";
import assert from "node:assert/strict";
import { fullMoney, fullNumber } from "../../src/lib/fullNumber.js";

test("the full value shows every digit with commas", () => {
  assert.equal(fullNumber(1234567890), "1,234,567,890");
  assert.equal(fullNumber(12.5), "12.50");
  assert.equal(fullNumber(1e21), "1,000,000,000,000,000,000,000");
  assert.equal(fullMoney(-1500), "-$1,500");
  assert.equal(fullNumber(Infinity), "∞");
});
