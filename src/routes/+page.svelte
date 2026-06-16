<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';

  const isTauri = () =>
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  // All state declared before any onMount that references them
  let canvasWidth = $state(1920);
  let canvasHeight = $state(1080);
  let canvasEl = $state<HTMLCanvasElement | null>(null);

  // Placeholder pet bounds — Phase 3 replaces with real petStore values
  const PET_PLACEHOLDER = { x: 100, y: 100, width: 64, height: 64 };

  async function updateInteractiveRegions() {
    if (!isTauri()) return;
    // Click-through OFF so the pet region accepts mouse input.
    // Phase 3 will pass the real per-frame bounding rect once petStore exists.
    await invoke('set_ignore_cursor_events', { ignore: false });
  }

  onMount(async () => {
    if (isTauri()) {
      const monitors = await invoke<Array<{ x: number; y: number; width: number; height: number }>>(
        'get_monitor_bounds'
      );
      if (monitors.length > 0) {
        canvasWidth = monitors[0].width;
        canvasHeight = monitors[0].height;
      }
    }
    await updateInteractiveRegions();
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
