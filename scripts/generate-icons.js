import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(__dirname, '../public/icons/icon.svg');
const outputDir = join(__dirname, '../public/icons');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`  ✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`  ✗ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  // Also create apple-touch-icon
  const appleIconPath = join(outputDir, 'apple-touch-icon.png');
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(appleIconPath);
  console.log('  ✓ Generated apple-touch-icon (180x180)');

  console.log('Done!');
}

generateIcons().catch(console.error);
