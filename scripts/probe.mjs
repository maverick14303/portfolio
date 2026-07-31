// Diagnostic: dump console messages + DOM state for the hero card.
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars"],
});
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message.slice(0, 300)}`));
await page.setViewport({ width: 1280, height: 800 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 3000));

const state = await page.evaluate(() => {
  const img = document.querySelector("figure img");
  const canvases = [...document.querySelectorAll("canvas")].map((c) => ({
    w: c.width,
    h: c.height,
    parentClass: (c.parentElement?.className || "").toString().slice(0, 60),
  }));
  return {
    img: img ? { src: img.currentSrc.slice(0, 120), natW: img.naturalWidth, complete: img.complete } : null,
    canvases,
  };
});
console.log(JSON.stringify(state, null, 1));
console.log("--- console ---");
for (const l of logs.slice(0, 25)) console.log(l);
await browser.close();
