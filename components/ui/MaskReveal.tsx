"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Masked slide-up reveal for headings — the reel-style title entrance. */
export default function MaskReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <span className={`block overflow-hidden pb-[0.1em] ${className ?? ""}`}>
      <motion.span
        className="block"
        initial={reduced ? { opacity: 0 } : { y: "108%" }}
        whileInView={reduced ? { opacity: 1 } : { y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}
