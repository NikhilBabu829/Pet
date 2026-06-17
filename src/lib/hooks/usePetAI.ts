import type { FSM } from '$lib/ai/FSM';
import { createNeeds, tickNeeds } from '$lib/ai/needs';
import type { Needs, NeedDecayRates } from '$lib/ai/needs';
import { pickAction, ACTION_TO_FSM_EVENT } from '$lib/ai/UtilityAI';
import type { UtilityProfile } from '$lib/ai/UtilityAI';

const AI_COOLDOWN_MS = 3000;

export function usePetAI(
  fsm: FSM,
  profile: UtilityProfile,
  rates: NeedDecayRates,
): { tick: (deltaMs: number) => void; needs: Needs } {
  const needs = createNeeds();
  let cooldownMs = AI_COOLDOWN_MS; // start at max so first tick can act immediately

  function tick(deltaMs: number): void {
    tickNeeds(needs, rates, deltaMs);

    cooldownMs += deltaMs;
    if (cooldownMs < AI_COOLDOWN_MS) return;

    const action = pickAction(needs, profile);
    const event = ACTION_TO_FSM_EVENT[action];

    if (fsm.canTransition(event)) {
      fsm.transition(event);
      cooldownMs = 0;
    }
  }

  return { tick, needs };
}
