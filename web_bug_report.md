# Bug Report — Sauce Demo (saucedemo.com)

**Tested:** [e.g. 2 July 2026]
**Browser:** [e.g. Chrome 126 / Firefox 127 / Safari 17]
**OS:** [e.g. macOS 14.5 / Windows 11]
**Tester:** [Your Name]

---

## Accounts Tested

| Username | Password | Purpose |
|----------|----------|---------|
| standard_user | secret_sauce | Baseline user |
| locked_out_user | secret_sauce | Should be blocked at login |
| problem_user | secret_sauce | Has intentional UI bugs |
| performance_glitch_user | secret_sauce | Slow login |

---

## BUG-001: [Title]

**Steps to Reproduce:**
1. Navigate to https://www.saucedemo.com
2. [Next step]
3. [Next step]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Severity:** Critical / Major / Minor
**Reasoning:** [One line — e.g. "Critical: blocks all users from completing purchase"]

**Evidence:** `screenshots/bug-001.png`

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

**Evidence:** `screenshots/bug-002.png`

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

**Evidence:** `screenshots/bug-003.png`

---

## BUG-004: [Title]

**Steps to Reproduce:**
1. ...

**Expected Result:**
...

**Actual Result:**
...

**Severity:** Critical / Major / Minor
**Reasoning:** ...

**Evidence:** `screenshots/bug-004.png`

---

## BUG-005: [Title]

**Steps to Reproduce:**
1. ...

**Expected Result:**
...

**Actual Result:**
...

**Severity:** Critical / Major / Minor
**Reasoning:** ...

**Evidence:** `screenshots/bug-005.png`

---

<!-- Add more BUG-00N sections as needed. Aim for 5–8 bugs total. -->

---

## What I'd Test Next

- **[Area 1]:** [Why it matters]
- **[Area 2]:** [Why it matters]
- **[Area 3]:** [Why it matters]
- **[Area 4]:** [Why it matters]
- **[Area 5]:** [Why it matters]

---

## Testing Notes

### Areas Covered
- Login: valid credentials, invalid credentials, locked-out user, empty fields
- Inventory: product display, sort dropdown (all 4 options), cart badge
- Cart: add/remove items, empty cart behavior
- Checkout: form validation (each field), order summary, confirmation
- Navigation: hamburger menu (About, Logout, Reset App State)
- Cross-account: standard_user vs problem_user comparison

### Severity Definitions Used
- **Critical** — blocks core functionality; no workaround; would prevent release
- **Major** — significant impact on UX or correctness; workaround exists but is painful
- **Minor** — cosmetic or low-frequency issue; does not block core flows
