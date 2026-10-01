// Generates transparent logo marks and favicons from src/assets/hyscale-circle.png.
// Run once (node scripts/make-brand-assets.mjs) when the logo changes.
import sharp from 'sharp';

const SRC = 'src/assets/hyscale-circle.png';

// Alpha mask: dark pixels of the logo become opaque.
async function mark(size, rgb) {
  const alpha = await sharp(SRC)
    .trim()
    .resize(size, size, { fit: 'contain', background: '#fff' })
    .greyscale()
    .negate()
    .linear(1.6, -40)
    .toColourspace('b-w')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = alpha.info;
  return sharp({ create: { width, height, channels: 3, background: rgb } })
    .joinChannel(alpha.data, { raw: { width, height, channels: 1 } })
    .png();
}

await (await mark(512, '#ffffff')).toFile('public/brand/mark-white.png');
await (await mark(512, '#171d63')).toFile('public/brand/mark-navy.png');
await (await mark(64, '#171d63')).toFile('public/favicon.png');
// Apple touch icon: white mark on the night background.
const touch = await (await mark(140, '#ffffff')).toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#0a0d24' } })
  .composite([{ input: touch, gravity: 'center' }])
  .png()
  .toFile('public/apple-touch-icon.png');
console.log('brand assets written');
