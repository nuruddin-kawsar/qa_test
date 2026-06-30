# Bug Report — Wikimedia Commons (Mobile App)

**Device:** [e.g. Pixel 8 emulator / Samsung Galaxy S23 / iPhone 15]
**OS:** [e.g. Android 14 / iOS 17.4]
**App Version:** [shown in Settings → Apps → Wikimedia Commons → App info]
**Tested:** [e.g. 2 July 2026]
**Tester:** [Your Name]

---

## Areas Covered

- [ ] Search — results loading, empty state, error handling
- [ ] Airplane mode — toggle on mid-session, observe error, toggle off, observe recovery
- [ ] [Your choice — e.g. image detail view / category browsing / recent uploads]

---

## BUG-001: [Title]

**Steps to Reproduce:**
1. Open Wikimedia Commons app
2. [Next step]
3. [Next step]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Severity:** Critical / Major / Minor
**Reasoning:** [One line]

**Evidence:** `screenshots/mob-bug-001.png`

---

## BUG-002: [Title]

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

## BUG-003: [Title]

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

<!-- Add more BUG-00N sections as needed. Aim for 3–6 bugs. -->

---

## Airplane Mode Test Notes

**Scenario:** Active search → airplane mode ON → airplane mode OFF

| Step | Observed Behavior | Expected Behavior | Pass/Fail |
|------|------------------|-------------------|-----------|
| Before toggle | | App operates normally | |
| Airplane ON | | Graceful error / offline state shown | |
| Airplane OFF | | App recovers, resumes without restart | |

---

## What I'd Test Next

- **[Area 1]:** [Why it matters]
- **[Area 2]:** [Why it matters]
- **[Area 3]:** [Why it matters]

---

## Severity Definitions Used
- **Critical** — app crash or complete loss of core functionality
- **Major** — significant UX degradation; workaround exists but is poor
- **Minor** — cosmetic or edge-case issue; does not block core flows
