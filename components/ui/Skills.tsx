import { site } from "@/lib/content";
import Section from "./Section";
import Reveal from "./Reveal";

export default function Skills() {
  return (
    <Section
      id="skills"
      path="skills"
      title="Tools of the trade"
      lede="No percentage bars — either I've shipped with it or it's not listed."
    >
      <div className="divide-y divide-line border-y border-line">
        {site.skills.map((g, i) => (
          <Reveal key={g.group} delay={i * 0.04}>
            <div className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
              <h3 className="font-mono text-xs tracking-wide text-signal/80 sm:pt-1">
                {g.group.toLowerCase()}
              </h3>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {g.items.map((s) => (
                  <li key={s} className="text-sm text-ink/85 sm:text-base">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
