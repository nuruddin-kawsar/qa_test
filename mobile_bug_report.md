# Bug Report — Wikimedia Commons (Android)

**Device:** Google Pixel 8 (Android Studio AVD, API 34)
**OS:** Android 14.0 (Build UQ1A.240105.004)
**App Version:** 4.2.1 (Google Play, installed 30 June 2026)
**Tested:** 30 June 2026
**Tester:** QA Candidate

---

## Areas Covered

- [x] Search — results loading, empty/no-result state, error handling
- [x] Airplane mode — toggle mid-session, observe error state, observe recovery
- [x] Additional area — Explore / "Picture of the Day" feature (image detail, share, attribution)

---

## BUG-M01: Search — Empty query submission triggers an unresolvable loading spinner with no timeout or escape path

**Steps to Reproduce:**
1. Open Wikimedia Commons app
2. Tap the Search icon (magnifying glass) in the bottom navigation bar
3. Leave the search field completely empty (no text entered)
4. Tap the Search / Return key on the on-screen keyboard

**Expected Result:**
Either (a) the keyboard submission is blocked and a hint such as "Enter a search term" is shown inline, or (b) the empty query is treated as a browse signal and the app navigates to a discovery/trending screen.

**Actual Result:**
A circular loading spinner appears in the centre of the results area and never resolves. Waited 60 seconds — no results appear, no error message appears, no timeout occurs. The spinner continues indefinitely. The only exit is the hardware Back button. Reproducible on 5/5 attempts.

**Severity:** Major
**Reasoning:** Any user who accidentally taps Search before typing is shown a frozen-looking screen with zero feedback. There is no error, no guidance, and no auto-recovery — the Back button is the only way out, and many users do not know to try it.

**Upstream Cross-Reference:** No exact GitHub issue. The closest analogue is [#5284](https://github.com/commons-app/apps-android-commons/issues/5284) (app retries genuinely-failed uploads indefinitely — the same "no bail-out on invalid input" pattern). The root cause here is missing client-side validation: an empty query should be rejected before the API call is made. The web interface recovers gracefully; the native app does not.

**Evidence:** `screenshots/mob-bug-001-empty-search-spinner.png`

---

## BUG-M02: Search — "No results" empty state is a dead end with no next-step guidance

**Steps to Reproduce:**
1. Open Wikimedia Commons app
2. Tap the Search icon
3. Type a nonsense query: `zzzzxxx123abc`
4. Tap Search / Return

**Expected Result:**
A "No results found for 'zzzzxxx123abc'" screen with at least one of: a suggestion to check spelling, a link to browse categories, or a "Try a different search" prompt.

**Actual Result:**
The app shows a minimal empty state: a small icon and the static text "No results". No query echo, no spelling suggestion, no link to categories or featured content, no call-to-action. The user's only option is to manually edit the search field.

**Severity:** Minor
**Reasoning:** The empty state is technically functional but offers no path forward. Users who mistype a query or genuinely search for something obscure are left with no guidance — a low-effort improvement (echoing the query, linking to "Browse categories") would substantially reduce abandonment.

**Upstream Cross-Reference:** No direct GitHub issue found. This is a general UX gap not yet filed upstream. Related design context: the upstream project tracks UX improvements under [Phabricator T360265](https://phabricator.wikimedia.org/T360265) (upload UX improvements), but empty-search UX is not covered there.

**Evidence:** `screenshots/mob-bug-002-no-results-empty-state.png`

---

## BUG-M03: Airplane Mode ON mid-navigation — App displays a blank white screen instead of an offline error when opening an image detail view

**Steps to Reproduce:**
1. Open Wikimedia Commons → Search for "sunset" → wait for results to fully load
2. Pull down the quick-settings panel → enable Airplane Mode (all connectivity off)
3. Tap any result thumbnail to open the image detail view

**Expected Result:**
App displays a clear offline error state — e.g., "You're offline. Check your connection and try again." with a Retry button. Alternatively, a cached thumbnail with an offline banner is shown.

**Actual Result:**
The screen transitions to a completely blank white screen. No error message, no offline indicator, no Retry button, no cached content. The screen is unresponsive to all touch gestures except the Back button. Pressing Back correctly returns to the search results list (which remains visible from the cache).

The logcat output (captured via Android Studio) shows:
```
java.net.UnknownHostException: Unable to resolve host "upload.wikimedia.org"
```
This exception is silently swallowed — it reaches no user-visible error handler.

**Severity:** Major
**Reasoning:** A blank white screen gives users no diagnostic information. Mobile network drops are extremely common (tunnels, lifts, rural areas). The exception is already caught — it simply needs to route to an error UI instead of a blank state.

**Upstream Cross-Reference:** The silent-swallow pattern is endemic across the app. The closest confirmed cases are upload failures [#4707](https://github.com/commons-app/apps-android-commons/issues/4707) and [#4658](https://github.com/commons-app/apps-android-commons/issues/4658), where network errors surface only as "Failed" with no explanation. No issue specifically tracks the image-detail blank-screen path — this appears to be a new bug not yet filed.

**Evidence:** `screenshots/mob-bug-003-airplane-blank-screen.png`

---

## BUG-M04: Airplane Mode OFF (reconnection) — App does not detect restored connectivity; manual restart required for image detail to load

**Steps to Reproduce:**
1. Reproduce BUG-M03 (blank screen in Airplane Mode)
2. Press Back to return to search results
3. Disable Airplane Mode via quick settings — wait 10 seconds for connectivity to restore
4. Tap the same result thumbnail again to open the image detail view

**Expected Result:**
Once network is restored, tapping the image should either (a) load automatically, or (b) show a "You're back online — tap to retry" Snackbar. The app should not require a full restart.

**Actual Result:**
The blank white screen from BUG-M03 reappears on the second tap. The app does not detect that network connectivity has been restored. The image detail view remains blank through 3 retry attempts. Only a full app restart (swipe away from recents, re-launch) resolves the issue and allows image detail pages to load.

**Severity:** Major
**Reasoning:** Requiring a full app restart to recover from a temporary network drop is a severe regression from expected mobile-app behaviour. Users who lose signal in a tunnel and regain it will lose their session entirely and have to start over.

**Upstream Cross-Reference:** Two related upstream issues. (1) [#6891](https://github.com/commons-app/apps-android-commons/issues/6891) — `NetworkUtils.getNetworkType()` returns `UNKNOWN` for cellular on Android 12+/API 31, which means the app cannot reliably detect when connectivity changes; a fix via `ConnectivityManager.getNetworkCapabilities()` is proposed in PR #6892. (2) The GSoC 2023 work by Ritika Pahwa (shipped in v4.2) fixed stuck-upload reconnect via WorkManager but did not cover the image-detail view reconnect path — this bug is a gap left by that work. Testing on app version 4.2.1 (the version under test) means the WorkManager upload fix is present but the image-detail reconnect is not.

**Evidence:** `screenshots/mob-bug-004-no-reconnect-recovery.png`

---

## BUG-M05: Explore — "Picture of the Day" share action copies a URL that resolves to the file description page, not the image itself

**Steps to Reproduce:**
1. Open Wikimedia Commons app
2. Tap "Explore" in the bottom navigation bar
3. Locate the "Picture of the Day" card at the top of the feed
4. Long-press the image (or tap the Share icon that appears on long-press)
5. Select "Copy link" from the share sheet
6. Paste the copied URL into a browser

**Expected Result:**
The copied link resolves directly to the full-resolution image file (e.g., `https://upload.wikimedia.org/wikipedia/commons/…/Filename.jpg`), so the recipient can view and download the image immediately.

**Actual Result:**
The copied link resolves to the Wikimedia file description page (e.g., `https://commons.wikimedia.org/wiki/File:Filename.jpg`), not the image itself. The recipient sees a desktop wiki page with metadata, not the image. To reach the actual image they must scroll down to find "Original file" and click through a second time.

**Severity:** Minor
**Reasoning:** The mismatch between user intent ("share this image") and actual behaviour ("share this wiki page") is a usability gap. The fix is one-line — swap the share payload to the `File:` page's `fullurl` field for the image rather than the description page URL.

**Upstream Cross-Reference:** No matching GitHub issue found in the known bug tracker. This appears to be an untracked bug. The Picture-of-the-Day widget has a related history ([#5395](https://github.com/commons-app/apps-android-commons/issues/5395) — PendingIntent crash, fixed in v5.0.0) but the share-URL mismatch is a separate, unfiled defect.

**Evidence:** `screenshots/mob-bug-005-share-url-wrong-target.png`

---

## Airplane Mode Test Log

| Step | Observed Behaviour | Expected Behaviour | Pass / Fail |
|------|-------------------|--------------------|-------------|
| Normal search loads results | Results appear in ~2 s on Wi-Fi | Results appear within 3 s | **Pass** |
| Airplane mode ON — tap search result | Blank white screen (no error message) | Graceful offline error with Retry button | **Fail** — BUG-M03 |
| Airplane mode ON — scroll search results list | Cached thumbnails remain visible; no crash | No crash; cached items visible or error shown | **Pass** |
| Airplane mode OFF — wait 10 s | No reconnection signal; image detail still blank | App detects reconnection automatically | **Fail** — BUG-M04 |
| Airplane mode OFF — full app restart, retry search | Results load correctly after restart | Results load without full restart | **Fail** (restart required) |

---

## Severity Definitions Used

- **Critical** — App crash, data loss, or complete loss of a core feature
- **Major** — Significant UX degradation or incorrect behaviour; workaround exists but is unacceptable for production
- **Minor** — Cosmetic issue, edge-case behaviour, or low-frequency problem with an obvious workaround

---

## Playwright Automation (Mobile Browser Emulation)

The scenarios above have been automated using Playwright's mobile device emulation against the **Wikimedia Commons web interface** (`https://commons.wikimedia.org`). This complements the native-app manual tests: the Playwright suite gives fast, repeatable CI coverage of equivalent behaviours on the mobile web.

**Device profiles configured:**
- `wikimedia-iphone` — iPhone 14 emulation (WebKit engine, 390×844 px, touch, mobile user-agent)
- `wikimedia-pixel` — Pixel 5 emulation (Chromium engine, 393×851 px, touch, mobile user-agent)

**Test coverage map:**

| Playwright test | Covers | File |
|---|---|---|
| TC-M01 — valid query returns results | Search happy path | `tests/wikimedia-mobile.spec.ts` |
| TC-M02 — empty query does not freeze (BUG-M01) | BUG-M01 web equivalent | `tests/wikimedia-mobile.spec.ts` |
| TC-M03 — nonsense query shows no-results state (BUG-M02) | BUG-M02 web equivalent | `tests/wikimedia-mobile.spec.ts` |
| TC-M04 — API failure is handled gracefully | Error handling | `tests/wikimedia-mobile.spec.ts` |
| TC-M05 — offline prevents detail load (BUG-M03) | BUG-M03 web equivalent | `tests/wikimedia-mobile.spec.ts` |
| TC-M06 — reconnect allows recovery without restart (BUG-M04) | BUG-M04 web equivalent | `tests/wikimedia-mobile.spec.ts` |
| TC-M07 — image detail shows metadata | Image detail area | `tests/wikimedia-mobile.spec.ts` |
| TC-M08 — direct link points to file not description page (BUG-M05) | BUG-M05 web equivalent | `tests/wikimedia-mobile.spec.ts` |

**Run commands:**
```bash
# All mobile tests (both device profiles)
npm run test:wikimedia-mobile

# iPhone 14 only
npm run test:wikimedia-iphone

# Pixel 5 only
npm run test:wikimedia-pixel

# View HTML report
npm run report
```

**Note on offline tests (TC-M05, TC-M06):** `page.context().setOffline(true/false)` is the Playwright equivalent of toggling airplane mode. It cuts all network traffic at the browser level — the same effect as the native app tests above.

---

## What I'd Test Next

Prioritised by risk to real users, highest first.

1. **Offline/reconnect path on iOS and on real hardware** — BUG-M03 and BUG-M04 were found on an Android emulator. The same airplane-mode sequence should be run on a physical Android device (to rule out AVD network-layer quirks) and on an iPhone, because the iOS WKWebView/URLSession stack handles offline errors differently. If the blank screen reproduces on a physical device, severity escalates to Critical; if it is emulator-only, it is still worth filing but lower urgency. Either way, the reconnect failure (BUG-M04) needs a real-device confirmation since emulators can suppress background network change events.

2. **Empty-search spinner under various network conditions** — BUG-M01 (the indefinite spinner on empty query) was reproducible on Wi-Fi. It should also be tested on a throttled 3G profile (Android Studio network throttling) to confirm the bug is not a timing race where the response normally comes back in <100 ms and the spinner is never visible. If it appears even on fast Wi-Fi, the root cause is the API accepting empty queries without validation — the fix should be client-side input validation before the request is ever sent.

3. **Search with special characters and non-ASCII input** — The test suite covered ASCII and alphanumeric queries. Common edge cases not yet tested: CJK characters (Japanese, Chinese, Korean), right-to-left input (Arabic, Hebrew), URL-encoded sequences (`%20`, `%00`), and emoji. Wikimedia Commons serves a global audience and its search backend is MediaSearch — any character-set issue in query encoding or result rendering would affect a large user population. I'd run each input type and check for (a) correct results, (b) no display corruption in the results list, and (c) correct rendering in the search field itself.

4. **Upload flow under interruption** — Wikimedia Commons is a contribution platform; file upload is a core feature. I would test: start an upload → enable Airplane Mode mid-upload → observe error handling → restore network → observe whether the upload resumes or must be restarted from scratch. A lost upload means lost contributor effort. Expected behaviour is a paused/queued state with resume-on-reconnect; any silent failure or forced restart-from-zero is a Major bug.

5. **Accessibility — TalkBack screen reader on search and image detail** — Enable TalkBack (Settings → Accessibility → TalkBack) and navigate: open app → search for "forest" → select a result → read the image detail. Verify that (a) the search field announces its purpose when focused, (b) result thumbnails have meaningful content descriptions (not just "Image" or silent), and (c) the attribution/licence text in image detail is reachable and readable by the screen reader. Wikimedia Commons images are used by journalists, researchers, and educators, many of whom rely on assistive technology — missing content descriptions on media files are both a legal risk and an accessibility regression.

---

## Known Upstream Issues (Not Reproduced in This Session)

The following bugs are confirmed open in the [commons-app/apps-android-commons](https://github.com/commons-app/apps-android-commons) GitHub tracker as of 30 June 2026. They were not reproducible on app version 4.2.1 under test (some are regressions introduced in later versions) but are relevant context for anyone testing the current release or planning future test cycles.

| Issue | Summary | Severity / Notes |
|-------|---------|-----------------|
| [#6902](https://github.com/commons-app/apps-android-commons/issues/6902) | Re-uploading a failed upload crashes the app | Major — fix PR #6903 open; repro: tap notification → "failed uploads" → tap refresh → crash |
| [#6908](https://github.com/commons-app/apps-android-commons/issues/6908) | Selecting two images tries to upload four — RAW+JPG pairs both selected automatically and RAW fails | Major — v6.6.0 regression; affects users who save RAW+JPG simultaneously |
| [#6904](https://github.com/commons-app/apps-android-commons/issues/6904) | No automatic numeric suffix when uploading multiple same-named images → files silently overwritten | Major — v6.6.0 regression; data-integrity risk for batch uploaders |
| [#6906](https://github.com/commons-app/apps-android-commons/issues/6906) | Login flow not triggering passcode confirmation; user locked out on each new WiFi connection | Major — filed by maintainer; `LoginFailedException: Incorrect password or confirmation code` |
| [#6895](https://github.com/commons-app/apps-android-commons/issues/6895) | In-app notification badge never clears after marking notifications as read | Minor — `markNotificationAsRead()` silently returns false; fix PR #6896 open |
| [#5580](https://github.com/commons-app/apps-android-commons/issues/5580) | BottomSheet creates multiple instances on repeated taps → memory leak | Minor — v4.2.1-debug; Android 14 |
| [#5689](https://github.com/commons-app/apps-android-commons/issues/5689) | Files uploaded via the website do not appear in the app's Contributions until logout/login; no duplicate warning for web-uploaded files | Minor — confirmed v5.0.1; also causes re-upload of files already on Commons |

**Prioritisation note:** For the current release cycle, #6902 (crash with ready PR), #6908 and #6904 (v6.6.0 upload regressions affecting core functionality), and #6906 (login breakage) should be triaged first. PRs #6892 (Android 12+ network detection) and #6896 (notification badge) are low-effort merges with fixes already written.
