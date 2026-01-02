/**
 * CDP Connection Helper
 *
 * Shared utilities for connecting to Chrome via DevTools Protocol
 */

const puppeteer = require('puppeteer-core');

const CDP_PORT = process.env.CDP_PORT || 9222;
const CDP_URL = `http://127.0.0.1:${CDP_PORT}`;

/**
 * Connect to running Chrome instance
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
async function connect() {
  try {
    const browser = await puppeteer.connect({
      browserURL: CDP_URL,
      defaultViewport: null
    });

    const pages = await browser.pages();
    const page = pages[0] || await browser.newPage();

    return { browser, page };
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.error('❌ Chrome not running with CDP enabled');
      console.error('👉 Run: node scripts/start.js');
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get all pages/tabs
 * @param {Browser} browser
 * @returns {Promise<Page[]>}
 */
async function getAllPages(browser) {
  return browser.pages();
}

/**
 * Find page by URL pattern
 * @param {Browser} browser
 * @param {string|RegExp} pattern
 * @returns {Promise<Page|null>}
 */
async function findPage(browser, pattern) {
  const pages = await browser.pages();
  for (const page of pages) {
    const url = page.url();
    if (typeof pattern === 'string' && url.includes(pattern)) {
      return page;
    }
    if (pattern instanceof RegExp && pattern.test(url)) {
      return page;
    }
  }
  return null;
}

module.exports = {
  CDP_PORT,
  CDP_URL,
  connect,
  getAllPages,
  findPage
};
