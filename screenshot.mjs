import puppeteer from 'puppeteer-core';
import { mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const screenshotDir = join(__dirname, 'temporary screenshots');

await mkdir(screenshotDir, { recursive: true });

// Auto-increment screenshot number
const files = await readdir(screenshotDir).catch(() => []);
const nums = files
  .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0'))
  .filter(n => !isNaN(n));
const nextNum = nums.length ? Math.max(...nums) + 1 : 1;

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const filename = `screenshot-${nextNum}${label}.png`;
const outPath = join(screenshotDir, filename);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500)); // let animations and fonts settle
await page.screenshot({ path: outPath, fullPage: true });

await browser.close();
console.log(`Screenshot saved: ${outPath}`);
