/** PRNG determinista (mulberry32) para que la demo siempre genere los mismos datos */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)]!,
    chance: (p: number) => next() < p,
    sample: <T,>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      const out: T[] = [];
      while (out.length < n && copy.length) out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]!);
      return out;
    },
    hex: (len: number) => Array.from({ length: len }, () => Math.floor(next() * 16).toString(16)).join(""),
  };
}

export type Random = ReturnType<typeof createRandom>;
