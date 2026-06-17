import { FsmEvent } from './FSM';
import type { Needs } from './needs';

export const enum AiAction {
  EAT            = 'EAT',
  SEEK_ATTENTION = 'SEEK_ATTENTION',
  SLEEP          = 'SLEEP',
  PLAY           = 'PLAY',
  WANDER         = 'WANDER',
}

export type ActionConfig = {
  multiplier: number;
};

export type UtilityProfile = {
  actions: Record<AiAction, ActionConfig>;
  criticalThreshold: number; // satisfaction below this triggers flat bonus
  criticalBonus: number;     // flat score added when need is critical
};

export const ACTION_TO_FSM_EVENT: Record<AiAction, FsmEvent> = {
  [AiAction.EAT]:            FsmEvent.SIT_DOWN,
  [AiAction.SEEK_ATTENTION]: FsmEvent.WANDER,
  [AiAction.SLEEP]:          FsmEvent.FALL_ASLEEP,
  [AiAction.PLAY]:           FsmEvent.SPEED_UP,
  [AiAction.WANDER]:         FsmEvent.WANDER,
};

export function scoreAction(
  satisfaction: number,
  config: ActionConfig,
  profile: UtilityProfile,
): number {
  const urgency = 1 - satisfaction;
  let score = urgency * config.multiplier;
  // Flat bonus when satisfaction is critically low — additive, not multiplied
  if (satisfaction < profile.criticalThreshold) {
    score += profile.criticalBonus;
  }
  return score;
}

export function pickAction(needs: Needs, profile: UtilityProfile): AiAction {
  const candidates: [AiAction, number][] = [
    [AiAction.EAT,            scoreAction(needs.hunger,    profile.actions[AiAction.EAT],            profile)],
    [AiAction.SEEK_ATTENTION, scoreAction(needs.attention, profile.actions[AiAction.SEEK_ATTENTION], profile)],
    [AiAction.SLEEP,          scoreAction(needs.energy,    profile.actions[AiAction.SLEEP],          profile)],
    [AiAction.PLAY,           scoreAction(needs.fun,       profile.actions[AiAction.PLAY],           profile)],
    [AiAction.WANDER,         0.05],  // base fallback so WANDER always has a floor score
  ];

  let best = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i][1] > best[1]) best = candidates[i];
  }
  return best[0];
}
