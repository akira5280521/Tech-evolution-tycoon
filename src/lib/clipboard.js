// Copy text, falling back to selecting a text field when the clipboard API
// isn't available (older WebViews). Returns true when it worked.
export async function copyText(text, field) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall back to selecting the text */
  }
  try {
    field?.focus();
    field?.select();
    return document.execCommand?.("copy") === true;
  } catch {
    return false;
  }
}
