"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { projects } from "@/lib/content";
import type { Project } from "@/lib/content";
import StackChips from "./StackChips";
import Glyph from "./Glyph";

const cardSrc = (p: Project) => `/cards/${p.slug}.webp`;

/**
 * The reel's centrepiece: project cards as a 3D coverflow. Drag, swipe,
 * use the arrows or ←/→ to move through the stack; the active card's details
 * render as real HTML beneath it, so everything stays readable and linkable.
 *
 * Deliberately CSS 3D rather than WebGL — the cards are flat images, and
 * `perspective` + `rotateY`/`translateZ` + `filter` produce the same depth
 * falloff with none of the shared-canvas fragility, on every device.
 */
export default function ProjectCarousel() {
  const [index, setIndex] = useState(0); // fractional while scrolling/dragging
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const wheelLock = useRef(0);

  const n = projects.length;
  // The stack wraps, so there are always cards on both sides of the focused
  // one — `index` runs unbounded and is folded onto the list.
  const mod = (v: number) => ((v % n) + n) % n;
  const active = mod(Math.round(index));
  const project = projects[active];
  const goto = useCallback((i: number) => setIndex(i), []);

  // Desktop: page scroll scrubs the stack while the tall track passes the
  // viewport — the page keeps scrolling normally throughout. Touch devices get
  // a plain swipe carousel instead (pinning a tall track on a phone just reads
  // as "stuck"), so scroll-driving is disabled there.
  const [scrubbable, setScrubbable] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (hover: hover)");
    const sync = () => setScrubbable(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Manual input wins briefly, then scroll takes back over. Without the
  // timeout a single drag would kill scroll-driving for good.
  const manual = useRef(0);
  const markManual = () => {
    manual.current = Date.now() + 900;
  };

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  const scrollIndex = useTransform(scrollYProgress, [0.06, 0.94], [0, n - 1]);

  useMotionValueEvent(scrollIndex, "change", (v) => {
    if (!scrubbable || reduced || Date.now() < manual.current) return;
    setScrolling(true);
    setIndex(Math.min(n - 1, Math.max(0, v)));
  });

  // While scrubbing, cards must follow scroll exactly — a CSS transition here
  // fights every frame and is what made the motion feel random.
  const [scrolling, setScrolling] = useState(false);
  const stopTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!scrolling) return;
    window.clearTimeout(stopTimer.current);
    stopTimer.current = window.setTimeout(() => setScrolling(false), 140);
    return () => window.clearTimeout(stopTimer.current);
  }, [scrolling, index]);

  const onDown = (e: React.PointerEvent) => {
    markManual();
    drag.current = { x: e.clientX, start: index, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !wrap.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    setIndex(drag.current.start - (dx / wrap.current.clientWidth) * 3.1);
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setIndex((v) => Math.round(v));
  };

  // horizontal wheel / trackpad only — vertical page scroll is never hijacked
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.4) return;
    const now = Date.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 260;
    markManual();
    goto(Math.round(index) + (e.deltaX > 0 ? 1 : -1));
  };

  const onKey = (e: React.KeyboardEvent) => {
    markManual();
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goto(Math.round(index) + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goto(Math.round(index) - 1);
    }
  };

  return (
    /* Desktop: a tall track whose sticky panel stays put while the page
       scrolls past, turning scroll into card movement. Touch: an ordinary
       block, swiped by hand. */
    <div
      ref={track}
      className="relative"
      style={scrubbable ? { height: `${n * 26 + 80}vh` } : undefined}
    >
      <div className={scrubbable ? "sticky top-[10vh] flex min-h-[80vh] flex-col justify-center" : ""}>
      <div
        ref={wrap}
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
        onKeyDown={onKey}
        className="relative h-[300px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[400px] md:h-[460px]"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
      >
        {projects.map((p, i) => {
          // shortest signed distance around the loop
          let d = i - index;
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
          const ad = Math.abs(d);
          if (ad > 3.2) return null;
          const focus = Math.max(0, 1 - ad * 0.62);
          const isActive = i === active;
          return (
            <figure
              key={p.slug}
              aria-hidden={!isActive}
              onClick={() => {
                if (!drag.current?.moved && !isActive) goto(index + d);
              }}
              className="absolute top-1/2 left-1/2 h-[88%] overflow-hidden rounded-xl border border-line/70"
              style={{
                aspectRatio: "3 / 4",
                transform: [
                  "translate(-50%,-50%)",
                  `translateX(${d * 52 - Math.sign(d) * Math.min(ad, 2.2) * 10}%)`,
                  `translateZ(${-Math.min(ad, 3.2) * 165}px)`,
                  `rotateY(${-d * 31}deg)`,
                  `scale(${1 - Math.min(ad, 3) * 0.05})`,
                ].join(" "),
                zIndex: Math.round(100 - ad * 10),
                filter: `brightness(${0.3 + focus * 0.7}) saturate(${0.3 + focus * 0.7})`,
                boxShadow: isActive
                  ? "0 40px 90px -25px rgba(0,0,0,0.85), 0 0 0 1px rgba(110,231,242,0.22)"
                  : "0 30px 70px -30px rgba(0,0,0,0.8)",
                // No easing while the index is being dragged or scrubbed —
                // the input already provides the motion.
                transition:
                  drag.current || scrolling
                    ? "none"
                    : "transform 0.55s cubic-bezier(0.16,1,0.3,1), filter 0.55s ease, box-shadow 0.4s ease",
                cursor: isActive ? "grab" : "pointer",
              }}
            >
              <Image
                src={cardSrc(p)}
                alt={
                  p.status === "stealth"
                    ? "Stealth project — details withheld"
                    : `${p.name} — ${p.tagline}`
                }
                fill
                sizes="(min-width: 768px) 350px, 250px"
                priority={i < 2}
                className="object-cover"
                draggable={false}
              />
              {/* sheen on the focused card */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: isActive ? 1 : 0,
                  background:
                    "linear-gradient(118deg, transparent 42%, rgba(110,231,242,0.10) 50%, transparent 58%)",
                }}
              />
            </figure>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => goto(Math.round(index) - 1)}
          aria-label="Previous project"
          className="rounded-full border border-line p-2.5 text-dim transition-colors hover:border-signal/50 hover:text-signal"
        >
          <Arrow dir="left" />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose project">
          {projects.map((p, i) => {
            // step to this card the short way round
            let d = i - active;
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;
            return (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={p.status === "stealth" ? "Stealth project" : p.name}
                onClick={() => goto(Math.round(index) + d)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-7 bg-signal" : "w-1.5 bg-line hover:bg-dim"
                }`}
              />
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => goto(Math.round(index) + 1)}
          aria-label="Next project"
          className="rounded-full border border-line p-2.5 text-dim transition-colors hover:border-signal/50 hover:text-signal"
        >
          <Arrow dir="right" />
        </button>
      </div>

      {/* active project details — real HTML, never baked into the card art */}
      <motion.div
        key={project.slug}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-9 max-w-2xl text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <Glyph name={project.slug} className="h-7 w-7 text-signal/70" />
          <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            {project.status === "stealth" ? "▮▮▮▮▮▮" : project.name}
          </h3>
          {project.status === "in-progress" ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ember">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" /> in progress
            </span>
          ) : null}
        </div>
        <p className="mt-2 font-medium text-signal/90">{project.tagline}</p>
        <p className="mt-4 leading-relaxed text-dim">{project.description}</p>
        {project.note ? <p className="mt-3 font-mono text-xs text-faint">{project.note}</p> : null}
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex justify-center">
            <StackChips items={project.stack} />
          </div>
          {project.links.length ? (
            <div className="flex flex-wrap justify-center gap-4">
              {project.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener"
                  className="font-mono text-xs text-signal underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>

      <p className="mt-8 text-center font-mono text-[11px] text-faint">
        scroll · drag · ← → to explore
      </p>
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}
