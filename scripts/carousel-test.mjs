// Captures the project carousel at rest and after advancing, so the 3D
// coverflow and the active-card detail swap can both be eyeballed.
import puppeteer from "puppeteer-core";

const OUT = process.argv[2] ?? ".shots";
const URL = process.env.SHOT_URL ?? "http://localhost:3000";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 200)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("console error:", m.text().slice(0, 200));
});
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));

// bring the carousel into view via Lenis (raw scrollTo gets reverted)
await page.evaluate(() => {
  const el = document.querySelector("#projects");
  const y = el.getBoundingClientRect().top + window.scrollY - 40;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
});
await new Promise((r) => setTimeout(r, 2200));
await page.screenshot({ path: `${OUT}/carousel-0.png` });

const state = await page.evaluate(() => {
  const h3 = document.querySelector("#projects h3");
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  return {
    active: h3?.textContent,
    tabs: tabs.length,
    selected: tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"),
  };
});
console.log("at rest:", JSON.stringify(state));

// advance two cards with the next button
const next = await page.$('button[aria-label="Next project"]');
await next.click();
await new Promise((r) => setTimeout(r, 900));
await next.click();
await new Promise((r) => setTimeout(r, 1400));
await page.screenshot({ path: `${OUT}/carousel-2.png` });

const after = await page.evaluate(() => {
  const h3 = document.querySelector("#projects h3");
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  return {
    active: h3?.textContent,
    selected: tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"),
  };
});
console.log("after 2 next:", JSON.stringify(after));

await browser.close();
