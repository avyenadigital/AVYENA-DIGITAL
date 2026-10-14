# AVYENA Black Edition 2026 — development preview

Branch: `feature/black-edition-2026`. Do not merge or deploy to production without the owner's approval.

## Implementation

- Existing black / violet / cyan design tokens and local images; no added production dependencies.
- PT and EN landing pages: `/black-edition-2026.html` and `/en/black-edition-2026.html`.
- On marketing entry pages: wait 3 seconds, defer while cookie consent/another modal/form entry is active, open a native modal dialog.
- Auto-close after 8 seconds. Pointer movement, touch/pointer input, wheel, keyboard navigation, or the Keep open control cancel auto-close. Manual openings do not auto-close.
- Explicit close, Escape, continue and campaign navigation persist a 7-day dismissal. Storage failure falls back to the current document session.
- A discreet Black Edition control remains below the site header while the campaign is active.
- Server-side schedule: 1 November 2026 00:00 Europe/Lisbon through 1 December 2026 00:00 Europe/Lisbon (exclusive; UTC+00 in this period). Uses server time, with elapsed client time between checks. Open tabs expire within 1 second after the end.
- The config endpoint returns preview mode only when `VERCEL_ENV=preview`. URL parameters cannot activate it in production. Preview mode deliberately shows the campaign outside the dates.
- Preview form submission validates without sending. Production submissions reuse `/api/contact`, its validation/anti-abuse measures and recipient configuration; the message is tagged Black Edition 2026.
- Outside the campaign window, the landing page remains as an informative page with a normal contact link. The campaign form and automatic presentation are disabled.
- Failure to load campaign configuration leaves the existing site usable and does not open a campaign.

## Validation performed

`npm ci --prefix tests && npm test --prefix tests`

16 automated tests passed (Node + jsdom; no real browser engine):

1. Start/end boundaries, preview versus production and endpoint method.
2. 3-second opening and 8-second dismissal.
3. Pointer, keyboard, touch and wheel cancel dismissal.
4. Manual reopening and focus restoration.
5. Escape/continue dismissal.
6. 7-day suppression and expiry.
7. Deferral for consent, modal and form focus.
8. Restricted storage resilience.
9. Inactive dates and endpoint failure.
10. Open-tab expiry on December 1.
11. English content and destination.
12. Preview validation without email.
13. Contact payload attribution, success and failure recovery using mocked responses.
14. Required privacy acknowledgement and email validation.
15. Page field labels, image alternatives, heading and inactive fallback.
16. Vercel build entries, routing order, retained CSP and accepted service values.

JavaScript syntax and `git diff --check` passed. No inline scripts/styles or third-party campaign libraries were added. Existing CSP and contact backend remain unchanged.

## Required validation before production

Browser rendering and actual device interaction have NOT been verified in this environment. The Sites workflow requires its browser-control skill, which is unavailable in this session. jsdom tests do not establish real layout, focus trapping, screen-reader behaviour, animation smoothness or Core Web Vitals.

| Surface | Required viewport | Status |
| --- | --- | --- |
| Small phone portrait / landscape | 320×568 / 568×320 | Pending browser QA |
| Modern phone portrait / landscape | 390×844 / 844×390 | Pending browser QA |
| S22 Ultra portrait / landscape | 412×915 / 915×412 | Pending browser QA |
| Tablet portrait / landscape | 768×1024 / 1024×768 | Pending browser QA |
| Desktop | 1366×768 and 1920×1080 | Pending browser QA |

Check: no horizontal overflow, readable text, visible close control, modal scrolling in short landscape view, keyboard Tab containment, Escape and focus restoration, reduced motion, 200% zoom, cookies, original service dialogs, EN navigation, form validity and errors. Responsive CSS includes fluid sizing, 600px/850px breakpoints and short-landscape handling.

Real email delivery was intentionally not exercised. Before release, confirm production contact configuration and perform one explicitly approved delivery test. Campaign pages currently have `noindex, nofollow` for review; decide indexing at release.

## Review steps

1. Open the preview home. Resolve the existing cookie prompt if shown, then wait 3 seconds.
2. Leave the presentation untouched to observe automatic closure, or interact to keep it open.
3. Reopen with Black Edition. Discover the campaign and test a valid enquiry; preview confirms that no email was sent.
4. Refresh: the automatic presentation stays dismissed. For a fresh presentation test, remove only `avyena:black-edition:2026:dismissed` from the preview origin's local storage, or use a fresh browser profile.
5. Do not merge the branch until the pending browser QA is complete and publication is authorized.
