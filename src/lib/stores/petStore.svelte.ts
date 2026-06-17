import { FRAME_SIZE } from '$lib/canvas/spriteRasterizer';
import type { Facing } from '$lib/canvas/renderer';

export type { Facing };
export type PetAnimState = 'idle' | 'walk';

export const petStore = $state({
  x: 100,
  y: 100,
  vx: 60,
  vy: 0,
  facing: 'right' as Facing,
  animState: 'walk' as PetAnimState,
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

export function scheduleWander(): () => void {
  const petW = FRAME_SIZE * 2;
  let intervalId: ReturnType<typeof setInterval>;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  function wander() {
    const targetX = Math.random() * (petStore.monitorW - petW);
    const dist = Math.abs(targetX - petStore.x);
    const travelMs = (dist / 60) * 1000;

    petStore.vx = targetX > petStore.x ? 60 : -60;
    petStore.animState = 'walk';

    timeoutId = setTimeout(() => {
      petStore.animState = 'idle';
    }, travelMs);
  }

  function scheduleNext() {
    const intervalMs = 4000 + Math.random() * 4000;
    intervalId = setInterval(() => {
      wander();
    }, intervalMs);
  }

  scheduleNext();

  return () => {
    clearInterval(intervalId);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  };
}
