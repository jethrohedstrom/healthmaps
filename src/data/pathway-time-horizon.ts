/**
 * Winding-path timeline — bucket positions and event types.
 * Spec: design_handoff_journey_calendar/README.md. Do not compute positions
 * from raw day counts; only use these named buckets.
 */
export const WAIT_BUCKETS = {
  'same-day': { pos: 8, sub: 'same day' },
  'few-days': { pos: 16, sub: 'a few days' },
  'around-week': { pos: 24, sub: 'around a week' },
  'one-two-weeks': { pos: 34, sub: '1\u20132 weeks' },
  'few-weeks': { pos: 46, sub: 'a few weeks' },
  'several-weeks': { pos: 56, sub: 'several weeks' },
  'one-month': { pos: 66, sub: '~1 month' },
  'one-two-months': { pos: 74, sub: '1\u20132 months' },
  'two-three-months': { pos: 82, sub: '2\u20133 months' },
  'three-six-months': { pos: 90, sub: '3\u20136 months' },
  'six-plus-months': { pos: 96, sub: '6+ months' },
} as const;

export type WaitBucket = keyof typeof WAIT_BUCKETS;

export interface PathwayTimelineEvent {
  /** Pin label, e.g. "GP", "Psychologist", "Psychiatrist" */
  label: string;
  /** Wait bucket — determines the dot's position along the path */
  bucket: WaitBucket;
  /** Optional override for the sub-label copy (defaults to the bucket's `sub`) */
  subOverride?: string;
}

export interface PathwayCardTimeHorizon {
  /** `today` is rendered automatically; just provide upcoming appointments. */
  events: PathwayTimelineEvent[];
}

/** Helper used in `pathway-cards.ts` to keep call sites readable. */
export function event(
  label: string,
  bucket: WaitBucket,
  subOverride?: string
): PathwayTimelineEvent {
  return { label, bucket, subOverride };
}
