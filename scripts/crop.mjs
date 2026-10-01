// node scripts/crop.mjs in.png out.png top height
import sharp from 'sharp';
const [i, o, top, h] = process.argv.slice(2);
const m = await sharp(i).metadata();
await sharp(i)
  .extract({ left: 0, top: +top, width: m.width, height: Math.min(+h, m.height - +top) })
  .toFile(o);
console.log(m.width, m.height);
