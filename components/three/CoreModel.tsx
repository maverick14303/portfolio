"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { webglOK } from "@/lib/webgl";

const CoreViewImpl = dynamic(() => import("./impl").then((m) => ({ default: m.CoreViewImpl })), {
  ssr: false,
});

/**
 * The exported core.glb, rendered through the shared canvas. Skipped without
 * WebGL — it is ornament, so there is nothing to fall back to.
 */
export default function CoreModel({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(webglOK());
  }, []);

  if (!on) return null;

  return (
    <div aria-hidden className={`pointer-events-none relative ${className ?? ""}`}>
      <CoreViewImpl />
    </div>
  );
}
