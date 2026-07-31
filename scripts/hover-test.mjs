import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 90000 });
await new Promise((r) => setTimeout(r, 3500)); // let intro finish

const clip = { x: 820, y: 150, width: 380, height: 500 };
await page.screenshot({ path: process.argv[2] + "/panel-idle.png", clip });

// hover into the portrait and let repulsion settle
await page.mouse.move(1007, 385, { steps: 12 });
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: process.argv[2] + "/panel-hover.png", clip });

await browser.close();
console.log("saved panel-idle.png / panel-hover.png");
