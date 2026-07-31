"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const LINE = "MEASURED · NOT CLAIMED · ";

/**
 * Oversized type drifting horizontally behind the project stack (the reel's
 * layered depth trick). Scroll-linked rather than looping, so it reads as
 * parallax depth instead of a ticker.
 */
export default function BehindMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["8%", "-38%"]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 overflow-hidden"
    >
      <motion.div
        style={reduced ? undefined : { x }}
        className="font-display whitespace-nowrap text-[18vw] leading-none font-extrabold tracking-tighter select-none"
      >
        <span
          style={{
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(11,15,23,0.09)",
          }}
        >
          {LINE.repeat(4)}
        </span>
      </motion.div>
    </div>
  );
}
