import { describe, it, expect } from 'vitest';
import { Animator } from './animator';
import type { SpriteManifest } from './spriteRasterizer';

const manifest: SpriteManifest = {
  idle: { row: 0, startCol: 0, frameCount: 4, fps: 8, loop: true }, // 125ms/frame
  pet: { row: 1, startCol: 0, frameCount: 4, fps: 8, loop: false },
};

describe('Animator', () => {
  it('starts at frame 0 immediately after setAnimation', () => {
    const animator = new Animator(manifest);
    animator.setAnimation('idle');
    expect(animator.tick(0)).toBe(0);
  });

  it('wraps back to frame 0 after a full loop cycle', () => {
    const animator = new Animator(manifest);
    animator.setAnimation('idle');
    // 4 frames at 8fps = 500ms per full cycle
    animator.tick(500);
    expect(animator.tick(0)).toBe(0);
  });

  it('advances frames mid-cycle for a loop animation', () => {
    const animator = new Animator(manifest);
    animator.setAnimation('idle');
    // 250ms at 8fps = 2 frames elapsed -> frame index 2
    expect(animator.tick(250)).toBe(2);
  });

  it('clamps a play-once animation at frameCount - 1 and marks done', () => {
    const animator = new Animator(manifest);
    animator.setAnimation('pet');
    animator.tick(10_000); // way past the animation length
    expect(animator.tick(0)).toBe(3);
    expect(animator.isDone).toBe(true);
  });

  it('resets elapsed time when switching to a new animation', () => {
    const animator = new Animator(manifest);
    animator.setAnimation('idle');
    animator.tick(250); // 2 frames in
    animator.setAnimation('pet');
    expect(animator.tick(0)).toBe(0);
    expect(animator.isDone).toBe(false);
  });

  it('does not reset elapsed time when setAnimation is called with the same name', () => {
    const animator = new Animator(manifest);
    animator.setAnimation('idle');
    animator.tick(250); // 2 frames in
    animator.setAnimation('idle'); // no-op, same animation
    expect(animator.tick(0)).toBe(2);
  });
});
