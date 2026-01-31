export function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
