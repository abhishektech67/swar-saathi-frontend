# Swar Saathi — Voice Check (drop-in files)

Copy the `src/` folder contents over your frontend's `src/` (same paths). Nothing else changes:
no new npm packages, no backend changes, no env vars.

Changed:  src/App.jsx, src/AiFeatures.jsx
New:      src/i18n.jsx, src/voice/{audioAnalyzer,audioRecorder,voiceScoring,exerciseLibrary,exerciseRecommendation}.js, src/voice/VoiceCheck.jsx

## Run locally (matches your package.json)
    cd speech-db-frontend
    npm install
    npm run dev          # http://localhost:5173  (localhost counts as a secure origin for the microphone)
    npm run build        # production build check (same as Netlify)

## Algorithm self-test (no browser needed, Node 18+)
    node tests/voiceAnalysis.test.mjs      # from the folder that contains src/ and tests/

## Safe deployment checklist
1. Back up the current project (copy the folder or `git branch backup-before-voice-check`).
2. Copy the files in, run `npm install` and `npm run dev`.
3. Test authentication: register, log in, log out, "remember me".
4. Test authorization: patient sees only own data; therapist sees only linked patients; caregiver only linked patients (unchanged backend, so this should be identical).
5. Test the microphone: allow, deny, and (if possible) unplug/disable it.
6. Test scoring: steady "aaah", wobbly "aaah", stop at ~4 s, silence, and 3 different voices.
7. Test Hindi: toggle English / हिन्दी on the patient page; check text and result cards.
8. Test on a phone (Chrome Android / Safari iOS, https only).
9. `npm run build`, then commit to GitHub on a branch and open a PR.
10. Render backend: no backend change is required — nothing to redeploy.
11. Verify the Netlify deploy preview builds.
12. Test the production site end to end, then merge.

## NEW: Play demo + Record buttons on every exercise
New file: src/voice/SoundPractice.jsx
Changed:  src/App.jsx (1 import + 1 line inside ExerciseCard)
Copy the src/ folder over your frontend's src/. No new packages, no backend changes.
