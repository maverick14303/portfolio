// Dev utility: full-page screenshots of the local site at desktop + mobile
// widths. Run: node scripts/shoot.mjs [outDir]
import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = process.argv[2] ?? path.resolve(import.meta.dirname, "..", ".shots");
const URL = process.env.SHOT_URL ?? "http://localhost:3000";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const shots = [
  { name: "desktop", width: 1280, height: 800, dsf: 1 },
  { name: "mobile", width: 375, height: 812, dsf: 2 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-first-run", "--disable-extensions", "--hide-scrollbars"],
});

for (const s of shots) {
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) console.log(`[${s.name}] ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => console.log(`[${s.name}] pageerror: ${e.message}`));
  await page.setViewport({ width: s.width, height: s.height, deviceScaleFactor: s.dsf });
  // dev server may 500 while recompiling for a second client — retry
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
    if (!res || res.status() < 500) break;
    console.log(`[${s.name}] got ${res.status()}, retrying...`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  await new Promise((r) => setTimeout(r, 1200)); // settle animations/fonts
  // Scroll through the whole page so every whileInView reveal has fired,
  // then return to the top before capturing.
  await page.evaluate(async () => {
    // Drive scrolling through Lenis when present — raw scrollTo gets reverted
    // by its rAF loop, so whileInView reveals in the tail never fire.
    const jump = (y) => {
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      jump(y);
      await new Promise((r) => setTimeout(r, 120));
    }
    jump(document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 600));
    jump(0);
  });
  await new Promise((r) => setTimeout(r, 900));
  // hero-only viewport shot
  await page.screenshot({ path: path.join(OUT, `${s.name}-hero.png`) });
  // full page
  await page.screenshot({ path: path.join(OUT, `${s.name}-full.png`), fullPage: true });
  console.log(`${s.name}: hero + full saved`);
  await page.close();
}

await browser.close();
console.log("out:", OUT);
