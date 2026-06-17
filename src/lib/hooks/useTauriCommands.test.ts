import { describe, it, expect } from 'vitest';
import {
  calcDistance,
  isInsidePetBox,
  createIdleTimer,
  tickIdleTimer,
  resetIdleTimer,
} from './useTauriCommands';
import { FSM, FsmState, FsmEvent } from '../ai/FSM';
import type { NeedDecayRates } from '../ai/needs';

function makeRates(attention: number): NeedDecayRates {
  return { hunger: 0.01, attention, energy: 0.01, fun: 0.01 };
}

// ---------------------------------------------------------------------------
// calcDistance
// ---------------------------------------------------------------------------

describe('calcDistance', () => {
  it('computes 3-4-5 triangle', () => {
    expect(calcDistance(0, 0, 3, 4)).toBe(5);
  });

  it('returns 0 for same point', () => {
    expect(calcDistance(7, 7, 7, 7)).toBe(0);
  });

  it('works with negative coordinates', () => {
    expect(calcDistance(-1, 0, 2, 0)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// isInsidePetBox  (pet at 100,100; size=64 → box [100,164) × [100,164))
// ---------------------------------------------------------------------------

describe('isInsidePetBox', () => {
  const PET_X = 100;
  const PET_Y = 100;
  const SIZE = 64;

  it('returns true for click at center of box', () => {
    expect(isInsidePetBox(132, 132, PET_X, PET_Y, SIZE)).toBe(true);
  });

  it('returns true on left edge', () => {
    expect(isInsidePetBox(100, 132, PET_X, PET_Y, SIZE)).toBe(true);
  });

  it('returns true on top edge', () => {
    expect(isInsidePetBox(132, 100, PET_X, PET_Y, SIZE)).toBe(true);
  });

  it('returns false one pixel left of box', () => {
    expect(isInsidePetBox(99, 132, PET_X, PET_Y, SIZE)).toBe(false);
  });

  it('returns false one pixel above box', () => {
    expect(isInsidePetBox(132, 99, PET_X, PET_Y, SIZE)).toBe(false);
  });

  it('returns false on right edge (exclusive)', () => {
    expect(isInsidePetBox(164, 132, PET_X, PET_Y, SIZE)).toBe(false);
  });

  it('returns false on bottom edge (exclusive)', () => {
    expect(isInsidePetBox(132, 164, PET_X, PET_Y, SIZE)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// tickIdleTimer
// ---------------------------------------------------------------------------

describe('tickIdleTimer', () => {
  it('does nothing before 30 seconds', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    tickIdleTimer(timer, rates, 0.02, fsm, timer.lastActivityMs + 29_000);
    expect(rates.attention).toBe(0.02);
    expect(timer.attentionBoosted).toBe(false);
    expect(fsm.currentState).toBe(FsmState.IDLE);
  });

  it('doubles attention rate at exactly 30 seconds', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    tickIdleTimer(timer, rates, 0.02, fsm, timer.lastActivityMs + 30_000);
    expect(rates.attention).toBeCloseTo(0.04);
    expect(timer.attentionBoosted).toBe(true);
  });

  it('does not double rate again on subsequent ticks after 30s', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    const t0 = timer.lastActivityMs;
    tickIdleTimer(timer, rates, 0.02, fsm, t0 + 30_000);
    tickIdleTimer(timer, rates, 0.02, fsm, t0 + 31_000);
    expect(rates.attention).toBeCloseTo(0.04);
  });

  it('fires MISCHIEF_START at 120 seconds', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    tickIdleTimer(timer, rates, 0.02, fsm, timer.lastActivityMs + 120_000);
    expect(fsm.currentState).toBe(FsmState.MISCHIEF);
    expect(timer.mischiefFired).toBe(true);
  });

  it('does not fire MISCHIEF a second time', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    const t0 = timer.lastActivityMs;
    tickIdleTimer(timer, rates, 0.02, fsm, t0 + 120_000);
    // FSM is now MISCHIEF; a second tick should not throw or double-transition
    tickIdleTimer(timer, rates, 0.02, fsm, t0 + 121_000);
    expect(fsm.currentState).toBe(FsmState.MISCHIEF);
  });
});

// ---------------------------------------------------------------------------
// resetIdleTimer
// ---------------------------------------------------------------------------

describe('resetIdleTimer', () => {
  it('restores attention rate after boost', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    tickIdleTimer(timer, rates, 0.02, fsm, timer.lastActivityMs + 30_000);
    expect(rates.attention).toBeCloseTo(0.04);
    resetIdleTimer(timer, rates, 0.02, Date.now());
    expect(rates.attention).toBe(0.02);
  });

  it('clears attentionBoosted and mischiefFired flags', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const fsm = new FSM(FsmState.IDLE);
    tickIdleTimer(timer, rates, 0.02, fsm, timer.lastActivityMs + 30_000);
    resetIdleTimer(timer, rates, 0.02, Date.now());
    expect(timer.attentionBoosted).toBe(false);
    expect(timer.mischiefFired).toBe(false);
  });

  it('updates lastActivityMs to the provided timestamp', () => {
    const timer = createIdleTimer();
    const rates = makeRates(0.02);
    const newTime = Date.now() + 99_999;
    resetIdleTimer(timer, rates, 0.02, newTime);
    expect(timer.lastActivityMs).toBe(newTime);
  });
});
