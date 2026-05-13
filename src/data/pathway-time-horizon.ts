/**
 * V6a pin buckets — fixed positions only (design_handoff_time_horizon/README.md).
 * Do not compute leftPct from raw day counts.
 */
export const WAIT_BUCKETS = {
  'few-days': { leftPct: 12, sub: 'a few days' },
  'around-week': { leftPct: 25, sub: 'around a week' },
  'one-two-weeks': { leftPct: 40, sub: '1\u20132 weeks' },
  'few-weeks': { leftPct: 68, sub: 'a few weeks' },
  'several-weeks': { leftPct: 85, sub: 'several weeks' },
} as const;

export type WaitBucket = keyof typeof WAIT_BUCKETS;

export interface PathwayTimeHorizonPin {
  label: string;
  sub: string;
  leftPct: number;
}

/** Attach to a pathway card; render via PathwayTimeHorizon.astro (1 or 2 pins). */
export interface PathwayCardTimeHorizon {
  pins: PathwayTimeHorizonPin[];
}

export function pinFromBucket(
  label: string,
  bucket: WaitBucket,
  subOverride?: string
): PathwayTimeHorizonPin {
  const b = WAIT_BUCKETS[bucket];
  return { label, sub: subOverride ?? b.sub, leftPct: b.leftPct };
}
