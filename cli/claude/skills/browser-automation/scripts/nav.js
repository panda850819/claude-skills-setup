#!/usr/bin/env node
/**
 * Navigate Chrome tab via CDP
 *
 * Usage:
 *   node nav.js https://example.com       # Navigate current tab
 *   node nav.js --new https://example.com # Open in new tab
 *   node nav.js --list                    # List all tabs
 */

const { connect, getAllPages } = require('./cdp');

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Usage: node nav.js [options] <url>

Options:
  --new, -n    Open URL in new tab
  --list, -l   List all open tabs
  --help       Show this help

Examples:
  node nav.js https://gemini.google.com/app
  node nav.js --new https://google.com
  node nav.js --list
`);
    return;
  }

  const { browser, page } = await connect();

  // List tabs
  if (args.includes('--list') || args.includes('-l')) {
    const pages = await getAllPages(browser);
    console.log('📑 Open tabs:');
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const title = await p.title();
      console.log(`  ${i + 1}. ${title || '(untitled)'}`);
      console.log(`     ${p.url()}`);
    }
    await browser.disconnect();
    return;
  }

  // Get URL (last non-flag argument)
  const url = args.filter(a => !a.startsWith('-')).pop();
  if (!url) {
    console.error('❌ URL required');
    process.exit(1);
  }

  // Ensure URL has protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  // New tab or current
  const openNew = args.includes('--new') || args.includes('-n');

  if (openNew) {
    const newPage = await browser.newPage();
    console.log(`🆕 Opening new tab: ${fullUrl}`);
    await newPage.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`✅ Loaded: ${await newPage.title()}`);
  } else {
    console.log(`🔗 Navigating to: ${fullUrl}`);
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`✅ Loaded: ${await page.title()}`);
  }

  await browser.disconnect();
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
