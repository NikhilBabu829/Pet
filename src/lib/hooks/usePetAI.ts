import type { FSM } from '$lib/ai/FSM';
import { createNeeds, tickNeeds } from '$lib/ai/needs';
import type { Needs, NeedDecayRates } from '$lib/ai/needs';
import { pickAction, ACTION_TO_FSM_EVENT } from '$lib/ai/UtilityAI';
import type { UtilityProfile } from '$lib/ai/UtilityAI';

const AI_COOLDOWN_MS = 3000;
const NEEDS_LOG_INTERVAL_MS = 5000;

export function usePetAI(
  fsm: FSM,
  profile: UtilityProfile,
  rates: NeedDecayRates,
): { tick: (deltaMs: number) => void; needs: Needs } {
  const needs = createNeeds();
  let cooldownMs = AI_COOLDOWN_MS; // start at max so first tick can act immediately
  let needsLogMs = 0;

  function tick(deltaMs: number): void {
    tickNeeds(needs, rates, deltaMs);

    // Periodic needs readout so you can watch them decay
    needsLogMs += deltaMs;
    if (needsLogMs >= NEEDS_LOG_INTERVAL_MS) {
      needsLogMs = 0;
      console.log(
        `[PetAI] needs — hunger: ${needs.hunger.toFixed(2)}  attention: ${needs.attention.toFixed(2)}  energy: ${needs.energy.toFixed(2)}  fun: ${needs.fun.toFixed(2)}`,
      );
    }

    cooldownMs += deltaMs;
    if (cooldownMs < AI_COOLDOWN_MS) return;

    const action = pickAction(needs, profile);
    const event = ACTION_TO_FSM_EVENT[action];

    if (fsm.canTransition(event)) {
      fsm.transition(event);
      cooldownMs = 0;
      console.log(
        `[PetAI] ✅ action: ${action} → event: ${event} → FSM state: ${fsm.currentState}`,
      );
    } else {
      console.log(
        `[PetAI] ⏸ action: ${action} blocked — FSM is in ${fsm.currentState} (can't fire ${event})`,
      );
      cooldownMs = 0; // reset so we retry next cooldown rather than hammering every frame
    }
  }

  return { tick, needs };
}
