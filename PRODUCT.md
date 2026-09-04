# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a person with accessibility needs who is considering attending an event. Companions, caregivers, and family members may also use the product on that person's behalf. They need reliable venue information before buying tickets, traveling, or otherwise committing to a plan.

## Product Purpose

BeforeDoors turns an event or venue link or newsletter into a live accessibility brief. It helps people know what to expect before they go by gathering venue evidence, identifying unanswered questions, and incorporating later confirmation from attendees.

Success means a prospective attendee can make a more informed decision using specific, current, attributable accessibility information without the product hiding uncertainty or inventing missing facts.

## Positioning

BeforeDoors is evidence-first and uncertainty-aware. Every accessibility detail retains its source, freshness, confidence, and confirmation type so a user can distinguish venue-published claims, direct venue confirmation, attendee experience, missing information, and conflicting evidence. The product researches gaps and supports targeted venue inquiries instead of collapsing incomplete evidence into a generic accessibility rating.

## Operating Context

- A user begins with an individual event or venue URL, or an event newsletter.
- BeforeDoors researches official webpages and PDFs through Firecrawl.
- Structured AI extraction turns the gathered material into accessibility details while retaining source evidence and uncertainty.
- Missing information can become a venue question delivered through AgentMail; sending is not autonomous.
- The report updates live through Convex as research, replies, and attendee confirmations arrive.
- Users can review and share the resulting event-level report before attending.
- After attending, a person can confirm what they experienced.

## Capabilities and Constraints

Confirmed intended capabilities:

- URL and newsletter ingestion.
- Firecrawl research across official pages and PDFs.
- Structured AI extraction with source-aware confidence.
- AgentMail delivery and reply handling for venue questions.
- Live Convex updates.
- Shareable event reports.
- Attendee confirmations.

MVP constraints:

- Focus on individual events rather than a nationwide venue directory.
- Do not present a generic accessibility rating.
- Do not send venue email autonomously.
- Do not provide medical or legal advice.
- Do not expand into a broad social network.
- Never invent accessibility information. Preserve source URLs, timestamps, evidence excerpts, confidence levels, and provenance.
- Protect sensitive access-needs information and avoid collecting or exposing it unnecessarily.

## Brand Commitments

- Product name: **BeforeDoors**.
- Product phrase: **Know before you go**.
- Preserve these status labels exactly: **Published by venue**, **Confirmed by venue**, **Confirmed by attendee**, **Unknown**, and **Conflicting**.
- Use clear, plain language. Trustworthiness comes from explicit evidence, provenance, freshness, and uncertainty rather than confident-sounding claims.

## Evidence on Hand

- The repository contains a working TanStack Router web scaffold connected to a Convex health-check query.
- Submission proof still to be produced: visible Convex reactivity, Firecrawl crawling, AgentMail delivery and reply handling, an actual venue inquiry, and a public live report.
- No verified venue evidence, attendee confirmations, testimonials, benchmarks, or production claims are currently present in the repository; future work must not fabricate them.

## Product Principles

1. **Show the evidence.** Make every important accessibility detail traceable to its source, timestamp, and evidence excerpt.
2. **Make uncertainty legible.** Clearly distinguish unknown, conflicting, stale, and differently confirmed information instead of smoothing it into false certainty.
3. **Ask only what the evidence cannot answer.** Research official material first, then help people direct specific unresolved questions to the venue with human control over sending.
4. **Design for the decision before the journey.** Keep the report focused on whether and how someone can confidently attend a particular event.
5. **Let reality update the report.** Venue replies, live system changes, and attendee experience should strengthen or challenge earlier claims without erasing provenance.

## Accessibility & Inclusion

- Support complete keyboard navigation.
- Use screen-reader-friendly document structure and controls.
- Maintain strong color contrast and never rely on color alone for meaning.
- Use explicit status labels and plain language.
- Make core workflows responsive on mobile devices.
- Preserve privacy for sensitive access needs and avoid implying medical or legal guidance.
