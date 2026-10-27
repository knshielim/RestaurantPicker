# Redesign verification

Date: 27 October 2026. Scope: the five existing RestaurantPicker app screens.

## Automated checks

- PASS: `node --test scripts/places.test.cjs`, all 14 existing restaurant-data regression tests.
- PASS: `node scripts/ui-smoke.cjs` against the local app in Chrome. Covered creating saved places, picking, logging meals, three choices, cuisine filtering, area search, saving a live result, both off-campus XMUM areas, light/dark themes, Escape dismissal, reduced motion, keyboard focus, persistence and absence of page errors.
- PASS: no horizontal overflow at 320, 375, 390, 768, 1280, 1440 and 1920 pixels.
- PASS: JavaScript syntax checks and `git diff --check`.
- PASS: Hallmark static sweep: zero FAIL, zero WARN, zero open REFLEX. Two deliberate reference-driven waivers: warm glass/blooms and the orange heading phrase. Existing recorded links: 6/6; fields: 12/12.
- Hallmark's bundled render tier timed out. The separate Chrome/Puppeteer browser checks and screenshots completed successfully; this is not reported as a Hallmark render pass.
- PASS: contrast checker: primary button text 7.41:1 at the darkest orange stop; dark secondary text 7.50:1; light secondary text 5.19:1. Input boundaries have dedicated higher-contrast tokens and visible focus outlines.

Browser tests use isolated storage and intercepted external-provider responses. They verify interface behaviour, not current restaurant availability. Existing provider regression tests were not edited for the redesign.

## Anti-slop delivery gate

| Gate | Status and evidence |
| --- | --- |
| R-02 | PASS: new interface copy contains no em dash. |
| R-03 | PASS: seven browser viewport checks found no page overflow. |
| R-17, R-18 | PASS: no invented statistics or testimonials were added; history statistics come from saved meals. |
| R-23 | PASS: the user supplied the design direction; the burger is decorative artwork and the existing brand asset is preserved. No invented avatar, restaurant photo or navigation destination. |
| R-24 | PASS: original routes and links retained; the skip link targets the existing main content. |
| R-25 | PASS: checked primary action and essential secondary-text colour pairs meet AA; focus and field-boundary tokens provide visible control states. |
| R-26 | PASS: existing handlers and option values preserved; main action flows exercised in Chrome, including the new keyboard handler on Import backup. |
| R-27 | PASS: existing empty, loading and provider-error states retained and styled. |
| R-28 | PASS: no FAQ introduced. |
| R-32 | PASS: visible keyboard focus, native keyboard controls, accessible icon labels and Escape dismissal checked. |
| R-33 | PASS: source changes written directly with patches; no source-rewriting helper is shipped. |
| R-34 | PASS: dark and light switching tested; the reference defines the dark default and the existing theme feature remains available. |
| R-35 | PASS: app served locally; browser smoke check records the main action sequence; provider regression suite passes. |
| R-36, R-38 | PASS: no new business, safety, performance or customer claims. |
| R-37 | PASS: user JSON, reference image and Apple design principles set direction before implementation. |
| R-01, R-07, R-13 | PASS: two static warm blooms and a primary-action gradient follow the supplied reference; no grid, texture or animated background added. |
| R-04, R-22 | PASS: one SVG icon vocabulary maps to actions; the decorative burger follows the supplied subject rather than representing a restaurant listing. |
| R-06 | PASS: the app keeps a familiar system sans voice; headings tighten tracking and controls remain readable. |
| R-08, R-09 | PASS: no decorative arrow suffixes or marketing badges added. |
| R-10, R-12 | PASS: live blur restricted to navigation and an open dialog; panel depth uses lightness and inner highlights. |
| R-14 | PASS: picker, restaurant records, statistics and dialogs follow their different content structures. |
| R-19 | PASS: short press feedback and result settling; reduced-motion preference checked. |
| Liveliness | PASS: ENERGY 2 / RHYTHM 2 / MOTION 1; dominant picking action, structural spacing, one orange accent and a repeated warm-glass material. |
| C-1 | PASS: visual decisions and their purposes are recorded in design-notes.md. |
| C-2 | PASS: wiring is preserved; no decorative controls added. |
| C-3 | PASS: only existing app screens are recomposed; no marketing filler sections. |
| C-4 | PASS: desktop/mobile, both themes, dialogs, keyboard and reduced motion checked. |
| C-5 | PASS: existing data sources and stored history drive facts. |
| R-05, R-11, R-15, R-16, R-20 | PASS: the app retains its task-specific controls and XMUM areas, with varied card/control radii and concrete action labels. No marketing buzzwords added. |
| R-21, R-29, R-30, R-31 | PASS: dark styling is requested; the supplied palette and reference are adapted to RestaurantPicker, with each visual choice documented. |

## In-thread finish review

Reviewed the 1440px desktop result, 390px and 320px mobile layouts, saved-place list and edit dialog. Fixed excessive mobile heading wrapping, removed the duplicate mobile burger, prevented the XMUM navigation label from wrapping and increased input-boundary contrast. The old version's straightforward forms and routes remain accessible. The supplied warm-glass direction carries through lists, dialogs and controls; no open visual defect was found in the reviewed screens.

Screenshots and baseline comparisons are in `.hallmark/screens/`. The artwork prompt, tool and saved asset path are recorded in design-notes.md. Unmodified functions such as live map tiles, the browser share sheet and remote provider availability remain dependent on the device and network.
