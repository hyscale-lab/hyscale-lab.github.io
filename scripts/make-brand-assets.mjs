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

await (await mark(128, '#ffffff')).toFile('public/brand/mark-white.png');
await (await mark(512, '#181c62')).toFile('public/brand/mark-navy.png');
await (await mark(64, '#181c62')).toFile('public/favicon.png');
// Apple touch icon: white mark on the night background.
const touch = await (await mark(140, '#ffffff')).toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#0a0d2b' } })
  .composite([{ input: touch, gravity: 'center' }])
  .png()
  .toFile('public/apple-touch-icon.png');

// Open Graph / link-preview image (1200×630).
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="a" cx="85%" cy="0%" r="70%"><stop offset="0" stop-color="#d71440" stop-opacity=".55"/><stop offset="1" stop-color="#d71440" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="0%" cy="100%" r="70%"><stop offset="0" stop-color="#0054a6" stop-opacity=".8"/><stop offset="1" stop-color="#0054a6" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#5da9dd"/><stop offset=".5" stop-color="#b98fd8"/><stop offset="1" stop-color="#ff5a7e"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0d2b"/><rect width="1200" height="630" fill="url(#a)"/><rect width="1200" height="630" fill="url(#b)"/>
  <text x="80" y="300" font-family="Rubik, Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="#eef0ff">HyScale <tspan fill="url(#t)">Lab</tspan></text>
  <text x="80" y="370" font-family="Rubik, Helvetica, Arial, sans-serif" font-size="34" fill="#abb3d9">Systems &amp; Cloud Architecture · NTU Singapore</text>
  <text x="80" y="520" font-family="Rubik, Helvetica, Arial, sans-serif" font-size="26" fill="#ff7d99" letter-spacing="4">SERVERLESS · AGENTIC · MULTI-MODAL AI CLOUD SYSTEMS</text>
</svg>`;
const ogMark = await (await mark(260, '#ffffff')).toBuffer();
await sharp(Buffer.from(og))
  .composite([{ input: ogMark, top: 120, left: 880, blend: 'over' }])
  .png()
  .toFile('public/og.png');
console.log('brand assets written');
