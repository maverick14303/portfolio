"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { site } from "@/lib/content";
import { scrollToHash } from "./SmoothScroll";
import Magnetic from "./Magnetic";
import Marquee from "./Marquee";
import PhotoCard from "@/components/three/PhotoCard";
import CoreModel from "@/components/three/CoreModel";

const EASE = [0.16, 1, 0.3, 1] as const;
const GIANT = "ANKIT";

function MaskedLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reduced ? { opacity: 0 } : { y: "110%" }}
        animate={reduced ? { opacity: 1 } : { y: 0 }}
        transition={{ duration: 0.95, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** The giant name, letter by letter. Rendered twice (behind + clipped front)
 *  with identical timing so the two layers stay in perfect register. */
function GiantName({ front }: { front?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className={`giant-name ${front ? "giant-name--front" : ""}`}>
      {GIANT.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -90, scale: 1.45 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.9 + i * 0.075, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const chipY1 = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const chipY2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const giantY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const giantOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const enter = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 22 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  const giantStyle = reduced ? undefined : { y: giantY, opacity: giantOpacity };

  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-svh w-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(52rem 36rem at 78% 38%, rgba(110,231,242,0.06), transparent 62%), radial-gradient(40rem 30rem at 12% 82%, rgba(242,178,99,0.05), transparent 60%)",
        }}
      />

      {/* slam-dunk name — behind layer */}
      <motion.div
        aria-hidden
        style={giantStyle}
        className="pointer-events-none absolute inset-x-0 bottom-[3.5rem] z-0 translate-y-[38%]"
      >
        <GiantName />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-7 px-5 pt-24 pb-10 sm:gap-10 sm:px-8 sm:pb-14 md:grid-cols-[1.12fr_0.88fr] md:gap-8 md:pt-20">
        <motion.div style={reduced ? undefined : { y: textY, opacity: textOpacity }} className="relative z-10">
          <motion.p {...enter(0.05)} className="path-label">
            {site.hero.eyebrow}
          </motion.p>

          <h1 className="font-display mt-4 max-w-xl text-[2.3rem] leading-[1.03] font-bold tracking-tight text-ink sm:mt-5 sm:text-6xl md:text-[4.6rem]">
            <MaskedLine delay={0.12}>I build</MaskedLine>
            <MaskedLine delay={0.22}>AI systems</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-signal">that ship.</span>
            </MaskedLine>
          </h1>

          <motion.p {...enter(0.5)} className="mt-5 max-w-md text-base text-dim sm:mt-6 sm:text-lg">
            {site.hero.subline}
          </motion.p>
          <motion.p {...enter(0.56)} className="mt-2.5 font-mono text-xs text-faint sm:mt-3">
            {site.hero.meta}
          </motion.p>

          <motion.div {...enter(0.66)} className="mt-7 flex flex-wrap items-center gap-4 sm:mt-9">
            <Magnetic>
              <a
                href={site.hero.ctaPrimary.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(site.hero.ctaPrimary.href);
                }}
                className="btn-shine inline-block rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-void"
              >
                {site.hero.ctaPrimary.label}
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={site.hero.ctaSecondary.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(site.hero.ctaSecondary.href);
                }}
                className="inline-block rounded-md border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-signal/50 hover:text-signal"
              >
                {site.hero.ctaSecondary.label}
              </a>
            </Magnetic>
          </motion.div>

          <motion.p {...enter(0.78)} className="mt-7 flex items-center gap-2.5 font-mono text-xs text-dim sm:mt-10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember/60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
            </span>
            {site.hero.status}
          </motion.p>
        </motion.div>

        <motion.div
          {...enter(0.4)}
          className="relative z-10 mx-auto w-52 sm:w-72 md:w-[21rem] md:justify-self-end"
        >
          {/* translate only — a rotated frame would desync the WebGL view rect */}
          <motion.div style={reduced ? undefined : { y: cardY }}>
            <PhotoCard
              src="/photos/hero-card.webp"
              alt="Ankit Keshari, laughing, looking away from the camera"
              aspect={0.8}
              caption={["portrait.distort(pointer)", "live"]}
              sizes="(min-width: 768px) 336px, 320px"
              priority
            />
          </motion.div>

          {/* the exported core.glb, orbiting past the portrait */}
          <motion.div
            style={reduced ? undefined : { y: chipY1 }}
            className="absolute -top-24 -left-28 z-0 hidden h-64 w-64 md:block"
          >
            <CoreModel className="h-full w-full" />
          </motion.div>

          {/* floating fact chips, parallaxing at their own speeds */}
          <motion.div
            style={reduced ? undefined : { y: chipY1 }}
            className="absolute -left-10 top-6 z-20 hidden rounded-md border border-line/80 bg-void/70 px-3 py-2 font-mono text-[10px] text-dim backdrop-blur-sm md:block"
          >
            <span className="text-signal">DRDO</span> · adversarial ML
          </motion.div>
          <motion.div
            style={reduced ? undefined : { y: chipY2 }}
            className="absolute -right-6 bottom-14 z-20 hidden rounded-md border border-line/80 bg-void/70 px-3 py-2 font-mono text-[10px] text-dim backdrop-blur-sm md:block"
          >
            <span className="text-ember">EY</span> · LLM platform
          </motion.div>
        </motion.div>
      </div>

      {/* slam-dunk name — clipped front slice crossing over the card */}
      <motion.div
        aria-hidden
        style={{ ...(giantStyle ?? {}), clipPath: "inset(0 0 62% 0)" }}
        className="pointer-events-none absolute inset-x-0 bottom-[3.5rem] z-20 hidden translate-y-[38%] md:block"
      >
        <GiantName front />
      </motion.div>

      <Marquee />
    </section>
  );
}
