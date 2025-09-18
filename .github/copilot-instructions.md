- Big picture
   - Single-page client-side bookmarklet / userscript that runs on old.reddit.com (user overview). No backend; all actions call Reddit JSON endpoints.
   - Runtime entry is `powerdeletesuite.js`. The app exposes a global `pd` object (state, settings, endpoints, helpers).
   - UI is mostly wiki-driven: markup comes from the subreddit's wiki JSON and CSS from a JSON `stylesheet` resource.

- Key files to read first
   - `powerdeletesuite.js` — full app (init, settings, endpoints, UI binders, filters, edit/delete flows). Primary edit target.
   - `bookmarklet.js`, `powerdeletesuite.user.js` — packaging/wrappers (bookmarklet string and userscript headers).
   - `README.md` — install/bookmarklet snippet and usage notes you must keep in sync with `pd.bookmarkver`.
   - `stylesheet.json` — local copy of stylesheet payload used by `pd.setup.applyStyles()`.

- Concrete runtime patterns & conventions
   - Global API: `pd` contains `pd.version`, `pd.bookmarkver`, `pd.endpoints`, `pd.setup.*`, `pd.checks.*`, and `pd.editStrings`.
   - Networking: uses jQuery (`$`) and `$.ajax(...).then(success, failure)`. Expect callback style, not async/await.
   - Reddit endpoints used: `/user/<user>/comments/.json`, `/user/<user>/submitted/.json`, `/search.json`, and post/edit/delete JSON endpoints.
   - Persisted settings live in `localStorage` (keys like `pd_ver`); UI and behavior depend on those keys.
   - Modhash / CSRF token extraction reads `#config` innerHTML. This is fragile — do not change selector logic lightly.

- Developer workflow and verification
   - No build step. Edit `powerdeletesuite.js` and other files directly. Changes are validated by manual smoke tests.
   - Manual test steps: install bookmarklet/userscript or load `powerdeletesuite.js` on `https://old.reddit.com/u/me/overview`, then:
      1. Load comments/submissions (use filters).
      2. Run an edit flow (use `pd.editStrings` candidates).
      3. Run a delete flow.
   - Typical PR checklist:
      - Bump `pd.version` for changes; bump `pd.bookmarkver` only if the bookmarklet string in `README.md` must change.
      - Update `README.md` if distribution/install string changes.
      - Describe which flows you tested on `old.reddit.com/u/me/overview`.

- Fragile areas and common failure modes
   - DOM selectors: `pd.checks.location()` compares username text to header link — changing selectors breaks the startup guard.
   - Remote wiki/CSS fetch: `pd.setup.applyCentral()` and `pd.setup.applyStyles()` fetch external JSON; network/CORS failures cause visible alerts.
   - Modhash extraction: parsing `#config` innerHTML is brittle and required for authenticated actions.

- Where to make common edits (quick pointers)
   - Endpoints and defaults: `pd.setup.basicSettings()` (search for `pd.endpoints`).
   - Wiki-driven UI: `pd.setup.applyCentral()` — how forms and labels are populated.
   - Stylesheet injection: `pd.setup.applyStyles()` expects `data.stylesheet` JSON.
   - Edit text candidates: `pd.editStrings` array in `powerdeletesuite.js`.

- Small tips
   - Preserve jQuery patterns; convert to Promises only if you update all call sites.