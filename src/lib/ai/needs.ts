export type Needs = {
  hunger: number;    // 1 = fully satisfied, 0 = critical
  attention: number;
  energy: number;
  fun: number;
};

export type NeedDecayRates = {
  hunger: number;    // satisfaction units lost per second
  attention: number;
  energy: number;
  fun: number;
};

export function createNeeds(initial: Partial<Needs> = {}): Needs {
  return { hunger: 1, attention: 1, energy: 1, fun: 1, ...initial };
}

export function tickNeeds(needs: Needs, rates: NeedDecayRates, deltaMs: number): void {
  const dt = deltaMs / 1000;
  needs.hunger    = Math.max(0, needs.hunger    - rates.hunger    * dt);
  needs.attention = Math.max(0, needs.attention - rates.attention * dt);
  needs.energy    = Math.max(0, needs.energy    - rates.energy    * dt);
  needs.fun       = Math.max(0, needs.fun       - rates.fun       * dt);
}
