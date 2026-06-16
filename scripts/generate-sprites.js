// Generates placeholder sprite sheets + manifests for Phase 2.
// Each animation occupies one row; frames are distinct colors with a frame-number label
// so they're visually distinguishable while real pixel art is pending.
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIRS = [
  join(__dirname, '..', 'assets', 'sprites'), // canonical source, owned by UI agent
  join(__dirname, '..', 'static', 'sprites'), // served at runtime by SvelteKit
];
const FRAME_SIZE = 32;
const MAX_COLS = 6;

const ANIMATIONS = [
  { name: 'idle', frameCount: 4, fps: 8, loop: true },
  { name: 'walk', frameCount: 6, fps: 8, loop: true },
  { name: 'run', frameCount: 4, fps: 12, loop: true },
  { name: 'sit', frameCount: 2, fps: 4, loop: true },
  { name: 'sleep', frameCount: 3, fps: 4, loop: true },
  { name: 'pet', frameCount: 4, fps: 8, loop: false },
  { name: 'type', frameCount: 4, fps: 10, loop: true },
  { name: 'overheat', frameCount: 4, fps: 12, loop: true },
  { name: 'mischief', frameCount: 4, fps: 8, loop: true },
  { name: 'pomo_work', frameCount: 4, fps: 8, loop: true },
  { name: 'pomo_break', frameCount: 3, fps: 6, loop: true },
];

function buildManifest() {
  const manifest = {};
  ANIMATIONS.forEach((anim, row) => {
    manifest[anim.name] = {
      row,
      startCol: 0,
      frameCount: anim.frameCount,
      fps: anim.fps,
      loop: anim.loop,
    };
  });
  return manifest;
}

function generateSheet(petKey, baseColor) {
  const width = MAX_COLS * FRAME_SIZE;
  const height = ANIMATIONS.length * FRAME_SIZE;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ANIMATIONS.forEach((anim, row) => {
    for (let col = 0; col < anim.frameCount; col++) {
      const x = col * FRAME_SIZE;
      const y = row * FRAME_SIZE;
      const shade = 40 + Math.round((col / Math.max(anim.frameCount - 1, 1)) * 100);
      ctx.fillStyle = `hsl(${baseColor + row * 12}, 65%, ${30 + (shade % 40)}%)`;
      ctx.fillRect(x, y, FRAME_SIZE, FRAME_SIZE);

      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, FRAME_SIZE - 1, FRAME_SIZE - 1);

      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(col), x + FRAME_SIZE / 2, y + FRAME_SIZE / 2);
    }
  });

  const pngBuffer = canvas.toBuffer('image/png');
  const manifestJson = JSON.stringify(buildManifest(), null, 2);
  for (const dir of OUT_DIRS) {
    writeFileSync(join(dir, `${petKey}.png`), pngBuffer);
    writeFileSync(join(dir, `${petKey}.json`), manifestJson);
  }
  console.log(`Generated ${petKey}.png (${width}x${height}) + ${petKey}.json in ${OUT_DIRS.length} location(s)`);
}

generateSheet('tabby_cat_default', 24); // orange hue
generateSheet('corgi_default', 35); // tan/gold hue
