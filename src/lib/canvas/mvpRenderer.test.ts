import { describe, it, expect, vi } from 'vitest';
import { extractAnimManifest, resolveColor, drawMvpFrame, MvpSpriteDef } from './mvpRenderer';

describe('mvpRenderer', () => {
  describe('extractAnimManifest', () => {
    it('extracts animation metadata correctly', () => {
      const def: MvpSpriteDef = {
        meta: { name: 'Test', type: 'modular_vector_pixel', base_grid: '16x16', scale_factor: 1, global_anchor: { x: 8, y: 16 } },
        palette: {},
        components: {},
        animations: {
          idle: { fps: 8, loop: true, frameCount: 4, frames: [null, null, null, null] },
          walk: { fps: 8, loop: true, frameCount: 6, frames: [null, null, null, null, null, null] },
        },
      };

      const manifest = extractAnimManifest(def);

      expect(manifest.idle).toEqual({
        fps: 8,
        loop: true,
        frameCount: 4,
        startCol: 0,
        row: 0,
      });

      expect(manifest.walk).toEqual({
        fps: 8,
        loop: true,
        frameCount: 6,
        startCol: 0,
        row: 0,
      });
    });
  });

  describe('drawMvpFrame', () => {
    it('draws frame with base components when no frame override exists', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fillRect: vi.fn(),
        set imageSmoothingEnabled(_: boolean) {},
        set fillStyle(_: string) {},
      } as any;

      const def: MvpSpriteDef = {
        meta: { name: 'Test', type: 'modular_vector_pixel', base_grid: '16x16', scale_factor: 1, global_anchor: { x: 8, y: 16 } },
        palette: { primary: '#FF0000' },
        components: {
          body: {
            layer_order: 1,
            anchor: { x: 8, y: 8 },
            pixels: [{ x: 0, y: 0, color: 'primary' }],
          },
        },
        animations: {
          idle: { fps: 8, loop: true, frameCount: 1, frames: [null] },
        },
      };

      drawMvpFrame(ctx, def, 'idle', 0, 10, 20, 2, false);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.translate).toHaveBeenCalledWith(10, 20);
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 2, 2);
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('applies frame override when present', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fillRect: vi.fn(),
        set imageSmoothingEnabled(_: boolean) {},
        set fillStyle(_: string) {},
      } as any;

      const def: MvpSpriteDef = {
        meta: { name: 'Test', type: 'modular_vector_pixel', base_grid: '16x16', scale_factor: 1, global_anchor: { x: 8, y: 16 } },
        palette: { primary: '#FF0000' },
        components: {
          body: {
            layer_order: 1,
            anchor: { x: 8, y: 8 },
            pixels: [{ x: 0, y: 0, color: 'primary' }],
          },
        },
        animations: {
          walk: {
            fps: 8,
            loop: true,
            frameCount: 2,
            frames: [
              null,
              {
                body: {
                  layer_order: 1,
                  anchor: { x: 8, y: 8 },
                  pixels: [{ x: 1, y: 1, color: 'primary' }],
                },
              },
            ],
          },
        },
      };

      drawMvpFrame(ctx, def, 'walk', 1, 10, 20, 2, false);

      expect(ctx.fillRect).toHaveBeenCalledWith(2, 2, 2, 2);
    });

    it('applies horizontal flip when flipX is true', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fillRect: vi.fn(),
        set imageSmoothingEnabled(_: boolean) {},
        set fillStyle(_: string) {},
      } as any;

      const def: MvpSpriteDef = {
        meta: { name: 'Test', type: 'modular_vector_pixel', base_grid: '16x16', scale_factor: 1, global_anchor: { x: 8, y: 16 } },
        palette: {},
        components: {
          body: { layer_order: 1, anchor: { x: 0, y: 0 }, pixels: [] },
        },
        animations: {
          idle: { fps: 8, loop: true, frameCount: 1, frames: [null] },
        },
      };

      drawMvpFrame(ctx, def, 'idle', 0, 10, 20, 2, true);

      expect(ctx.translate).toHaveBeenCalledWith(10 + 2 * 16, 20);
      expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
    });

    it('clamps frameIndex to valid range', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fillRect: vi.fn(),
        set imageSmoothingEnabled(_: boolean) {},
        set fillStyle(_: string) {},
      } as any;

      const def: MvpSpriteDef = {
        meta: { name: 'Test', type: 'modular_vector_pixel', base_grid: '16x16', scale_factor: 1, global_anchor: { x: 8, y: 16 } },
        palette: { primary: '#FF0000' },
        components: {
          body: {
            layer_order: 1,
            anchor: { x: 0, y: 0 },
            pixels: [{ x: 0, y: 0, color: 'primary' }],
          },
        },
        animations: {
          idle: { fps: 8, loop: true, frameCount: 2, frames: [null, null] },
        },
      };

      // Index 5 is clamped to 1 (frameCount - 1)
      drawMvpFrame(ctx, def, 'idle', 5, 0, 0, 2, false);

      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('respects layer_order when drawing components', () => {
      const fillCalls: Array<{ order: number; x: number }> = [];
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fillRect: (x: number) => fillCalls.push({ order: fillCalls.length, x }),
        set imageSmoothingEnabled(_: boolean) {},
        set fillStyle(_: string) {},
      } as any;

      const def: MvpSpriteDef = {
        meta: { name: 'Test', type: 'modular_vector_pixel', base_grid: '16x16', scale_factor: 1, global_anchor: { x: 8, y: 16 } },
        palette: {},
        components: {
          shadow: {
            layer_order: 1,
            anchor: { x: 0, y: 0 },
            pixels: [{ x: 0, y: 0, color: '#000' }],
          },
          body: {
            layer_order: 3,
            anchor: { x: 0, y: 0 },
            pixels: [{ x: 10, y: 0, color: '#000' }],
          },
          head: {
            layer_order: 2,
            anchor: { x: 0, y: 0 },
            pixels: [{ x: 5, y: 0, color: '#000' }],
          },
        },
        animations: {
          idle: { fps: 8, loop: true, frameCount: 1, frames: [null] },
        },
      };

      drawMvpFrame(ctx, def, 'idle', 0, 0, 0, 1, false);

      // Check that components were drawn in layer_order: shadow(1), head(2), body(3)
      expect(fillCalls[0].x).toBe(0); // shadow at x=0
      expect(fillCalls[1].x).toBe(5); // head at x=5
      expect(fillCalls[2].x).toBe(10); // body at x=10
    });
  });
});
