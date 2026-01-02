#!/usr/bin/env node
/**
 * Interactive DOM Element Picker
 *
 * Opens an interactive mode where you can click elements to get their selectors.
 * Useful for finding the right selectors when UI changes.
 *
 * Usage:
 *   node pick.js              # Start picker mode
 *   node pick.js --multi      # Multi-select mode (Cmd/Ctrl+Click)
 */

const { connect } = require('./cdp');
const readline = require('readline');

const PICKER_SCRIPT = `
(function() {
  if (window.__pickerActive) return 'Picker already active';

  window.__pickerActive = true;
  window.__pickedElements = [];

  const overlay = document.createElement('div');
  overlay.id = '__picker-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:999999;pointer-events:none;';
  document.body.appendChild(overlay);

  const info = document.createElement('div');
  info.id = '__picker-info';
  info.style.cssText = 'position:fixed;top:10px;left:10px;background:#333;color:#fff;padding:10px 15px;border-radius:8px;font-family:monospace;font-size:12px;z-index:1000000;max-width:80%;word-break:break-all;';
  info.textContent = '🎯 Click element to select (Cmd/Ctrl+Click for multi) | Press Escape to exit';
  document.body.appendChild(info);

  let highlight = null;

  function getSelector(el) {
    if (el.id) return '#' + el.id;

    const parts = [];
    while (el && el.nodeType === 1) {
      let selector = el.tagName.toLowerCase();

      if (el.id) {
        selector = '#' + el.id;
        parts.unshift(selector);
        break;
      }

      if (el.className && typeof el.className === 'string') {
        const classes = el.className.trim().split(/\\s+/).filter(c => c && !c.startsWith('_'));
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 2).join('.');
        }
      }

      const siblings = el.parentNode ? Array.from(el.parentNode.children).filter(c => c.tagName === el.tagName) : [];
      if (siblings.length > 1) {
        const index = siblings.indexOf(el) + 1;
        selector += ':nth-of-type(' + index + ')';
      }

      parts.unshift(selector);
      el = el.parentNode;

      if (parts.length >= 4) break;
    }

    return parts.join(' > ');
  }

  function onMouseMove(e) {
    if (highlight) highlight.remove();

    const rect = e.target.getBoundingClientRect();
    highlight = document.createElement('div');
    highlight.style.cssText = 'position:fixed;border:2px solid #00f;background:rgba(0,0,255,0.1);pointer-events:none;z-index:999998;';
    highlight.style.left = rect.left + 'px';
    highlight.style.top = rect.top + 'px';
    highlight.style.width = rect.width + 'px';
    highlight.style.height = rect.height + 'px';
    overlay.appendChild(highlight);

    const selector = getSelector(e.target);
    info.textContent = '🎯 ' + selector;
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const selector = getSelector(e.target);
    const elementInfo = {
      selector: selector,
      tag: e.target.tagName.toLowerCase(),
      text: (e.target.textContent || '').slice(0, 50).trim(),
      attributes: {}
    };

    ['id', 'class', 'name', 'type', 'aria-label', 'data-test-id', 'src', 'href'].forEach(attr => {
      const val = e.target.getAttribute(attr);
      if (val) elementInfo.attributes[attr] = val.slice(0, 100);
    });

    window.__pickedElements.push(elementInfo);
    console.log('PICKED:', JSON.stringify(elementInfo));

    if (!e.metaKey && !e.ctrlKey) {
      cleanup();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  function cleanup() {
    window.__pickerActive = false;
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    overlay.remove();
    info.remove();
    console.log('PICKER_DONE:', JSON.stringify(window.__pickedElements));
  }

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);

  return 'Picker activated - click elements to select';
})();
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: node pick.js [options]

Interactive DOM element picker. Click elements in the browser to get their CSS selectors.

Options:
  --multi    Keep picker active for multiple selections (Cmd/Ctrl+Click)
  --help     Show this help

Controls:
  Click              Select element and exit
  Cmd/Ctrl + Click   Select element and continue
  Escape             Exit without selecting

The tool outputs selector information that can be used in other scripts.
`);
    return;
  }

  console.log('🎯 Starting element picker...');
  console.log('');
  console.log('Instructions:');
  console.log('  • Hover over elements to see their selector');
  console.log('  • Click to select and copy selector');
  console.log('  • Cmd/Ctrl+Click for multi-select');
  console.log('  • Press Escape to exit');
  console.log('');

  const { browser, page } = await connect();

  // Inject picker
  await page.evaluate(PICKER_SCRIPT);

  // Listen for console messages
  const picked = [];

  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('PICKED:')) {
      const data = JSON.parse(text.replace('PICKED:', ''));
      picked.push(data);
      console.log('✅ Selected:', data.selector);
      if (data.attributes['aria-label']) {
        console.log('   aria-label:', data.attributes['aria-label']);
      }
    }
    if (text.startsWith('PICKER_DONE:')) {
      console.log('');
      console.log('📋 All selected elements:');
      picked.forEach((p, i) => {
        console.log(`${i + 1}. ${p.selector}`);
      });
      browser.disconnect();
      process.exit(0);
    }
  });

  // Keep alive
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('close', async () => {
    await browser.disconnect();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
