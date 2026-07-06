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
    summary: 'A good first step for you is starting with a GP. This fits when you want professional guidance and a pathway to Medicare-rebated sessions.',
    secondarySummary: 'Useful if you want professional guidance and a pathway to Medicare-rebated sessions.',
    href: '#through-gp',
  },
  private: {
    title: 'Go straight to a private practitioner',
    summary: 'A good first step for you is going straight to a private practitioner. This fits when you want to start quickly and are comfortable paying out of pocket.',
    secondarySummary: 'Useful if you want to start quickly and are comfortable paying out of pocket.',
    href: '#private',
  },
  'low-cost': {
    title: 'Try free or community services',
    summary: 'A good first step for you is free or community support. This fits when cost, local access, or walk-in services matter most.',
    secondarySummary: 'Useful if cost, local access, or walk-in services matter most.',
    href: '#low-cost',
  },
  'self-guided': {
    title: 'Start with self-guided online tools',
    summary: 'A good first step for you is self-guided online support. This fits when you want something private, low-pressure, and available right now.',
    secondarySummary: 'Useful if you want something private, low-pressure, and available right now.',
    href: '#self-guided',
  },
};
