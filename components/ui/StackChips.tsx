export default function StackChips({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
      {items.map((s) => (
        <li
          key={s}
          className="rounded border border-line/80 bg-raise/60 px-2 py-1 font-mono text-[11px] text-dim"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}
