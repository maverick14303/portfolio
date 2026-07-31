import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="path-label">404</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        This route never shipped.
      </h1>
      <p className="max-w-sm text-dim">
        The page you&apos;re after doesn&apos;t exist — but the projects that do are one click away.
      </p>
      <Link
        href="/"
        className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-void transition-transform hover:-translate-y-0.5"
      >
        Back home
      </Link>
    </main>
  );
}
