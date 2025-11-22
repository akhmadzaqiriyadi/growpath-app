const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, 'public', 'logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created icons directory');
}

console.log('Generating PWA icons from logo.png...\n');

// Generate each size
Promise.all(
  sizes.map(size => 
    sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
      .then(() => {
        console.log(`✓ Generated icon-${size}x${size}.png`);
        return true;
      })
      .catch(err => {
        console.error(`✗ Failed to generate ${size}x${size}:`, err.message);
        return false;
      })
  )
).then(results => {
  const successful = results.filter(r => r).length;
  console.log(`\nCompleted! Generated ${successful}/${sizes.length} icons`);
}).catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
