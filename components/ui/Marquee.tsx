const ITEMS = [
  "AI agents",
  "ML pipelines",
  "local-first tools",
  "adversarial ML",
  "LLM systems",
  "trading bots",
  "offline speech",
];

export default function Marquee() {
  const row = ITEMS.map((t, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6">
      <span>{t}</span>
      <span aria-hidden className="text-signal/50">
        ✦
      </span>
    </span>
  ));

  return (
    <div
      aria-hidden
      className="relative z-10 overflow-hidden border-y border-line/60 bg-void/40 py-3 font-mono text-xs tracking-[0.18em] text-faint uppercase backdrop-blur-sm"
    >
      <div className="marquee-track flex w-max whitespace-nowrap">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
