// Verifies that plain page scrolling advances the carousel (the reel's
// behaviour) and that the page keeps scrolling normally throughout.
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));

const jump = async (y) =>
  page.evaluate((yy) => {
    if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true, force: true });
    else window.scrollTo(0, yy);
  }, y);

const start = await page.evaluate(() => {
  const el = document.querySelector("#projects");
  return el.getBoundingClientRect().top + window.scrollY;
});

const readState = () =>
  page.evaluate(() => ({
    active: document.querySelector("#projects h3")?.textContent?.slice(0, 34),
    y: Math.round(window.scrollY),
  }));

console.log("scrolling through the projects track:");
const seen = [];
for (let i = 0; i <= 8; i++) {
  await jump(start + i * 380);
  await new Promise((r) => setTimeout(r, 700));
  const s = await readState();
  seen.push(s.active);
  console.log(`  y=${String(s.y).padStart(5)}  →  ${s.active}`);
}

const unique = [...new Set(seen)];
console.log(`\ndistinct cards surfaced by scrolling alone: ${unique.length}/8`);
console.log(unique.length >= 5 ? "PASS: scroll drives the carousel" : "FAIL: cards not advancing");

// page must still scroll past the section
await jump(start + 6000);
await new Promise((r) => setTimeout(r, 600));
const past = await page.evaluate(() => {
  const el = document.querySelector("#about");
  return el ? el.getBoundingClientRect().top < window.innerHeight : false;
});
console.log(past ? "PASS: page scrolls past into About" : "FAIL: page appears stuck");

await browser.close();
