// Quiz result copy, shared by PathwayQuiz.astro (server-rendered height sizer)
// and pathway-quiz.ts (runtime result rendering). Keeping both consumers on
// this one source means copy edits automatically keep the card height honest.

export const scoredPathwayIds = ['through-gp', 'private', 'low-cost', 'self-guided'] as const;
export type ScoredPathwayId = (typeof scoredPathwayIds)[number];

export interface ResultContent {
  title: string;
  summary: string;
  secondarySummary: string;
  href: `#${ScoredPathwayId}`;
}

export const resultContent: Record<ScoredPathwayId, ResultContent> = {
  'through-gp': {
    title: 'Start with a GP',
    // REVIEW: AI-drafted — check the Medicare-rebate framing.
    summary: "A GP visit unlocks Medicare rebates for therapy sessions, and gives you professional guidance on what suits you. You don't need a regular GP to start.",
    secondarySummary: "Worth it if you'd like a doctor's guidance and Medicare rebates on sessions.",
    href: '#through-gp',
  },
  private: {
    title: 'Go straight to a practitioner',
    summary: 'Booking directly with a psychologist or counsellor is usually the fastest way in. No referral, no paperwork; you pay the full fee yourself.',
    secondarySummary: 'The quickest route in, if paying the full fee yourself is manageable.',
    href: '#private',
  },
  'low-cost': {
    title: 'Try a community or public service',
    // REVIEW: AI-drafted — check the walk-in / no-referral claim.
    summary: 'Community and public services cost little or nothing, and many take walk-ins with no referral.',
    secondarySummary: 'Free or close to it, often walk-in, no referral needed.',
    href: '#low-cost',
  },
  'self-guided': {
    title: 'Start with self-guided online tools',
    summary: 'Online programs and apps let you start today, privately and at your own pace. Many of the good ones are free.',
    secondarySummary: 'Private and low-pressure, and you can start today.',
    href: '#self-guided',
  },
};
