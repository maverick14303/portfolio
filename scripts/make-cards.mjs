// Builds the 3:4 art for each project card in the carousel.
//
// Every card is a REAL capture, framed:
//   · web apps   → a browser window around a screenshot of the app running
//                  locally (.shots/real/*.png, produced by shoot-project.mjs)
//   · CLI tools  → a terminal window around the actual stdout of the program
//                  (captures/*.txt, produced by capture-cli.sh)
// Nothing here is mocked up: if a capture is missing the card is skipped and
// the build says so, rather than inventing a screenshot.
import sharp from "sharp";
import { mkdir, readFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "cards");
const SHOTS = path.join(ROOT, ".shots", "real");
const CAPS = path.join(ROOT, "captures");

const W = 900;
const H = 1200;
const VOID = "#05070d";
const INK = "#e9eef8";
const DIM = "#8d99ad";
const FAINT = "#5b6779";
const SIGNAL = "#6ee7f2";
const EMBER = "#f2b263";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

/** Card shell: dark panel, accent glow, title block at the bottom. */
const shell = (inner, { eyebrow, title, sub, accent }) => `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#0a1220"/><stop offset="1" stop-color="${VOID}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.3" r="0.7">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="60" y="96" font-family="'IBM Plex Mono',monospace" font-size="25" fill="${accent}" letter-spacing="3">${esc(eyebrow)}</text>
  ${inner}
  <text x="60" y="${H - 118}" font-family="Arial,sans-serif" font-size="56" font-weight="700" fill="${INK}">${esc(title)}</text>
  <text x="60" y="${H - 68}" font-family="'IBM Plex Mono',monospace" font-size="25" fill="${DIM}">${esc(sub)}</text>
</svg>`;

/** Browser chrome (traffic lights + address bar) around a screenshot. */
const browserFrame = (x, y, w, h, label, accent) => {
  const bar = 46;
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h + bar}" rx="14" fill="#0d1622" stroke="${accent}" stroke-opacity="0.28" stroke-width="1.5"/>
    <circle cx="${x + 26}" cy="${y + 23}" r="7" fill="#ff5f57"/>
    <circle cx="${x + 50}" cy="${y + 23}" r="7" fill="#febc2e"/>
    <circle cx="${x + 74}" cy="${y + 23}" r="7" fill="#28c840"/>
    <rect x="${x + 100}" y="${y + 10}" width="${w - 130}" height="26" rx="13" fill="#060b14"/>
    <text x="${x + 116}" y="${y + 28}" font-family="'IBM Plex Mono',monospace" font-size="17" fill="${FAINT}">${esc(label)}</text>
  </g>`;
};

/** Terminal chrome around real stdout. */
const terminalCard = (lines, opts) => {
  const x = 48;
  const y = 150;
  const w = W - 96;
  const bar = 44;
  const lineH = 25.5;
  const shown = lines.slice(0, opts.maxLines ?? 26);
  const h = bar + 28 + shown.length * lineH + 20;

  const body = shown
    .map((ln, i) => {
      const t = ln.replace(/\t/g, "  ");
      let fill = "#a9b6c9";
      if (/^===/.test(t)) fill = opts.accent;
      else if (/\bYES\b/.test(t)) fill = "#7ee0a8";
      else if (/\bno edge\b|\bno\b\s*$/.test(t)) fill = "#e08a8a";
      else if (/^\s*(horizon|date|strategy)/.test(t)) fill = FAINT;
      const weight = /^===/.test(t) ? "600" : "400";
      return `<text x="${x + 22}" y="${y + bar + 32 + i * lineH}" font-family="'IBM Plex Mono','Consolas',monospace" font-size="19" font-weight="${weight}" fill="${fill}" xml:space="preserve">${esc(t.slice(0, 62))}</text>`;
    })
    .join("");

  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#060b13" stroke="${opts.accent}" stroke-opacity="0.3" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="${w}" height="${bar}" rx="14" fill="#0d1622"/>
    <rect x="${x}" y="${y + bar - 14}" width="${w}" height="14" fill="#0d1622"/>
    <circle cx="${x + 26}" cy="${y + 22}" r="6.5" fill="#ff5f57"/>
    <circle cx="${x + 48}" cy="${y + 22}" r="6.5" fill="#febc2e"/>
    <circle cx="${x + 70}" cy="${y + 22}" r="6.5" fill="#28c840"/>
    <text x="${x + 96}" y="${y + 28}" font-family="'IBM Plex Mono',monospace" font-size="17" fill="${FAINT}">${esc(opts.cmd)}</text>
    ${body}
  </g>`;
};

/* ------------------------------- cards ------------------------------- */

async function fromScreenshot({ slug, shot, meta, label }) {
  const src = path.join(SHOTS, shot);
  if (!(await exists(src))) return { slug, skipped: `missing ${shot}` };

  const inset = 44;
  const imgW = W - inset * 2;
  const imgH = 790;
  const y = 150;
  const bar = 46;

  const shotBuf = await sharp(src)
    .resize({ width: imgW * 2, height: imgH * 2, fit: "cover", position: "top" })
    .toBuffer();

  const svg = shell(browserFrame(inset, y, imgW, imgH, label, meta.accent), meta);
  const base = await sharp(Buffer.from(svg)).png().toBuffer();

  // rounded bottom corners on the screenshot so it sits inside the chrome
  const mask = Buffer.from(
    `<svg width="${imgW}" height="${imgH}"><rect width="${imgW}" height="${imgH}" rx="0"/></svg>`
  );
  const shotRounded = await sharp(shotBuf)
    .resize(imgW, imgH)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return {
    slug,
    buf: await sharp(base)
      .composite([{ input: shotRounded, left: inset, top: y + bar }])
      .webp({ quality: 90 })
      .toFile(path.join(OUT, `${slug}.webp`))
      .then(() => true),
  };
}

async function fromCapture({ slug, capture, meta, cmd, maxLines, grep }) {
  const src = path.join(CAPS, capture);
  if (!(await exists(src))) return { slug, skipped: `missing ${capture}` };
  let lines = (await readFile(src, "utf8")).split("\n");
  if (grep) lines = lines.filter((l) => grep.test(l) || l.trim() === "");
  lines = lines.filter((l, i, a) => !(l.trim() === "" && a[i - 1]?.trim() === ""));
  lines = lines.filter((l) => !/^HTTP Error|possibly delisted/.test(l));
  const svg = shell(terminalCard(lines, { accent: meta.accent, cmd, maxLines }), meta);
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(path.join(OUT, `${slug}.webp`));
  return { slug, buf: true };
}

/** Cards with no runnable surface yet: honest geometric identity, no fake UI. */
async function fromGeometry({ slug, meta, art }) {
  const svg = shell(art(meta.accent), meta);
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(path.join(OUT, `${slug}.webp`));
  return { slug, buf: true };
}

const orbit = (accent) => {
  let g = "";
  for (let i = 0; i < 4; i++) {
    const r = 95 + i * 66;
    g += `<ellipse cx="450" cy="560" rx="${r}" ry="${r * 0.42}" fill="none" stroke="${accent}" stroke-opacity="${0.42 - i * 0.07}" stroke-width="2" transform="rotate(${i * 24} 450 560)"/>`;
    const a = i * 1.5;
    g += `<circle cx="${450 + Math.cos(a) * r}" cy="${560 + Math.sin(a) * r * 0.42}" r="9" fill="${accent}"/>`;
  }
  return `${g}<circle cx="450" cy="560" r="32" fill="none" stroke="${accent}" stroke-width="3"/><circle cx="450" cy="560" r="10" fill="${accent}"/>`;
};

const waveform = (accent) => {
  let bars = "";
  for (let i = 0; i < 44; i++) {
    const t = i / 43;
    const env = Math.sin(t * Math.PI);
    const h = 30 + env * (180 + Math.sin(i * 2.7) * 95);
    bars += `<rect x="${82 + i * 17.6}" y="${560 - h / 2}" width="8" height="${h}" rx="4" fill="${accent}" fill-opacity="${0.35 + env * 0.55}"/>`;
  }
  return `${bars}<line x1="60" y1="560" x2="840" y2="560" stroke="${accent}" stroke-opacity="0.2" stroke-width="1.5"/>`;
};

const globe = (accent) => {
  let g = `<circle cx="450" cy="560" r="235" fill="none" stroke="${accent}" stroke-width="2.5" stroke-opacity="0.7"/>`;
  for (let i = 1; i < 5; i++)
    g += `<ellipse cx="450" cy="560" rx="${235 * Math.cos((i / 5) * Math.PI * 0.5 + 0.15)}" ry="235" fill="none" stroke="${accent}" stroke-opacity="0.3" stroke-width="1.8"/>`;
  for (let i = 1; i < 4; i++) {
    const yy = 560 - 235 + (i * 235 * 2) / 4;
    const rx = Math.sqrt(Math.max(0, 235 * 235 - (yy - 560) * (yy - 560)));
    g += `<line x1="${450 - rx}" y1="${yy}" x2="${450 + rx}" y2="${yy}" stroke="${accent}" stroke-opacity="0.3" stroke-width="1.8"/>`;
  }
  return g;
};

const locked = (accent) => {
  let g = "";
  for (let i = 0; i < 5; i++)
    g += `<rect x="${150 + i * 122}" y="${430 + (i % 2) * 60}" width="92" height="${180 - (i % 3) * 40}" rx="10" fill="${accent}" fill-opacity="0.10" stroke="${accent}" stroke-opacity="0.28" stroke-width="2"/>`;
  return `${g}<rect x="360" y="620" width="180" height="140" rx="18" fill="none" stroke="${accent}" stroke-width="4" stroke-opacity="0.75"/>
    <path d="M395 620v-42a55 55 0 0 1 110 0v42" fill="none" stroke="${accent}" stroke-width="4" stroke-opacity="0.75"/>
    <circle cx="450" cy="686" r="16" fill="${accent}" fill-opacity="0.8"/>`;
};

const jobs = [
  () =>
    fromScreenshot({
      slug: "interview-strategy",
      shot: "sunday-app.png",
      label: "localhost:3000 — today",
      meta: {
        eyebrow: "running locally",
        title: "Know the round",
        sub: "company → rounds → questions",
        accent: EMBER,
      },
    }),
  () =>
    fromScreenshot({
      slug: "sunday-agent",
      shot: "sunday-companies.png",
      label: "localhost:3000 — companies",
      meta: {
        eyebrow: "24 companies tracked",
        title: "Applies while I sleep",
        sub: "scrape → rank → write → send",
        accent: EMBER,
      },
    }),
  () =>
    fromCapture({
      slug: "stock-news-monitor",
      capture: "scoreboard.txt",
      cmd: "python scoreboard.py",
      grep: /^===|horizon|^\s*\d+d\s|baseline|VADER|LLM|\(EDGE|hit%|^\s{2}\S.*\(\d+%\)/,
      maxLines: 26,
      meta: {
        eyebrow: "290 graded signals",
        title: "It grades itself",
        sub: "verdict: no edge — honestly",
        accent: SIGNAL,
      },
    }),
  () =>
    fromCapture({
      slug: "nse-swing-bot",
      capture: "backtest.txt",
      cmd: "python run_backtests.py --summary",
      maxLines: 22,
      meta: {
        eyebrow: "backtest · 8.9 yrs",
        title: "Rules, tested",
        sub: "backtest only — never live claims",
        accent: EMBER,
      },
    }),
  () =>
    fromGeometry({
      slug: "whisperflow-local",
      art: waveform,
      meta: {
        eyebrow: "zero cloud · ~1.5s",
        title: "Speech, on-device",
        sub: "VAD → whisper → local LLM",
        accent: SIGNAL,
      },
    }),
  () =>
    fromGeometry({
      slug: "chief-of-staff",
      art: orbit,
      meta: {
        eyebrow: "in progress",
        title: "Structure, not authority",
        sub: "briefing · check-in · budget",
        accent: EMBER,
      },
    }),
  () =>
    fromGeometry({
      slug: "mun-prep",
      art: globe,
      meta: {
        eyebrow: "cited · verified",
        title: "Every claim sourced",
        sub: "dossier from primary sources",
        accent: SIGNAL,
      },
    }),
  () =>
    fromGeometry({
      slug: "stealth",
      art: locked,
      meta: {
        eyebrow: "stealth",
        title: "Under wraps",
        sub: "computer vision · in development",
        accent: FAINT,
      },
    }),
];

const run = async () => {
  await mkdir(OUT, { recursive: true });
  for (const job of jobs) {
    const r = await job();
    console.log(r.skipped ? `SKIP ${r.slug}: ${r.skipped}` : `card ${r.slug}`);
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
