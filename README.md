# OneMessage

Next.js Pages Router application with Firebase email/password authentication, a temporary pixel board, a permanent wall. Placements currently run in demo mode without collecting payments.

## Local development

```bash
npm ci
cp .env.example .env.local
# Fill in your Firebase configuration, then:
npm run dev
```

Use one application server process with the local sql.js database. For a multi-process or hosted deployment, move persistence and live events to shared services before accepting real payments. The database file and its temporary save file are ignored by Git.

```bash
npm test
npm run build
```

See [PROJECT_REVIEW.md](PROJECT_REVIEW.md) for the latest bug fixes, product observations, test coverage and launch limitations.

## Firebase Authentication (Email / Password)

1. Create a Firebase project and register a Web app in Project settings.
2. In Authentication → Sign-in method, enable **Email/Password**.
3. Copy `.env.example` to `.env.local` and fill in the four `NEXT_PUBLIC_FIREBASE_*` values from the Web app configuration.
4. Set `FIREBASE_PROJECT_ID` to the same project. Basic signature, audience, issuer and expiry validation needs only the project ID. To additionally check disabled users and revoked sessions, configure an Admin SDK service account using either the server-only `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` variables or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a JSON file outside the repository. Never commit service account credentials.
5. Restart `npm run dev` after changing environment variables.

Firebase manages passwords and persists the browser session. The application verifies ID tokens with the Admin SDK (including revocation when service account credentials are configured) and links local profiles by unique Firebase UID. Message purchases require a verified token; client-supplied nicknames are not used for authorization. Existing local accounts require a separate migration; they are never automatically linked by email. If profile creation fails after Firebase signup (for example a nickname collision), choose another nickname and retry, or sign in and use “Finish an incomplete registration”.

Validation: `npm run build`. To test against your configured project, register a new email, reload, sign out, sign back in, and check that replacing a message works only while signed in. Without Firebase credentials, real signup/login cannot be tested.

Official setup: https://firebase.google.com/docs/auth/web/password-auth
Token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens

## Message boards

The home page includes a 64-cell live board (1, 7 or 30 days), a paginated permanent wall, and an archive of expired temporary messages. Rates live in `lib/board-plans.js` and are always resolved on the server; client-supplied prices and expiration dates are ignored. Temporary cells are available again at their expiry timestamp; no cron job is required. Permanent cells cannot be overwritten. The permanent wall exposes additional pages as its last row fills.

Board placements are **demo only**: no payment is collected. Do not treat a reservation response as a payment confirmation. Before accepting payments, add a provider checkout/webhook flow that verifies payment and claims the cell atomically, with a refund policy for conflicts. “Forever” refers to the lifetime of the service subject to content rules.

Profiles show the latest 100 board placements and counts for published, active and permanent messages.

Run `node --test tests/*.test.cjs` for Firebase guard, retired-route, board plan, collision, expiry/archive, and permanent-wall expansion checks. Board tests use an isolated temporary SQLite database.

## Returning to a draft and sharing

A board draft is saved in sessionStorage for up to seven days. The sign-in/registration links preserve a validated local return URL and restore the selected cell, duration and text. Storage is best-effort when the browser blocks it.

A message can be shared through `/?message=<id>#boards`. The ID identifies the original placement, so the link remains valid after expiration or reuse of its cell. Public profile responses do not include account email. Leaderboard positions are ordered primarily by published-message count on the boards; all value totals are demo values.

The single-message Spotlight format has been retired. Its previous API routes return HTTP 410, and `/history` redirects to the boards. Legacy database records are retained but no longer affect public rankings or profiles.
