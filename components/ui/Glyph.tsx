/**
 * Hand-drawn line-art glyphs, one per project — same wireframe language as
 * the 3D background shapes. Stroke inherits currentColor.
 */
export default function Glyph({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    "sunday-agent": (
      <>
        <rect x="5" y="8" width="14" height="11" rx="2.5" />
        <path d="M12 8V4.5M12 4.5h3.5" />
        <circle cx="12" cy="3.8" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="9.2" cy="13" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.8" cy="13" r="1" fill="currentColor" stroke="none" />
        <path d="M9.5 16.2h5" />
      </>
    ),
    "whisperflow-local": (
      <>
        <rect x="9.5" y="4" width="5" height="9" rx="2.5" />
        <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3M9.5 20h5" />
      </>
    ),
    "nse-swing-bot": (
      <>
        <path d="M6 4v3M6 13v3.5" />
        <rect x="4.5" y="7" width="3" height="6" rx="0.8" />
        <path d="M12 7.5v2.5M12 16v2.5" />
        <rect x="10.5" y="10" width="3" height="6" rx="0.8" />
        <path d="M18 4.5v2M18 12.5v3" />
        <rect x="16.5" y="6.5" width="3" height="6" rx="0.8" />
      </>
    ),
    "stock-news-monitor": (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M7.5 9h9M7.5 12h4" />
        <path d="M7.5 16l3-2.5 2 1.5 4-3.5" />
        <path d="M14.2 11.5h2.3v2.3" />
      </>
    ),
    "interview-strategy": (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
    "chief-of-staff": (
      <>
        <rect x="6" y="4.5" width="12" height="15.5" rx="2" />
        <path d="M10 4.5V3.5h4v1" />
        <path d="M9 10l1.4 1.4L13 8.8M9 15l1.4 1.4L13 13.8" />
        <path d="M15 10.7h1.5M15 15.7h1.5" />
      </>
    ),
    "mun-prep": (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16M12 4c2.8 2.4 2.8 13.6 0 16M12 4c-2.8 2.4-2.8 13.6 0 16" />
      </>
    ),
    stealth: (
      <>
        <rect x="6" y="10.5" width="12" height="9" rx="2" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
    codelens: (
      <>
        <path d="M8 5L3.5 12L8 19M16 5l4.5 7L16 19" />
        <circle cx="12" cy="12" r="2.2" />
        <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
      </>
    ),
    "ecg-interpreter": (
      <>
        <path d="M3 12h4l2-5 3 9 2.5-6.5L16 12h5" />
      </>
    ),
  };

  const node = paths[name];
  if (!node) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {node}
    </svg>
  );
}
