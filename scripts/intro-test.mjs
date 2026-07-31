// Captures the intro at three moments, then checks the site is usable after
// it lifts. Also re-checks scroll-driving now that the track is shorter.
import puppeteer from "puppeteer-core";

const OUT = ".shots";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 160)));
await page.setViewport({ width: 1280, height: 860 });
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 90000 });

for (const [ms, name] of [
  [900, "intro-a"],
  [2100, "intro-b"],
  [3300, "intro-c"],
]) {
  await new Promise((r) => setTimeout(r, ms - (name === "intro-a" ? 0 : 900)));
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

await new Promise((r) => setTimeout(r, 1600));
const afterIntro = await page.evaluate(() => ({
  overflow: document.documentElement.style.overflow,
  introGone: !document.querySelector('[class*="z-\\[100\\]"]'),
  scrollable: document.body.scrollHeight > window.innerHeight,
}));
console.log("after intro:", JSON.stringify(afterIntro));
await page.screenshot({ path: `${OUT}/intro-done.png` });

// scroll-drive check with the shorter track
const start = await page.evaluate(() => {
  const el = document.querySelector("#projects");
  return el.getBoundingClientRect().top + window.scrollY;
});
const seen = [];
for (let i = 0; i <= 9; i++) {
  await page.evaluate(
    (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)),
    start + i * 260
  );
  await new Promise((r) => setTimeout(r, 480));
  seen.push(await page.evaluate(() => document.querySelector("#projects h3")?.textContent?.slice(0, 30)));
}
console.log("cards while scrolling:", [...new Set(seen)].length, "distinct");
seen.forEach((s, i) => console.log(`  step ${i}: ${s}`));

await browser.close();
