import { experience } from "@/lib/content";
import Section from "./Section";
import Reveal from "./Reveal";
import StackChips from "./StackChips";

export default function Experience() {
  return (
    <Section
      id="experience"
      path="experience"
      title="Where I've worked"
      lede="Two internships, two very different sides of applied ML — attacking models, then building with them."
    >
      <ol className="relative space-y-12 border-l border-line pl-7 sm:pl-10">
        {experience.map((e, i) => (
          <li key={e.org} className="relative">
            <span
              aria-hidden
              className={`absolute top-1.5 -left-[33px] flex h-3 w-3 items-center justify-center sm:-left-[45px]`}
            >
              {e.current ? (
                <>
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-ember/50 motion-reduce:animate-none" />
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-ember bg-void" />
                </>
              ) : (
                <span className="h-2.5 w-2.5 rounded-full border-2 border-signal/70 bg-void" />
              )}
            </span>
            <Reveal delay={i * 0.06}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {e.role} <span className="text-dim">·</span>{" "}
                  <span className="text-signal">{e.org}</span>
                </h3>
                <p className="font-mono text-xs text-faint">{e.period}</p>
              </div>
              <p className="mt-3 max-w-3xl font-medium text-ink/90">{e.summary}</p>
              <ul className="mt-4 max-w-3xl space-y-2.5">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-dim">
                    <span aria-hidden className="mt-[7px] h-1 w-3 shrink-0 rounded bg-line" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <StackChips items={e.stack} />
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
