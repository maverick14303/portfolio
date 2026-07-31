"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/content";
import { scrollToHash } from "./SmoothScroll";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line/70 bg-void/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          onClick={(e) => jump(e, "#top")}
          className="font-mono text-sm text-ink transition-colors hover:text-signal"
          aria-label="Back to top"
        >
          <span className="text-faint">~/</span>ankit
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => jump(e, item.href)}
              className="text-sm text-dim transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-5 md:hidden">
          <a href="#projects" onClick={(e) => jump(e, "#projects")} className="text-sm text-dim transition-colors hover:text-ink">
            Projects
          </a>
          <a href="#contact" onClick={(e) => jump(e, "#contact")} className="text-sm text-dim transition-colors hover:text-ink">
            Contact
          </a>
        </div>
        <a
          href={site.contact.resume}
          target="_blank"
          rel="noopener"
          className="rounded-md border border-line px-3.5 py-1.5 font-mono text-xs text-ink transition-colors hover:border-ember/60 hover:text-ember"
        >
          Resume ↗
        </a>
      </nav>
    </header>
  );
}
