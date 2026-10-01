// Resolve an image named in a content file (path relative to content/) so
// Astro can optimise it. Throws with the file name if the image is missing.
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>('/content/**/*.{png,jpg,jpeg,webp,gif}', { eager: true });

export function contentImage(path: string, where: string): ImageMetadata {
  const img = images[`/content/${path.replace(/^\/+/, '')}`]?.default;
  if (!img) throw new Error(`[content] ${where}: image "${path}" not found (paths are relative to content/)`);
  return img;
}
