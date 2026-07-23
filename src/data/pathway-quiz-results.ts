// Quiz result copy, shared by PathwayQuiz.astro (server-rendered height sizer)
// and pathway-quiz.ts (runtime result rendering). Keeping both consumers on
// this one source means copy edits automatically keep the card height honest.

export const scoredPathwayIds = ['through-gp', 'private', 'low-cost', 'self-guided'] as const;
export type ScoredPathwayId = (typeof scoredPathwayIds)[number];

export interface ResultContent {
  title: string;
  summaryPoints: string[];
  secondarySummary: string;
  href: `#${ScoredPathwayId}`;
}

export const resultContent: Record<ScoredPathwayId, ResultContent> = {
  'through-gp': {
    title: 'Start with a GP',
    // REVIEW: AI-drafted — check the Medicare-rebate framing and the claim
    // that GPs often recommend a specific practitioner.
    summaryPoints: [
      'This is the route that gets you Medicare rebates on therapy',
      'Advice on what kind of help fits, and often a recommendation for who to see',
      'Any GP can do this, not just one you already know',
    ],
    secondarySummary: "Worth it if you'd like a doctor's guidance and Medicare rebates on sessions.",
    href: '#through-gp',
  },
  private: {
    title: 'Go straight to a practitioner',
    summaryPoints: [
      'Usually the fastest way in',
      'No referral, no paperwork',
      'You pay the full fee yourself',
    ],
    secondarySummary: 'The quickest route in, if paying the full fee yourself is manageable.',
    href: '#private',
  },
  'low-cost': {
    title: 'Try a community or public service',
    // REVIEW: AI-drafted — check the walk-in / no-referral claim.
    summaryPoints: [
      'Costs little or nothing',
      'Many take walk-ins',
      'No referral needed',
    ],
    secondarySummary: 'Free or close to it, often walk-in, no referral needed.',
    href: '#low-cost',
  },
  'self-guided': {
    title: 'Start with self-guided online tools',
    summaryPoints: [
      'Start today, at your own pace',
      'Private and low-pressure',
      'Many of the good ones are free',
    ],
    secondarySummary: 'Private and low-pressure, and you can start today.',
    href: '#self-guided',
  },
};
