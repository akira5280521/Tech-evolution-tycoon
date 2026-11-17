import assert from "node:assert/strict";
import test from "node:test";
import { getCloudState, refreshStatus, resetCloudForTests, setPluginForTests, setStatusTimeoutForTests } from "./cloudSave.js";

// Capacitor's registerPlugin proxy answers every property, including `then`,
// with a native call that never invokes the promise callback.
function thenableProxy(methods) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return () => {
            /* never settle */
          };
        }
        if (Object.prototype.hasOwnProperty.call(methods, prop)) return methods[prop];
        return () => new Promise(() => {});
      },
    },
  );
}

test("refreshStatus does not hang when the plugin proxy is thenable", async () => {
  resetCloudForTests();
  setPluginForTests(
    thenableProxy({
      status: async () => ({ configured: true, signedIn: false, name: null }),
    }),
  );
  const result = await Promise.race([
    refreshStatus(),
    new Promise((_resolve, reject) => setTimeout(() => reject(new Error("hung")), 500)),
  ]);
  assert.equal(result.configured, true);
  assert.equal(result.signedIn, false);
  assert.notEqual(result.phase, "unavailable");
});

test("refreshStatus leaves Checking when status never answers", async () => {
  resetCloudForTests();
  setStatusTimeoutForTests(40);
  setPluginForTests(
    thenableProxy({
      status: () => new Promise(() => {}),
    }),
  );
  const result = await refreshStatus();
  assert.equal(result.configured, false);
  assert.equal(result.phase, "unavailable");
  assert.match(getCloudState().error, /didn't answer/);
});
