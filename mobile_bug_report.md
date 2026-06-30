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

Prioritised by platform risk, highest first.

1. **iOS vs Android behavioural parity on the same scenarios** — Mobile apps often have platform-specific failure modes that only appear when you run identical steps on both OS. For Wikimedia Commons specifically I would repeat the airplane-mode sequence on both platforms and compare: (a) the exact wording and timing of the offline error message, (b) whether the iOS swipe-back gesture during a failed image load behaves differently from the Android hardware back button, and (c) whether the app requires a full restart after reconnection on one platform but auto-recovers on the other. Any difference is a parity bug that should be filed even if neither platform crashes.

2. **Interruption and background recovery** — Mobile users get interrupted constantly. I would test: incoming phone call while a search is loading (does the app resume the request or silently fail?), pressing the Home button mid-image-upload and returning after 30 seconds, and locking the screen during a search. The key assertion is that the app either resumes the in-flight operation or presents a clear retry option — a blank or frozen screen on return is a Major bug.

3. **Orientation change mid-flow** — Rotate the device from portrait to landscape while viewing a search results list and while viewing an image detail page. Verify that the layout reflows without clipping text, the scroll position is maintained, and the app does not restart the current request. This is a common source of crashes in React Native and similar frameworks that don't handle `onConfigurationChanged` correctly.

4. **Accessibility font size and display settings** — Go to OS Settings → Accessibility → increase text size to the largest setting, then search for an item and open an image detail. Verify that labels, captions, and attribution text do not overflow their containers or get clipped. Repeat with Bold Text enabled on iOS. These settings affect a large percentage of users over 40 and are rarely tested on mobile.

5. **Offline-first cache and stale content** — After a successful search, enable airplane mode and pull-to-refresh. The expected behaviour is that cached results remain visible with a clear "You are offline — showing cached results" banner, not a blank screen. If the app clears results on a failed refresh, that is a data-loss regression. Also verify that cached images are served from disk (no repeated network requests for the same asset) — this matters for users on metered mobile data plans.
