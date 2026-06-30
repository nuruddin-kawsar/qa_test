# Bug Report — Wikimedia Commons (Mobile App)

**Device:** [TO COMPLETE — e.g. Pixel 8 / Android Emulator AVD API 34 / iPhone 15]
**OS:** [TO COMPLETE — e.g. Android 14 / iOS 17.4]
**App Version:** [TO COMPLETE — Settings → Apps → Wikimedia Commons → App info]
**Tested:** [TO COMPLETE — date of testing]
**Tester:** QA Candidate

> **Note to reviewer:** Mobile testing requires a physical device or emulator.
> To set up a free Android emulator: Android Studio → Virtual Device Manager →
> Pixel 8 → API 34 → Launch. Airplane mode is toggled via the quick-settings
> pull-down. All bug entries below are templated and must be completed from a
> real device session before submission.

---

## Areas to Cover

- [x] Search — results loading, empty/no-result state, error handling
- [x] Airplane mode — toggle mid-session, observe error state, observe recovery
- [x] Additional area — image detail view (zoom, attribution, share)

---

## Testing Notes — Search

**Happy path:**
1. Open app → tap Search icon
2. Type "Eiffel Tower" → observe results load

**Edge cases to check:**
- Empty query (tap search with no text) → does app crash or show placeholder?
- Nonsense query (e.g., "zzzzxxx123abc") → does "No results" state appear?
- Very long query (100+ chars) → does input truncate or overflow?
- Special characters (e.g., `<script>`, `%20`) → any unexpected behavior?

---

## Testing Notes — Airplane Mode

**Scenario:**
1. Open app and perform a search — wait for results to load
2. Pull down quick settings → enable Airplane Mode (all network off)
3. Tap on a search result or scroll further
4. Observe the error / offline state presented
5. Disable Airplane Mode
6. Observe whether app recovers automatically or requires manual retry

**Key questions:**
- Is there a clear offline error message or just a blank screen?
- Does the app crash when network drops?
- Does the app resume the previous state after reconnection, or require full restart?

---

## BUG-M01: [Title]

**Steps to Reproduce:**
1. Open Wikimedia Commons app
2. [Next step]
3. [Next step]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened — observed on device]

**Severity:** Critical / Major / Minor
**Reasoning:** [One line]

**Evidence:** `screenshots/mob-bug-001.png`

---

## BUG-M02: [Title]

**Steps to Reproduce:**
1. ...

**Expected Result:**
...

**Actual Result:**
...

**Severity:** Critical / Major / Minor
**Reasoning:** ...

**Evidence:** `screenshots/mob-bug-002.png`

---

## BUG-M03: [Title]

**Steps to Reproduce:**
1. ...

**Expected Result:**
...

**Actual Result:**
...

**Severity:** Critical / Major / Minor
**Reasoning:** ...

**Evidence:** `screenshots/mob-bug-003.png`

---

## Airplane Mode Test Log

| Step | Observed Behaviour | Expected Behaviour | Pass / Fail |
|------|-------------------|--------------------|-------------|
| Normal search loads results | | Results appear within 3 s | |
| Airplane mode ON — tap result | | Graceful offline error shown | |
| Airplane mode ON — scroll search list | | No crash; cached items visible or error shown | |
| Airplane mode OFF — wait 5 s | | App detects reconnection | |
| Airplane mode OFF — retry search | | Results load without full restart | |

---

## Severity Definitions Used

- **Critical** — App crash, data loss, or complete loss of a core feature
- **Major** — Significant UX degradation or incorrect behaviour; workaround exists but is unacceptable
- **Minor** — Cosmetic issue, edge-case behaviour, or low-frequency problem

---

## What I'd Test Next

- **iOS vs Android parity:** Run the same search and airplane-mode sequence on both platforms and compare error messages, recovery time, and UI layout differences.
- **Slow network (2G/3G simulation):** Use developer tools or a throttling app to test image loading under poor connectivity — does the app show placeholders or freeze?
- **Deep linking:** Open a Wikimedia Commons URL from a browser or messaging app and verify the correct in-app page opens without a crash.
