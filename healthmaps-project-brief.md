# HealthMaps Project Brief

## What is this document?

This is the project brief for healthmaps.com.au. It captures the thinking, user research, and decisions made before any code was written. It should be referenced by Claude Code (via CLAUDE.md) as the source of truth for what we're building and why.

---

## The Problem

People in Australia who are struggling mentally often don't know how to get help — not because help doesn't exist, but because the system is confusing. They don't know:

- Do I need to see a GP first?
- What's the difference between a psychologist, psychiatrist, counsellor, and psychotherapist?
- Which one do I actually need?
- What's a Mental Health Care Plan (MHCP) and do I need one?
- What will it cost me?
- What's the actual sequence of steps from "I feel bad" to "I'm sitting in front of the right person"?
- Can I skip steps?

The core user need is: **"Tell me what to do, in what order, so I don't waste time and money going to the wrong place."**

This is distinct from the separate (and harder) problem of "help me find the right specific therapist" — which HealthMaps does not attempt to solve at this stage.

---

## Evidence: User Research

User interviews were conducted with ~10 people in late 2025. Two distinct problems emerged across interviews:

### Problem 1: "I don't know what to do" (THIS IS OUR FOCUS)

- **Tommy:** Used the analogy of re-registering his car — he just wanted to be told the first step, then the next, in order. For a broken ankle, he wanted to know: "Can I skip the GP? Can I go straight to a specialist?" His goal: "So I don't waste time and money." He cared more about knowing the steps than choosing the specific practitioner.
- **Remy:** Didn't know she needed to see a GP. Didn't know the difference between professionals. This confusion was part of why she never sought help. She signed up for an online therapy service from Instagram but never used it.
- **Kevin:** Looking back at university, his barriers were stigma, not knowing the difference between professionals, not knowing costs, and the hassle of breaking routine to see a GP.
- **Jenny:** Didn't know whether to start with a GP or go directly to a therapist. Didn't understand the differences between counsellor, psychologist, and EAP. Eventually figured it out via Google and ChatGPT, but found ChatGPT unreliable for decision-making.
- **Peter:** Used ChatGPT to figure out the steps. Found practitioners' descriptions of their approach meaningless ("family systems", "body work").

### Problem 2: "I can't find the right person" (NOT IN SCOPE — for now)

- **Georgina, Grace, Bec:** They understood the system but found it exhausting to find someone available, affordable, and who felt like a good fit. Bec gave up entirely and never saw a psychologist.

### Key observations from research

- The entry point into the system is often someone else (a parent, a friend, EAP through work) — not the person's own knowledge.
- Word of mouth is the dominant trust mechanism.
- People in distress can't process walls of text — they need simple, visual, minimal steps.
- Current LLMs (ChatGPT etc.) get some details wrong (e.g. MHCP transfer rules). A well-researched, accurate website has real value.
- The pathway isn't one-size-fits-all. It branches depending on the person's situation (EAP access, budget, urgency, severity).

---

## The Solution

A website (healthmaps.com.au) that explains the Australian mental health system in plain, accurate language and walks people through what to do, step by step.

### Design Principles

- **Extremely low friction.** The site must work for someone in distress (low capacity to read and decide) AND someone calmly researching.
- **Progressive disclosure.** Show the simple version by default. Let people click into more detail if they want it.
- **Accuracy over everything.** Written/verified by a healthcare professional. No LLM-generated health information without verification. Details matter (e.g. MHCPs must be updated, not transferred).
- **No agenda.** No ads, no lead generation for clinics, no commercial partnerships. Purely user-focused.
- **Simple, clear, works.** The website itself should feel easy to use — not just the content.

### Core User Experience

The primary experience: land on the site → immediately see or access a clear, step-by-step walkthrough of the most common mental health pathway.

**Option C approach:** Show one "default" pathway as the main content (the most common one: GP → Mental Health Care Plan → Psychologist), with alternative pathways (EAP, private counsellor, etc.) clearly accessible but secondary.

This maps to Tommy's request: "Run me through from start to finish."

---

## Site Structure

### Homepage
- Clear statement of what HealthMaps is and who it's for
- Immediately shows or links to the main pathway ("here's what most people do")
- Signposts to other key sections

### Main Pathway (the core content)
- Step-by-step walkthrough of the most common route: GP → MHCP → Psychologist
- Each step explains what actually happens, practically
- Progressive disclosure: simple by default, expandable for detail
- Alternative pathways accessible from here:
  - Employee Assistance Program (EAP)
  - Private counsellor (no Medicare rebate, no GP referral needed)
  - Other routes as relevant
- Note: the default pathway is NOT always GP → MHCP → Psychologist. The site should make clear that other paths exist and may be better depending on the person's situation.

### Practitioner Comparison
- Psychologist vs psychiatrist vs counsellor vs psychotherapist
- Plain language: what they do, training required, typical cost, when you'd see each one
- Addresses the confusion that came up in almost every interview

### Cost Calculator
- Interactive tool
- Input your situation → see what you'd actually pay out of pocket
- Should cover Medicare rebates, gap payments, bulk billing, session limits, EAP (free), private counsellor rates

### User Stories
- Real people describing their experience navigating the system
- Builds trust and relatability
- From research: people want to hear from someone they can relate to, not generic profiles

### Practical Tips / Information
- Rapport matters more than modality — it's OK to prioritise "do I feel comfortable with this person"
- It's OK to switch practitioners
- What to do if everyone's booked out
- Other practical guidance that's hard to find elsewhere

---

## Future Features (not in initial build)

- Embedded chatbot (chat.healthmaps.com.au exists separately, built by someone else)
- Video content (Bec specifically wanted video over text for crisis situations)
- Broader healthcare navigation beyond mental health
- Practitioner matching / finding (Problem 2 from research)

---

## Technical Decisions

### What's been decided
- **Domain:** healthmaps.com.au (already owned)
- **Hosting:** Netlify
- **Build approach:** Vibe coded from scratch using Claude Code
- **Multi-page site** (not single page)
- **No backend required** at this stage — static site with interactive components
- **No user accounts, no payments, no database**

### What needs to be decided (in Claude Code plan mode)
- **Framework:** Needs to support interactive components (calculator, progressive disclosure, possibly video embeds, animations). Plain HTML will likely be too limiting. React / Next.js / similar should be considered. The tradeoffs should be discussed in plan mode before committing.
- **Styling approach:** TBD
- **Content management:** For now, content can live in the code. If the site grows, a headless CMS could be considered later.

### Existing assets
- **healthmaps.com.au** currently exists on Webflow (designed in UX Pilot → Figma → Webflow). This is being replaced by the new build.
- **chat.healthmaps.com.au** — separate chatbot project, not part of this build.
- **Obsidian vault** — contains extensive project notes, user research, and thinking. Claude Code should be pointed at this for reference.

---

## Who's building this

Jethro Hedstrom — community physiotherapist based in Byron Bay, Australia. Works 3 days/week in clinical practice, spends remaining time on HealthMaps. Has healthcare domain knowledge but is not a software developer — building via vibe coding with Claude Code.

---

## Key Reference: What LLMs Get Wrong

This site exists partly because LLMs give inaccurate information about the Australian mental health system. Known errors to watch for:

- **MHCP transfers:** A Mental Health Care Plan cannot be "transferred" to a new therapist. It must be updated by the GP. This is a common LLM error.
- Other inaccuracies should be documented here as they're discovered.

**Rule: All health information on the site must be verified by Jethro against current Australian guidelines. Claude Code should not generate health content without flagging it for review.**
