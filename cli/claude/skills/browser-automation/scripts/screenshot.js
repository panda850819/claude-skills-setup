#!/usr/bin/env node
/**
 * Take screenshot via CDP
 *
 * Usage:
 *   node screenshot.js                    # Save to temp dir with timestamp
 *   node screenshot.js -o ./output.png    # Save to specific path
 *   node screenshot.js --full             # Full page screenshot
 *   node screenshot.js --selector "img"   # Screenshot specific element
 */

const { connect } = require('./cdp');
const path = require('path');
const os = require('os');
const fs = require('fs');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    output: null,
    fullPage: false,
    selector: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') {
      result.help = true;
    } else if (args[i] === '-o' || args[i] === '--output') {
      result.output = args[++i];
    } else if (args[i] === '--full' || args[i] === '-f') {
      result.fullPage = true;
    } else if (args[i] === '--selector' || args[i] === '-s') {
      result.selector = args[++i];
    }
  }

  return result;
}

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node screenshot.js [options]

Options:
  -o, --output <path>     Save to specific path (default: temp dir)
  -f, --full              Full page screenshot
  -s, --selector <css>    Screenshot specific element
  --help                  Show this help

Examples:
  node screenshot.js                          # Viewport to temp
  node screenshot.js -o ./screen.png          # Viewport to path
  node screenshot.js --full -o ./fullpage.png # Full page
  node screenshot.js -s "img.generated"       # Specific element
`);
    return;
  }

  const { browser, page } = await connect();

  // Determine output path
  let outputPath = opts.output;
  if (!outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    outputPath = path.join(os.tmpdir(), `screenshot-${timestamp}.png`);
  }

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    if (opts.selector) {
      // Element screenshot
      const element = await page.$(opts.selector);
      if (!element) {
        console.error(`❌ Element not found: ${opts.selector}`);
        process.exit(1);
      }
      await element.screenshot({ path: outputPath });
      console.log(`📸 Element screenshot saved: ${outputPath}`);
    } else {
      // Page screenshot
      await page.screenshot({
        path: outputPath,
        fullPage: opts.fullPage
      });
      console.log(`📸 Screenshot saved: ${outputPath}`);
    }

    // Also log to stdout for easy piping
    console.log(outputPath);
  } catch (error) {
    console.error('❌ Screenshot error:', error.message);
    process.exit(1);
  }

  await browser.disconnect();
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
