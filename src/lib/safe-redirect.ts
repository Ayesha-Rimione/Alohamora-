/** Only same-origin paths may be used as a post-login redirect target. */
export function safeRedirect(target: string | undefined, fallback = "/dashboard"): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return fallback;
}
