export function useGameLoop(tick: (deltaMs: number) => void) {
  let rafId = 0;
  let lastTime = 0;

  function loop(now: number) {
    const deltaMs = lastTime === 0 ? 16 : now - lastTime;
    lastTime = now;
    tick(Math.min(deltaMs, 100));
    rafId = requestAnimationFrame(loop);
  }

  return {
    startLoop() { rafId = requestAnimationFrame(loop); },
    stopLoop()  { cancelAnimationFrame(rafId); lastTime = 0; },
  };
}
