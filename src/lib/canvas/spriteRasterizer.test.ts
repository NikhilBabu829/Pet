import { describe, it, expect } from 'vitest';
import { getSourceRect, FRAME_SIZE, type SpriteManifest } from './spriteRasterizer';

const manifest: SpriteManifest = {
  idle: { row: 0, startCol: 0, frameCount: 4, fps: 8, loop: true },
  walk: { row: 1, startCol: 0, frameCount: 6, fps: 8, loop: true },
  pet: { row: 5, startCol: 2, frameCount: 4, fps: 8, loop: false },
};

describe('getSourceRect', () => {
  it('computes sx/sy for frame 0 of a row-0 animation', () => {
    expect(getSourceRect(manifest.idle, 0)).toEqual({ sx: 0, sy: 0 });
  });

  it('computes sy as row * FRAME_SIZE', () => {
    expect(getSourceRect(manifest.walk, 0).sy).toBe(1 * FRAME_SIZE);
  });

  it('computes sx using startCol + frameIndex', () => {
    expect(getSourceRect(manifest.pet, 0).sx).toBe(2 * FRAME_SIZE);
    expect(getSourceRect(manifest.pet, 3).sx).toBe((2 + 3) * FRAME_SIZE);
  });

  it('reaches the last frame at frameCount - 1', () => {
    const { sx } = getSourceRect(manifest.walk, 5);
    expect(sx).toBe((0 + 5) * FRAME_SIZE);
  });

  it('clamps frame index below the catalog range to 0', () => {
    expect(getSourceRect(manifest.idle, -3)).toEqual({ sx: 0, sy: 0 });
  });

  it('clamps frame index beyond frameCount - 1', () => {
    const overshoot = getSourceRect(manifest.idle, 99);
    const last = getSourceRect(manifest.idle, manifest.idle.frameCount - 1);
    expect(overshoot).toEqual(last);
  });
});
