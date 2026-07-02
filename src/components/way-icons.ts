/**
 * Shared wobble icons for the pathway page (design handoff 6a).
 * Used by the WayRow pathway cards in "All the ways".
 *
 * Icon geometry copied verbatim from the design reference
 * (design_handoff_pathway_quiz_6a/reference/6a Pathway Page.html).
 * The paint-* filters (defined once in pathway.astro) give a hand-drawn
 * wobble; dropping the filter attribute is a safe fallback — geometry is
 * unchanged.
 */
export type WayIcon = 'gp' | 'practitioner' | 'community' | 'self-guided';

export const wayIconSvg: Record<WayIcon, string> = {
  gp: '<svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><g filter="url(#paint-c)"><circle cx="20" cy="20" r="4.9" fill="currentColor"></circle><circle cx="20" cy="20" r="10.2" stroke="currentColor" stroke-width="2.2"></circle><circle cx="20" cy="20" r="15.6" stroke="currentColor" stroke-width="2.2" opacity="0.5"></circle></g></svg>',
  practitioner: '<svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><g filter="url(#paint-b)"><circle cx="10" cy="20" r="4.9" fill="currentColor"></circle><path d="M15 20h7.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"></path><circle cx="29.5" cy="20" r="5.1" stroke="currentColor" stroke-width="2.3"></circle></g></svg>',
  community: '<svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><g filter="url(#paint-a)"><circle cx="20" cy="12.6" r="5.1" fill="currentColor"></circle><circle cx="12.5" cy="26.3" r="5" fill="currentColor"></circle><circle cx="27.5" cy="25.7" r="4.8" fill="currentColor"></circle></g></svg>',
  'self-guided': '<svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true"><g filter="url(#paint-b)"><path d="M11 28.5C16.5 23.5 22.5 26 28 12.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="0.1 5.8"></path><circle cx="11" cy="28.5" r="4.9" fill="currentColor"></circle><circle cx="28.8" cy="12" r="3" stroke="currentColor" stroke-width="2.3"></circle></g></svg>',
};

