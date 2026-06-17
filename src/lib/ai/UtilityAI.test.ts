import { describe, it, expect } from 'vitest';
import { AiAction, scoreAction, pickAction } from './UtilityAI';
import type { UtilityProfile } from './UtilityAI';
import { createNeeds } from './needs';

const BASE_PROFILE: UtilityProfile = {
  actions: {
    [AiAction.EAT]:            { multiplier: 1.0 },
    [AiAction.SEEK_ATTENTION]: { multiplier: 1.0 },
    [AiAction.SLEEP]:          { multiplier: 1.0 },
    [AiAction.PLAY]:           { multiplier: 1.0 },
    [AiAction.WANDER]:         { multiplier: 1.0 },
  },
  criticalThreshold: 0.25,
  criticalBonus: 0.5,
};

describe('scoreAction', () => {
  it('returns 0 when satisfaction is full (urgency = 0)', () => {
    expect(scoreAction(1, { multiplier: 2 }, BASE_PROFILE)).toBe(0);
  });

  it('returns multiplier when satisfaction is 0 (urgency = 1)', () => {
    // urgency=1, score = 1 * 2 = 2; 0 < 0.25 so also adds criticalBonus
    expect(scoreAction(0, { multiplier: 2 }, BASE_PROFILE)).toBeCloseTo(2 + 0.5);
  });

  it('score scales linearly with urgency', () => {
    const score = scoreAction(0.5, { multiplier: 2 }, BASE_PROFILE);
    expect(score).toBeCloseTo(1.0); // urgency=0.5, no critical bonus (0.5 >= 0.25)
  });

  it('critical bonus is flat-additive when satisfaction < criticalThreshold', () => {
    const profile = { ...BASE_PROFILE, criticalThreshold: 0.3, criticalBonus: 0.5 };
    const config = { multiplier: 1.0 };
    // satisfaction=0.2 < 0.3 → bonus applies
    const score = scoreAction(0.2, config, profile);
    const urgency = 0.8;
    expect(score).toBeCloseTo(urgency * 1.0 + 0.5);
  });

  it('critical bonus is NOT applied when satisfaction >= criticalThreshold', () => {
    const profile = { ...BASE_PROFILE, criticalThreshold: 0.25, criticalBonus: 0.5 };
    const score = scoreAction(0.3, { multiplier: 1.0 }, profile);
    expect(score).toBeCloseTo(0.7); // no bonus
  });
});

describe('pickAction', () => {
  it('selects EAT when hunger is critically low and other needs are full', () => {
    const needs = createNeeds({ hunger: 0 });
    const action = pickAction(needs, BASE_PROFILE);
    expect(action).toBe(AiAction.EAT);
  });

  it('selects SLEEP when energy is critically low', () => {
    const needs = createNeeds({ energy: 0 });
    const action = pickAction(needs, BASE_PROFILE);
    expect(action).toBe(AiAction.SLEEP);
  });

  it('selects WANDER when all needs are fully satisfied', () => {
    const needs = createNeeds(); // all at 1
    const action = pickAction(needs, BASE_PROFILE);
    expect(action).toBe(AiAction.WANDER);
  });

  it('highest-need action wins over lower-need actions', () => {
    const needs = createNeeds({ hunger: 0.1, attention: 0.9, energy: 0.9, fun: 0.9 });
    // hunger urgency=0.9, others urgency≤0.1, plus critical bonus for hunger
    const action = pickAction(needs, BASE_PROFILE);
    expect(action).toBe(AiAction.EAT);
  });

  it('respects multiplier differences — higher multiplier wins on equal need', () => {
    const needs = createNeeds({ hunger: 0.5, fun: 0.5 }); // equal urgency
    const profile: UtilityProfile = {
      ...BASE_PROFILE,
      actions: {
        ...BASE_PROFILE.actions,
        [AiAction.EAT]:  { multiplier: 2.0 },
        [AiAction.PLAY]: { multiplier: 1.0 },
      },
    };
    const action = pickAction(needs, profile);
    expect(action).toBe(AiAction.EAT);
  });
});
