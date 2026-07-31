// Prepares all site imagery from the raw photos in images/.
// Run: npm run photos   (re-run any time the source photos change)
import sharp from "sharp";
import { mkdir, copyFile, rm } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "images");
const OUT = path.join(ROOT, "public", "photos");
const PUB = path.join(ROOT, "public");

// Adiyogi portrait: high-res, strong depth (blurred statue behind), subject
// looking off-frame — it carries the hero far better than the phone stills.
const HERO_SRC = path.join(SRC, "PXL_20260110_054439139.PORTRAIT.jpg");
const ABOUT_SRC = path.join(SRC, "VID_20260204_112304_472_exported_0.jpg");
const RESUME = "C:/Users/ACER/Downloads/Resume_Ankit_March_2026.pdf";

// 4:5 window framed on the subject, keeping the statue's face in the top of
// the frame and his own in the upper third.
const HERO_CARD = { left: 0.03, top: 0.30, width: 0.80 };

const heroCardRegion = async () => {
  const { width: W, height: H } = await sharp(HERO_SRC).metadata();
  const width = Math.round(W * HERO_CARD.width);
  const height = Math.round(width * 1.25); // 4:5
  return {
    left: Math.round(W * HERO_CARD.left),
    top: Math.min(Math.round(H * HERO_CARD.top), H - height),
    width,
    height,
  };
};

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const hero = await heroCardRegion();
  console.log(`hero card crop ${hero.width}x${hero.height} @ ${hero.left},${hero.top}`);

  // 1. Hero card texture (also the no-WebGL fallback image)
  await sharp(HERO_SRC)
    .extract(hero)
    .resize({ width: 760 })
    .webp({ quality: 85 })
    .toFile(path.join(OUT, "hero-card.webp"));

  // 2. Cinematic duotone still — OG art + reduced-motion aesthetic anchor
  await sharp(HERO_SRC)
    .extract(hero)
    .resize({ width: 760 })
    .grayscale()
    .linear(1.12, -14)
    .tint({ r: 120, g: 196, b: 212 })
    .modulate({ brightness: 0.92 })
    .webp({ quality: 84 })
    .toFile(path.join(OUT, "hero-duotone.webp"));

  // 3. About card texture: 3:4 window of the hand-over-eyes shot
  const am = await sharp(ABOUT_SRC).metadata();
  const ah = Math.min(am.height, Math.round(am.width / 0.75));
  const atop = Math.round((am.height - ah) * 0.35);
  await sharp(ABOUT_SRC)
    .extract({ left: 0, top: atop, width: am.width, height: ah })
    .resize({ width: 840 })
    .webp({ quality: 84 })
    .toFile(path.join(OUT, "about-card.webp"));

  // 4. OG image: void background, duotone portrait right, name left
  const portrait = await sharp(HERO_SRC)
    .extract(hero)
    .resize({ height: 630 })
    .grayscale()
    .linear(1.12, -14)
    .tint({ r: 120, g: 196, b: 212 })
    .modulate({ brightness: 0.8 })
    .toBuffer();
  const pMeta = await sharp(portrait).metadata();
  const textSvg = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#05070d"/>
      <text x="72" y="300" font-family="Arial, sans-serif" font-size="76" font-weight="800" fill="#e9eef8">Ankit Keshari</text>
      <text x="74" y="368" font-family="Arial, sans-serif" font-size="34" fill="#6ee7f2">I build AI systems that ship.</text>
      <text x="74" y="428" font-family="Arial, sans-serif" font-size="24" fill="#8d99ad">Agents · ML pipelines · local-first tools — NIT Delhi</text>
    </svg>`);
  await sharp(textSvg)
    .composite([
      { input: portrait, left: 1200 - (pMeta.width ?? 500), top: 0 },
      {
        input: Buffer.from(
          `<svg width="1200" height="630"><rect x="${1200 - (pMeta.width ?? 500)}" y="0" width="${pMeta.width ?? 500}" height="630" fill="url(#g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#05070d" stop-opacity="1"/><stop offset="0.45" stop-color="#05070d" stop-opacity="0"/></linearGradient></defs></svg>`
        ),
        left: 0,
        top: 0,
      },
    ])
    .jpeg({ quality: 84 })
    .toFile(path.join(PUB, "og.jpg"));


  // 7. Intro splash (the original hero shot) + the remaining candids for the
  //    scatter gallery. Portrait 4:5 crops, centred on the subject.
  const INTRO_SRC = path.join(SRC, "Screenshot_20260204-125344.png");
  const im = await sharp(INTRO_SRC).metadata();
  const iw = Math.round(im.width * 0.86);
  const ih = Math.min(im.height, Math.round(iw * 1.25));
  await sharp(INTRO_SRC)
    .extract({
      left: Math.round((im.width - iw) / 2),
      top: Math.min(Math.round(im.height * 0.06), im.height - ih),
      width: iw,
      height: ih,
    })
    .resize({ width: 900 })
    .webp({ quality: 86 })
    .toFile(path.join(OUT, "intro.webp"));

  const gallery = [
    ["VID_20260204_110129_704_exported_2598.jpg", "gallery-1.webp", 0.30],
    ["VID_20260204_111910_604_exported_0.jpg", "gallery-2.webp", 0.42],
    ["VID_20260204_112304_472_exported_0.jpg", "gallery-3.webp", 0.34],
  ];
  for (const [file, out, topFrac] of gallery) {
    const src = path.join(SRC, file);
    const m = await sharp(src).metadata();
    const w = m.width;
    const h = Math.min(m.height, Math.round(w * 1.25));
    await sharp(src)
      .extract({ left: 0, top: Math.min(Math.round(m.height * topFrac), m.height - h), width: w, height: h })
      .resize({ width: 720 })
      .webp({ quality: 84 })
      .toFile(path.join(OUT, out));
  }

  // 5. Resume PDF
  await copyFile(RESUME, path.join(PUB, "resume.pdf"));

  // 6. Drop outputs from older iterations
  for (const stale of ["hero.webp", "hero-particles.png", "about-1.webp", "about-2.webp"]) {
    await rm(path.join(OUT, stale), { force: true });
  }

  console.log("done: hero-card, hero-duotone, about-card, intro, gallery-1..3, og.jpg, resume.pdf");
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
