import { site } from "@/lib/content";
import Section from "./Section";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <Section id="contact" path="contact" title="Let's build something">
      <Reveal>
        <p className="max-w-xl text-lg text-dim">{site.contact.line}</p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${site.contact.email}`}
            className="btn-shine rounded-md bg-signal px-6 py-3 text-sm font-semibold text-void transition-transform hover:-translate-y-0.5"
          >
            {site.contact.email}
          </a>
          <a
            href={site.contact.github}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-line px-5 py-3 text-sm text-ink transition-colors hover:border-signal/50 hover:text-signal"
          >
            GitHub
          </a>
          <a
            href={site.contact.linkedin}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-line px-5 py-3 text-sm text-ink transition-colors hover:border-signal/50 hover:text-signal"
          >
            LinkedIn
          </a>
          <a
            href={site.contact.resume}
            target="_blank"
            rel="noopener"
            className="rounded-md border border-line px-5 py-3 text-sm text-ink transition-colors hover:border-ember/60 hover:text-ember"
          >
            Resume ↗
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
