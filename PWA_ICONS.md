# PWA Icons Generation

## Cara Generate Icons untuk PWA

Gunakan logo.png yang ada di `/public/logo.png` untuk generate berbagai ukuran icon.

### Opsi 1: Menggunakan Online Tool
1. Buka https://www.pwabuilder.com/imageGenerator
2. Upload file `/public/logo.png`
3. Download hasil generate icons
4. Extract dan copy semua files ke `/public/icons/`

### Opsi 2: Menggunakan Sharp (Manual)
Install sharp:
```bash
npm install --save-dev sharp
```

Buat script generate-icons.js:
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = './public/logo.png';

if (!fs.existsSync('./public/icons')) {
  fs.mkdirSync('./public/icons');
}

sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size)
    .toFile(`./public/icons/icon-${size}x${size}.png`)
    .then(() => console.log(`Generated ${size}x${size}`))
    .catch(err => console.error(err));
});
```

Run script:
```bash
node generate-icons.js
```

## Icon Requirements
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152 (Apple Touch Icon)
- 192x192 (Android)
- 384x384
- 512x512 (Splash screen)
