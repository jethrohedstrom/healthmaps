const bmData = {
  gp: {
    name: "GP (General Practitioner)",
    color: "#5c6670",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare", cls: "badge-medicare" }
    ],
    desc: "A doctor (GP) is where most mental health journeys start. They can diagnose mental health conditions, prescribe medication, and set you up with a <button type=\"button\" class=\"bm-mhcp-toggle\" style=\"color:var(--color-primary);font-weight:600;text-decoration:underline;text-underline-offset:2px;cursor:pointer;background:none;border:none;padding:0;font-size:inherit;font-family:inherit;line-height:inherit;\">Mental Health Care Plan (MHCP)</button>, which unlocks Medicare-funded sessions with a psychologist, social worker, or OT. Some people only need their GP for medication and check-ins. For talk therapy, your GP will refer you to one of these other professionals.",
    details: [
      { label: "Cost", value: "Free – $100+<br><a href=\"#\" style=\"font-size:11px;color:var(--color-primary);font-weight:600;text-decoration:none;white-space:nowrap;\">More on pricing →</a>" },
      { label: "Referral", value: "None needed" },
      { label: "Can prescribe", value: "Yes" },
      { label: "Wait", value: "Typically 0–5 days" }
    ]
  },
  psychologist: {
    name: "Psychologist",
    color: "#4a7fb5",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "The most common professional people see through Medicare for mental health. They work with you on specific problems using techniques that are backed by research. You'll need a GP referral to access Medicare rebates. There are two types: general psychologists and clinical psychologists. Clinical psychologists have additional specialist training and attract a higher Medicare rebate.",
    details: [
      { label: "Cost", value: "$150–$300" },
      { label: "Medicare rebate", value: "$98.95 (general) / $145.25 (clinical)" },
      { label: "Sessions", value: "10 per year (Better Access)" },
      { label: "Referral", value: "Not required. GP referral needed for Medicare rebate." },
      { label: "Can prescribe", value: "No" }
    ]
  },
  psychiatrist: {
    name: "Psychiatrist",
    color: "#7e6aad",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "A psychiatrist is a medical doctor who specialises in mental health. They can diagnose conditions, prescribe and manage medication, and provide therapy. Most people see a psychiatrist for conditions like ADHD, bipolar disorder, or treatment-resistant depression, when a clear diagnosis is needed, or when specialist medications are required that a GP can't prescribe. You'll need a GP referral to access a Medicare rebate.",
    costRows: [
      { label: "First session", fee: "$400 – $800", rebate: "$262.10", outOfPocket: "$138 – $538" },
      { label: "Follow-up sessions", fee: "$200 – $400", rebate: "$87.05 – $134.00", outOfPocket: "$66 – $266" }
    ],
    details: [
      { label: "Wait", value: "1 – 6 months" },
      { label: "Referral", value: "GP referral needed" },
      { label: "Can prescribe", value: "Yes" }
    ]
  },
  counsellor: {
    name: "Counsellor",
    color: "#5aab7b",
    badges: [
      { text: "Title not regulated", cls: "badge-unregulated" },
      { text: "No Medicare rebate", cls: "badge-no-medicare" },
      { text: "Voluntary accreditation (ACA/PACFA)", cls: "badge-voluntary" }
    ],
    // REVIEW: health-system claim, verify "no benefit to getting a GP referral for counsellors" is accurate
    desc: "A trained listener who helps you work through everyday challenges: stress, grief, relationships, life transitions. You don't need a GP appointment or referral, and there's no benefit to getting one, since counsellors sit outside Medicare entirely. Just book directly. In Australia, long wait times for psychologists are common. Counsellors are generally easier to access. Note: \u201ccounsellor\u201d is not a protected title. <a href=\"https://www.arcapregister.com.au/\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--color-primary);font-weight:600;text-decoration:underline;text-underline-offset:2px;\">Verify your practitioner's credentials</a>.",
    details: [
      { label: "Cost", value: "$80–$200" },
      { label: "Medicare", value: "No" },
      { label: "Referral", value: "Not needed" },
      { label: "Can prescribe", value: "No" }
    ]
  },
  "social-worker": {
    name: "Mental Health Social Worker",
    color: "#c27a4a",
    badges: [
      { text: "Professionally accredited (AASW)", cls: "badge-voluntary" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "Most people associate social workers with welfare, but Accredited Mental Health Social Workers are specialist therapists with extra training in mental health. Their strength is looking at the bigger picture \u2014 how things like housing, finances, relationships, and family situations affect your mental health, and helping you navigate those systems alongside therapy.",
    details: [
      { label: "Cost", value: "$150–$250" },
      { label: "Medicare rebate", value: "$87.25" },
      { label: "Sessions", value: "10 per year (Better Access)" },
      { label: "Referral", value: "Not required. GP referral needed for Medicare rebate." },
      { label: "Can prescribe", value: "No" }
    ]
  },
  ot: {
    name: "Mental Health OT",
    color: "#b5894a",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" },
      { text: "Medicare (with GP referral)", cls: "badge-medicare" }
    ],
    desc: "Most people don\u2019t think of OTs for mental health, but mental health OTs have specialist endorsement and extra training beyond standard OT registration. They focus on the practical side of recovery. Things like rebuilding daily routines, getting back to work, and managing tasks that feel overwhelming. They take a hands-on approach, working with you on real-life skills and strategies.",
    details: [
      { label: "Cost", value: "$170–$260" },
      { label: "Medicare rebate", value: "$87.25" },
      { label: "Sessions", value: "10 per year (Better Access)" },
      { label: "Referral", value: "Not required. GP referral needed for Medicare rebate." },
      { label: "Can prescribe", value: "No" }
    ]
  },
  "mh-nurse": {
    name: "Mental Health Nurse",
    color: "#c25a6a",
    badges: [
      { text: "Nationally registered", cls: "badge-registered" }
    ],
    desc: "Focuses on clinical care rather than structured therapy: monitoring your medication, checking physical health side effects, coordinating between your GP and psychiatrist, and providing crisis support. They are a registered nurse with specialist postgraduate training in mental health. Most people see a mental health nurse for free through community health teams or public hospitals, rather than in private practice.",
    details: [
      { label: "Referral", value: "Yes (GP referral with Chronic Disease Management plan)" },
      { label: "Can prescribe", value: "No" }
    ]
  },
  peer: {
    name: "Peer Support Worker",
    color: "#8a8a8a",
    badges: [
      { text: "Not regulated", cls: "badge-unregulated" },
      { text: "No Medicare rebate", cls: "badge-no-medicare" }
    ],
    desc: "Peer workers draw on their own experience of mental health challenges and recovery to support others going through similar things. They don\u2019t diagnose or treat. Instead, they offer understanding, hope, and help navigating the mental health system from someone who\u2019s been there. There are qualifications available (like a Cert IV in Mental Health Peer Work) but none are legally required to practice. Most peer worker services are free through public health services, community organisations, or NDIS plans.",
    details: [
      { label: "Cost", value: "Usually free (through services)" },
      { label: "Medicare", value: "No" },
      { label: "Referral", value: "Not needed" },
      { label: "Training", value: "Cert IV available but not required" }
    ]
  }
};

(function() {
  const wrapper = document.querySelector('.bubble-map');
  if (!wrapper) return;
  const debugRunId = `run-${Date.now()}`;
  let debugUpdateViewBoxCount = 0;
  function debugLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
    fetch('http://127.0.0.1:7840/ingest/4796b335-cf3c-4958-9a7c-6583e2dcb00e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a57960'},body:JSON.stringify({sessionId:'a57960',runId:debugRunId,hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  }
  const prevInitCount = Number((wrapper as HTMLElement).dataset.bmInitCount || '0');
  (wrapper as HTMLElement).dataset.bmInitCount = String(prevInitCount + 1);
  // #region agent log
  debugLog('H1', 'src/scripts/practitioner-bubble-map.ts:init', 'bubble map script initialized', {
    prevInitCount,
    currentInitCount: prevInitCount + 1,
    path: window.location.pathname,
    width: window.innerWidth
  });
  // #endregion

  wrapper.querySelectorAll('.bm-blob[data-prof]').forEach(function(el) {
    (el as SVGElement).style.cursor = 'pointer';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const key = el.getAttribute('data-prof');
    const label = bmData[key as keyof typeof bmData]?.name || key;
    el.setAttribute('aria-label', 'Learn about ' + label);
  });

  let moreVisible = false;
  const bmSvg = wrapper.querySelector('.bm-map-svg') as SVGSVGElement;
  const FULL_VB = '0 0 700 540';
  const MOBILE_VB = '80 40 560 500';
  // Keep identical scale between states to avoid perceived blob size jumps.
  const MOBILE_VB_EXPANDED = '80 40 560 500';

  // --- Mobile blob repositioning ---
  // Shift only edge hidden blobs inward when expanded to avoid clipping.
  const mobileShifts: Record<string, number> = { 'mh-nurse': 50, 'ot': -50, 'peer': -80 };
  const origX = new Map<Element, number>();

  Object.keys(mobileShifts).forEach(function(prof) {
    wrapper!.querySelectorAll('[data-prof="' + prof + '"]').forEach(function(el) {
      const tag = el.tagName.toLowerCase();
      const attr = tag === 'ellipse' ? 'cx' : 'x';
      origX.set(el, parseFloat(el.getAttribute(attr) || '0'));
    });
  });

  function repositionMobileBlobs() {
    const mobile = window.innerWidth < 768;
    origX.forEach(function(origVal, el) {
      const prof = el.getAttribute('data-prof') || '';
      const shift = mobileShifts[prof] || 0;
      const tag = el.tagName.toLowerCase();
      const attr = tag === 'ellipse' ? 'cx' : 'x';
      // Keep hidden blob coordinates stable across show/hide toggles on mobile.
      // This avoids perceived lateral "movement" when only visibility changes.
      el.setAttribute(attr, String(mobile ? origVal + shift : origVal));
    });
  }

  function updateViewBox() {
    if (!bmSvg) return;
    debugUpdateViewBoxCount += 1;
    if (window.innerWidth < 768) {
      bmSvg.setAttribute('viewBox', moreVisible ? MOBILE_VB_EXPANDED : MOBILE_VB);
    } else {
      bmSvg.setAttribute('viewBox', FULL_VB);
    }
    repositionMobileBlobs();
    // #region agent log
    debugLog('H2', 'src/scripts/practitioner-bubble-map.ts:updateViewBox', 'updateViewBox applied', {
      count: debugUpdateViewBoxCount,
      width: window.innerWidth,
      moreVisible,
      appliedViewBox: bmSvg.getAttribute('viewBox')
    });
    // #endregion
  }

  const showMoreBtn = document.getElementById('showMoreBtn-bm');
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', function() {
      const prevScrollY = window.scrollY;
      // #region agent log
      debugLog('H3', 'src/scripts/practitioner-bubble-map.ts:showMoreBtn:before', 'show more clicked before toggle', {
        moreVisible,
        prevScrollY,
        labelsClass: document.getElementById('extra-labels-bm')?.className,
        blobsClass: document.getElementById('extra-blobs-bm')?.className
      });
      // #endregion
      moreVisible = !moreVisible;
      const blobs = document.getElementById('extra-blobs-bm');
      const labels = document.getElementById('extra-labels-bm');

      showMoreBtn.setAttribute('aria-expanded', String(moreVisible));
      if (moreVisible) {
        // Close popover synchronously before relayout to avoid
        // mobile viewport scroll jumps when toggling map state.
        if (activeKey) {
          hideBmInfo(true);
        }
        blobs?.classList.remove('bm-hidden');
        blobs?.classList.add('bm-visible');
        blobs?.setAttribute('aria-hidden', 'false');
        labels?.classList.remove('bm-hidden');
        labels?.classList.add('bm-visible');
        labels?.setAttribute('aria-hidden', 'false');
        showMoreBtn.textContent = '\u2190 Show fewer professionals';
      } else {
        // Close popover synchronously (no 200ms race with relayout)
        if (activeKey) {
          hideBmInfo(true);
        }
        // Now change visibility
        blobs?.classList.add('bm-hidden');
        blobs?.classList.remove('bm-visible');
        blobs?.setAttribute('aria-hidden', 'true');
        labels?.classList.add('bm-hidden');
        labels?.classList.remove('bm-visible');
        labels?.setAttribute('aria-hidden', 'true');
        showMoreBtn.textContent = '\uff0b Show all professionals';
      }
      updateViewBox();
      requestAnimationFrame(function() {
        if (window.scrollY !== prevScrollY) {
          window.scrollTo(0, prevScrollY);
        }
        // #region agent log
        debugLog('H3', 'src/scripts/practitioner-bubble-map.ts:showMoreBtn:afterRAF', 'show more completed frame', {
          moreVisible,
          scrollYAfter: window.scrollY,
          targetScrollY: prevScrollY,
          labelsClass: labels?.className,
          blobsClass: blobs?.className,
          viewBox: bmSvg?.getAttribute('viewBox')
        });
        // #endregion
      });
    });
  }

  const popover = document.getElementById('bm-popover') as HTMLElement;
  const backdrop = document.getElementById('bm-popover-backdrop') as HTMLElement;
  const mapContainer = wrapper!.querySelector('.bm-map-container') as HTMLElement;
  let activeKey: string | null = null;
  let hideTimeout: number | null = null;

  updateViewBox();

  function isMobile() {
    return window.innerWidth < 768;
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
    // #region agent log
    debugLog('H4', 'src/scripts/practitioner-bubble-map.ts:hideBmInfo', 'hide popover called', {
      immediate: Boolean(immediate),
      activeKey,
      hasHideTimeout: Boolean(hideTimeout)
    });
    // #endregion
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
    const p = bmData[key as keyof typeof bmData];
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

    popover.innerHTML =
      '<div class="bm-drag-handle"><div class="bm-drag-pill"></div></div>' +
      '<button class="bm-popover-close" aria-label="Close">&times;</button>' +
      '<div class="bm-info-topline">' +
        '<div class="bm-info-dot" style="background:' + p.color + '"></div>' +
        '<div class="bm-info-name">' + p.name + '</div>' +
      '</div>' +
      '<div class="bm-info-badges">' +
        p.badges.map(function(b) { return '<span class="bm-info-badge ' + b.cls + '">' + b.text + '</span>'; }).join('') +
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
      (key === 'mh-nurse' ? '<div style="margin-top:14px;margin-bottom:14px;"><p style="font-size:13px;color:var(--color-body);line-height:1.6;margin:0 0 8px;">Not usually seen in private practice. Most people access mental health nurses for free through community health teams or public hospitals.</p><button class="bm-nurse-toggle" style="background:none;border:none;padding:0;font-size:13px;color:var(--color-primary);font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;text-decoration:underline;text-underline-offset:2px;">Medicare pricing in private practice <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="transition:transform 0.2s ease;"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg></button><div class="bm-nurse-detail" style="overflow:hidden;max-height:0;opacity:0;transition:max-height 0.3s ease-out,opacity 0.3s ease-out;"><div class="bm-cost-breakdown" style="margin-top:10px;"><div class="bm-cost-row"><div class="bm-cost-row-label">Per session</div><div class="bm-cost-row-items"><div class="bm-cost-item"><div class="bm-cost-item-label">Fee</div><div class="bm-cost-item-value">$100 – $180</div></div><div class="bm-cost-item"><div class="bm-cost-item-label">Medicare rebate</div><div class="bm-cost-item-value">$61.80</div></div><div class="bm-cost-separator"></div><div class="bm-cost-item bm-cost-item-highlight"><div class="bm-cost-item-label">Out of pocket</div><div class="bm-cost-item-value">$38 – $118</div></div></div></div></div><p style="font-size:11px;color:var(--color-body);line-height:1.5;margin:8px 0 0;font-style:italic;">5 sessions per year under a Chronic Disease Management plan, shared with other allied health services like physio.</p></div></div>' : '') +
      '<div class="bm-info-details">' +
        p.details.map(function(d) {
          return '<div class="bm-info-detail">' +
            '<div class="bm-info-detail-label">' + d.label + '</div>' +
            '<div class="bm-info-detail-value">' + d.value + '</div>' +
          '</div>';
        }).join('') +
      '</div>';

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
      // #region agent log
      debugLog('H2', 'src/scripts/practitioner-bubble-map.ts:resizeDebounced', 'resize debounce fired', {
        width: window.innerWidth,
        moreVisible
      });
      // #endregion
      if (activeKey && popover) {
        const blobEl = wrapper!.querySelector('.bm-blob[data-prof="' + activeKey + '"]') as SVGElement | null;
        if (blobEl) positionPopover(blobEl);
      }
    }, 100);
  });
})();
