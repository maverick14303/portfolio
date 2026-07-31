import type { ReactNode } from "react";
import Reveal from "./Reveal";
import MaskReveal from "./MaskReveal";

export default function Section({
  id,
  path,
  title,
  lede,
  children,
}: {
  id: string;
  path: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-24 sm:px-8 md:py-32">
      <Reveal>
        <p className="path-label">{path}</p>
      </Reveal>
      <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
        <MaskReveal>{title}</MaskReveal>
      </h2>
      {lede ? (
        <Reveal delay={0.15}>
          <p className="mt-4 max-w-2xl text-base text-dim sm:text-lg">{lede}</p>
        </Reveal>
      ) : null}
      <div className="mt-12 md:mt-16">{children}</div>
    </section>
  );
}
