---
inclusion: always
---
# Tech

- Plain ES modules, HTML and CSS. No framework, no build step, no runtime dependencies.
- Speech: Web Speech API (`SpeechRecognition`, lang `id-ID`), always with a typed fallback.
- Storage: `localStorage`, namespaced `bukubon:<app-id>`.
- Tests: Node's built-in `node:assert`, run with `npm test`. Parser changes must keep the property test (round-trip of 1..999,999 spoken in words) green.
- Keep `skeleton/parser.js` pure (no DOM) so it is testable in Node.
- Serve locally with `npm start`; deploy as static files (GitHub Pages).
