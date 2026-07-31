"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { webglOK } from "@/lib/webgl";

const PhotoViewImpl = dynamic(() => import("./impl").then((m) => ({ default: m.PhotoViewImpl })), {
  ssr: false,
});

/**
 * A photo presented as a 3D card, reel-style: the plane ripples away from the
 * pointer with a subtle RGB split and tilts toward the cursor (tilt happens in
 * 3D so the canvas scissor rect always matches the DOM frame).
 * Renders on the page's single shared WebGL canvas via a drei View, layered
 * over a plain <Image> that stays put as the fallback and LCP element.
 */
export default function PhotoCard({
  src,
  alt,
  aspect,
  caption,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  aspect: number; // width / height
  caption?: [string, string];
  sizes: string;
  priority?: boolean;
}) {
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setWebgl(webglOK());
  }, []);

  return (
    <figure className="group relative">
      <div
        className="relative overflow-hidden rounded-xl border border-line/70 transition-[border-color] duration-300 group-hover:border-signal/40"
        style={{
          aspectRatio: `${aspect}`,
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
        }}
      >
        {/* Always painted underneath: instant LCP, and the guaranteed floor if
            the WebGL plane isn't rendering (off-screen view, context loss). */}
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        {webgl ? <PhotoViewImpl src={src} aspect={aspect} /> : null}
        {webgl ? <span className="sr-only">{alt}</span> : null}
        {/* glare sweep */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(110,231,242,0.08) 48%, transparent 62%)",
          }}
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 flex items-center justify-between font-mono text-[11px] text-faint">
          <span>{webgl ? caption[0] : caption[0].replace(/\(.*\)$/, "()")}</span>
          <span className={webgl ? "text-signal/70" : ""}>{webgl ? caption[1] : "still"}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
