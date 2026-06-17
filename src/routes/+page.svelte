<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { Renderer } from '$lib/canvas/renderer';
  import { Animator } from '$lib/canvas/animator';
  import { loadMvpSprite, extractAnimManifest } from '$lib/canvas/mvpRenderer';
  import { FRAME_SIZE } from '$lib/canvas/spriteRasterizer';
  import { petStore, tickPet } from '$lib/stores/petStore.svelte';
  import { useGameLoop } from '$lib/hooks/useGameLoop';
  import { FSM, FsmState, FsmEvent } from '$lib/ai/FSM';

  const isTauri = () =>
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  // All state declared before any onMount that references them
  let canvasWidth = $state(1920);
  let canvasHeight = $state(1080);
  let canvasEl = $state<HTMLCanvasElement | null>(null);

  let stopLoop: (() => void) | null = null;
  let wanderTimerId: ReturnType<typeof setTimeout> | null = null;
  let wanderTargetX = 100;

  async function updateInteractiveRegions() {
    if (!isTauri()) return;
    await invoke('set_ignore_cursor_events', {
      ignore: false,
      rect: { x: petStore.x, y: petStore.y, width: FRAME_SIZE * 2, height: FRAME_SIZE * 2 },
    });
  }

  function scheduleNextWander(fsm: FSM) {
    const delayMs = 4000 + Math.random() * 4000;
    wanderTimerId = setTimeout(() => {
      if (fsm.canTransition(FsmEvent.WANDER)) {
        fsm.transition(FsmEvent.WANDER);
      }
      scheduleNextWander(fsm);
    }, delayMs);
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

    // Load dog MVP sprite
    const mvpDef = await loadMvpSprite('/sprites/dog.json');
    const animManifest = extractAnimManifest(mvpDef);

    const renderer = Renderer.fromMvp(canvasEl, mvpDef);
    renderer.resize(canvasWidth, canvasHeight);

    const animator = new Animator(animManifest);

    // Create FSM with velocity callbacks
    const fsm = new FSM(FsmState.IDLE, {
      onEnter(state) {
        switch (state) {
          case FsmState.WALKING: {
            const petW = FRAME_SIZE * 2;
            const targetX = Math.random() * (petStore.monitorW - petW);
            wanderTargetX = targetX;
            petStore.vx = targetX > petStore.x ? 60 : -60;
            petStore.facing = petStore.vx > 0 ? 'right' : 'left';
            break;
          }
          case FsmState.RUNNING:
            petStore.vx = petStore.facing === 'right' ? 160 : -160;
            break;
          default:
            petStore.vx = 0;
        }
      },
    });

    scheduleNextWander(fsm);

    const { startLoop, stopLoop: stop } = useGameLoop((deltaMs) => {
      tickPet(deltaMs);

      // ARRIVE detection — within one frame's travel of target
      if (fsm.currentState === FsmState.WALKING && fsm.canTransition(FsmEvent.ARRIVE)) {
        const step = Math.abs(petStore.vx) * (deltaMs / 1000) + 1;
        if (Math.abs(petStore.x - wanderTargetX) < step) {
          fsm.transition(FsmEvent.ARRIVE);
        }
      }

      // One-shot PETTING completion
      if (fsm.currentState === FsmState.PETTING && animator.isDone) {
        fsm.transition(FsmEvent.ANIM_DONE);
      }

      const animName = fsm.getAnimation();
      animator.setAnimation(animName);
      const frameIndex = animator.tick(deltaMs);
      renderer.draw(petStore.x, petStore.y, frameIndex, animName, petStore.facing);
    });

    stopLoop = stop;
    startLoop();

    await updateInteractiveRegions();
  });

  onDestroy(() => {
    stopLoop?.();
    if (wanderTimerId) {
      clearTimeout(wanderTimerId);
    }
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
