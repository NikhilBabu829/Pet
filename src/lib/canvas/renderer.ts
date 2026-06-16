import { drawFrame, type SpriteManifest } from './spriteRasterizer';

export type Facing = 'left' | 'right';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteSheet: ImageBitmap;
  private manifest: SpriteManifest;

  constructor(canvas: HTMLCanvasElement, spriteSheet: ImageBitmap, manifest: SpriteManifest) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire 2d rendering context');
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.manifest = manifest;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  draw(
    petX: number,
    petY: number,
    frameIndex: number,
    animName: string,
    facing: Facing,
    scale = 2,
  ) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    drawFrame(
      this.ctx,
      this.spriteSheet,
      this.manifest,
      animName,
      frameIndex,
      petX,
      petY,
      scale,
      facing === 'left',
    );

    this.drawBubble();
    this.drawWidget();
    this.drawNoteLabel();
  }

  // Filled in Phase 8 (thought bubbles)
  private drawBubble() {}

  // Filled in Phase 9 (pomodoro widget)
  private drawWidget() {}

  // Filled in Phase 10 (sticky notes)
  private drawNoteLabel() {}
}
