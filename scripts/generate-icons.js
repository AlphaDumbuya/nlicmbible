const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, '../assets/images/nlicm-logo.jpg');
const ICON_SIZES = {
  ios: [
    { size: 20, scales: [2, 3] },
    { size: 29, scales: [2, 3] },
    { size: 40, scales: [2, 3] },
    { size: 60, scales: [2, 3] },
    { size: 76, scales: [1, 2] },
    { size: 83.5, scales: [2] },
    { size: 1024, scales: [1] } // App Store
  ],
  android: [
    { size: 36, density: 'ldpi' },
    { size: 48, density: 'mdpi' },
    { size: 72, density: 'hdpi' },
    { size: 96, density: 'xhdpi' },
    { size: 144, density: 'xxhdpi' },
    { size: 192, density: 'xxxhdpi' }
  ]
};

async function generateIcons() {
  // Ensure the output directories exist
  const iosIconDir = path.join(__dirname, '../assets/icons/ios');
  const androidIconDir = path.join(__dirname, '../assets/icons/android');
  fs.mkdirSync(iosIconDir, { recursive: true });
  fs.mkdirSync(androidIconDir, { recursive: true });

  // Generate iOS icons
  for (const config of ICON_SIZES.ios) {
    for (const scale of config.scales) {
      const size = Math.round(config.size * scale);
      const filename = `icon-${config.size}@${scale}x.png`;
      await sharp(SOURCE_ICON)
        .resize(size, size)
        .toFile(path.join(iosIconDir, filename));
      console.log(`Generated iOS icon: ${filename}`);
    }
  }

  // Generate Android icons
  for (const config of ICON_SIZES.android) {
    const filename = `ic_launcher_${config.density}.png`;
    await sharp(SOURCE_ICON)
      .resize(config.size, config.size)
      .toFile(path.join(androidIconDir, filename));
    console.log(`Generated Android icon: ${filename}`);
  }

  // Generate adaptive icon background and foreground
  await sharp(SOURCE_ICON)
    .resize(432, 432)
    .toFile(path.join(androidIconDir, 'adaptive_icon_foreground.png'));
  
  await sharp({
    create: {
      width: 432,
      height: 432,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .toFile(path.join(androidIconDir, 'adaptive_icon_background.png'));

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
