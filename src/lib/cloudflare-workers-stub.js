// Stand-in for the Cloudflare Workers runtime, used only by the static Android
// build. The hosted worker build resolves the real `cloudflare:workers` module.
export const env = {};

export function waitUntil() {}
