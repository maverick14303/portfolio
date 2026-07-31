let cached: boolean | null = null;

/** One shared capability check: WebGL available and motion allowed. */
export function webglOK(): boolean {
  if (typeof window === "undefined") return false;
  if (cached !== null) return cached;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cached = false;
    return cached;
  }
  try {
    const cv = document.createElement("canvas");
    cached = Boolean(cv.getContext("webgl2") ?? cv.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}
