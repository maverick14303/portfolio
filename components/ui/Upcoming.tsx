import { upcoming } from "@/lib/content";
import Section from "./Section";
import Reveal from "./Reveal";
import StackChips from "./StackChips";
import Glyph from "./Glyph";

export default function Upcoming() {
  return (
    <Section
      id="next"
      path="next"
      title="Building next"
      lede="Fully planned, honestly labelled — these are blueprints, not vaporware demos."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {upcoming.map((u, i) => (
          <Reveal key={u.slug} delay={i * 0.08} className="h-full">
            <article
              className="relative flex h-full flex-col rounded-xl border border-dashed border-line p-6 sm:p-8"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(110,231,242,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,242,0.025) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            >
              <Glyph
                name={u.slug}
                className="absolute top-6 right-6 h-8 w-8 text-ember/40"
              />
              <p className="font-mono text-[11px] tracking-wide text-ember">{u.meta}</p>
              <h3 className="font-display mt-3 text-2xl font-bold text-ink sm:text-3xl">{u.name}</h3>
              <p className="mt-1.5 font-medium text-signal/90">{u.tagline}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-dim sm:text-base">
                {u.description}
              </p>
              <div className="mt-6">
                <StackChips items={u.stack} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
