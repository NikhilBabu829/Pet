import { AiAction } from '$lib/ai/UtilityAI';
import type { UtilityProfile } from '$lib/ai/UtilityAI';
import type { NeedDecayRates } from '$lib/ai/needs';

export const LAZY_CAT_PROFILE: UtilityProfile = {
  actions: {
    [AiAction.EAT]:            { multiplier: 1.2 },
    [AiAction.SEEK_ATTENTION]: { multiplier: 0.8 },
    [AiAction.SLEEP]:          { multiplier: 1.5 },
    [AiAction.PLAY]:           { multiplier: 0.6 },
    [AiAction.WANDER]:         { multiplier: 0.4 },
  },
  criticalThreshold: 0.25,
  criticalBonus: 0.5,
};

export const HYPERACTIVE_DOG_PROFILE: UtilityProfile = {
  actions: {
    [AiAction.EAT]:            { multiplier: 1.0 },
    [AiAction.SEEK_ATTENTION]: { multiplier: 1.6 },
    [AiAction.SLEEP]:          { multiplier: 0.4 },
    [AiAction.PLAY]:           { multiplier: 1.8 },
    [AiAction.WANDER]:         { multiplier: 1.2 },
  },
  criticalThreshold: 0.35,
  criticalBonus: 0.6,
};

export const LAZY_CAT_RATES: NeedDecayRates = {
  hunger: 0.01,
  attention: 0.008,
  energy: 0.005,
  fun: 0.007,
};

export const HYPERACTIVE_DOG_RATES: NeedDecayRates = {
  hunger: 0.015,
  attention: 0.02,
  energy: 0.008,
  fun: 0.025,
};
