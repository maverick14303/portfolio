// Screenshots a locally-running project so the carousel cards show the real
// UI rather than an illustration.
//   node scripts/shoot-project.mjs <url> <out.png> [--pin 1234] [--path /x] [--w 1440] [--h 900]
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i === -1 ? d : args[i + 1];
};
const pin = opt("pin", null);
const gotoPath = opt("path", "/");
const W = Number(opt("w", 1440));
const H = Number(opt("h", 900));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-first-run", "--hide-scrollbars", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 160)));
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });

await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

// unlock a PIN gate if one is present
if (pin) {
  const input = await page.$('input[type="password"], input[type="text"], input[inputmode="numeric"]');
  if (input) {
    await input.click();
    await input.type(pin, { delay: 70 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 45000 }).catch(() => {}),
      page.keyboard.press("Enter"),
    ]);
    await new Promise((r) => setTimeout(r, 2000));
    // still gated? click the submit button as a fallback
    if (await page.$('input[type="password"]')) {
      const btn = await page.$('button[type="submit"], form button, button');
      if (btn) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 45000 }).catch(() => {}),
          btn.click(),
        ]);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    console.log("after unlock, url:", page.url());
  }
}

// `--path` is given without a leading slash (Git Bash rewrites those into
// Windows paths), e.g. `--path companies`
if (gotoPath && gotoPath !== "/") {
  const target = new URL(gotoPath.replace(/^\/+/, ""), url).href;
  await page.goto(target, { waitUntil: "networkidle2", timeout: 90000 });
}

await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: out });
const title = await page.title();
const text = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log("title:", title);
console.log("--- visible text ---\n" + text);
await browser.close();
