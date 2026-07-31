// Viewport-sized screenshots of each section, scrolled into view — the honest
// way to check anything drawn on the fixed WebGL canvas (fullPage captures
// can't paint fixed layers off-screen).
import puppeteer from "puppeteer-core";
import path from "node:path";

const OUT = process.argv[2] ?? ".shots";
const URL = process.env.SHOT_URL ?? "http://localhost:3000";
const WIDTH = Number(process.env.SHOT_W ?? 1280);
const HEIGHT = Number(process.env.SHOT_H ?? 800);
const TAG = process.env.SHOT_TAG ?? "sec";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 200)));
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));

for (const id of ["projects", "experience", "next", "about", "skills", "contact"]) {
  await page.evaluate((sel) => {
    const el = document.getElementById(sel);
    const y = el ? el.getBoundingClientRect().top + window.scrollY - 40 : 0;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }, id);
  await new Promise((r) => setTimeout(r, 1400));
  await page.screenshot({ path: path.join(OUT, `${TAG}-${id}.png`) });
  console.log("shot", id);
}

await browser.close();
