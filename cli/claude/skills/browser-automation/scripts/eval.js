#!/usr/bin/env node
/**
 * Evaluate JavaScript in Chrome tab via CDP
 *
 * Usage:
 *   node eval.js 'document.title'
 *   node eval.js '(() => { const x = 1; return x + 1; })()'
 *   node eval.js --json 'Array.from(document.querySelectorAll("a")).map(a => a.href)'
 */

const { connect } = require('./cdp');

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Usage: node eval.js [options] <javascript>

Options:
  --json, -j   Pretty print JSON output
  --help       Show this help

Notes:
  - Single expressions work directly: 'document.title'
  - Multiple statements need IIFE: '(() => { const x = 1; return x; })()'
  - Async supported: '(async () => { return await fetch("/api").then(r => r.json()); })()'

Examples:
  node eval.js 'document.title'
  node eval.js 'document.querySelectorAll("img").length'
  node eval.js --json 'Array.from(document.querySelectorAll("a")).slice(0,5).map(a => ({text: a.textContent, href: a.href}))'
`);
    return;
  }

  const jsonOutput = args.includes('--json') || args.includes('-j');
  const code = args.filter(a => !a.startsWith('-')).join(' ');

  if (!code) {
    console.error('❌ JavaScript code required');
    process.exit(1);
  }

  const { browser, page } = await connect();

  try {
    const result = await page.evaluate(code);

    if (jsonOutput && typeof result === 'object') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }
  } catch (error) {
    console.error('❌ Eval error:', error.message);
    process.exit(1);
  }

  await browser.disconnect();
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
