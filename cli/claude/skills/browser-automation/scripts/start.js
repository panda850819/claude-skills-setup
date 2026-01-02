#!/usr/bin/env node
/**
 * Start Chrome with CDP (Chrome DevTools Protocol)
 *
 * Key insight from Factory: Copy profile to temp dir to avoid singleton lock
 *
 * Usage:
 *   node start.js              # Fresh temp profile
 *   node start.js --profile    # Copy your Chrome profile (keeps cookies/logins)
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CDP_PORT = process.env.CDP_PORT || 9222;

// Chrome paths by platform
const CHROME_PATHS = {
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/usr/bin/google-chrome',
  win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
};

// User profile directories
const USER_PROFILES = {
  darwin: path.join(os.homedir(), 'Library/Application Support/Google/Chrome'),
  linux: path.join(os.homedir(), '.config/google-chrome'),
  win32: path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data')
};

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    useProfile: args.includes('--profile') || args.includes('-p'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function isPortInUse(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function copyProfileToTemp(sourceDir) {
  const tempDir = path.join(os.tmpdir(), `chrome-cdp-${Date.now()}`);
  console.log(`📂 Copying profile to: ${tempDir}`);

  // Copy essential profile data (not everything - just cookies/login state)
  const essentialDirs = ['Default', 'Local State', 'First Run'];

  fs.mkdirSync(tempDir, { recursive: true });

  for (const item of essentialDirs) {
    const src = path.join(sourceDir, item);
    const dest = path.join(tempDir, item);

    if (fs.existsSync(src)) {
      try {
        // Use cp -r for directories
        if (fs.statSync(src).isDirectory()) {
          execSync(`cp -r "${src}" "${dest}"`, { stdio: 'ignore' });
        } else {
          fs.copyFileSync(src, dest);
        }
      } catch (e) {
        // Ignore copy errors for locked files
      }
    }
  }

  return tempDir;
}

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
Usage: node start.js [options]

Options:
  --profile, -p   Copy your Chrome profile (preserves logins/cookies)
  --help, -h      Show this help

The script creates a temporary copy of your profile to avoid conflicts
with your running Chrome instance.

Examples:
  node start.js              # Fresh temporary profile
  node start.js --profile    # With your cookies and logins
`);
    return;
  }

  // Check if CDP already running
  if (isPortInUse(CDP_PORT)) {
    console.log(`✅ Chrome CDP already running on port ${CDP_PORT}`);
    console.log(`🔗 http://127.0.0.1:${CDP_PORT}`);
    return;
  }

  const chromePath = CHROME_PATHS[process.platform];
  if (!chromePath || !fs.existsSync(chromePath)) {
    console.error('❌ Chrome not found');
    process.exit(1);
  }

  // Create temp profile directory
  let userDataDir;
  if (opts.useProfile) {
    const userProfile = USER_PROFILES[process.platform];
    if (userProfile && fs.existsSync(userProfile)) {
      userDataDir = copyProfileToTemp(userProfile);
    } else {
      console.log('⚠️  User profile not found, using fresh profile');
      userDataDir = path.join(os.tmpdir(), `chrome-cdp-${Date.now()}`);
      fs.mkdirSync(userDataDir, { recursive: true });
    }
  } else {
    userDataDir = path.join(os.tmpdir(), `chrome-cdp-${Date.now()}`);
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const chromeArgs = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-translate',
    '--disable-blink-features=AutomationControlled'
  ];

  console.log('🚀 Starting Chrome with CDP...');

  const chrome = spawn(chromePath, chromeArgs, {
    detached: true,
    stdio: 'ignore'
  });

  chrome.unref();

  // Wait for CDP
  await new Promise(r => setTimeout(r, 2000));

  if (isPortInUse(CDP_PORT)) {
    console.log(`✅ Chrome started on :${CDP_PORT}` + (opts.useProfile ? ' with your profile' : ''));
    console.log(`🔗 http://127.0.0.1:${CDP_PORT}`);
    console.log(`📍 Profile: ${userDataDir}`);
  } else {
    console.error('❌ Failed to start Chrome');
    process.exit(1);
  }
}

main().catch(console.error);
