import type { SpriteManifest } from './spriteRasterizer';

export class Animator {
  private manifest: SpriteManifest;
  private currentAnim: string | null = null;
  private elapsedMs = 0;
  private done = false;

  constructor(manifest: SpriteManifest) {
    this.manifest = manifest;
  }

  get isDone(): boolean {
    return this.done;
  }

  get currentAnimation(): string | null {
    return this.currentAnim;
  }

  setAnimation(name: string) {
    if (this.currentAnim === name) return;
    this.currentAnim = name;
    this.elapsedMs = 0;
    this.done = false;
  }

  tick(deltaMs: number): number {
    if (!this.currentAnim) return 0;
    const def = this.manifest[this.currentAnim];
    if (!def) return 0;

    if (this.done) {
      return def.frameCount - 1;
    }

    this.elapsedMs += deltaMs;
    const rawIndex = Math.floor((this.elapsedMs * def.fps) / 1000);

    if (def.loop) {
      return rawIndex % def.frameCount;
    }

    if (rawIndex >= def.frameCount - 1) {
      this.done = true;
      return def.frameCount - 1;
    }
    return rawIndex;
  }
}
