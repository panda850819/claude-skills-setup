#!/usr/bin/env node
/**
 * Gemini Watermark Remover
 *
 * Removes Gemini's SynthID watermark using reverse alpha blending.
 * Based on: https://github.com/journey-ad/gemini-watermark-remover
 *
 * Usage:
 *   node watermark.js input.png output.png
 *   node watermark.js input.png              # Overwrites input
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Constants from original algorithm
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

// Watermark configurations
const WATERMARK_CONFIG = {
  small: { size: 48, margin: 32 },  // For images <= 1024
  large: { size: 96, margin: 64 }   // For images > 1024
};

/**
 * Load PNG and get raw pixel data
 */
function loadPNG(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', function() {
        resolve(this);
      })
      .on('error', reject);
  });
}

/**
 * Calculate alpha map from background capture
 * Returns normalized brightness values (0-1)
 */
function calculateAlphaMap(bgPNG) {
  const { width, height, data } = bgPNG;
  const alphaMap = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    // Use max RGB as brightness
    const brightness = Math.max(r, g, b);
    alphaMap[i] = brightness / 255;
  }

  return alphaMap;
}

/**
 * Apply reverse alpha blending to remove watermark
 * Formula: original = (watermarked - α × logo) / (1 - α)
 */
function removeWatermark(imagePNG, alphaMap, x, y, size) {
  const { width, data } = imagePNG;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const imgX = x + col;
      const imgY = y + row;

      // Bounds check
      if (imgX < 0 || imgX >= imagePNG.width || imgY < 0 || imgY >= imagePNG.height) {
        continue;
      }

      const alphaIdx = row * size + col;
      const alpha = alphaMap[alphaIdx];

      // Skip negligible alpha values
      if (alpha < ALPHA_THRESHOLD) continue;

      // Clamp alpha to prevent division issues
      const clampedAlpha = Math.min(alpha, MAX_ALPHA);

      const pixelIdx = (imgY * width + imgX) * 4;

      // Apply reverse blend to R, G, B channels
      for (let c = 0; c < 3; c++) {
        const watermarked = data[pixelIdx + c];
        const original = (watermarked - clampedAlpha * LOGO_VALUE) / (1 - clampedAlpha);
        data[pixelIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
      }
      // Alpha channel (index 3) remains unchanged
    }
  }
}

/**
 * Process image and remove watermark
 */
async function processImage(inputPath, outputPath) {
  console.log(`🔍 Loading image: ${inputPath}`);

  // Load input image
  const imagePNG = await loadPNG(inputPath);
  const { width, height } = imagePNG;

  console.log(`📐 Image size: ${width}x${height}`);

  // Determine watermark config
  const config = (width > 1024 && height > 1024)
    ? WATERMARK_CONFIG.large
    : WATERMARK_CONFIG.small;

  console.log(`🎯 Using ${config.size}x${config.size} watermark config`);

  // Load corresponding background capture
  const bgPath = path.join(__dirname, 'assets', `bg_${config.size}.png`);
  if (!fs.existsSync(bgPath)) {
    throw new Error(`Background capture not found: ${bgPath}`);
  }

  const bgPNG = await loadPNG(bgPath);
  const alphaMap = calculateAlphaMap(bgPNG);

  // Calculate watermark position (bottom-right corner)
  const x = width - config.margin - config.size;
  const y = height - config.margin - config.size;

  console.log(`📍 Watermark position: (${x}, ${y})`);

  // Remove watermark
  console.log('🧹 Removing watermark...');
  removeWatermark(imagePNG, alphaMap, x, y, config.size);

  // Save result
  return new Promise((resolve, reject) => {
    imagePNG.pack()
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', () => {
        console.log(`✅ Saved: ${outputPath}`);
        resolve();
      })
      .on('error', reject);
  });
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
Usage: node watermark.js <input> [output]

Arguments:
  input   Input PNG file
  output  Output PNG file (default: overwrites input)

Example:
  node watermark.js image.png cleaned.png
  node watermark.js image.png
`);
    return;
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : inputPath;

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    await processImage(inputPath, outputPath);
    console.log('🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { processImage, removeWatermark, calculateAlphaMap };

// Run CLI
if (require.main === module) {
  main();
}
