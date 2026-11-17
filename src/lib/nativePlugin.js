// Capacitor's registerPlugin() proxy turns every property read into a native
// call, including `then`. A promise that resolves to that proxy waits on the
// native `then`, which never calls back. Always hand the proxy back inside a
// plain object so the promise settles.

export async function loadNativePlugin(name) {
  const { registerPlugin } = await import("@capacitor/core");
  return { plugin: registerPlugin(name) };
}
