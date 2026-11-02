# Customer 360 — implementation and verification

## Architecture
React/TypeScript on the existing Vinext/Cloudflare runtime. D1 holds records, workspace memberships, invitations, notification preferences, notification events and append-only API audit events. R2 stores evidence. Sites provides authenticated identity. Do not expose the Worker outside the trusted Sites gateway: identity headers are trusted only behind that gateway.

## Fixed workflows
- Empty authenticated workspaces stay empty and save to D1; anonymous preview remains explicitly temporary.
- Organization collaboration uses explicit invitations and acceptance. Personal records retain their original workspace; joining another workspace does not migrate or expose those records.
- Administrators manage memberships. Leadership has workspace visibility; function heads are scoped by function, relationship owners by assignment, and action owners by assigned action. Restricted records and restricted customer context require creator/explicit email grants, including for administrators.
- Server checks cover records, search, derived notifications and evidence downloads. Mutations record attribution and an audit event in the same database transaction.
- Customer, meeting, feedback, action and escalation records persist. Source records must belong to the same customer and be accessible. Actions need an active member owner and a valid date. Closure requires remarks and any existing confirmation requirement. Optimistic versions reject stale writes.
- Demo import is atomic, explicitly fictional and idempotent. Deterministic IDs never overwrite edited imported records.
- Analytics use authorized saved records, with rolling six-month sentiment charts and customer-specific chart inputs. Customer sentiment and last interaction derive from the latest recorded feedback.
- Server-side search applies permissions and filters before count/pagination (25 results per page).
- Follow-up actions link to their source feedback. Completed meetings can open linked feedback capture.
- Evidence: PDF/PNG/JPEG, signature validation, 5 MB maximum, private R2 objects, authorized downloads. Save a record before attaching evidence. Old base64 evidence is not silently migrated.
- Notification read IDs and preferences persist per user/workspace. Automatic reconciliation while the app is open creates deduplicated database alerts for overdue/due-soon commitments, meetings, missing feedback, critical feedback, escalations and confirmation pending.
- Responsive mobile capture, optional browser speech recognition, full navigation through More, and a home-screen web manifest. No sensitive API responses are cached offline.

## Verification
Commands: `npm run typecheck`, `npm test`, `npm run build`.
Local API workflow suite: `node tests/api.integration.mjs` against dev on 5173.
Built-server authorization suite: `node tests/roles.integration.mjs` against 5175 (TEST_BASE can override).
Import suite: `node tests/import.integration.mjs` uses the fixture written by the role suite. Import, readback and idempotency now pass after draining request bodies. Integration clients isolate connections after rejected writes.
Browser checks: mobile feedback capture successfully saved; desktop search found it after reload. Desktop and mobile layouts inspected.

## Local configuration (deployment excluded)
Keep the existing project ID in .openai/hosting.json. D1 binding is DB; R2 binding is BUCKET. Apply schema migrations in order; never replay applied migrations. Migration 0002 adds workspace membership, invitations, preferences and file metadata. Existing records remain in place.
The first authenticated visitor to a personal workspace receives its administrator membership. Invite colleagues in Administration; they accept on their own sign-in. Site-level private access must also be granted by the owner before colleagues can visit. Application invitations do not change Site sharing.

## Remaining delivery/configuration work
- The local runner checks reminders every five minutes without an open browser. Email and push adapters queue and retry requests but require provider credentials and opt-in; real external delivery is unverified.
- Native Expo source now supports device authentication, customer briefs, feedback, action updates, evidence and device reminders. TypeScript and Android bundle export pass; installable binaries and physical-device testing remain unverified. AI and Microsoft 365 integrations remain optional future phases.
- Writes now atomically update typed domain tables and a foreign-key relationship index alongside compatibility record snapshots. Administrator backfill handles existing records and reports missing legacy links. Search still uses those synchronized snapshots; large-dataset load testing remains outstanding.
- Full accessibility certification, load testing and third-party security review are not claimed. The build currently warns about a large client bundle.
- No real users were invited and no production customer records were created by the tests; tests use local storage only.

