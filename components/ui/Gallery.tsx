"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import MaskReveal from "./MaskReveal";

/**
 * The reel's third move: photo tiles scattered at different depths that
 * converge toward the centre as the section scrolls through. Purely
 * scroll-linked transforms — no state, so nothing can desync.
 */
const TILES = [
  { src: "/photos/gallery-1.webp", alt: "Ankit laughing with a hand over his eyes", x: -42, y: -18, r: -8, z: 0.55, w: "34%" },
  { src: "/photos/gallery-3.webp", alt: "Ankit at a table, smiling", x: 40, y: -24, r: 7, z: 0.7, w: "30%" },
  { src: "/photos/gallery-2.webp", alt: "Ankit looking down, warm interior light", x: 30, y: 26, r: -5, z: 0.42, w: "26%" },
];

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // 0 → scattered, 1 → gathered (peaks mid-section, then drifts apart again)
  const gather = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0, 1, 0.25]);

  return (
    <section ref={ref} id="gallery" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="path-label">offline</p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
          <MaskReveal>Away from the terminal</MaskReveal>
        </h2>
      </div>

      <div className="relative mx-auto mt-14 h-[52vh] w-full max-w-5xl px-5 sm:h-[60vh] sm:px-8">
        {TILES.map((t, i) => (
          <Tile key={t.src} tile={t} gather={gather} reduced={!!reduced} index={i} />
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-md px-5 text-center font-mono text-[11px] text-faint sm:px-8">
        badminton · lawn tennis · volleyball · and finding new places to be
      </p>
    </section>
  );
}

function Tile({
  tile,
  gather,
  reduced,
  index,
}: {
  tile: (typeof TILES)[number];
  gather: ReturnType<typeof useTransform<number, number>>;
  reduced: boolean;
  index: number;
}) {
  const x = useTransform(gather, [0, 1], [`${tile.x}%`, "0%"]);
  const y = useTransform(gather, [0, 1], [`${tile.y}%`, "0%"]);
  const rotate = useTransform(gather, [0, 1], [tile.r, tile.r * 0.15]);
  const scale = useTransform(gather, [0, 1], [tile.z, 1]);

  return (
    <motion.figure
      style={
        reduced
          ? { width: tile.w }
          : { x, y, rotate, scale, width: tile.w, zIndex: Math.round(tile.z * 10) }
      }
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line/70 shadow-2xl shadow-black/60"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={tile.src}
          alt={tile.alt}
          fill
          sizes="(min-width: 640px) 300px, 40vw"
          className="object-cover"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>
    </motion.figure>
  );
}
