#!/usr/bin/env node

/**
 * Record a high-resolution smooth-scroll video of the stacked screenshot page
 * (documentation/demo_poc/scroll-page.html) using images 1–4.
 *
 * Prerequisites:
 *   Place these files in documentation/demo_poc/:
 *   - mosc_sacred_theme_home_screenshot_1.png
 *   - mosc_sacred_theme_home_screenshot_2.png
 *   - mosc_sacred_theme_home_screenshot_3.png
 *   - mosc_sacred_theme_home_screenshot_4.png
 *
 * Usage:
 *   npm run record:screenshot-scroll
 *   node scripts/record-screenshot-scroll-video.js
 *   node scripts/record-screenshot-scroll-video.js --resolution=2560x1440
 *
 * Output: videos/screenshot-scroll-<timestamp>.webm and .mp4 (if ffmpeg available)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'videos');
const SCROLL_HTML = path.join(PROJECT_ROOT, 'documentation', 'demo_poc', 'scroll-page.html');

const args = process.argv.slice(2);
const resArg = args.find(a => a.startsWith('--resolution='));
const noConvert = args.includes('--no-convert');

const RESOLUTION = resArg ? resArg.replace('--resolution=', '') : '1920x1080';
const [width, height] = RESOLUTION.split('x').map(Number) || [1920, 1080];

function toFileUrl(filePath) {
  const normalized = path.resolve(filePath).replace(/\\/g, '/');
  return 'file:///' + (normalized.startsWith('/') ? normalized.slice(1) : normalized);
}

async function run() {
  if (!fs.existsSync(SCROLL_HTML)) {
    console.error('Missing scroll page:', SCROLL_HTML);
    process.exit(1);
  }

  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    console.error('Playwright not installed. Run: npm install --save-dev playwright && npx playwright install chromium');
    process.exit(1);
  }

  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const videoName = `screenshot-scroll-${timestamp}`;
  const contextDir = path.join(VIDEOS_DIR, 'playwright-context-' + timestamp);

  const fileUrl = toFileUrl(SCROLL_HTML);
  console.log('Recording screenshot scroll video');
  console.log('  Page:', SCROLL_HTML);
  console.log('  URL:', fileUrl);
  console.log('  Resolution:', width, 'x', height);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox', '--allow-file-access-from-files'],
  });

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: contextDir,
      size: { width, height },
    },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  try {
    await page.goto(fileUrl, { waitUntil: 'load', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    const scrollStep = 350;
    const stepDelay = 80;

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    let scrollTop = 0;

    while (scrollTop < scrollHeight) {
      scrollTop += scrollStep;
      await page.evaluate((y) => window.scrollTo({ top: Math.min(y, 999999), behavior: 'instant' }), scrollTop);
      await new Promise((r) => setTimeout(r, stepDelay));
    }

    await new Promise((r) => setTimeout(r, 1200));
  } finally {
    await context.close();
    await browser.close();
  }

  const contextFiles = fs.readdirSync(contextDir);
  const webmFile = contextFiles.find(f => f.endsWith('.webm'));
  if (!webmFile) {
    console.warn('No .webm file found in', contextDir);
    process.exit(1);
  }

  const webmPath = path.join(contextDir, webmFile);
  const destWebm = path.join(VIDEOS_DIR, `${videoName}.webm`);
  fs.renameSync(webmPath, destWebm);
  fs.rmSync(contextDir, { recursive: true, force: true });

  console.log('\nSaved:', destWebm);

  if (!noConvert) {
    try {
      const { execSync } = await import('child_process');
      const mp4Path = path.join(VIDEOS_DIR, `${videoName}.mp4`);
      execSync(
        `ffmpeg -y -i "${destWebm}" -movflags faststart -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p "${mp4Path}"`,
        { stdio: 'inherit' }
      );
      console.log('Converted to MP4:', mp4Path);
    } catch (e) {
      console.log('\nTo convert to MP4 manually:');
      console.log(`  ffmpeg -i "${destWebm}" -movflags faststart -c:v libx264 -crf 18 "${path.join(VIDEOS_DIR, videoName + '.mp4')}"`);
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
