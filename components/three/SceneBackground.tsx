"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { webglOK } from "@/lib/webgl";

const BackgroundViewImpl = dynamic(
  () => import("./impl").then((m) => ({ default: m.BackgroundViewImpl })),
  { ssr: false }
);

/**
 * Full-page background scene (wave grid + floating wireframes) rendered as a
 * drei View on the shared canvas. Without WebGL the page keeps its flat void
 * background — nothing else changes.
 */
export default function SceneBackground() {
  const [state, setState] = useState<{ on: boolean; compact: boolean } | null>(null);

  useEffect(() => {
    setState({ on: webglOK(), compact: window.innerWidth < 768 });
  }, []);

  if (!state?.on) return null;
  return <BackgroundViewImpl compact={state.compact} />;
}
