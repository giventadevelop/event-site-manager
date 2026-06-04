#!/usr/bin/env node

/**
 * Record a high-quality scroll-through video of a page (e.g. MOSC homepage)
 * and optionally convert to MP4.
 *
 * Usage:
 *   node scripts/record-mosc-scroll-video.js
 *   node scripts/record-mosc-scroll-video.js --url https://example.com/page
 *
 * Output:
 *   - videos/mosc-scroll-<timestamp>.webm (Playwright native)
 *   - videos/mosc-scroll-<timestamp>.mp4 (if ffmpeg is installed and conversion runs)
 *
 * Convert .webm to MP4 manually (if script doesn't run ffmpeg):
 *   ffmpeg -i videos/mosc-scroll-*.webm -movflags faststart -c:v libx264 -crf 18 videos/output.mp4
 *
 * High resolution: 1920x1080 (default). Use --resolution 2560x1440 for 2K.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'videos');

// Parse args
const args = process.argv.slice(2);
const urlArg = args.find(a => a.startsWith('--url='));
const resArg = args.find(a => a.startsWith('--resolution='));
const noConvert = args.includes('--no-convert');

const TARGET_URL = urlArg ? urlArg.replace('--url=', '') : 'https://www.mosc-temp.com/mosc';
const RESOLUTION = resArg ? resArg.replace('--resolution=', '') : '1920x1080';
const [width, height] = RESOLUTION.split('x').map(Number) || [1920, 1080];

async function run() {
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
  const videoName = `mosc-scroll-${timestamp}`;
  const contextDir = path.join(VIDEOS_DIR, 'playwright-context-' + timestamp);

  console.log('Recording scroll video');
  console.log('  URL:', TARGET_URL);
  console.log('  Resolution:', width, 'x', height);
  console.log('  Output dir:', VIDEOS_DIR);

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
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
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Smooth scroll from top to bottom in steps
    const scrollStep = 400;
    const stepDelay = 120;

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    let scrollTop = 0;

    while (scrollTop < scrollHeight) {
      scrollTop += scrollStep;
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.min(scrollTop, scrollHeight));
      await new Promise((r) => setTimeout(r, stepDelay));
    }

    // Pause at bottom briefly
    await new Promise((r) => setTimeout(r, 1500));
  } finally {
    await context.close();
    await browser.close();
  }

  // Playwright writes the video on context close; it's in contextDir with a generated name
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

  // Optional: convert to MP4 with ffmpeg
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
      console.log('\nTo convert to MP4 manually, run:');
      console.log(`  ffmpeg -i "${destWebm}" -movflags faststart -c:v libx264 -crf 18 "${path.join(VIDEOS_DIR, videoName + '.mp4')}"`);
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
