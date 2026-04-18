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
  oneLiner: string;
  isCrisis: boolean;
  facts: {
    cost: string;
    sessions: string;
    wait: string;
  };
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

// REVIEW: All costs, session limits, phone numbers, eligibility criteria,
// and process descriptions below are AI-drafted and need verification against
// current Medicare, NDIS, and service provider information.

export const pathwayCards: PathwayCard[] = [
  {
    id: 'through-gp',
    icon: 'stethoscope',
    title: 'Through your GP (Medicare-subsidised)',
    bestFor: 'Best for: ongoing support at the lowest cost, or for complex conditions and medication.',
    accentColor: 'border-l-primary',
    badge: 'Most common starting point',
    oneLiner: 'You want professional support and are happy to start with your GP \u2014 they can refer you on to the right kind of practitioner for your situation.',
    isCrisis: false,
    facts: {
      cost: '$50\u2013$550+ per session after rebate (depending on practitioner)', // REVIEW cost range
      sessions: '10 per year for MHTP-funded; no annual cap for psychiatrist', // REVIEW
      wait: 'Days for GP; weeks\u2013months for psychologist; 2\u20136 months for psychiatrist',
    },
    steps: [
      {
        number: 1,
        title: 'Book a long appointment with your GP',
        detail: 'Ask for a longer appointment (at least 30 minutes) so there\u2019s enough time to talk properly. This needs to be at your usual GP or a MyMedicare-registered practice.',
      },
      {
        number: 2,
        title: 'Your GP creates a Mental Health Treatment Plan',
        detail: 'Your GP will ask about how you\u2019ve been feeling, may use a short questionnaire, and write up a plan. This is what unlocks Medicare rebates for psychology sessions.',
      },
      {
        number: 3,
        title: 'Your GP refers you to the right practitioner',
        // TODO: confirm referral process for mental health nurses \u2014 is it via the MHTP, a separate pathway, or employer/PHN-arranged? Clarify before publishing.
        detail: 'An MHTP-based referral covers psychologists, social workers, or occupational therapists (up to 6 sessions initially). For a psychiatrist, your GP writes a separate specialist referral letter \u2014 this is its own Medicare item, not part of the MHTP. Mental health nurses may be available through some GP practices or PHN-funded programs.',
      },
      {
        number: 4,
        title: 'Find and book your practitioner',
        detail: 'Search directories like <a href="https://www.psychologytoday.com/au" target="_blank" rel="noopener noreferrer">Psychology Today Australia</a>, the <a href="https://www.psychology.org.au/Find-a-Psychologist" target="_blank" rel="noopener noreferrer">APS directory</a>, or ask your GP for a recommendation. Psychiatrist wait times of 2\u20136 months are common \u2014 ask about cancellation lists.',
      },
      {
        number: 5,
        title: 'Attend sessions \u2014 and return to your GP for a review',
        // TODO: confirm whether psychiatrist pathway has a parallel review checkpoint \u2014 "no annual cap" suggests a different cadence to the MHTP review cycle.
        detail: 'For MHTP-funded sessions (psychologist / social worker / OT), return to your GP after 6 sessions for a review \u2014 this unlocks 4 more, up to 10 per calendar year. Psychiatrist care isn\u2019t capped the same way; follow-up is arranged with the psychiatrist directly.',
      },
      {
        number: 6,
        title: 'MHTP-funded sessions reset each January',
        // TODO: verify psychiatrist referral validity period \u2014 psychiatrist referrals usually last 3\u201312 months and aren\u2019t tied to the MHTP cycle, but worth confirming.
        detail: 'The 10-session cap resets every calendar year. You\u2019ll need a new Mental Health Treatment Plan from your GP to start the next year\u2019s MHTP-funded sessions. Psychiatrist referrals aren\u2019t subject to this cycle.',
      },
    ],
  },
  {
    id: 'private',
    icon: 'bolt',
    title: 'Pay privately (skip the referral, no rebate)',
    bestFor: 'Best for: getting started quickly without a GP visit.',
    accentColor: 'border-l-accent-blue',
    oneLiner: 'You want to start quickly and are happy to pay out-of-pocket.',
    isCrisis: false,
    facts: {
      cost: '$120\u2013$330+ per session (no rebate)', // REVIEW cost range
      sessions: 'No limit',
      wait: 'Days to 2 weeks',
    },
    steps: [
      {
        number: 1,
        title: 'Decide what kind of practitioner you want',
        detail: 'Psychologist, counsellor, or social worker \u2014 each has different training and approach. See our <a href="/practitioners/">practitioners page</a> to compare.',
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
        title: 'No paperwork, no referral \u2014 just show up',
        detail: 'You don\u2019t need a GP referral, Mental Health Treatment Plan, or any other documentation. Just turn up to your appointment.',
      },
    ],
  },
  {
    id: 'digital-free',
    icon: 'clipboard', // TODO: pick a more fitting icon for digital programs
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
    steps: [
      {
        number: 1,
        title: 'TODO: copy pending deep research',
        detail: 'Layout placeholder \u2014 content to follow.',
      },
    ],
  },
  {
    id: 'digital-paid',
    icon: 'shield', // TODO: pick a more fitting icon for paid therapy apps
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
    steps: [
      {
        number: 1,
        title: 'TODO: copy pending deep research',
        detail: 'Layout placeholder \u2014 content to follow.',
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
        detail: 'University psychology clinics offer sessions at $10\u2013$80 on a sliding scale. You\u2019ll see a trainee supervised by a registered psychologist.', // REVIEW cost range
      },
      {
        number: 5,
        title: 'Ask your employer about an EAP',
        detail: 'Employee Assistance Programs typically offer 3\u20136 free, confidential sessions. Check with your HR team or workplace intranet.', // REVIEW session count
      },
    ],
  },
];
