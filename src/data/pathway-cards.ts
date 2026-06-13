import { event, type PathwayCardTimeHorizon } from './pathway-time-horizon';

export interface PathwayStep {
  number: number;
  title: string;
  detail: string;
}

export interface PathwayCard {
  id: string;
  icon: string;
  title: string;
  bestFor: string;
  accentColor: string;
  badge?: string;
  oneLiner?: string;
  isCrisis: boolean;
  facts: {
    cost: string;
    sessions?: string;
    wait?: string;
  };
  /** Optional event data for PathwayTimeHorizon; omitted cards render its "varies" fallback. */
  timeHorizon?: PathwayCardTimeHorizon;
  /** When true, steps fan out one-by-one with a progress bar (PathwayCardVisual progressive mode). */
  progressive?: boolean;
  /** Drafts are excluded from rendering until their copy is finalised. */
  draft?: boolean;
  steps: PathwayStep[];
}

/* Shared style maps: used by PathwayCardVisual and JourneyStrip */
export const iconStyleMap: Record<string, { bg: string; stroke: string }> = {
  phone:       { bg: 'bg-accent-red-light',      stroke: 'text-accent-red' },
  stethoscope: { bg: 'bg-primary-light',         stroke: 'text-primary' },
  bolt:        { bg: 'bg-accent-blue-light',     stroke: 'text-accent-blue' },
  heart:       { bg: 'bg-accent-amber-light',    stroke: 'text-accent-amber' },
  clipboard:   { bg: 'bg-accent-purple-light',   stroke: 'text-accent-purple' },
  shield:      { bg: 'bg-accent-olive-light',    stroke: 'text-accent-olive' },
};

export const accentVarMap: Record<string, string> = {
  'border-l-accent-amber':  'var(--color-accent-amber)',
  'border-l-accent-red':    'var(--color-accent-red)',
  'border-l-primary':       'var(--color-primary)',
  'border-l-accent-blue':   'var(--color-accent-blue)',
  'border-l-accent-teal':   'var(--color-accent-teal)',
  'border-l-accent-purple': 'var(--color-accent-purple)',
  'border-l-accent-olive':  'var(--color-accent-olive)',
};

// Costs, session limits, phone numbers and process descriptions on the live
// cards verified June 2026 against MBS/Services Australia/provider sources —
// see docs/health-content-review.md. Draft cards (digital-free, digital-paid)
// remain unverified placeholders.

export const pathwayCards: PathwayCard[] = [
  {
    // TODO(journey-calendar): Product call pending on whether to add a third
    // psychiatrist event here (three-six-months) in addition to GP + Psychologist.
    id: 'through-gp',
    icon: 'stethoscope',
    title: 'Start with your GP',
    bestFor: 'Best for: most people starting out.',
    accentColor: 'border-l-primary',
    badge: 'Most common starting point',
    isCrisis: false,
    facts: {
      cost: '$50\u2013$200 per session',
      sessions: 'Up to 10 per year',
      wait: 'A few days for a GP; a few weeks for a psychologist or other practitioner',
    },
    timeHorizon: {
      events: [
        event('GP', 'few-days'),
        event('Psychologist', 'few-weeks'),
      ],
    },
    steps: [
      {
        number: 1,
        title: 'Book a long appointment with your GP',
        detail: 'Ask for a longer appointment (at least 30 minutes) so there\u2019s enough time to talk properly. This needs to be at your usual GP or a MyMedicare-registered practice.',
      },
      {
        number: 2,
        title: 'Your GP creates a Mental Health Care Plan',
        detail: 'Your GP will ask about how you\u2019ve been feeling, may use a short questionnaire, and write up a plan. This is what unlocks Medicare rebates for psychology sessions.',
      },
      {
        number: 3,
        title: 'Your GP refers you to the right practitioner',
        detail: 'An MHCP-based referral covers psychologists, social workers, or occupational therapists (up to 6 sessions initially). For a psychiatrist, your GP writes a separate specialist referral letter, which is its own Medicare item, not part of the MHCP. Mental health nurses sit outside the MHCP: in private practice they’re rebated via a GP chronic condition management plan, but most people see them free through public services or PHN-funded programs.',
      },
      {
        number: 4,
        title: 'Find and book your practitioner',
        detail: 'Search directories like <a href="https://www.psychologytoday.com/au" target="_blank" rel="noopener noreferrer">Psychology Today Australia</a>, the <a href="https://www.psychology.org.au/Find-a-Psychologist" target="_blank" rel="noopener noreferrer">APS directory</a>, or ask your GP for a recommendation. Psychiatrist wait times of 2\u20136 months are common, so ask about cancellation lists.',
      },
      {
        number: 5,
        title: 'Attend sessions, then return to your GP for a review',
        detail: 'For MHCP-funded sessions (psychologist, social worker, or OT), return to your GP after 6 sessions for a review. This unlocks 4 more, up to 10 per calendar year. Psychiatrist care isn\u2019t capped the same way; follow-up is arranged with the psychiatrist directly.',
      },
      {
        number: 6,
        title: 'MHCP-funded sessions reset each January',
        detail: 'The 10-session cap resets every calendar year. Your plan itself doesn\u2019t expire \u2014 you\u2019ll just need a new referral from your GP for the new year\u2019s sessions (and your GP may review the plan while you\u2019re there). GP referrals to psychiatrists last 12 months by default and aren\u2019t tied to this cycle.',
      },
    ],
  },
  {
    id: 'private',
    icon: 'bolt',
    title: 'Go straight to a practitioner',
    bestFor: 'Best for: getting started quickly without a GP visit.',
    accentColor: 'border-l-accent-blue',
    oneLiner: 'You want to start quickly and are happy to pay out-of-pocket.',
    isCrisis: false,
    facts: {
      cost: '$80\u2013$330+ per session (no rebate)',
      sessions: 'No limit',
      wait: 'Days to 2 weeks',
    },
    timeHorizon: {
      events: [
        event('Practitioner', 'one-two-weeks', 'days to 2 weeks'),
      ],
    },
    progressive: true,
    steps: [
      {
        number: 1,
        title: 'Decide what kind of practitioner you want',
        detail: 'Psychologist, counsellor, accredited mental health social worker, or psychiatrist. Each has different training and approach — see our <a href="/practitioners/">practitioners page</a> to compare. Psychiatrists are the exception here: you’ll almost always want a GP referral first, both for the Medicare rebate and because most private psychiatrists won’t book you in without one.',
      },
      {
        number: 2,
        title: 'Search directories or practice websites',
        detail: 'Look for someone in your area or who offers telehealth. Most practices list their fees, specialities, and availability online.',
      },
      {
        number: 3,
        title: 'Contact them directly and book',
        detail: 'Call, email, or book online. Many practices have online booking.',
      },
      {
        number: 4,
        title: 'No paperwork, no referral, just show up',
        detail: 'You don\u2019t need a GP referral, Mental Health Care Plan, or any other documentation (psychiatrists aside). Just turn up to your appointment.',
      },
    ],
  },
  {
    id: 'digital-free',
    draft: true, // copy pending deep research — hidden from the live page
    icon: 'clipboard', // REVIEW: pick a more fitting icon for digital programs
    title: 'Free digital programs',
    bestFor: 'Best for: TODO',
    accentColor: 'border-l-accent-purple',
    oneLiner: 'TODO: copy pending deep research',
    isCrisis: false,
    facts: {
      cost: 'Free',
      sessions: 'TBC',
      wait: 'TBC',
    },
    timeHorizon: {
      events: [
        event('Program', 'same-day'),
      ],
    },
    progressive: true,
    steps: [
      {
        number: 1,
        title: 'TODO: copy pending deep research',
        detail: 'Layout placeholder. Content to follow.',
      },
    ],
  },
  {
    id: 'digital-paid',
    draft: true, // copy pending deep research — hidden from the live page
    icon: 'shield', // REVIEW: pick a more fitting icon for paid therapy apps
    title: 'Paid therapy apps',
    bestFor: 'Best for: TODO',
    accentColor: 'border-l-accent-olive',
    oneLiner: 'TODO: copy pending deep research',
    isCrisis: false,
    facts: {
      cost: 'TBC',
      sessions: 'TBC',
      wait: 'TBC',
    },
    timeHorizon: {
      events: [
        event('App', 'same-day'),
      ],
    },
    progressive: true,
    steps: [
      {
        number: 1,
        title: 'TODO: copy pending deep research',
        detail: 'Layout placeholder. Content to follow.',
      },
    ],
  },
  {
    id: 'low-cost',
    icon: 'heart',
    title: 'Free or low-cost support',
    bestFor: 'Best for: people on a tight budget or without Medicare.',
    accentColor: 'border-l-accent-amber',
    oneLiner: 'Cost is a barrier, you\u2019re on a low income, or you want to access services without a Medicare gap fee.',
    isCrisis: false,
    facts: {
      cost: 'Free or very low cost',
      sessions: 'Varies',
      wait: 'Varies by service',
    },
    progressive: true,
    steps: [
      {
        number: 1,
        title: 'Visit a Medicare Mental Health Centre',
        detail: 'Free, walk-in, no referral needed. Call <a href="tel:1800595212">1800 595 212</a> to find your nearest centre.',
      },
      {
        number: 2,
        title: 'Contact your local Primary Health Network (PHN)',
        detail: 'PHNs commission free mental health services in your area. Search for your PHN online to see what\u2019s available locally.',
      },
      {
        number: 3,
        title: 'Check headspace if you\u2019re aged 12\u201325',
        detail: 'Free or very low cost, no referral needed. Visit <a href="https://headspace.org.au" target="_blank" rel="noopener noreferrer">headspace.org.au</a> to find your nearest centre.',
      },
      {
        number: 4,
        title: 'Ask about university training clinics',
        detail: 'University psychology clinics offer sessions at $10\u2013$50 on a sliding scale (some free). You\u2019ll see a trainee supervised by a registered psychologist.',
      },
      {
        number: 5,
        title: 'Ask your employer about an EAP',
        detail: 'Employee Assistance Programs typically offer 3\u20136 free, confidential sessions. Check with your HR team or workplace intranet.',
      },
    ],
  },
];
