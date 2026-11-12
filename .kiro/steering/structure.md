---
inclusion: always
---
# Structure

- `skeleton/` — the reusable foundation: `parser.js` (amounts, intents, parties), `store.js` (ledger), `voice.js` (speech), `app.js` (UI mount), `style.css`.
- `app-warung/` — App A, Kasbon Warung: customer debts and repayments, balances per person.
- `app-ojol/` — App B, Dompet Ojol: daily income vs. costs with tags (bensin, makan, motor, parkir, tip).
- An app folder contains only `index.html` and `config.js`. A config declares: `id`, `title`, `accent`, `tagline`, `placeholder`, `hint`, `listTitle`, `needsParty`, `intents[]`, optional `tags[]`, and the functions `describe`, `missingHelp`, `summary`.
- To add a third app: copy an app folder, change `config.js` only.
