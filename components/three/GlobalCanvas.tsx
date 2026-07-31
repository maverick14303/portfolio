"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { webglOK } from "@/lib/webgl";

const GlobalCanvasImpl = dynamic(() => import("./impl").then((m) => ({ default: m.GlobalCanvasImpl })), {
  ssr: false,
});

/**
 * Mounts the ONE shared WebGL canvas (fixed, z-0). Every 3D element on the
 * page renders through it via drei <View>s. Skipped entirely without WebGL
 * or with reduced motion.
 */
export default function GlobalCanvas() {
  const [state, setState] = useState<{ on: boolean; compact: boolean } | null>(null);

  useEffect(() => {
    setState({ on: webglOK(), compact: window.innerWidth < 768 });
  }, []);

  if (!state?.on) return null;
  return <GlobalCanvasImpl compact={state.compact} />;
}
