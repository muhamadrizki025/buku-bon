# Design: Voice Ledger Skeleton

## Flow
mic/typed text → `voice.js` (up to 3 alternatives) → `parser.parseUtterance(text, config)` for each → first `ok` candidate → preview → `store.add()` → `config.summary()` re-render.

## Parser
- `normalize()` lowercases, joins thousand separators, turns decimal commas into dots, splits "15rb" into "15 rb", expands `se-` prefixes (seratus → satu ratus).
- `parseNumberTokens()` keeps three accumulators: `d` (pending digit word), `chunk` (value below the next scale word), `total` (completed ribu/juta groups). `belas` adds 10+d, `puluh` adds d×10, `ratus` adds d×100, a scale word flushes `(chunk+d)×scale` into `total`.
- `parseIntent()` matches whole-word keywords; longest wins; falls back to an intent marked `default`.
- `parseParty()` finds an honorific followed by a non-number token.

## Config contract
See `.kiro/steering/structure.md`. The skeleton never imports an app; apps import the skeleton.

## Correctness properties
- P1 Round-trip: for every n in 1..999,999, `parseAmount(say(n)) === n` where `say` speaks n in standard Indonesian.
- P2 Sign safety: an entry's sign always equals its intent's sign.
