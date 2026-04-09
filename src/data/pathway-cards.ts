export interface PathwayStep {
  number: number;
  title: string;
  detail: string;
}

export interface PathwayCard {
  id: string;
  title: string;
  tagline: string;
  accentColor: string;
  oneLiner: string;
  isCrisis: boolean;
  facts: {
    cost: string;
    sessions?: string;
    wait?: string;
  };
  steps: PathwayStep[];
}

// REVIEW — All costs, session limits, phone numbers, eligibility criteria,
// and process descriptions below are AI-drafted and need verification against
// current Medicare, NDIS, and service provider information.

export const pathwayCards: PathwayCard[] = [
  {
    id: 'crisis',
    title: 'I need help now',
    tagline: 'Free, 24/7, no appointment needed',
    accentColor: 'border-l-accent-amber',
    oneLiner: 'You or someone you know is in immediate danger or severe distress.',
    isCrisis: true,
    facts: {
      cost: 'Free',
      wait: 'Immediate',
    },
    steps: [
      {
        number: 1,
        title: 'If in immediate danger, call 000',
        detail: 'Triple Zero (000) connects you to police, ambulance, or fire services. If someone is at risk of harm right now, this is the first call to make.',
      },
      {
        number: 2,
        title: 'Call Lifeline on 13 11 14',
        detail: '24/7 crisis support and suicide prevention. You can also text 0477 13 11 14 or chat online at <a href="https://www.lifeline.org.au" target="_blank" rel="noopener noreferrer">lifeline.org.au</a>.',
      },
      {
        number: 3,
        title: 'Call Beyond Blue on 1300 22 4636',
        detail: '24/7 mental health support. Also available via web chat at <a href="https://www.beyondblue.org.au" target="_blank" rel="noopener noreferrer">beyondblue.org.au</a>.',
      },
      {
        number: 4,
        title: 'Go to your nearest emergency department',
        detail: 'If you or someone else needs immediate medical attention for a mental health crisis, go to the nearest hospital emergency department.',
      },
      {
        number: 5,
        title: 'Call your state\u2019s mental health crisis triage line',
        detail: 'Each state has a crisis team that can assess the situation by phone and send a team to you if needed. Ask for your local number at any of the services above.',
      },
    ],
  },
  {
    id: 'medicare-gp',
    title: 'See a psychologist through your GP',
    tagline: '$50\u2013$220/session after Medicare rebate', // REVIEW cost range
    accentColor: 'border-l-primary',
    oneLiner: 'You want professional support and are happy to start with your GP.',
    isCrisis: false,
    facts: {
      cost: '$50\u2013$220 per session after rebate', // REVIEW cost range
      sessions: '10 per calendar year', // REVIEW session cap
      wait: 'Days for GP; weeks\u2013months for psych',
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
        title: 'Get a referral for up to 6 sessions',
        detail: 'Your GP refers you to a psychologist, social worker, or occupational therapist. The referral is valid for up to 6 sessions.',
      },
      {
        number: 4,
        title: 'Find and book your practitioner',
        detail: 'Search directories like <a href="https://www.psychologytoday.com/au" target="_blank" rel="noopener noreferrer">Psychology Today Australia</a>, the <a href="https://www.psychology.org.au/Find-a-Psychologist" target="_blank" rel="noopener noreferrer">APS directory</a>, or ask your GP for a recommendation. Check their fees, availability, and whether they offer telehealth.',
      },
      {
        number: 5,
        title: 'After 6 sessions, return to your GP for a review',
        detail: 'Your GP reviews your progress and can refer you for 4 more sessions (10 total per calendar year).',
      },
      {
        number: 6,
        title: 'Your sessions reset every January',
        detail: 'The 10-session limit resets each calendar year. You\u2019ll need a new Mental Health Treatment Plan from your GP to start the next year\u2019s sessions.',
      },
    ],
  },
  {
    id: 'private',
    title: 'Go direct \u2014 no GP, no waiting for a plan',
    tagline: '$120\u2013$330+/session, no rebate', // REVIEW cost range
    accentColor: 'border-l-accent-blue',
    oneLiner: 'You want to start quickly, you know what you\u2019re looking for, or you\u2019d rather not go through a GP.',
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
    id: 'low-cost',
    title: 'Free or low-cost support',
    tagline: 'Free or very low cost',
    accentColor: 'border-l-accent-teal',
    oneLiner: 'Cost is a barrier, you\u2019re on a low income, or you want to access services without a Medicare gap fee.',
    isCrisis: false,
    facts: {
      cost: 'Free or very low cost',
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
  {
    id: 'psychiatrist',
    title: 'See a psychiatrist for specialist assessment or medication',
    tagline: '$150\u2013$550+ out-of-pocket, 2\u20136 month wait', // REVIEW cost range
    accentColor: 'border-l-accent-purple',
    oneLiner: 'You think you may need medication, your condition is complex, or previous treatment hasn\u2019t worked.',
    isCrisis: false,
    facts: {
      cost: '$150\u2013$550+ out-of-pocket (after rebate)', // REVIEW cost range
      sessions: 'No annual cap', // REVIEW session rules
      wait: '2\u20136 months typically',
    },
    steps: [
      {
        number: 1,
        title: 'See your GP and ask for a psychiatrist referral',
        detail: 'Unlike psychologists, you need a GP referral to see a psychiatrist and receive a Medicare rebate.',
      },
      {
        number: 2,
        title: 'Your GP writes a specialist referral letter',
        detail: 'This letter includes your history, current symptoms, and what your GP is hoping the psychiatrist can help with.',
      },
      {
        number: 3,
        title: 'Call the psychiatrist\u2019s clinic to book',
        detail: 'Ask about fees, wait times, and whether they have a cancellation list. Wait times of 2\u20136 months are common, especially for child psychiatry or regional areas.',
      },
      {
        number: 4,
        title: 'Attend your initial assessment',
        detail: 'Usually 45\u201360 minutes. The psychiatrist will review your history, do an assessment, and discuss options.',
      },
      {
        number: 5,
        title: 'The psychiatrist recommends a treatment path',
        detail: 'They may recommend medication, ongoing appointments, or refer you back to a psychologist for therapy alongside their care.',
      },
    ],
  },
  {
    id: 'ndis',
    title: 'Mental health support through the NDIS',
    tagline: '$0 out-of-pocket, NDIS-funded',
    accentColor: 'border-l-accent-olive',
    oneLiner: 'You have a severe, ongoing mental health condition (psychosocial disability) that significantly affects your daily life.',
    isCrisis: false,
    facts: {
      cost: '$0 out-of-pocket (NDIS-funded)',
      wait: 'Application takes months',
    },
    steps: [
      {
        number: 1,
        title: 'Check if you may be eligible',
        detail: 'The NDIS is for permanent and significant disability, not short-term conditions. Your psychosocial disability must substantially affect your ability to do everyday activities.', // REVIEW eligibility criteria
      },
      {
        number: 2,
        title: 'Gather evidence from your treating team',
        detail: 'You\u2019ll need reports from your GP, psychiatrist, psychologist, or other treating professionals that document how your condition affects your daily life.',
      },
      {
        number: 3,
        title: 'Submit an access request to the NDIA',
        detail: 'You can apply online, by phone (1800 800 110), or in person at an NDIA office. A support person or advocate can help you with the application.',
      },
      {
        number: 4,
        title: 'If approved, build your plan with a planner',
        detail: 'Work with an NDIA planner or support coordinator to build a plan that covers the supports you need.',
      },
      {
        number: 5,
        title: 'Choose your providers',
        detail: 'Psychologists, occupational therapists, peer workers, recovery coaches, and more. You choose who provides your supports.',
      },
    ],
  },
];
