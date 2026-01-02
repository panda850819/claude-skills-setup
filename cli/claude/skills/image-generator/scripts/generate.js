#!/usr/bin/env node
/**
 * Gemini Image Generator
 *
 * Automates image generation via Gemini using CDP.
 * Automatically removes Gemini watermark after generation.
 *
 * Usage:
 *   node generate.js --prompt "your prompt" --output "./image.png"
 *   node generate.js -p "prompt" -o "./image.png" --keep-watermark
 */

const { connect, findPage } = require('../../browser-automation/scripts/cdp');
const { processImage: removeWatermark } = require('./watermark');
const path = require('path');
const fs = require('fs');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  geminiUrl: 'https://gemini.google.com/app',
  timeout: {
    navigation: 30000,
    generation: 180000,  // 3 min for image generation
    download: 30000
  }
};

// Selectors - update these if Gemini UI changes
// Use pick.js to find new selectors interactively
const SELECTORS = {
  promptInput: [
    '.ql-editor[contenteditable="true"]',
    'div[contenteditable="true"][role="textbox"]',
    'rich-textarea div[contenteditable="true"]',
    'div[contenteditable="true"]'
  ],
  submitButton: [
    'button[aria-label*="Send"]',
    'button[aria-label*="Submit"]',
    'button[data-test-id="send-button"]',
    'button.send-button',
    'mat-icon-button[aria-label*="Send"]'
  ],
  generatedImage: [
    'img[alt*="的圖片"]',           // Chinese: "的圖片" = generated image
    'img[alt*="Generated"]',        // English fallback
    'img[src*="lh3.googleusercontent.com/gg/"]'  // /gg/ path = generated content
  ],
  loading: [
    '.loading-indicator',
    '[aria-label*="Loading"]',
    '.response-loading'
  ]
};

// ============================================================================
// Helper Functions
// ============================================================================

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { prompt: '', output: './generated-image.png', keepWatermark: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prompt' || args[i] === '-p') {
      result.prompt = args[++i];
    } else if (args[i] === '--output' || args[i] === '-o') {
      result.output = args[++i];
    } else if (args[i] === '--keep-watermark' || args[i] === '-k') {
      result.keepWatermark = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node generate.js [options]

Options:
  --prompt, -p       Image prompt (required)
  --output, -o       Output file path (default: ./generated-image.png)
  --keep-watermark   Keep Gemini watermark (default: auto-remove)
  --help, -h         Show this help

Example:
  node generate.js -p "A minimalist tech illustration" -o "./images/hero.png"
  node generate.js -p "prompt" -o "./out.png" --keep-watermark
`);
      process.exit(0);
    }
  }

  return result;
}

async function findElement(page, selectors, description) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`  Found ${description}: ${selector}`);
        return element;
      }
    } catch {}
  }
  return null;
}

async function waitForElement(page, selectors, timeout, description) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = await findElement(page, selectors, description);
    if (element) return element;
    await delay(500);
  }

  throw new Error(`Timeout waiting for ${description}`);
}

// ============================================================================
// Main Generation Flow
// ============================================================================

async function generateImage(prompt, outputPath) {
  console.log('🚀 Gemini Image Generator (CDP Mode)');
  console.log(`📝 Prompt: ${prompt.substring(0, 80)}...`);
  console.log(`📁 Output: ${outputPath}`);
  console.log('');

  // Ensure output directory exists
  const outputDir = path.dirname(path.resolve(outputPath));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Connect to Chrome
  console.log('🔗 Connecting to Chrome...');
  const { browser, page } = await connect();

  try {
    // Check if already on Gemini or navigate
    const currentUrl = page.url();
    if (!currentUrl.includes('gemini.google.com')) {
      console.log('🌐 Navigating to Gemini...');
      await page.goto(CONFIG.geminiUrl, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout.navigation
      });
    } else {
      console.log('✅ Already on Gemini');
    }

    await delay(2000);

    // Check for login requirement
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('');
      console.log('⚠️  需要登入 Google 帳號');
      console.log('👉 請在瀏覽器中手動登入');
      console.log('👉 登入完成後重新執行此腳本');
      console.log('');
      console.log('提示: 使用 --profile 選項啟動 Chrome 可保持登入狀態:');
      console.log('  node scripts/start.js --profile');
      await browser.disconnect();
      process.exit(1);
    }

    // Find and fill prompt input
    console.log('✏️  Finding input field...');
    const inputElement = await waitForElement(
      page,
      SELECTORS.promptInput,
      10000,
      'prompt input'
    );

    // Click and type prompt
    await inputElement.click();
    await delay(300);

    // Clear existing content and type new prompt
    await page.keyboard.down('Meta');
    await page.keyboard.press('a');
    await page.keyboard.up('Meta');
    await page.keyboard.type(prompt, { delay: 15 });

    console.log('📤 Submitting prompt...');
    await delay(500);

    // Try submit button first, then Enter key
    const submitButton = await findElement(page, SELECTORS.submitButton, 'submit button');
    if (submitButton) {
      await submitButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for generation
    console.log('⏳ Waiting for image generation (this may take 1-2 minutes)...');

    const imageElement = await waitForElement(
      page,
      SELECTORS.generatedImage,
      CONFIG.timeout.generation,
      'generated image'
    );

    // Extra wait for image to fully load
    await delay(3000);

    // Download the image
    console.log('💾 Downloading image...');

    const resolvedPath = path.resolve(outputPath);

    // Method 1: Screenshot the element (most reliable)
    try {
      await imageElement.screenshot({ path: resolvedPath });
      console.log(`✅ Image saved: ${resolvedPath}`);
    } catch (screenshotError) {
      // Method 2: Try fetch as fallback
      const imageSrc = await page.evaluate(el => el.src, imageElement);

      if (imageSrc && imageSrc.startsWith('http')) {
        const imageBuffer = await page.evaluate(async (src) => {
          const response = await fetch(src);
          if (!response.ok) throw new Error('Fetch failed');
          const buffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        }, imageSrc);

        fs.writeFileSync(resolvedPath, Buffer.from(imageBuffer));
        console.log(`✅ Image saved: ${resolvedPath}`);
      } else {
        throw new Error('No valid image source');
      }
    }

    // Save prompt for reference
    const promptPath = outputPath.replace(/\.[^.]+$/, '.prompt.txt');
    fs.writeFileSync(path.resolve(promptPath), prompt);
    console.log(`📝 Prompt saved: ${promptPath}`);

    // Return the resolved path for watermark removal
    return resolvedPath;

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');

    // Save debug screenshot
    const debugPath = outputPath.replace(/\.[^.]+$/, '.debug.png');
    try {
      await page.screenshot({ path: debugPath, fullPage: true });
      console.error(`🐛 Debug screenshot saved: ${debugPath}`);
    } catch {}

    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Use pick.js to find updated selectors: node scripts/pick.js');
    console.error('  2. Check if logged in to Google');
    console.error('  3. Try restarting Chrome: node scripts/start.js --profile');

    throw error;
  } finally {
    await browser.disconnect();
  }
}

// ============================================================================
// CLI Entry Point
// ============================================================================

(async () => {
  const { prompt, output, keepWatermark } = parseArgs();

  if (!prompt) {
    console.error('❌ Error: --prompt is required');
    console.error('Usage: node generate.js --prompt "your prompt" --output "./image.png"');
    process.exit(1);
  }

  try {
    const imagePath = await generateImage(prompt, output);

    // Remove watermark unless --keep-watermark is specified
    if (!keepWatermark && imagePath) {
      console.log('');
      console.log('🧹 Removing Gemini watermark...');
      try {
        await removeWatermark(imagePath, imagePath);
      } catch (wmError) {
        console.log(`⚠️  Watermark removal failed: ${wmError.message}`);
        console.log('   (Original image kept)');
      }
    }

    console.log('');
    console.log('🎉 Done!');
  } catch (error) {
    process.exit(1);
  }
})();
