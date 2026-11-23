import { useEffect, useState } from "react";

import { useReducedMotion } from "motion/react";

export function useCounter(value: number, durationMs = 1500): number {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      setCount(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      setCount(Math.round(value * p));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, durationMs, reduced]);
  return count;
}
