const bmData = {
  gp: {
    name: "GP (General Practitioner)",
    color: "#5c6670",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare", cls: "badge-medicare" }
    ],
    desc: "<p>A doctor (GP) is where most mental health journeys start.</p><ul><li>Can diagnose mental health conditions and prescribe medication</li><li>Sets you up with a <button type=\"button\" class=\"bm-mhcp-toggle\" style=\"color:var(--color-primary);font-weight:600;text-decoration:underline;text-underline-offset:2px;cursor:pointer;background:none;border:none;padding:0;font-size:inherit;font-family:inherit;line-height:inherit;text-align:left;\">Mental Health Care Plan (MHCP)</button>, which unlocks Medicare-funded sessions with a psychologist, social worker, or OT</li><li>For talk therapy, your GP refers you on — some people only need their GP for medication and check-ins</li></ul>",
    details: [
      { label: "Cost", value: "Free – $100+<br><a href=\"/calculator/\" style=\"font-size:11px;color:var(--color-primary);font-weight:600;text-decoration:none;white-space:nowrap;\">More on pricing →</a>" },
      { label: "Referral", value: "None needed" },
      { label: "Can prescribe", value: "Yes" },
      { label: "Wait", value: "Typically 0–5 days" }
    ],
    approachable: {
      lead: "Where most mental health journeys start. A doctor who can diagnose, prescribe, and set up your Medicare-funded sessions.",
      qa: [
        {
          q: "What will it cost me?",
          a: 'Free if your GP bulk-bills, up to <span class="bm-qa-fig">$100+</span> with a gap fee.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: "No. You can book a GP directly, and you'll usually be seen within a few days."
        },
        {
          q: "How do they sort out therapy?",
          a: 'They set you up with a <button type="button" class="bm-rebate-toggle" aria-expanded="false">Mental Health Care Plan<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>, which unlocks up to 10 Medicare-funded sessions with a psychologist, social worker or OT.',
          detail: '<div class="bm-rebate-detail"><div class="bm-rebate-detail-inner">A Mental Health Care Plan is a short document your GP writes during your appointment. It unlocks Medicare rebates for up to 10 sessions a year, with no extra paperwork on your end.<a href="/pathway/#step-2">See how the process works <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a></div></div>'
        }
      ],
      moreDetail: '<dl><dt>Cost</dt><dd>Free (bulk-billed) to $100+ with a gap fee</dd><dt>Referral</dt><dd>None needed to see a GP</dd><dt>Can prescribe</dt><dd>Yes</dd><dt>Wait</dt><dd>Typically 0–5 days</dd></dl>'
    }
  },
  psychologist: {
    name: "Psychologist",
    color: "#4a7fb5",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "<p>The most common professional people see through Medicare for mental health.</p><ul><li>Works with you on specific problems using research-backed techniques</li><li>GP referral needed to access Medicare rebates</li><li>Two types — general and clinical. Clinical psychologists have extra specialist training and a higher Medicare rebate</li></ul>",
    details: [
      { label: "Cost", value: "$150–$300" },
      { label: "Medicare rebate", value: "$98.95 (general) / $145.25 (clinical)" },
      { label: "Sessions", value: "10 per year (Better Access)" },
      { label: "Referral", value: "Not required. GP referral needed for Medicare rebate." },
      { label: "Can prescribe", value: "No" }
    ],
    // Approachable, question-led panel. Rolled out for Psychologist first; when an
    // entry has `approachable`, showBmInfo renders this instead of badges/desc/details.
    approachable: {
      lead: "The therapist most people see first. Structured, evidence-based therapy for anxiety, depression and trauma.",
      qa: [
        {
          // REVIEW: out-of-pocket range. Full fee $150–$300 (general) / $180–$350 (clinical),
          // rebate fixed at $98.95 / $145.25 (verified 10 Jun 2026). Re-check after MBS
          // indexation (next expected 1 Jul 2026). Source: src/data/calculator-costs.json.
          q: "What will it cost me?",
          a: 'Usually <span class="bm-qa-fig">$100–$200</span> a session, after the Medicare rebate.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: 'Technically no. But most people get a GP referral first, so Medicare covers part of each session through the <button type="button" class="bm-rebate-toggle" aria-expanded="false">Medicare rebate<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>.',
          detail: '<div class="bm-rebate-detail"><div class="bm-rebate-detail-inner">Your GP writes you a <strong>Mental Health Care Plan</strong>. It lets Medicare cover part of up to 10 sessions a year. Without one, you pay the full fee.<a href="/pathway/#step-2">See how the plan works <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a></div></div>'
        },
        {
          q: "How long's the wait?",
          a: "Usually 2–12 weeks."
        }
      ],
      moreDetail: '<dl><dt>Full fee</dt><dd>$150–$300 per session</dd><dt>Medicare rebate</dt><dd>$98.95 general, $145.25 clinical</dd><dt>General vs clinical</dt><dd>Clinical psychologists have extra specialist training and a higher rebate.</dd><dt>Can prescribe</dt><dd>No</dd><dt>Registration</dt><dd>AHPRA registered</dd></dl>'
    }
  },
  psychiatrist: {
    name: "Psychiatrist",
    color: "#7e6aad",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "<p>A medical doctor who specialises in mental health.</p><ul><li>Can diagnose conditions, prescribe and manage medication, and provide therapy</li><li>Most often seen for ADHD, bipolar disorder, treatment-resistant depression, or when specialist medications are needed that a GP can't prescribe</li><li>GP referral needed to access a Medicare rebate</li></ul>",
    costRows: [
      { label: "First session", fee: "$400 – $800", rebate: "$262.10", outOfPocket: "$138 – $538" },
      { label: "Follow-up sessions", fee: "$200 – $400", rebate: "$87.05 – $134.00", outOfPocket: "$66 – $313" }
    ],
    details: [
      { label: "Wait", value: "1 – 6 months" },
      { label: "Referral", value: "Needed for Medicare rebate" },
      { label: "Can prescribe", value: "Yes" }
    ],
    approachable: {
      lead: "A medical specialist for complex or hard-to-treat conditions, like ADHD, bipolar, or depression that hasn't responded to other treatment.",
      qa: [
        {
          // REVIEW: derived out-of-pocket. First session $400–$800 fee − $262.10 rebate;
          // follow-ups $200–$400 − $87.05–$134.00. Source: src/data/calculator-costs.json.
          q: "What will it cost me?",
          a: 'The priciest option. Around <span class="bm-qa-fig">$140–$540</span> out of pocket for the first session, and less for follow-ups, after the Medicare rebate.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: "Not to be seen — you can book a private psychiatrist without one. A GP referral only unlocks the Medicare rebate; without it you pay the full fee, but there's also no Medicare record of the visit, which some people prefer for privacy."
        },
        {
          q: "How long's the wait?",
          a: "Often 1 to 6 months."
        }
      ],
      moreDetail: '<dl><dt>First session</dt><dd>$400–$800 fee, $262.10 rebate, ~$140–$540 out of pocket</dd><dt>Follow-ups</dt><dd>$200–$400 fee, $87–$134 rebate, ~$65–$315 out of pocket</dd><dt>Sessions</dt><dd>No yearly cap</dd><dt>Can prescribe</dt><dd>Yes</dd></dl>'
    }
  },
  counsellor: {
    name: "Counsellor",
    color: "#5aab7b",
    badges: [
      { text: "Title not regulated", cls: "badge-unregulated" },
      { text: "No Medicare rebate", cls: "badge-no-medicare" },
      { text: "Voluntary accreditation (ACA/PACFA)", cls: "badge-voluntary" }
    ],
    desc: "<p>A trained listener who helps you work through everyday challenges: stress, grief, relationships, life transitions.</p><ul><li>Book directly \u2014 no GP appointment or referral needed, and no benefit to getting one, since counsellors sit outside Medicare entirely</li><li>Generally easier to access than psychologists, where long waits are common</li><li>\u201cCounsellor\u201d is not a protected title \u2014 <a href=\"https://www.arcapregister.com.au/\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--color-primary);font-weight:600;text-decoration:underline;text-underline-offset:2px;\">verify your practitioner's credentials</a></li></ul>",
    details: [
      { label: "Cost", value: "$80–$200" },
      { label: "Medicare", value: "No" },
      { label: "Referral", value: "Not needed" },
      { label: "Can prescribe", value: "No" }
    ],
    approachable: {
      lead: "A trained listener for everyday challenges like stress, grief, relationships and life changes. Usually easier to get into than a psychologist.",
      qa: [
        {
          q: "What will it cost me?",
          a: '<span class="bm-qa-fig">$80–$200</span> a session. There is no Medicare rebate, so that is the full cost.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: "No, and there is no benefit to getting one, since counsellors sit outside Medicare."
        },
        {
          q: "Is my counsellor qualified?",
          a: '“Counsellor” is not a protected title, so it is worth a quick <button type="button" class="bm-rebate-toggle" aria-expanded="false">credentials check<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>.',
          detail: '<div class="bm-rebate-detail"><div class="bm-rebate-detail-inner">Anyone can call themselves a counsellor. Look for membership of the <strong>ACA</strong> or <strong>PACFA</strong>, the two main professional bodies.<a href="https://www.arcapregister.com.au/" target="_blank" rel="noopener noreferrer">Verify your practitioner <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a></div></div>'
        }
      ],
      moreDetail: '<dl><dt>Cost</dt><dd>$80–$200 (no Medicare rebate)</dd><dt>Referral</dt><dd>Not needed</dd><dt>Accreditation</dt><dd>Voluntary (ACA / PACFA)</dd><dt>Can prescribe</dt><dd>No</dd></dl>'
    }
  },
  "social-worker": {
    name: "Mental Health Social Worker",
    color: "#c27a4a",
    badges: [
      { text: "Professionally accredited (AASW)", cls: "badge-voluntary" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "<p>Most people associate social workers with welfare, but Accredited Mental Health Social Workers are specialist therapists with extra training in mental health.</p><ul><li>Strength is the bigger picture \u2014 how housing, finances, relationships, and family situations affect your mental health</li><li>Helps you navigate those systems alongside therapy</li></ul>",
    details: [
      { label: "Cost", value: "$150–$250" },
      { label: "Medicare rebate", value: "$87.25" },
      { label: "Sessions", value: "10 per year (Better Access)" },
      { label: "Referral", value: "Not required. GP referral needed for Medicare rebate." },
      { label: "Can prescribe", value: "No" }
    ],
    approachable: {
      lead: "A therapist who looks at the bigger picture, how housing, money, family and relationships affect your mental health, and helps you navigate them.",
      qa: [
        {
          // REVIEW: derived out-of-pocket. Fee $150–$250 − $87.25 rebate. Source: bmData + content/*.md.
          q: "What will it cost me?",
          a: 'Usually <span class="bm-qa-fig">$65–$165</span> out of pocket after the Medicare rebate.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: 'Not to book one, but most people get a GP referral first, so Medicare covers part of each session through the <button type="button" class="bm-rebate-toggle" aria-expanded="false">Medicare rebate<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>.',
          detail: '<div class="bm-rebate-detail"><div class="bm-rebate-detail-inner">Your GP writes you a <strong>Mental Health Care Plan</strong>. It lets Medicare cover part of up to 10 sessions a year. Without one, you pay the full fee.<a href="/pathway/#step-2">See how the plan works <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a></div></div>'
        },
        {
          q: "What makes them different?",
          a: "Their strength is the practical side: sorting out housing, money and family pressures alongside therapy."
        }
      ],
      moreDetail: '<dl><dt>Full fee</dt><dd>$150–$250 per session</dd><dt>Medicare rebate</dt><dd>$87.25 (with a GP plan)</dd><dt>Sessions</dt><dd>10 per year (Better Access)</dd><dt>Can prescribe</dt><dd>No</dd></dl>'
    }
  },
  ot: {
    name: "Mental Health OT",
    color: "#b5894a",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "<p>Most people don\u2019t think of OTs for mental health, but mental health OTs have specialist endorsement and extra training beyond standard OT registration.</p><ul><li>Focuses on the practical side of recovery \u2014 rebuilding daily routines, getting back to work, managing tasks that feel overwhelming</li><li>Hands-on approach, working with you on real-life skills and strategies</li></ul>",
    details: [
      { label: "Cost", value: "$170–$260" },
      { label: "Medicare rebate", value: "$87.25" },
      { label: "Sessions", value: "10 per year (Better Access)" },
      { label: "Referral", value: "Not required. GP referral needed for Medicare rebate." },
      { label: "Can prescribe", value: "No" }
    ],
    approachable: {
      lead: "Focuses on the practical side of recovery, rebuilding routines, getting back to work or study, and managing daily tasks that feel overwhelming.",
      qa: [
        {
          // REVIEW: derived out-of-pocket. Fee $170–$260 − $87.25 rebate. Source: bmData + content/*.md.
          q: "What will it cost me?",
          a: 'Usually <span class="bm-qa-fig">$85–$175</span> out of pocket after the Medicare rebate.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: 'Not to book one, but most people get a GP referral first, so Medicare covers part of each session through the <button type="button" class="bm-rebate-toggle" aria-expanded="false">Medicare rebate<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>.',
          detail: '<div class="bm-rebate-detail"><div class="bm-rebate-detail-inner">Your GP writes you a <strong>Mental Health Care Plan</strong>. It lets Medicare cover part of up to 10 sessions a year. Without one, you pay the full fee.<a href="/pathway/#step-2">See how the plan works <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a></div></div>'
        },
        {
          q: "What makes them different?",
          a: "Hands-on and practical, working with you on real-life skills rather than exploring the past."
        }
      ],
      moreDetail: '<dl><dt>Full fee</dt><dd>$170–$260 per session</dd><dt>Medicare rebate</dt><dd>$87.25 (with a GP plan)</dd><dt>Sessions</dt><dd>10 per year (Better Access)</dd><dt>Can prescribe</dt><dd>No</dd></dl>'
    }
  },
  "mh-nurse": {
    name: "Mental Health Nurse",
    color: "#c25a6a",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" }
    ],
    desc: "<p>A registered nurse with specialist postgraduate training in mental health.</p><ul><li>Clinical care rather than structured therapy — medication monitoring, physical health side effects, crisis support</li><li>Coordinates between your GP and psychiatrist</li></ul>",
    details: [
      { label: "Referral", value: "Yes (GP chronic condition management plan)" },
      { label: "Can prescribe", value: "No" }
    ],
    approachable: {
      lead: "A nurse with specialist mental health training, for clinical care, medication monitoring and crisis support, rather than talk therapy.",
      qa: [
        {
          // REVIEW: derived out-of-pocket. Private fee $100–$180 − $61.80 rebate. Most access is free
          // via public/community services. Source: bmData nurse pricing + content/mental-health-nurse.md.
          q: "What will it cost me?",
          a: 'Usually <span class="bm-qa-fig">free</span> through public or community services. In private practice, about $40–$120 out of pocket after a rebate.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: 'For private sessions, yes, through a <button type="button" class="bm-rebate-toggle" aria-expanded="false">GP chronic-condition plan<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>.',
          detail: '<div class="bm-rebate-detail"><div class="bm-rebate-detail-inner">This is a different Medicare plan from the Mental Health Care Plan. It covers 5 allied-health sessions a year, shared with services like physio. Most people, though, see a mental health nurse for free through public or community teams.</div></div>'
        },
        {
          q: "What do they help with?",
          a: "Medication side effects, staying well day to day, and coordinating between your GP and psychiatrist."
        }
      ],
      moreDetail: '<dl><dt>Private fee</dt><dd>$100–$180 per session</dd><dt>Medicare rebate</dt><dd>$61.80 (chronic-condition plan)</dd><dt>Most common access</dt><dd>Free via public / community services</dd><dt>Can prescribe</dt><dd>No</dd></dl>'
    }
  },
  peer: {
    name: "Peer Support Worker",
    color: "#8a8a8a",
    badges: [
      { text: "Not regulated", cls: "badge-unregulated" },
      { text: "No Medicare rebate", cls: "badge-no-medicare" }
    ],
    desc: "<p>Draws on their own experience of mental health challenges and recovery to support others going through similar things.</p><ul><li>Doesn\u2019t diagnose or treat \u2014 offers understanding, hope, and help navigating the system from someone who\u2019s been there</li><li>Qualifications exist (like a Cert IV in Mental Health Peer Work) but none are legally required</li><li>Usually free through public health services, community organisations, or NDIS plans</li></ul>",
    details: [
      { label: "Cost", value: "Usually free (through services)" },
      { label: "Medicare", value: "No" },
      { label: "Referral", value: "Not needed" },
      { label: "Training", value: "Cert IV available but not required" }
    ],
    approachable: {
      lead: "Someone who has been through mental health challenges themselves, offering understanding, hope and help finding your way through the system.",
      qa: [
        {
          q: "What will it cost me?",
          a: 'Usually <span class="bm-qa-fig">free</span>, through public services, community organisations or an NDIS plan.',
          cost: true
        },
        {
          q: "Do I need a referral?",
          a: "No. You can reach out through a service directly."
        },
        {
          q: "What can they help with?",
          a: "Not diagnosis or treatment, but lived-experience support alongside your clinical care."
        }
      ],
      moreDetail: '<dl><dt>Cost</dt><dd>Usually free (services or NDIS)</dd><dt>Medicare</dt><dd>No</dd><dt>Training</dt><dd>Cert IV exists but is not required</dd><dt>Role</dt><dd>Complements clinical care, does not replace it</dd></dl>'
    }
  }
};

(function() {
  const wrapper = document.querySelector('.bubble-map');
  if (!wrapper) return;

  wrapper.querySelectorAll('.bm-blob[data-prof]').forEach(function(el) {
    (el as SVGElement).style.cursor = 'pointer';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const key = el.getAttribute('data-prof');
    const label = bmData[key as keyof typeof bmData]?.name || key;
    el.setAttribute('aria-label', 'Learn about ' + label);
  });

  const bmSvg = wrapper.querySelector('.bm-map-svg') as SVGSVGElement;
  const MOBILE_MEDIA_QUERY = '(max-width: 767px)';
  const FULL_VB = bmSvg?.getAttribute('data-viewbox-full') || '0 0 700 540';
  const MOBILE_VB = bmSvg?.getAttribute('data-viewbox-mobile') || FULL_VB;

  function isMobileViewport() {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }

  function updateViewBox() {
    if (!bmSvg) return;
    const mobile = isMobileViewport();
    const targetViewBox = mobile ? MOBILE_VB : FULL_VB;
    if (bmSvg.getAttribute('viewBox') !== targetViewBox) {
      bmSvg.setAttribute('viewBox', targetViewBox);
    }
    // bm-vb-mobile gates the mobile geometry CSS in PractitionerBubbleMap.astro;
    // the component's inline script sets it pre-paint, this keeps it in sync
    // when a resize crosses the mobile breakpoint.
    bmSvg.classList.toggle('bm-vb-mobile', mobile);
  }

  const popover = document.getElementById('bm-popover') as HTMLElement;
  const backdrop = document.getElementById('bm-popover-backdrop') as HTMLElement;
  const mapContainer = wrapper!.querySelector('.bm-map-container') as HTMLElement;
  let activeKey: string | null = null;
  let hideTimeout: number | null = null;

  updateViewBox();

  function isMobile() {
    return isMobileViewport();
  }

  function positionPopover(blobEl: SVGElement) {
    if (!popover || !mapContainer || isMobile()) return;

    const containerRect = mapContainer.getBoundingClientRect();
    const blobRect = blobEl.getBoundingClientRect();

    // Bubble center relative to container
    const bubbleCenterX = blobRect.left + blobRect.width / 2 - containerRect.left;
    const bubbleCenterY = blobRect.top + blobRect.height / 2 - containerRect.top;
    const bubbleRadiusX = blobRect.width / 2;

    const popoverWidth = 360;
    const gap = 12;

    // Try right side first
    let left = bubbleCenterX + bubbleRadiusX + gap;
    if (left + popoverWidth > containerRect.width) {
      // Flip to left
      left = bubbleCenterX - bubbleRadiusX - gap - popoverWidth;
    }
    // Clamp left so it doesn't go off-screen left
    left = Math.max(8, left);

    // Measure popover height after content is set
    const popoverHeight = popover.offsetHeight;
    const vpMargin = 16;
    const hdr = document.querySelector('header');
    const hdrH = hdr ? hdr.getBoundingClientRect().height : 0;

    // Clamp popover within the VIEWPORT (converted to container-relative coords)
    // so it stays on-screen without any scrolling.
    const visibleTop = -containerRect.top + hdrH + vpMargin;
    const visibleBottom = -containerRect.top + window.innerHeight - vpMargin;

    // Ideal vertical position: centered on bubble
    let top = bubbleCenterY - popoverHeight / 2;

    // Clamp within viewport-visible area
    if (top + popoverHeight > visibleBottom) {
      top = visibleBottom - popoverHeight;
    }
    if (top < visibleTop) {
      top = visibleTop;
    }

    // If popover is taller than visible area, pin to top and cap height
    const availableHeight = visibleBottom - visibleTop;
    if (popoverHeight > availableHeight && availableHeight > 200) {
      top = visibleTop;
      popover.style.maxHeight = availableHeight + 'px';
      popover.style.overflowY = 'auto';
    } else {
      popover.style.maxHeight = '';
      popover.style.overflowY = '';
    }

    popover.style.left = left + 'px';
    popover.style.top = top + 'px';
  }

  function hideBmInfo(immediate?: boolean) {
    if (!popover) return;
    activeKey = null;
    popover.classList.remove('bm-popover-visible');
    popover.classList.remove('bm-popover-expanded');
    backdrop.classList.remove('bm-popover-backdrop-visible');
    if (immediate) {
      if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
      popover.style.transform = '';
      popover.style.maxHeight = '';
      popover.style.overflowY = '';
      popover.innerHTML = '';
      document.body.classList.remove('bm-body-locked');
      document.documentElement.classList.remove('bm-body-locked');
    } else {
      hideTimeout = window.setTimeout(function() {
        popover.style.transform = '';
        popover.style.maxHeight = '';
        popover.style.overflowY = '';
        popover.innerHTML = '';
        document.body.classList.remove('bm-body-locked');
        document.documentElement.classList.remove('bm-body-locked');
      }, 550);
    }
  }

  function showBmInfo(key: string) {
    // Typed loosely: entries vary in shape (some have `approachable`, `costRows`, etc),
    // and the fallback branch below must stay reachable for any future entry without `approachable`.
    const p = bmData[key as keyof typeof bmData] as any;
    if (!p || !popover) return;

    // Clear any pending hide
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // Reset stale state from any interrupted dismiss animation
    popover.style.transform = '';
    popover.style.maxHeight = '';
    popover.style.overflowY = '';
    popover.style.height = '';
    backdrop.style.opacity = '';
    popover.classList.remove('bm-popover-visible');
    popover.classList.remove('bm-popover-expanded');
    popover.classList.remove('bm-popover-dragging');
    backdrop.classList.remove('bm-popover-backdrop-visible');
    document.body.classList.remove('bm-body-locked');
    document.documentElement.classList.remove('bm-body-locked');

    activeKey = key;

    if ('approachable' in p) {
      const a = (p as any).approachable;
      popover.innerHTML =
        '<div class="bm-drag-handle"><div class="bm-drag-pill"></div></div>' +
        '<button class="bm-popover-close" aria-label="Close">&times;</button>' +
        '<div class="bm-info-topline">' +
          '<div class="bm-info-dot" style="background:' + p.color + '"></div>' +
          '<div class="bm-info-name">' + p.name + '</div>' +
        '</div>' +
        '<p class="bm-lead">' + a.lead + '</p>' +
        a.qa.map(function(item: any) {
          return '<div class="bm-qa' + (item.cost ? ' bm-qa-cost' : '') + '">' +
            '<div class="bm-qa-q">' + item.q + '</div>' +
            '<div class="bm-qa-a">' + item.a + '</div>' +
            (item.detail || '') +
          '</div>';
        }).join('') +
        '<button type="button" class="bm-more-toggle" aria-expanded="false">More detail <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button>' +
        '<div class="bm-more-detail"><div class="bm-more-detail-inner">' + a.moreDetail + '</div></div>';
    } else {
    popover.innerHTML =
      '<div class="bm-drag-handle"><div class="bm-drag-pill"></div></div>' +
      '<button class="bm-popover-close" aria-label="Close">&times;</button>' +
      '<div class="bm-info-topline">' +
        '<div class="bm-info-dot" style="background:' + p.color + '"></div>' +
        '<div class="bm-info-name">' + p.name + '</div>' +
      '</div>' +
      '<div class="bm-info-badges">' +
        p.badges.map(function(b: any) { return '<span class="bm-info-badge ' + b.cls + '">' + b.text + '</span>'; }).join('') +
      '</div>' +
      '<div class="bm-info-desc">' + p.desc + '</div>' +
      ('costRows' in p && (p as any).costRows
        ? '<div class="bm-cost-breakdown">' +
          (p as any).costRows.map(function(r: any) {
            return '<div class="bm-cost-row">' +
              '<div class="bm-cost-row-label">' + r.label + '</div>' +
              '<div class="bm-cost-row-items">' +
                '<div class="bm-cost-item">' +
                  '<div class="bm-cost-item-label">Fee</div>' +
                  '<div class="bm-cost-item-value">' + r.fee + '</div>' +
                '</div>' +
                '<div class="bm-cost-item">' +
                  '<div class="bm-cost-item-label">Medicare rebate</div>' +
                  '<div class="bm-cost-item-value">' + r.rebate + '</div>' +
                '</div>' +
                '<div class="bm-cost-separator"></div>' +
                '<div class="bm-cost-item bm-cost-item-highlight">' +
                  '<div class="bm-cost-item-label">Out of pocket</div>' +
                  '<div class="bm-cost-item-value">' + r.outOfPocket + '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
          '</div>'
        : '') +
      (key === 'gp' ? '<div class="bm-mhcp-detail" style="overflow:hidden;max-height:0;opacity:0;transition:max-height 0.3s ease-out,opacity 0.3s ease-out;"><div style="background:#f8fafc;border-radius:8px;padding:10px 12px;margin-bottom:14px;font-size:12px;color:#64748b;line-height:1.6;border-left:3px solid rgba(68,238,112,0.4);"><p style="font-weight:600;color:#1e293b;margin:0 0 4px;">What is a Mental Health Care Plan?</p><p style="margin:0;">A document your GP creates during your appointment that unlocks Medicare rebates for up to 10 psychology sessions per calendar year. Your GP handles it all, with no extra paperwork on your end.</p><a href="/pathway/#step-2" style="display:inline-flex;align-items:center;gap:4px;color:var(--color-primary);font-weight:600;margin-top:6px;font-size:11px;text-decoration:none;">Learn more about the process <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a></div></div>' : '') +
      (key === 'mh-nurse' ? '<div style="margin-top:14px;margin-bottom:14px;"><p style="font-size:13px;color:var(--color-body);line-height:1.6;margin:0 0 8px;">Not usually seen in private practice. Most people access mental health nurses for free through community health teams or public hospitals.</p><button class="bm-nurse-toggle" style="background:none;border:none;padding:0;font-size:13px;color:var(--color-primary);font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;text-decoration:underline;text-underline-offset:2px;">Medicare pricing in private practice <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="transition:transform 0.2s ease;"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button><div class="bm-nurse-detail" style="overflow:hidden;max-height:0;opacity:0;transition:max-height 0.3s ease-out,opacity 0.3s ease-out;"><div class="bm-cost-breakdown" style="margin-top:10px;"><div class="bm-cost-row"><div class="bm-cost-row-label">Per session</div><div class="bm-cost-row-items"><div class="bm-cost-item"><div class="bm-cost-item-label">Fee</div><div class="bm-cost-item-value">$100 – $180</div></div><div class="bm-cost-item"><div class="bm-cost-item-label">Medicare rebate</div><div class="bm-cost-item-value">$61.80</div></div><div class="bm-cost-separator"></div><div class="bm-cost-item bm-cost-item-highlight"><div class="bm-cost-item-label">Out of pocket</div><div class="bm-cost-item-value">$38 – $118</div></div></div></div></div><p style="font-size:11px;color:var(--color-body);line-height:1.5;margin:8px 0 0;font-style:italic;">5 sessions per year under a GP chronic condition management plan, shared with other allied health services like physio.</p></div></div>' : '') +
      '<div class="bm-info-details">' +
        p.details.map(function(d: any) {
          return '<div class="bm-info-detail">' +
            '<div class="bm-info-detail-label">' + d.label + '</div>' +
            '<div class="bm-info-detail-value">' + d.value + '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }

    // Wire close button
    const closeBtn = popover.querySelector('.bm-popover-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hideBmInfo();
      });
    }

    // Wire MHCP toggle in GP popover
    const mhcpBtn = popover.querySelector('.bm-mhcp-toggle');
    const mhcpDetail = popover.querySelector('.bm-mhcp-detail');
    if (mhcpBtn && mhcpDetail) {
      mhcpBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = (mhcpDetail as HTMLElement).style.maxHeight === '200px';
        if (isOpen) {
          (mhcpDetail as HTMLElement).style.maxHeight = '0';
          (mhcpDetail as HTMLElement).style.opacity = '0';
        } else {
          (mhcpDetail as HTMLElement).style.maxHeight = '200px';
          (mhcpDetail as HTMLElement).style.opacity = '1';
        }
      });
    }

    // Wire nurse pricing toggle in MH Nurse popover
    const nurseBtn = popover.querySelector('.bm-nurse-toggle');
    const nurseDetail = popover.querySelector('.bm-nurse-detail');
    if (nurseBtn && nurseDetail) {
      nurseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = (nurseDetail as HTMLElement).style.maxHeight === '250px';
        const chevron = nurseBtn.querySelector('svg') as SVGElement | null;
        if (isOpen) {
          (nurseDetail as HTMLElement).style.maxHeight = '0';
          (nurseDetail as HTMLElement).style.opacity = '0';
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
          (nurseDetail as HTMLElement).style.maxHeight = '250px';
          (nurseDetail as HTMLElement).style.opacity = '1';
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
      });
    }

    // Decorative chevron/arrow icons: hide from assistive tech (buttons/links carry the label).
    popover.querySelectorAll('svg').forEach(function(svg) {
      svg.setAttribute('aria-hidden', 'true');
    });

    // Wire "More detail" + inline Medicare-rebate collapses (approachable layout).
    // Open/closed state is tracked with the .is-open class — which also drives
    // visibility:hidden in CSS so collapsed links leave the tab order / AT tree.
    function wireBmCollapse(toggle: Element | null, detail: Element | null, regionId: string) {
      if (!toggle || !detail) return;
      const el = detail as HTMLElement;
      if (!el.id) el.id = regionId;
      toggle.setAttribute('aria-controls', el.id);
      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const chevron = toggle.querySelector('svg') as SVGElement | null;
        if (el.classList.contains('is-open')) {
          el.classList.remove('is-open');
          el.style.maxHeight = '0px';
          el.style.opacity = '0';
          toggle.setAttribute('aria-expanded', 'false');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
          el.classList.add('is-open');
          el.style.maxHeight = el.scrollHeight + 'px';
          el.style.opacity = '1';
          toggle.setAttribute('aria-expanded', 'true');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
      });
    }
    wireBmCollapse(popover.querySelector('.bm-more-toggle'), popover.querySelector('.bm-more-detail'), 'bm-more-detail-region');
    wireBmCollapse(popover.querySelector('.bm-rebate-toggle'), popover.querySelector('.bm-rebate-detail'), 'bm-rebate-detail-region');

    // Position near the clicked blob (desktop only)
    const blobEl = wrapper!.querySelector('.bm-blob[data-prof="' + key + '"]') as SVGElement | null;
    if (blobEl) {
      positionPopover(blobEl);
    }

    // Force layout NOW so innerHTML geometry is computed before animation
    void popover.offsetHeight;

    requestAnimationFrame(function() {
      if (isMobile()) {
        backdrop.classList.add('bm-popover-backdrop-visible');
        document.body.classList.add('bm-body-locked');
        document.documentElement.classList.add('bm-body-locked');
      }
      popover.classList.add('bm-popover-visible');
    });
  }

  function toggleSelection(key: string) {
    if (activeKey === key) {
      hideBmInfo();
    } else {
      showBmInfo(key);
    }
  }

  wrapper.querySelectorAll('.bm-blob[data-prof]').forEach(function(el) {
    el.addEventListener('click', function() {
      const key = el.getAttribute('data-prof');
      if (key) toggleSelection(key);
    });
    el.addEventListener('keydown', function(e) {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        (e as KeyboardEvent).preventDefault();
        const key = el.getAttribute('data-prof');
        if (key) toggleSelection(key);
      }
    });
  });

  // Dismiss on click outside
  document.addEventListener('click', function(e) {
    if (!activeKey || !popover) return;
    const target = e.target as Element;
    if (target.closest('.bm-popover') || target.closest('.bm-blob')) return;
    hideBmInfo();
  });

  // Dismiss on backdrop tap (mobile)
  if (backdrop) {
    backdrop.addEventListener('click', function() {
      hideBmInfo();
    });
  }

  // Swipe-to-dismiss and swipe-to-expand on mobile
  let touchStartY = 0;
  let touchDeltaY = 0;
  let isDragging = false;
  let dragDirection: 'down' | 'up' | null = null;
  let touchStartOnHandle = false;

  if (popover) {
    popover.addEventListener('touchstart', function(e) {
      if (!isMobile() || !activeKey) return;
      touchStartY = e.touches[0].clientY;
      touchDeltaY = 0;
      isDragging = false;
      dragDirection = null;
      const target = e.target as HTMLElement;
      touchStartOnHandle = target.closest('.bm-drag-handle') !== null;
    }, { passive: true });

    popover.addEventListener('touchmove', function(e) {
      if (!isMobile() || !activeKey || touchStartY === 0) return;
      const currentY = e.touches[0].clientY;
      touchDeltaY = currentY - touchStartY;

      // Prevent browser from claiming touch gestures on non-expanded sheet.
      // Must fire before 5px threshold so iOS Safari doesn't pre-empt our handler.
      if (!popover.classList.contains('bm-popover-expanded')) {
        e.preventDefault();
      }

      // Determine drag direction on first significant movement
      if (!dragDirection) {
        if (touchStartOnHandle) {
          // Drag handle: allow both directions immediately, no scroll checks
          if (touchDeltaY > 5) {
            dragDirection = 'down';
          } else if (touchDeltaY < -5) {
            const isExpanded = popover.classList.contains('bm-popover-expanded');
            if (!isExpanded) {
              dragDirection = 'up';
            } else {
              touchStartY = 0;
              return;
            }
          } else {
            return;
          }
        } else {
          // Content area: only allow downward dismiss when scrolled to top
          if (touchDeltaY > 5 && popover.scrollTop <= 0) {
            dragDirection = 'down';
          } else if (touchDeltaY < -5) {
            // Allow expansion when sheet isn't fully expanded yet
            const isExpanded = popover.classList.contains('bm-popover-expanded');
            if (!isExpanded) {
              dragDirection = 'up';
            } else {
              touchStartY = 0;
              return;
            }
          } else {
            return;
          }
        }
      }

      if (dragDirection === 'down') {
        // Prevent Chrome pull-to-refresh
        e.preventDefault();

        if (!isDragging) {
          isDragging = true;
          popover.classList.add('bm-popover-dragging');
        }

        const downDelta = Math.max(0, touchDeltaY);
        popover.style.transform = 'translateY(' + downDelta + 'px)';
        // Fade backdrop proportionally (dismiss at 80px threshold)
        const progress = Math.min(downDelta / 200, 1);
        backdrop.style.opacity = String(1 - progress);
      } else if (dragDirection === 'up') {
        // Prevent Chrome pull-to-refresh / default scroll
        e.preventDefault();

        if (!isDragging) {
          isDragging = true;
          popover.classList.add('bm-popover-dragging');
        }

        // Increase max-height dynamically (upDelta is positive pixels dragged upward)
        const upDelta = Math.max(0, -touchDeltaY);
        const baseVh = 60;
        const maxVh = 90;
        const extraVh = Math.min((upDelta / window.innerHeight) * 100, maxVh - baseVh);
        popover.style.height = (baseVh + extraVh) + 'vh';
        popover.style.maxHeight = (baseVh + extraVh) + 'vh';
      }
    }, { passive: false });

    popover.addEventListener('touchend', function() {
      if (!isDragging) {
        touchStartY = 0;
        dragDirection = null;
        return;
      }

      popover.classList.remove('bm-popover-dragging');
      void popover.offsetHeight; // force style recalc so transitions apply

      if (dragDirection === 'down') {
        if (touchDeltaY > 80) {
          // Dismiss: animate from drag position to off-screen
          popover.style.transform = 'translateY(100%)';
          backdrop.style.opacity = '';
          backdrop.classList.remove('bm-popover-backdrop-visible');
          activeKey = null;
          hideTimeout = window.setTimeout(function() {
            popover.classList.remove('bm-popover-visible');
            popover.classList.remove('bm-popover-expanded');
            popover.style.transform = '';
            popover.style.maxHeight = '';
            popover.innerHTML = '';
            document.body.classList.remove('bm-body-locked');
            document.documentElement.classList.remove('bm-body-locked');
          }, 550);
        } else {
          // Snap back: animate from drag position to translateY(0)
          popover.style.transform = '';
          backdrop.style.opacity = '';
        }
      } else if (dragDirection === 'up') {
        const upDelta = Math.max(0, -touchDeltaY);
        if (upDelta > 40) {
          // Snap to expanded
          popover.classList.add('bm-popover-expanded');
          popover.style.height = '';
          popover.style.maxHeight = '';
        } else {
          // Snap back to default
          popover.style.height = '';
          popover.style.maxHeight = '';
        }
      }

      touchStartY = 0;
      touchDeltaY = 0;
      isDragging = false;
      dragDirection = null;
    }, { passive: true });
  }

  // Dismiss on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && activeKey) {
      hideBmInfo();
    }
  });

  // Reposition on resize (debounced)
  let resizeTimer: number | null = null;
  window.addEventListener('resize', function() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function() {
      updateViewBox();
      if (activeKey && popover) {
        const blobEl = wrapper!.querySelector('.bm-blob[data-prof="' + activeKey + '"]') as SVGElement | null;
        if (blobEl) positionPopover(blobEl);
      }
    }, 100);
  });
})();
