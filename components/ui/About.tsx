"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { site } from "@/lib/content";
import Section from "./Section";
import Reveal from "./Reveal";
import PhotoCard from "@/components/three/PhotoCard";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <Section id="about" path="about" title="Behind the terminal">
      <div ref={ref} className="grid grid-cols-1 gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div>
          {site.about.bio.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="mb-5 leading-relaxed text-dim [&:first-of-type]:text-lg [&:first-of-type]:text-ink/90">
                {p}
              </p>
            </Reveal>
          ))}
          <Reveal delay={0.15}>
            <dl className="mt-8 space-y-4 border-t border-line pt-7">
              {site.about.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-1 gap-1 sm:grid-cols-[130px_1fr] sm:gap-4">
                  <dt className="font-mono text-xs tracking-wide text-signal/80 sm:pt-0.5">
                    {f.label.toLowerCase()}
                  </dt>
                  <dd className="text-sm leading-relaxed text-ink/85">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <motion.div
            style={reduced ? undefined : { y: photoY }}
            className="mx-auto w-full max-w-xs md:mx-0 md:justify-self-end"
          >
            <PhotoCard
              src="/photos/about-card.webp"
              alt="Ankit laughing with a hand over his eyes"
              aspect={0.75}
              caption={["candid.exe — no retakes", "new delhi"]}
              sizes="(min-width: 768px) 320px, 80vw"
            />
          </motion.div>
        </Reveal>
      </div>
    </Section>
  );
}
