<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Alohomora! — architecture decisions

- Frontend-only prototype (P0/P1 brief): all data lives in `src/data/*.ts` as typed mock records, clearly labelled as demo; UI must never present demo jobs/sponsors/resources as verified. No backend, no auth in this phase.
- Global prototype state (profile, skills, bookmarks, plan progress) lives in `src/state/app-state.tsx`, persisted to localStorage key `alohomora.v1`. localStorage holds non-sensitive preferences only, never secrets. Seed state ships a demo profile so every view has believable data.
- Skill coverage is transparent mock logic in `src/data/skills.ts` (`computeCoverage`): weighted share of a role's required skill areas (demonstrated=1, developing=0.5). Always explained in-UI as coverage of requirements, not job-offer probability; statuses are self-assessed.
- Learning plans come from `src/data/plan.ts` `generatePlan(roleId, skills, hoursPerWeek, variant)` — deterministic mock planner; no AI calls.
- Routes: pathless layout `src/routes/_layout.tsx` (plum sidebar shell) + 11 child pages; landing at `/`, onboarding at `/onboarding`. Route files map 1:1 to sidebar items — every nav item must have a real route.
- Design tokens (plum/parchment/gold palette, Cinzel + IM Fell English + Inter, animations, parchment/plum-panel utilities) are defined once in `src/styles.css` with oklch values; components use semantic tokens only.
- Brand assets: `src/assets/alohomora-logo.png` (key seal), `src/assets/owl-keeper.png` (Keykeeper Owl mascot), `src/assets/hero-library.jpg`; favicon derived in `public/favicon.png`.
- TS config uses `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`: avoid explicit `undefined` assignments to optional props; assert catalog lookups with `!` or `??` fallbacks.
