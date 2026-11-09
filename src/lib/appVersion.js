// Web and desktop builds have no PackageManager. Android replaces these
// with versionName / versionCode from the installed package.
export const WEB_VERSION_NAME = "0.0.11";
export const WEB_VERSION_CODE = "11";

export function formatAppVersion(name, code) {
  const version = String(name || WEB_VERSION_NAME).replace(/^v/i, "");
  const build = String(code || WEB_VERSION_CODE);
  return `v${version} (build ${build})`;
}
