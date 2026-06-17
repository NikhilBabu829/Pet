import { FRAME_SIZE } from '$lib/canvas/spriteRasterizer';
import type { Facing } from '$lib/canvas/renderer';

export type { Facing };

export const petStore = $state({
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  facing: 'right' as Facing,
  monitorW: 1920,
  monitorH: 1080,
});

export function tickPet(deltaMs: number): void {
  const dt = deltaMs / 1000;
  const petW = FRAME_SIZE * 2;

  petStore.x += petStore.vx * dt;

  if (petStore.x < 0) {
    petStore.x = 0;
    petStore.vx = Math.abs(petStore.vx);
    petStore.facing = 'right';
  } else if (petStore.x > petStore.monitorW - petW) {
    petStore.x = petStore.monitorW - petW;
    petStore.vx = -Math.abs(petStore.vx);
    petStore.facing = 'left';
  }
}
