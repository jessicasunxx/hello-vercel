# Assignment 10 — UX improvements from user study feedback

---

## Submission (copy below this line)

### Summary of changes

These updates respond to usability feedback from our user studies (documented in `USER_STUDY_REPORT.md`): confusion about technical wording on the home page, worry when the browser switched to Google for sign-in, not knowing why the gallery required an account, trouble finding upload and sign out, uncertainty whether votes were saved, and feeling unclear about “where I am” after logging in.

**Home (`page.tsx`):** Replaced the old “View Supabase Data” style CTA with plain language (“Open meme gallery”), described what the app does, and stated that a Google account is needed and that sign-in may briefly leave the site before returning.

**Sign-in gate and login (`items` when logged out, `login/page.tsx`):** Clarified that only signed-in users can use the gallery and why; added Home / Meme gallery wayfinding on the gate; explained on the login screen that redirecting to Google is normal.

**Gallery header (`items` when logged in):** Added breadcrumbs, a visible “Signed in” box with the user’s email, a top **Add a meme** button that scrolls to the upload section (`#upload-section`), and a more prominent sign out. The upload form section has a stable id and scroll margin so the jump lands correctly.

**Voting modal (`ImageModal.tsx`):** Added short instructions that upvote/downvote rank the caption, save automatically, and persist if the modal is closed; after a successful vote, show “Vote saved” and an `aria-live` message for accessibility.

**Site title (`layout.tsx`):** Set the browser tab title and meta description to “Meme gallery” and a short summary so the app is easier to recognize among tabs.

### Links

- **Vercel (production):** https://hello-vercel-3s6z.vercel.app — *If your team uses a different deployment URL, replace this with the one shown in your Vercel dashboard.*

- **Repository:** https://github.com/jessicasunxx/hello-vercel

---

## Reference to Assignment #9 feedback

There is no separate `assignment-9` file in this repository. The feedback that motivated these changes is documented in **`USER_STUDY_REPORT.md`** (three in-library user studies: Kevin, Jasmine, Michelle). The improvements below map directly to the **observed problems** and **planned improvements** summarized in that report (e.g., confusion about “Supabase” on the home button, OAuth redirect anxiety, upload/sign-out discoverability, uncertainty that votes persisted, and unclear “where am I” after sign-in).

---

## Summary of code changes

### 1. Plain language and pre-auth expectations (home + gate + login)

**Feedback:** Users were confused by “View Supabase Data” and did not always understand that the gallery requires sign-in or that Google would open in the browser.

**Changes:**

- **`src/app/page.tsx`** — Replaced technical/jargon CTA with **“Open meme gallery →”**, reframed the hero around the meme gallery, and added short copy that a **Google account is required** and that sign-in may **briefly leave the site** before returning.
- **`src/app/items/page.tsx`** (unauthenticated) — Renamed the gate to **“Sign in required”**, added **Home / Meme gallery** wayfinding, and explained **why** the gallery is account-only and what happens next with Google.
- **`src/app/login/page.tsx`** — Clarified what sign-in unlocks (gallery, vote, upload) and added a note that **redirecting to Google’s page is expected**.

### 2. “Where am I?” and session visibility (gallery)

**Feedback:** Participants wanted clearer location after OAuth and a stronger sense of being signed in.

**Changes:**

- **`src/app/items/page.tsx`** (authenticated) — Added a visible **breadcrumb** (`Home / Meme gallery`).
- Added a **“Signed in”** panel with the user’s **email** (high contrast, `role="status"` / `aria-live="polite"`) so session state is obvious without hunting the header.

### 3. Upload and sign-out discoverability

**Feedback:** Upload sat below the fold; sign-out felt easy to miss next to a large title.

**Changes:**

- **`src/app/items/page.tsx`** — Placed **“Add a meme”** (jumps to `#upload-section`) and a **larger sign-out control** in a dedicated **action row beside the title** (not only at the end of a long stats line).
- **`src/app/items/UploadForm.tsx`** — Set **`id="upload-section"`** and **`scroll-mt-24`** so in-page navigation lands cleanly on the upload card.
- **`src/app/items/SignOutButton.tsx`** — Optional **`className`** override so the gallery can use a more prominent button without changing other uses.

### 4. Caption ranking / voting clarity

**Feedback:** Users hesitated and asked whether votes “stuck” or required extra saving; first-time voters wanted clearer affordances.

**Changes:**

- **`src/app/items/ImageModal.tsx`** — Added **inline instructions** that upvote/downvote **rank the caption**, that the choice **saves automatically**, and that **closing the modal does not undo** the vote.
- On successful submit, show a short **“Vote saved”** message and an **`aria-live`** status for screen readers.

### 5. Browser chrome / document title

**Feedback:** Michelle-style participants used tab/title cues to orient themselves.

**Changes:**

- **`src/app/layout.tsx`** — Updated **`metadata.title`** and **`description`** to **“Meme gallery”** and a short app summary.

---

## Mapping: feedback → change

| User study theme | Implementation |
|------------------|----------------|
| “What is Supabase?” / jargon CTA | Home CTA + copy; no “Supabase” on primary path for end users |
| OAuth / redirect anxiety | Home, login, and gate copy explain Google step |
| Why sign-in is required | Gate explains account-only gallery |
| Upload hard to find | Top **Add a meme** → `#upload-section` |
| Sign out too subtle | Prominent sign-out styling in gallery header |
| Vote persistence unclear | Modal copy + **Vote saved** + `aria-live` |
| Lost after OAuth | Breadcrumbs + page title metadata |

---

## Deployment

**Vercel production URL:** https://hello-vercel-3s6z.vercel.app (update in Vercel dashboard / this file if yours differs)

**GitHub:** https://github.com/jessicasunxx/hello-vercel

---

## How to submit

Copy the **Submission** section above into your course form. Confirm the live site matches the described behavior after your latest deploy.
