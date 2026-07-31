// Verifies the no-particles fallback: emulates prefers-reduced-motion and
// captures the portrait panel, which must show the static duotone photo.
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.setViewport({ width: 1280, height: 800 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: ".shots/panel-fallback.png", clip: { x: 820, y: 150, width: 380, height: 500 } });
const caption = await page.evaluate(() => document.querySelector("figcaption")?.textContent);
console.log("caption:", caption);
await browser.close();
