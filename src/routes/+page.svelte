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
  import { usePetAI } from '$lib/hooks/usePetAI';
  import { HYPERACTIVE_DOG_PROFILE, HYPERACTIVE_DOG_RATES } from '$lib/data/behaviorProfiles';
  import { useTauriCommands } from '$lib/hooks/useTauriCommands';

  const isTauri = () =>
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  // All state declared before any onMount that references them
  let canvasWidth = $state(1920);
  let canvasHeight = $state(1080);
  let canvasEl = $state<HTMLCanvasElement | null>(null);

  let stopLoop: (() => void) | null = null;
  let tauriCleanup: (() => void) | null = null;
  let wanderTargetX = 100;

  async function updateInteractiveRegions() {
    if (!isTauri()) return;
    await invoke('set_ignore_cursor_events', {
      ignore: false,
      rect: { x: petStore.x, y: petStore.y, width: FRAME_SIZE * 2, height: FRAME_SIZE * 2 },
    });
  }

  onMount(async () => {
    if (isTauri()) {
      // get_monitor_bounds returns physical pixels; we only use it to confirm
      // a monitor exists. Actual sizing uses logical pixels (window.inner*)
      // so canvas coordinates match CSS and nothing overflows on HiDPI displays.
      await invoke<Array<{ x: number; y: number; width: number; height: number }>>(
        'get_monitor_bounds'
      );
    }

    // Always size to the logical viewport — matches CSS 100vw/100vh exactly
    canvasWidth  = window.innerWidth;
    canvasHeight = window.innerHeight;
    petStore.monitorW = canvasWidth;
    petStore.monitorH = canvasHeight;

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

    const petAI = usePetAI(fsm, HYPERACTIVE_DOG_PROFILE, HYPERACTIVE_DOG_RATES);

    const { startLoop, stopLoop: stop } = useGameLoop((deltaMs) => {
      petAI.tick(deltaMs);
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

    const { destroy } = await useTauriCommands(fsm, petStore, HYPERACTIVE_DOG_RATES, canvasEl);
    tauriCleanup = destroy;

    await updateInteractiveRegions();
  });

  onDestroy(() => {
    stopLoop?.();
    tauriCleanup?.();
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
