import Section from "./Section";
import ProjectCarousel from "./ProjectCarousel";
import BehindMarquee from "./BehindMarquee";

/**
 * The work, on a light surface — the reel's mid-page theme flip. Everything
 * inside inherits the `.on-light` tokens, so the same components restyle
 * without a second set of classes.
 */
export default function Projects() {
  return (
    <div className="on-light relative">
      {/* soft edges so the flip reads as a panel, not a hard cut */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{ background: "linear-gradient(#05070d, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ background: "linear-gradient(transparent, #05070d)" }}
      />
      <BehindMarquee />
      <Section
        id="projects"
        path="projects"
        title="Things I've shipped"
        lede="Agents, ML systems, and tools I actually run. Every number on these cards is measured — several are screenshots of the thing running."
      >
        <ProjectCarousel />
      </Section>
    </div>
  );
}
