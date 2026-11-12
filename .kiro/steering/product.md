---
inclusion: always
---
# Product: Buku Bon

Buku Bon is a voice-first ledger skeleton for Indonesian micro-entrepreneurs who keep books in their heads or on scraps of paper: warung owners, ojol drivers, market sellers. Users speak everyday Bahasa Indonesia ("Bu Sri ngutang lima belas ribu", "isi bensin goceng") and the app turns it into a ledger entry they confirm with one tap.

Principles:
- Speak first, type second. Every flow must also work by typing.
- Local-first. Data stays in the browser; no account, no server, works offline after first load.
- Confirm before saving. Show what was understood (who, what, how much) and let the user save or cancel.
- Speak the user's language: Indonesian UI copy, rupiah formatting (`Rp 15.000`), street slang for amounts (goceng, ceban, cepek).
- Each app is only a config object. If an app needs new behavior, extend the skeleton generically instead of special-casing the app.
