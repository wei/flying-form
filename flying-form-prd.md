# Flying Form — PRD

**One-liner.** Photograph a paper form; get a working, validated mobile form in seconds. The user fills it via QR on their phone; the enterprise opens the submission by scanning a success QR back.

**Event.** ai& × Moonshot Tokyo Hackathon Night — Enterprise Workflow / AI Agent track. Build window ~2 hours (17:20–19:30), live demo + judging from 19:30.

**Status.** Draft for build. Two decisions defaulted below — override if wrong.

### Locked decisions
- **Name:** Flying Form. English only, no Japanese name, no tagline.
- **Model:** Kimi K2.7 only, on ai& inference. No Gemini, no A2UI dependency. Running on Kimi is the qualification gate — any other model call disqualifies.
- **Schema:** bespoke JSON, structure separated from values, closed field-type enum validated before render. No in-app schema editor.
- **User fill UX:** grouped multi-screen wizard (one screen per section), not one-question-at-a-time.
- **Bilingual:** English/Japanese toggle is a required feature (P0), not a nice-to-have.
- **No auth in the MVP:** all routes and features are public — no login, accounts, or credentials. Access control is post-MVP.

### Assumed decisions (override to change)
- **Demo scenario:** visitor / contractor check-in at a Tokyu Land building. Chosen because the "front desk scans your success QR" handshake fits the round trip and the enterprise judges own that world.
- **ai& path:** build directly on Kimi K2 on the ai& platform. Chosen because vision (image input) is load-bearing and the brief flags vision-to-code under this path specifically. If bringing your own agent, confirm that endpoint accepts an image before committing.

---

## Problem statement

Japanese enterprises — property, facilities, clinics, city offices — still run intake and inspection on paper. Someone photographs, re-keys, or files each sheet by hand; data is slow, error-prone, and stuck offline. The people who feel it are front-desk and facilities staff (the ones re-typing forms) and the visitors/contractors filling them, and it happens every single day. Building a digital equivalent normally takes a developer days per form, so most forms never get digitized.

Paper also silently excludes people. A Japanese-only form is unusable to the many foreign residents and visitors in Tokyo, and a printed sheet is completely invisible to a screen reader, hard for anyone with low vision, and unforgiving for people with motor or literacy barriers. Digitizing the form is therefore not just an efficiency win — it is what makes the form accessible in the first place.

## Goals

1. **Turn a paper form into a working digital form in under a minute**, live, from a single photo — no manual field setup.
2. **Make the fill experience genuinely good on a phone** — grouped screens, right widget per field, inline validation, bilingual. User experience is the primary success bar.
3. **Close the loop physically** — user gets a success QR; enterprise scans it and the exact submission opens on their dashboard.
4. **Demonstrate safety-by-construction and sovereignty** — the generator can only emit from a fixed, validated widget vocabulary, and all vision runs on Kimi via ai& in Japan, so personal data is processed on Japan-based inference rather than shipped to a foreign API.
5. **Make previously-inaccessible forms usable by more people** — foreigners (via the JP/EN toggle), screen-reader and low-vision users (via semantic, labeled digital widgets instead of paper), and people who struggle with tapping or reading (via the conversational/voice fill path). Inclusion is a headline benefit, not a footnote.
6. **Land the value beat inside ~40 seconds** of a ~2-minute demo.

## Non-goals

- **No in-app schema editor.** Correctness comes from the closed field vocabulary + validation, not manual editing. (Cut for time and to keep the demo tight.)
- **No conditional/branching form logic generation.** High risk, low visible payoff in a 2-minute slot. Parking lot.
- **No authentication of any kind in the MVP.** No login, accounts, roles, or credentials. Every route — the enterprise dashboard included — is publicly accessible; anyone with a URL or QR can open it. Access control, tenancy, and per-user data isolation are explicitly post-MVP. (Cut so the demo has zero friction and no sign-in step on stage.)
- **No offline mode or native app.** Responsive web only.
- **No analytics dashboard beyond a submissions table.** Anomaly-flagging and completeness checks are P1/P2, not v1 core.

## Accessibility & inclusion

A core benefit, delivered mostly by features already in scope rather than by separate work:

- **Foreigners** — the JP/EN toggle (P0-7) turns a Japanese-only form into one anyone can read and complete. The single most concrete inclusion win, and it's already P0.
- **Screen-reader and low-vision users** — because the fill surface is a real digital form, the renderer uses semantic, correctly-labeled inputs (native controls, `<label>` associations, ARIA where needed, visible focus, adequate contrast and tap-target size). A screen reader can navigate it; a photo of paper cannot be navigated at all. This is a cheap commitment for the renderer team (B), not a new workstream — build on native form elements and label everything.
- **Motor / reading / literacy barriers** — the conversational/voice fill path (P1-3) lets someone complete the form by talking in plain language instead of tapping small fields or parsing dense text; bilingual throughout. Voice is handled by the browser's own speech services (Web Speech API, JP + EN); Kimi K2.7 runs the conversation as text.

Scope honesty: full WCAG conformance is not a two-hour goal. The commitment is the *direction* and the three concrete wins above — language, semantic labeled widgets, and a spoken/conversational alternative — which are genuinely more accessible than the paper original.

## Users & personas

- **Enterprise operator** (front-desk / facilities staff). Sets up a form from a paper original, shares the QR, reviews submissions.
- **End user** (visitor / contractor). Scans a QR, fills the form on their own phone, shows a success QR.
- **Judges** (enterprise CTOs, AI founders, infra/devtool specialists, Tokyu Land). Watch the demo; reward visible value, production-shape, and the ai& thesis.

## User stories

**Enterprise operator**
- As an operator, I want to photograph a paper form and get a digital version automatically, so I don't have to rebuild it by hand.
- As an operator, I want each field to have the right input type and validation inferred from the paper, so submissions come in clean.
- As an operator, I want a QR to share the form, so any visitor can open it on their own phone.
- As an operator, I want to scan a visitor's success QR and see their submission immediately, so check-in is instant at the desk.
- As an operator, I want to see all submissions for a form in one table, so I can track intake.

**End user**
- As a visitor, I want to open the form by scanning a QR, so I don't install anything.
- As a visitor, I want to fill related fields grouped into a few clear screens, so it doesn't feel like a wall of inputs.
- As a visitor, I want to switch the form between Japanese and English, so I can use my language.
- As a visitor, I want to photograph a form I already filled out on paper and have it pre-fill, so I only confirm and submit. *(stretch)*
- As a visitor, I want a clear success screen with a QR, so the front desk can pull up what I submitted.

## Requirements

### Must-have (P0) — the demo dies without these

**P0-1 — Paper photo → schema (Kimi vision).**
Operator uploads/shoots a paper form; Kimi K2.7 returns a valid schema conforming to the closed field vocabulary.
- Given a photo of a real paper form, when the operator submits it, then a schema with `sections[]` and typed `fields[]` is produced within ~10s.
- Field `type` is always one of the allowed enum values; output is validated before use.
- Malformed or non-conforming model output is rejected and retried once, not rendered.

**P0-2 — Publish → QR.**
- Given a generated schema, when the operator publishes, then a form URL `/f/:formId` is created and a QR encoding it is displayed.
- The rendered form is shown read-only as a preview before/at publish (this is not an editor — just seeing the result).

**P0-3 — Grouped multi-screen fill (user).**
- Given a published form, when a user opens `/f/:formId`, then fields render as a wizard with one screen per section, a progress indicator, and back/next.
- Required-field validation gates advancing; the right widget renders per type.
- Fully responsive; phone is the primary target.

**P0-4 — Submit → success QR.**
- Given a completed form, when the user submits, then the submission is stored and a success screen shows a QR encoding the submission reference.

**P0-5 — Enterprise opens submission via success QR.**
- Given a submission exists, when the operator scans the success QR on the dashboard, then that exact submission opens.
- Submissions also appear in the form's submissions table (live/refreshable).
- In the MVP the QR is an open deep link, not an access gate — there is no auth, so anyone who scans it can open the submission. That is acceptable for the prototype; gating is post-MVP.

**P0-6 — Runs on Kimi via ai&.**
- Every model call is Kimi K2.7 on ai& inference. No other provider is called. (Qualification gate.)

**P0-7 — English/Japanese toggle.**
Kimi emits both JP and EN labels for every field and section title; a single control flips the entire form's language.
- Given a published form, when the user taps the language toggle, then all section titles, field labels, placeholders, and validation messages switch between Japanese and English without losing entered values.
- Both label sets are generated at schema time, so the toggle is instant and requires no extra model call.
- Applies to the user fill flow (P0); the dashboard may stay single-language for v1.

### Nice-to-have (P1) — build if time survives

**P1-1 — Inferred validation, not just OCR.** Kimi tags postal codes, emails, phones, dates with the right input type + validation, so the phone shows the right keyboard and rejects bad input. Mostly a prompt concern; fold into P0-1.

**P1-2 — Photo prefill (stretch, promotable to headline).** User photographs an already-filled paper copy; Kimi vision returns a `values` object keyed by field id; the wizard opens pre-populated to confirm and submit. Elevate to the demo headline only if reliable by the 10-minute risk test.

**P1-3 — Conversational fill (stretch).** Instead of tapping through the wizard, the user completes the form by chatting with Kimi in JP or EN. Kimi asks for the remaining fields naturally, and its answers drive the actual widgets.
- Given a published form, when the user chooses "fill by chat," then Kimi conducts a bilingual conversation and populates `values` against the field ids.
- Chat and widgets are two views of one shared form-state object — Kimi returns structured field actions (set a field, advance a section), not just prose, so the visible widget fills in and the active field highlights as the conversation proceeds. It is not a separate collector pane.
- Reuses the existing schema and submission path — it is an alternate input surface, not a second form engine.
- Handle it as one more Kimi-on-ai& call in a short turn loop; keep the wizard as the guaranteed happy path so a slow or off-track turn never blocks submission.
- Chat here is text (typed). Spoken input/output is a separate stretch — see P1-5.
- Alternative framing if time is tighter: an enterprise-side chat to query submissions ("how many contractors checked in today?"). Pick one; do not build both tonight.

**P1-4 — WebMCP actuation (stretch, builds on P1-3).** Expose the form's operations (`fill_field`, `set_section`, `submit`) as WebMCP tools declared on the page with JSON schemas, so the form is standards-compliant "agent-ready" and the on-screen assistant drives the real widgets through registered tools rather than ad-hoc state writes. Chrome's `:tool-form-active` / `:tool-submit-active` pseudo-classes then highlight exactly which field and submit button the agent is operating — the form visibly fills itself.
- This is the polish layer on P1-3, not an independent feature. Build conversational fill first; add WebMCP only if it lands.
- The tool *caller* stays Kimi on ai& — never Chrome's built-in agent — so the qualification gate holds. WebMCP is only the interface Kimi actuates through.
- Demo dependency: WebMCP is an early W3C Community Group Draft, shipped behind a Chrome flag / origin trial (or via polyfill) with native support expected H2 2026. Pin the demo to a browser build that has it, and keep the plain shared-state path (P1-3) as the visually-identical fallback.
- Judge value: infra/devtool judges will recognize "our form declares WebMCP tools and Kimi actuates them" as genuinely ahead of the standard — a strong, on-trend flex.

**P1-5 — Voice fill (stretch, builds on P1-3).** Let the user speak answers and hear questions instead of typing, in JP or EN.
- Browser-native, not model-native: Kimi K2.7 is text + image only and does not hear audio. The browser's Web Speech API handles mic→text (`SpeechRecognition`, `ja-JP` / `en-US`) and text→speech (`SpeechSynthesis`); Kimi only ever sees text.
- All inference stays on Kimi, so the qualification gate holds — the speech I/O is a browser service, not a second AI model. (Moonshot's separate Kimi-Audio model can do speech natively, but assume it is not on the ai& endpoint tonight.)
- Depends on conversational fill (P1-3) existing first — it is a spoken skin over the same turn loop and shared state. Build P1-3, then add voice only if it lands.
- Demo dependency: pin to a browser with Web Speech support for both languages (aligns with the Chrome build already used for WebMCP). Keep typed chat as the fallback.
- Accessibility payoff: this is the win for users who can't tap small fields or read dense text — worth prioritizing over WebMCP if inclusion is the story you want to tell on stage.

### Future considerations (P2) — design-compatible, not built

- **Pre-submit completeness/consistency check** (Kimi flags gaps or contradictions in the user's language).
- **Submission anomaly flagging** on the dashboard.
- **Accounts, multi-workspace, roles, form versioning.**
- **Conditional/branching logic.**

## Data schema

One JSON object flows through the whole system. Structure is separate from values so prefill only ever writes `values`.

```json
{
  "formId": "string",
  "title": "Visitor check-in",
  "sections": [
    {
      "title": "Visitor details",
      "fields": [
        { "id": "name",    "label": "Full name", "type": "text",  "required": true },
        { "id": "company", "label": "Company",    "type": "text" },
        { "id": "email",   "label": "Email",      "type": "email", "required": true }
      ]
    },
    {
      "title": "Visit",
      "fields": [
        { "id": "date", "label": "Date", "type": "date", "required": true },
        { "id": "host", "label": "Host", "type": "select",
          "options": ["Facilities", "Leasing", "Ops"] }
      ]
    }
  ],
  "values": {}
}
```

- `type` ∈ `text | email | tel | number | date | select | radio | checkbox | textarea`. This enum is the correctness guarantee — validate every field against it before rendering; reject anything else.
- Every field and section carries both `label_ja` and `label_en` (required — drives the P0 language toggle). Optional per-field: `placeholder`, `validation` hints.
- `sections` map one-to-one to wizard screens.
- A submission = a filled `values` object plus `formId` and timestamp.

## Kimi calls (all on ai&)

1. **Schema generation (vision).** Input: form photo. System prompt: emit only valid JSON matching the schema above, using only the allowed `type` enum, no prose, no markdown fences. Emit both `label_ja` and `label_en` for every field and section (drives the P0 toggle). Group visually-related fields into `sections`. Infer types and validation from labels and layout.
2. **Prefill (vision, P1).** Input: photo of a filled form + the existing schema. Output: a `values` object keyed by field `id`, values only, no structure.
3. **Conversational fill (text, P1).** Input: schema + conversation so far. Output: the next bilingual question plus structured field actions (set field by `id`, advance section) applied to the shared form state, until the form is complete. With P1-4, these actions are the WebMCP tool calls Kimi invokes.
4. **Completeness check (text, P2).** Input: schema + values. Output: a short list of gaps/contradictions in the user's language.

The language toggle itself needs no call — both label sets ship in the schema.

Parse defensively: strip any stray fences, `JSON.parse` in try/catch, validate against the enum, retry once on failure.

## Architecture & stack

- **Frontend:** one responsive web app. Routes: `/admin` (enterprise) and `/f/:formId` (user). Prompt-built; spend the UX budget on the user wizard.
- **Model:** Kimi K2.7 on ai& inference — the only AI, for every call (schema, prefill, conversational fill, completeness).
- **Store:** a cross-device shared store (Supabase / Firebase / tiny server with a JSON or SQLite store — whatever the team already knows). Needed because enterprise laptop and user phone are different devices. No migrations; keep it trivial.
- **QR:** any client-side QR lib for generation; camera/scanner for reading the success QR on `/admin`.

**Surfaces**
- `/admin`: forms list (name, live QR, submission count) → form detail (submissions table) → single-submission view. Create flow: photo → Kimi → read-only preview → publish → QR. Scan-success-QR control opens a submission directly.
- `/f/:formId`: phone-first wizard — one screen per section, progress indicator, back/next with validation gating, language toggle (P1), success screen with receipt QR. Optional "I already filled this on paper" entry → prefill (P1).

## Demo script (~2 minutes)

1. Hold up a real, messy paper form. "Every building in Japan still runs on this."
2. Shoot it on the dashboard. **~40s: fields render into a clean mobile form and a QR appears.** ← value beat.
3. A judge scans the QR with their own phone and fills the grouped-screen flow; flip it to English mid-way for the room.
4. *If prefill is solid:* a second judge photographs a pre-filled paper copy and watches the form auto-populate — they just confirm.
5. Submit → success QR on the judge's phone → you scan it on the dashboard → their exact submission opens live in the table.
6. Close: "Every photo and field ran on Kimi, on ai&, in Japan. The form generator can only emit widgets we defined, so a bad photo can't produce a broken form — and the same paper form that shut people out is now something a foreign visitor can read in English, a screen-reader user can navigate, and someone who can't tap tiny fields can just talk through."

Disclose real-vs-mocked honestly. If you pre-cache one schema as a lag fallback, say so. Note: the sovereignty point is about *where inference runs* (Kimi on ai&, in Japan) — keep it there and don't overclaim data protection, since the prototype has no auth and forms are openly accessible. If a judge asks, be straight: access control is deliberately post-MVP.

## 10-minute risk test (before any UI)

Two throwaway scripts, no front-end:
1. **First call of the night:** send a real paper-form photo to Kimi on ai& → confirm you get clean, enum-conformant schema JSON. Tune the prompt on 2–3 different forms.
2. Send a filled-form photo + schema → confirm correct `values` mapped by id.

Decision gate: if both pass, prefill is the demo headline and the rest is prompt-built polish. If prefill is shaky, demote it to P1/stretch and protect the setup→submit loop. Decide by minute 10, not minute 110. Also confirm at check-in **which ai& path accepts an image** — the whole product depends on it.

## Team split & timeline

Parallelizes cleanly across the schema contract:
- **A — Kimi prompts** (schema + prefill). Starts immediately; owns the risk test.
- **B — user wizard renderer** (section-to-screen, widgets, validation, language toggle, success screen). The UX budget; primary success bar.
- **C — dashboard + store + QR** (generate + scan, submissions table, single-submission view).

Rough timeline: 0:00–0:10 risk test (A) while B/C scaffold routes and store · 0:10–1:15 build P0 in parallel against the shared schema · 1:15–1:40 integrate the round trip end-to-end · 1:40–2:00 rehearse the demo twice, add P1 only if green, freeze.

## Success metrics (hackathon-scoped)

**Leading (in the room)**
- Paper → rendered form in ≤ ~60s, live, first try.
- Full round trip (create → fill → success QR → open on dashboard) completes on stage without a manual patch.
- Value beat lands by ~0:40.
- A judge successfully fills the form on their own phone unaided.

**Lagging (post-event thesis)**
- Selected for further discussion / pilot with SDS or Tokyu Land.
- Clear real-user story: front-desk / facilities intake, PII-sovereign on ai&.

## Open questions

- **[Stakeholder]** Demo scenario confirmed as visitor check-in, or switch to facilities inspection? *(blocking for demo framing)*
- **[Eng]** Which ai& path is in use, and does its endpoint accept image input? *(blocking — verify at check-in)*
- **[Eng]** Handwriting reliability for prefill — headline or stretch? *(resolved by the 10-minute risk test)*
- **[Eng]** Shared store choice (Supabase vs Firebase vs tiny server)? *(non-blocking; pick what the team knows)*
- **[Design]** Conversational fill vs enterprise submission-query chat — which stretch, if either? *(non-blocking; do not build both)*
- **[Eng]** For WebMCP (P1-4): is the demo browser a Chrome build with the flag/origin trial, or do we use the polyfill? Confirmed that Kimi (not the built-in browser agent) is the tool caller? *(non-blocking; only relevant if P1-3 lands first)*
- **[Eng]** If voice is wanted: confirm K2.7 on ai& has no audio modality (expected) and that Web Speech API covers JP + EN on the demo browser. *(non-blocking)*
