# Buku Bon 🎙️📒

**A voice-first ledger skeleton for Indonesia's street economy.** Kiroween 2026, Skeleton Crew category.

Millions of warung owners and ojol drivers keep their books in their heads. Buku Bon lets them *say* a transaction in everyday Bahasa Indonesia, including street slang like *goceng* (Rp 5.000) or *ceban* (Rp 10.000), and turns it into a confirmed ledger entry. No account, no server; data stays on the phone.

## One skeleton, two apps
| Folder | What it is |
|---|---|
| `skeleton/` | Parser for spoken Indonesian amounts, intents and names; local ledger store; speech wrapper; config-driven UI |
| `app-warung/` | **Kasbon Warung**: "Bu Sri ngutang lima belas ribu" → debt per customer |
| `app-ojol/` | **Dompet Ojol**: "isi bensin dua puluh ribu" → daily net income, fuel spend |

Each app is just an `index.html` and a `config.js`. A third app is a copy-and-edit away.

## Run it
```bash
npm test     # parser unit tests + 5,000-case round-trip property test
npm start    # serve locally, open /app-warung/ or /app-ojol/
```
Voice needs Chrome/Edge (Web Speech API, `id-ID`). Every flow also works by typing.

## How Kiro was used
- **Steering** (`.kiro/steering/`): product, tech and structure docs keep Kiro answering in Indonesian UX terms and stop app logic leaking into the skeleton.
- **Spec-driven development** (`.kiro/specs/voice-ledger-skeleton/`): requirements in EARS form, a design with correctness properties, and a task list.
- **Hooks** (`.kiro/hooks/`): run the parser tests on every save; guard that `skeleton/` stays generic.
- **Property-based testing**: every number 1..999,999 spoken in Indonesian words must parse back to itself.

## License
MIT
