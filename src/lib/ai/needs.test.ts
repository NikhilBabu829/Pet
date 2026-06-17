import { describe, it, expect } from 'vitest';
import { createNeeds, tickNeeds } from './needs';
import type { NeedDecayRates } from './needs';

const UNIFORM_RATES: NeedDecayRates = { hunger: 0.1, attention: 0.1, energy: 0.1, fun: 0.1 };

describe('createNeeds', () => {
  it('initialises all needs to 1 by default', () => {
    const needs = createNeeds();
    expect(needs.hunger).toBe(1);
    expect(needs.attention).toBe(1);
    expect(needs.energy).toBe(1);
    expect(needs.fun).toBe(1);
  });

  it('accepts partial overrides', () => {
    const needs = createNeeds({ hunger: 0.5, fun: 0 });
    expect(needs.hunger).toBe(0.5);
    expect(needs.fun).toBe(0);
    expect(needs.attention).toBe(1);
    expect(needs.energy).toBe(1);
  });
});

describe('tickNeeds', () => {
  it('decrements each need by rate * dt', () => {
    const needs = createNeeds();
    tickNeeds(needs, UNIFORM_RATES, 1000);
    expect(needs.hunger).toBeCloseTo(0.9);
    expect(needs.attention).toBeCloseTo(0.9);
    expect(needs.energy).toBeCloseTo(0.9);
    expect(needs.fun).toBeCloseTo(0.9);
  });

  it('clamps needs at 0 — never goes negative', () => {
    const needs = createNeeds({ hunger: 0.05 });
    tickNeeds(needs, UNIFORM_RATES, 5000);
    expect(needs.hunger).toBe(0);
  });

  it('scales correctly with sub-second deltas', () => {
    const needs = createNeeds();
    tickNeeds(needs, UNIFORM_RATES, 500);
    expect(needs.hunger).toBeCloseTo(0.95);
  });

  it('does not affect other needs when one bottoms out', () => {
    const needs = createNeeds({ hunger: 0 });
    tickNeeds(needs, UNIFORM_RATES, 1000);
    expect(needs.hunger).toBe(0);
    expect(needs.attention).toBeCloseTo(0.9);
  });

  it('independent rates decay independently', () => {
    const rates: NeedDecayRates = { hunger: 0.2, attention: 0.05, energy: 0.1, fun: 0.0 };
    const needs = createNeeds();
    tickNeeds(needs, rates, 1000);
    expect(needs.hunger).toBeCloseTo(0.8);
    expect(needs.attention).toBeCloseTo(0.95);
    expect(needs.energy).toBeCloseTo(0.9);
    expect(needs.fun).toBe(1);
  });
});
