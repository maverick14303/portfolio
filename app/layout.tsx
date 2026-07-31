import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

const DESCRIPTION =
  "AI builder at NIT Delhi. Agents, ML pipelines, and local-first tools — adversarial ML at DRDO, LLM document intelligence at EY.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ankit Keshari — AI builder",
    template: "%s · Ankit Keshari",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Ankit Keshari — I build AI systems that ship.",
    description: DESCRIPTION,
    url: "/",
    siteName: "Ankit Keshari",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Ankit Keshari — AI builder" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ankit Keshari — I build AI systems that ship.",
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ankit Keshari",
  jobTitle: "AI Intern",
  worksFor: { "@type": "Organization", name: "EY" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "National Institute of Technology Delhi" },
  email: "mailto:ankitkeshari326@gmail.com",
  url: SITE_URL,
  sameAs: [
    "https://github.com/maverick14303",
    "https://www.linkedin.com/in/ankit-keshari-105846255/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${instrument.variable} ${plexMono.variable} grain antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
