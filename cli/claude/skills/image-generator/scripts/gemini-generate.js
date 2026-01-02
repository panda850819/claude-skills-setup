#!/usr/bin/env node
/**
 * Gemini Image Generator
 *
 * 使用 Puppeteer 自動化 Gemini 生圖
 *
 * Usage:
 *   node gemini-generate.js --prompt "your prompt" --output "./output.png"
 *
 * 首次使用：
 *   1. 設定 CHROME_PROFILE_PATH 環境變數或修改下方路徑
 *   2. 手動登入一次 Google 帳號
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Helper: 等待函數（替代已棄用的 page.waitForTimeout）
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// 配置
// ============================================================================

const CONFIG = {
  // Chrome profile 路徑（保持登入狀態）
  // 使用獨立 profile（首次需手動登入 Google）
  chromeProfilePath: process.env.CHROME_PROFILE_PATH ||
    path.join(process.env.HOME, '.puppeteer-chrome-profile'),

  // Gemini URL
  geminiUrl: 'https://gemini.google.com/app',

  // 超時設定 (ms)
  timeout: {
    navigation: 30000,
    generation: 120000,  // 圖片生成可能需要較長時間
    download: 30000
  },

  // 是否顯示瀏覽器（調試用）
  headless: false,  // 建議首次使用設為 false
};

// ============================================================================
// Selectors（Gemini UI 可能更新，需要調整）
// ============================================================================

const SELECTORS = {
  // 輸入框
  promptInput: 'div[contenteditable="true"], textarea[aria-label*="prompt"], .ql-editor',

  // 發送按鈕
  submitButton: 'button[aria-label*="Send"], button[aria-label*="Submit"], button[data-test-id="send-button"]',

  // 生成的圖片
  generatedImage: 'img[src*="googleusercontent"], img[alt*="Generated"]',

  // 下載按鈕（如果有）
  downloadButton: 'button[aria-label*="Download"], button[aria-label*="Save"]',
};

// ============================================================================
// 主函數
// ============================================================================

async function generateImage(prompt, outputPath) {
  console.log('🚀 Starting Gemini image generation...');
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
  console.log(`📁 Output: ${outputPath}`);

  // 確保輸出目錄存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 啟動瀏覽器（使用真正的 Chrome，不是 Chromium）
  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    userDataDir: CONFIG.chromeProfilePath,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 隱藏自動化痕跡
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    // 1. 前往 Gemini
    console.log('🌐 Navigating to Gemini...');
    await page.goto(CONFIG.geminiUrl, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.timeout.navigation
    });

    // 等待頁面載入
    await delay(2000);

    // 2. 檢查是否需要登入
    const needsLogin = await page.$('input[type="email"]');
    if (needsLogin) {
      console.log('⚠️  需要登入 Google 帳號');
      console.log('👉 請在開啟的瀏覽器中手動登入');
      console.log('👉 登入完成後，等待頁面載入 Gemini');
      console.log(`Chrome profile 位置: ${CONFIG.chromeProfilePath}`);

      // 等待用戶登入（最多 5 分鐘）
      console.log('⏳ 等待登入完成...');
      try {
        await page.waitForSelector(SELECTORS.promptInput, { timeout: 300000 });
        console.log('✅ 登入成功！繼續執行...');
      } catch (e) {
        console.log('❌ 登入超時，請重新執行');
        await browser.close();
        process.exit(1);
      }
    }

    // 3. 輸入 prompt
    console.log('✏️  Entering prompt...');

    // 嘗試多種 selector
    let inputElement = null;
    for (const selector of SELECTORS.promptInput.split(', ')) {
      inputElement = await page.$(selector);
      if (inputElement) break;
    }

    if (!inputElement) {
      throw new Error('找不到輸入框，Gemini UI 可能已更新');
    }

    await inputElement.click();
    await page.keyboard.type(prompt, { delay: 10 });

    // 4. 發送請求
    console.log('📤 Submitting prompt...');
    await delay(500);

    // 嘗試多種發送方式
    const submitButton = await page.$(SELECTORS.submitButton);
    if (submitButton) {
      await submitButton.click();
    } else {
      // 備用：按 Enter
      await page.keyboard.press('Enter');
    }

    // 5. 等待生成
    console.log('⏳ Waiting for image generation...');

    // 等待圖片出現
    await page.waitForSelector(SELECTORS.generatedImage, {
      timeout: CONFIG.timeout.generation
    });

    // 額外等待確保圖片完全載入
    await delay(3000);

    // 6. 下載圖片
    console.log('💾 Downloading image...');

    const imageElement = await page.$(SELECTORS.generatedImage);
    if (!imageElement) {
      throw new Error('找不到生成的圖片');
    }

    // 方法 1: 嘗試右鍵下載
    const imageSrc = await page.evaluate(el => el.src, imageElement);

    if (imageSrc) {
      // 使用 fetch 下載圖片
      const imageBuffer = await page.evaluate(async (src) => {
        const response = await fetch(src);
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
      }, imageSrc);

      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      console.log(`✅ Image saved to: ${outputPath}`);
    } else {
      // 方法 2: 截圖圖片元素
      await imageElement.screenshot({ path: outputPath });
      console.log(`✅ Screenshot saved to: ${outputPath}`);
    }

    // 7. 記錄 prompt
    const promptLogPath = outputPath.replace(/\.[^.]+$/, '.prompt.txt');
    fs.writeFileSync(promptLogPath, prompt);
    console.log(`📝 Prompt saved to: ${promptLogPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);

    // 截圖用於調試
    const debugPath = outputPath.replace(/\.[^.]+$/, '.debug.png');
    await page.screenshot({ path: debugPath, fullPage: true });
    console.log(`🐛 Debug screenshot: ${debugPath}`);

    throw error;
  } finally {
    await browser.close();
  }
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    prompt: '',
    output: './generated-image.png'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prompt' || args[i] === '-p') {
      result.prompt = args[++i];
    } else if (args[i] === '--output' || args[i] === '-o') {
      result.output = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node gemini-generate.js [options]

Options:
  --prompt, -p   Image prompt (required)
  --output, -o   Output file path (default: ./generated-image.png)
  --help, -h     Show this help

Example:
  node gemini-generate.js -p "A minimalist tech illustration" -o "./images/hero.png"
      `);
      process.exit(0);
    }
  }

  return result;
}

// 主程式
(async () => {
  const { prompt, output } = parseArgs();

  if (!prompt) {
    console.error('❌ Error: --prompt is required');
    process.exit(1);
  }

  try {
    await generateImage(prompt, output);
    console.log('🎉 Done!');
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
})();
