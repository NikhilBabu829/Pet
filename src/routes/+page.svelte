<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { Renderer } from '$lib/canvas/renderer';
  import { Animator, } from '$lib/canvas/animator';
  import { loadSpriteSheet, FRAME_SIZE } from '$lib/canvas/spriteRasterizer';
  import type { SpriteManifest } from '$lib/canvas/spriteRasterizer';
  import { petStore, tickPet, scheduleWander } from '$lib/stores/petStore';
  import { useGameLoop } from '$lib/hooks/useGameLoop';

  const isTauri = () =>
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  // All state declared before any onMount that references them
  let canvasWidth = $state(1920);
  let canvasHeight = $state(1080);
  let canvasEl = $state<HTMLCanvasElement | null>(null);

  let stopLoop: (() => void) | null = null;
  let cleanupWander: (() => void) | null = null;

  async function updateInteractiveRegions() {
    if (!isTauri()) return;
    await invoke('set_ignore_cursor_events', {
      ignore: false,
      rect: { x: petStore.x, y: petStore.y, width: FRAME_SIZE * 2, height: FRAME_SIZE * 2 },
    });
  }

  onMount(async () => {
    let primaryMonitor = { width: 1920, height: 1080 };

    if (isTauri()) {
      const monitors = await invoke<Array<{ x: number; y: number; width: number; height: number }>>(
        'get_monitor_bounds'
      );
      if (monitors.length > 0) {
        primaryMonitor = monitors[0];
        canvasWidth = primaryMonitor.width;
        canvasHeight = primaryMonitor.height;
      }
    }

    petStore.monitorW = primaryMonitor.width;
    petStore.monitorH = primaryMonitor.height;

    if (!canvasEl) return;

    const bitmap = await loadSpriteSheet('/sprites/tabby_cat_default.png');
    const manifest: SpriteManifest = await fetch('/sprites/tabby_cat_default.json').then(r => r.json());

    const renderer = new Renderer(canvasEl, bitmap, manifest);
    renderer.resize(canvasWidth, canvasHeight);

    const animator = new Animator(manifest);

    cleanupWander = scheduleWander();

    const { startLoop, stopLoop: stop } = useGameLoop((deltaMs) => {
      tickPet(deltaMs);
      animator.setAnimation(petStore.animState);
      const frameIndex = animator.tick(deltaMs);
      renderer.draw(petStore.x, petStore.y, frameIndex, petStore.animState, petStore.facing);
    });

    stopLoop = stop;
    startLoop();

    await updateInteractiveRegions();
  });

  onDestroy(() => {
    stopLoop?.();
    cleanupWander?.();
  });
</script>

<canvas
  id="pet-canvas"
  bind:this={canvasEl}
  width={canvasWidth}
  height={canvasHeight}
></canvas>

<style>
  :global(body) {
    background: transparent;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  canvas {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
</style>
