"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor: an instant dot plus a lagging ring that grows over links and
 * buttons. Only mounts for fine pointers without reduced motion; the native
 * cursor stays available underneath (never hidden), so this is pure flavor.
 */
export default function Cursor() {
  const [active, setActive] = useState(false);
  const [onLink, setOnLink] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 160, damping: 18, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 160, damping: 18, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setActive(true);

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      const t = e.target as Element | null;
      setOnLink(Boolean(t?.closest?.("a, button")));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  if (!active) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed z-[70] h-1.5 w-1.5 rounded-full bg-signal"
        style={{ x: mx, y: my, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        aria-hidden
        animate={{
          scale: onLink ? 1.9 : 1,
          opacity: onLink ? 0.9 : 0.5,
        }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed z-[70] h-7 w-7 rounded-full border border-signal/60"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
      />
    </>
  );
}
