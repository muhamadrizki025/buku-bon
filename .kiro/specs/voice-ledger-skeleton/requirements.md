# Requirements: Voice Ledger Skeleton

## R1 Spoken amounts
User story: As a warung owner, I want to say amounts the way I normally talk, so I don't have to type numbers.
- WHEN the user says an amount in Indonesian words (e.g. "dua ratus lima puluh ribu") THEN the system SHALL parse it to the exact integer rupiah value.
- WHEN the user says digits with units ("15 ribu", "15rb", "Rp 15.000", "1,5 juta") THEN the system SHALL parse them correctly.
- WHEN the user uses street slang (cepek, gopek, seceng, goceng, ceban, gocap) THEN the system SHALL map it to its value.

## R2 Intent from keywords
- WHEN an utterance contains an app-defined keyword (e.g. "ngutang", "bayar", "dapat", "isi") THEN the system SHALL pick that intent and its sign (+/−).
- IF several keywords match THEN the system SHALL prefer the longest keyword.

## R3 Party detection (apps that need it)
- WHEN `needsParty` is true AND the utterance has an honorific followed by a name ("Bu Sri", "Pak Budi") THEN the system SHALL record that party.
- IF the party, amount or intent is missing THEN the system SHALL NOT save and SHALL show app-specific help.

## R4 Confirm, store, export
- WHEN an utterance is understood THEN the system SHALL show a preview and save only after the user taps Simpan.
- The system SHALL persist entries locally per app, support delete, clear-all with confirmation, and CSV export.

## R5 Two distinct apps from one foundation
- The skeleton SHALL power Kasbon Warung (balances per customer) and Dompet Ojol (daily net, fuel spend) with no app-specific code inside `skeleton/`.

## R6 Graceful degradation
- IF the browser lacks SpeechRecognition THEN the mic SHALL be disabled with an explanation and typing SHALL still work.
