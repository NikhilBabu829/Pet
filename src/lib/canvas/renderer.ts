import { drawFrame, type SpriteManifest } from './spriteRasterizer';
import { drawMvpFrame, type MvpSpriteDef } from './mvpRenderer';

export type Facing = 'left' | 'right';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private spriteSheet?: ImageBitmap;
  private manifest?: SpriteManifest;
  private mvpDef?: MvpSpriteDef;

  constructor(canvas: HTMLCanvasElement, spriteSheet: ImageBitmap, manifest: SpriteManifest) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire 2d rendering context');
    this.ctx = ctx;
    this.spriteSheet = spriteSheet;
    this.manifest = manifest;
  }

  static fromMvp(canvas: HTMLCanvasElement, mvpDef: MvpSpriteDef): Renderer {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire 2d rendering context');
    const renderer = new Renderer(canvas, null as any, {} as any);
    renderer.canvas = canvas;
    renderer.ctx = ctx;
    renderer.mvpDef = mvpDef;
    return renderer;
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

    if (this.mvpDef) {
      drawMvpFrame(
        this.ctx,
        this.mvpDef,
        animName,
        frameIndex,
        petX,
        petY,
        scale,
        facing === 'left',
      );
    } else if (this.spriteSheet && this.manifest) {
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
    }

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
