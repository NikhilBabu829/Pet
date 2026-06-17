import { FRAME_SIZE } from '$lib/canvas/spriteRasterizer';
import { FSM, FsmEvent, FsmState } from '$lib/ai/FSM';
import type { NeedDecayRates } from '$lib/ai/needs';
import type { petStore as PetStoreType } from '$lib/stores/petStore.svelte';

const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// --- Pure helpers (exported for unit tests) ---

export function calcDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isInsidePetBox(
  clickX: number,
  clickY: number,
  petX: number,
  petY: number,
  size: number
): boolean {
  return clickX >= petX && clickX < petX + size && clickY >= petY && clickY < petY + size;
}

export interface IdleTimerState {
  lastActivityMs: number;
  attentionBoosted: boolean;
  mischiefFired: boolean;
}

export function createIdleTimer(): IdleTimerState {
  return { lastActivityMs: Date.now(), attentionBoosted: false, mischiefFired: false };
}

export function tickIdleTimer(
  timer: IdleTimerState,
  rates: NeedDecayRates,
  baseAttentionRate: number,
  fsm: FSM,
  nowMs: number
): void {
  const elapsedSecs = (nowMs - timer.lastActivityMs) / 1000;

  if (elapsedSecs >= 120 && !timer.mischiefFired) {
    timer.mischiefFired = true;
    if (fsm.canTransition(FsmEvent.MISCHIEF_START)) {
      fsm.transition(FsmEvent.MISCHIEF_START);
    }
  } else if (elapsedSecs >= 30 && !timer.attentionBoosted) {
    timer.attentionBoosted = true;
    rates.attention *= 2;
  }
}

export function resetIdleTimer(
  timer: IdleTimerState,
  rates: NeedDecayRates,
  baseAttentionRate: number,
  nowMs: number
): void {
  if (timer.attentionBoosted) {
    rates.attention = baseAttentionRate;
  }
  timer.lastActivityMs = nowMs;
  timer.attentionBoosted = false;
  timer.mischiefFired = false;
}

// --- Main hook ---

type PetStore = typeof PetStoreType;

export async function useTauriCommands(
  fsm: FSM,
  store: PetStore,
  rates: NeedDecayRates,
  canvasEl?: HTMLCanvasElement | null
): Promise<{ destroy(): void }> {
  const baseAttentionRate = rates.attention;
  const timer = createIdleTimer();
  const unlisteners: Array<() => void> = [];
  const PET_SIZE = FRAME_SIZE * 2;

  // Click-to-pet: runs in browser too (no Tauri gate needed)
  const clickTarget: EventTarget = canvasEl ?? window;
  const onClickHandler = (e: Event) => {
    const me = e as MouseEvent;
    if (isInsidePetBox(me.clientX, me.clientY, store.x, store.y, PET_SIZE)) {
      if (fsm.canTransition(FsmEvent.PET)) fsm.transition(FsmEvent.PET);
    }
  };
  clickTarget.addEventListener('click', onClickHandler);

  // Idle timer: 1s tick, no Tauri gate
  const idleInterval = window.setInterval(() => {
    tickIdleTimer(timer, rates, baseAttentionRate, fsm, Date.now());
  }, 1000);

  if (isTauri()) {
    const { listen } = await import('@tauri-apps/api/event');

    // typing-update: wpm > 80 → OVERHEAT; active → TYPING; inactive → cool down
    const unlistenTyping = await listen<{ wpm: number; active: boolean }>(
      'typing-update',
      ({ payload }) => {
        if (payload.active) {
          resetIdleTimer(timer, rates, baseAttentionRate, Date.now());
        }
        if (payload.wpm > 80) {
          if (fsm.canTransition(FsmEvent.OVERHEAT)) fsm.transition(FsmEvent.OVERHEAT);
        } else if (payload.active) {
          if (fsm.canTransition(FsmEvent.START_TYPING)) fsm.transition(FsmEvent.START_TYPING);
        } else {
          // Not active — try to wind down typing/overheat states
          if (fsm.canTransition(FsmEvent.STOP_TYPING)) {
            fsm.transition(FsmEvent.STOP_TYPING);
          } else if (fsm.canTransition(FsmEvent.COOL_DOWN)) {
            fsm.transition(FsmEvent.COOL_DOWN);
          }
        }
      }
    );
    unlisteners.push(unlistenTyping);

    // mouse-move: flee if cursor < 80px from pet center; slow down when clear
    const unlistenMouse = await listen<{ x: number; y: number; speed: number }>(
      'mouse-move',
      ({ payload }) => {
        resetIdleTimer(timer, rates, baseAttentionRate, Date.now());

        const petCenterX = store.x + FRAME_SIZE;
        const petCenterY = store.y + FRAME_SIZE;
        const dist = calcDistance(payload.x, payload.y, petCenterX, petCenterY);

        if (dist < 80) {
          // Set flee direction away from cursor before SPEED_UP so onEnter(RUNNING) uses it
          store.facing = payload.x > petCenterX ? 'left' : 'right';
          if (fsm.canTransition(FsmEvent.SPEED_UP)) fsm.transition(FsmEvent.SPEED_UP);
        } else if (fsm.currentState === FsmState.RUNNING) {
          if (fsm.canTransition(FsmEvent.SLOW_DOWN)) fsm.transition(FsmEvent.SLOW_DOWN);
        }
      }
    );
    unlisteners.push(unlistenMouse);
  }

  return {
    destroy() {
      clickTarget.removeEventListener('click', onClickHandler);
      clearInterval(idleInterval);
      unlisteners.forEach((fn) => fn());
    },
  };
}
