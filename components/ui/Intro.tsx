"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.76, 0, 0.24, 1] as const;
const NAME = ["ANKIT", "KESHARI"];

/**
 * Opening sequence, in the reel's shape: black → the portrait wipes up behind
 * the name → a counter fills → the whole panel splits and lifts away, handing
 * off to the hero. Runs once per tab (sessionStorage), is skippable by click
 * or key, and is replaced by an instant fade when reduced motion is set.
 */
export default function Intro() {
  const [done, setDone] = useState(true); // assume done until we know otherwise
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("intro-seen") === "1") return;
    setDone(false);
    document.documentElement.style.overflow = "hidden";
  }, []);

  const finish = () => {
    sessionStorage.setItem("intro-seen", "1");
    document.documentElement.style.overflow = "";
    setDone(true);
  };

  useEffect(() => {
    if (done) return;
    if (reduced) {
      const t = window.setTimeout(finish, 500);
      timers.current.push(t);
      return () => timers.current.forEach(clearTimeout);
    }
    // count 0 → 100 over ~1.9s, then hold briefly and lift
    const step = window.setInterval(() => {
      setCount((c) => {
        if (c >= 100) {
          clearInterval(step);
          return 100;
        }
        return c + Math.max(1, Math.round((100 - c) / 12));
      });
    }, 45);
    const end = window.setTimeout(finish, 3400);
    timers.current.push(end);
    return () => {
      clearInterval(step);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, reduced]);

  // let people skip
  useEffect(() => {
    if (done) return;
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] overflow-hidden bg-void"
          exit={reduced ? { opacity: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* two halves that part on exit */}
          {[0, 1].map((half) => (
            <motion.div
              key={half}
              className="absolute inset-x-0 h-1/2 bg-void"
              style={{ top: half === 0 ? 0 : "50%" }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : { y: half === 0 ? "-100%" : "100%", transition: { duration: 1.05, ease: EASE, delay: 0.15 } }
              }
            />
          ))}

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* portrait, wiping up from behind the type */}
            <motion.div
              className="relative h-[54vh] w-[38vh] overflow-hidden rounded-lg sm:h-[58vh] sm:w-[41vh]"
              initial={reduced ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", scale: 1.14 }}
              animate={
                reduced
                  ? { opacity: 1 }
                  : {
                      clipPath: "inset(0% 0 0 0)",
                      scale: 1,
                      transition: { duration: 1.5, ease: EASE, delay: 0.25 },
                    }
              }
              exit={reduced ? { opacity: 0 } : { scale: 1.15, opacity: 0, transition: { duration: 0.7, ease: EASE } }}
            >
              <Image
                src="/photos/intro.webp"
                alt=""
                fill
                priority
                sizes="41vh"
                className="object-cover"
              />
              {/* scrim so the name stays legible over the photo */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(5,7,13,0.55), rgba(5,7,13,0.25) 45%, rgba(5,7,13,0.8))" }}
              />
            </motion.div>

            {/* name, split across the portrait */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              {NAME.map((word, i) => (
                <div key={word} className="overflow-hidden">
                  <motion.span
                    className="font-display block text-[15vw] leading-[0.92] font-extrabold tracking-tighter text-white sm:text-[11vw]"
                    style={{ textShadow: "0 6px 40px rgba(0,0,0,0.6)" }}
                    initial={reduced ? { opacity: 0 } : { y: "108%" }}
                    animate={
                      reduced
                        ? { opacity: 1 }
                        : { y: 0, transition: { duration: 1.05, ease: EASE, delay: 0.45 + i * 0.12 } }
                    }
                    exit={reduced ? {} : { y: "-108%", transition: { duration: 0.75, ease: EASE } }}
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>

          {/* counter + rule */}
          <motion.div
            className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10"
            exit={reduced ? {} : { opacity: 0, transition: { duration: 0.3 } }}
          >
            <div className="mx-auto flex w-full max-w-6xl items-end justify-between font-mono text-xs text-dim">
              <span>portfolio · 2026</span>
              <span className="text-signal tabular-nums">{String(count).padStart(3, "0")}</span>
            </div>
            <div className="mx-auto mt-3 h-px w-full max-w-6xl bg-line">
              <motion.div
                className="h-px bg-signal"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: count / 100 }}
                style={{ transformOrigin: "left" }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
