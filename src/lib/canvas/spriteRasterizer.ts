export const FRAME_SIZE = 32;

export interface AnimationFrameDef {
  row: number;
  startCol: number;
  frameCount: number;
  fps: number;
  loop: boolean;
}

export type SpriteManifest = Record<string, AnimationFrameDef>;

const bitmapCache = new Map<string, ImageBitmap>();

export async function loadSpriteSheet(path: string): Promise<ImageBitmap> {
  const cached = bitmapCache.get(path);
  if (cached) return cached;

  const response = await fetch(path);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  bitmapCache.set(path, bitmap);
  return bitmap;
}

export function getSourceRect(def: AnimationFrameDef, frameIndex: number) {
  const clampedIndex = Math.max(0, Math.min(frameIndex, def.frameCount - 1));
  return {
    sx: (def.startCol + clampedIndex) * FRAME_SIZE,
    sy: def.row * FRAME_SIZE,
  };
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  manifest: SpriteManifest,
  animName: string,
  frameIndex: number,
  dx: number,
  dy: number,
  scale = 2,
  flipX = false,
) {
  const def = manifest[animName];
  if (!def) return;

  const { sx, sy } = getSourceRect(def, frameIndex);
  const size = FRAME_SIZE * scale;

  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (flipX) {
    ctx.translate(dx + size, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(bitmap, sx, sy, FRAME_SIZE, FRAME_SIZE, 0, 0, size, size);
  } else {
    ctx.drawImage(bitmap, sx, sy, FRAME_SIZE, FRAME_SIZE, dx, dy, size, size);
  }
  ctx.restore();
}
