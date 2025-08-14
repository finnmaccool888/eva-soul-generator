# Eva Mirror — Master PRD (v1.0 Foundation + Retention Layer)

## Decisions (locked)
- Audience: crypto-first
- Raw text storage: local-only (no server raw)
- LLM: GPT-4o-mini (optional for v1.1 summaries; v1 uses heuristics)
- Streaks + cosmetics in v1: Yes
- Public profiles in v1: No
- Echo invites: Yes in v1 (code-based redemption; no server)
- Analytics event set: Approved

## Vision
Help people build a living, evolving digital self they love to feed daily. Make reflection feel like a game, and identity feel collectible yet meaningful.

## North-star metric
- D7 retention ≥ 25%
- Secondary: weekly feeds/user ≥ 4

## MVP scope (v1.0)
- Onboarding ≤60s: alias → choose vibe (3 styles) → 3 micro-prompts → Soul Seed Level 1
- Daily Transmission: 1–3 prompts/day with chips + free text (autosave, streaks)
- Rewards: cosmetic artifacts (basic set) on completion
- Insight Card: shareable card with redacted excerpt via Web Share API
- Echo invites: generate an invite link or code; friend answers a prompt; both earn a fragment; original user redeems via code (local-only)
- Privacy: local-only raw reflections; on-device redaction for PII (emails, phones, handles) before generating share cards

## Out of scope (v1.0)
- Public profiles
- Server storage of raw reflections
- Multi-device sync (considered in v1.2 via Cloud Sync opt-in)

## v1.1+ highlights
- Weekly Sync: compact JSON deltas; optional GPT-4o-mini summarization on derived data only
- Archetype progress bars; seasonal arcs

## Data policy (summary)
- Raw reflections: local-only (IndexedDB + WebCrypto optional later). User can export/delete.
- Derived: trait vectors, tags, artifacts stored locally for v1 (no server).
- PII redaction: on-device before sharing (emails/phones/handles/URLs → tokens). No PII in analytics.

## Core systems
- Soul Seed: traits vector (16 dims), memories (shards), artifacts (cosmetics), streak counters
- Rituals: Daily Transmission (1–3 prompts); Weekly Sync later
- Content: Prompt objects with id/theme/inputType/chipSuggestions/safetyTags/cooldownDays
- Rewards: rarity tiers; reveal screen

## Analytics (local buffer → network optional later)
- Events: onboarding_started/completed, daily_opened, prompt_answered, streak_day, reward_revealed, share_clicked, echo_invite_generated, echo_redeemed

## Technical requirements
- Next.js App Router (client-first for MVP); PWA later
- Performance budgets: initial JS ≤ 180KB gz, CSS ≤ 40KB; LCP < 2.0s on 4G
- Storage: `localStorage` for v1 (simple), IndexedDB upgrade later
- AI ops: heuristics first; gate LLM behind env flag and token budget

## UX flows (mobile-first)
- Onboarding: alias → vibe → micro-prompt trio → Soul Seed L1
- Daily: streak card → 1–3 prompts → reward reveal → timeline update → share
- Echo: generate invite → friend answers → code given → redeem in app

## Prompts (starter set)
- Psychological, mental models, spiritual, philosophical, social, personal history, values, habits, passions, emotional profile (short variants for mobile). See `src/lib/mirror/prompts.ts`.

## Risk & mitigations
- Input fatigue → chips, dictation, micro mode
- Privacy → local-only, redaction, no raw analytics
- Retention → streaks, variable rewards, Echo invites

## Build plan (one-shot MVP)
1) Data types: `SoulSeed`, `TraitVector16`, `MemoryShard`, `Artifact`, `Prompt`
2) Storage utils: namespaced `localStorage` read/write; simple migration key
3) Prompt set: 30–40 micro prompts with chips
4) Traits heuristics: keyword → trait deltas; clamp 0–100
5) Rewards: basic artifact pool; rarity weighting
6) Echo: invite code generation (base64 of payload + HMAC salt) and redemption
7) UI route: `src/app/mirror/page.tsx` with sections: Onboarding, Daily, Reward, Timeline, Echo
8) Components: `soul-seed-card`, `daily-transmission`, `chip-input`, `reward-reveal`, `timeline`, `insight-card`
9) Analytics: event queue to local (console in dev)
10) Ship to Vercel

## Future
- Weekly Sync with GPT-4o-mini (derived-only input), archetypes, seasonal arcs, Cloud Sync opt-in. 