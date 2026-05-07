# TestSprite (Playwright)

## Admin suite (`npm run test:admin`)

1. Install browser: `npm run test:install-playwright`
2. Copy `admin-tests/auth.json.example` to `admin-tests/auth.json` with a Clerk **email/password** admin user, **or** set `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD`.
3. Ensure the test user has `user_role` ADMIN in `user_profile` for your tenant.
4. Start the app (any port), then run with the same origin, for example:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3004 npm run test:admin
```

Saved session cookies are written to `admin-tests/.auth-state.json` (gitignored). Delete that file to force a fresh sign-in.

The admin suite includes **Manage Focus Groups** (`/admin/focus-groups`): list table, New Group link, pagination controls, row actions when data exists, and **Create Focus Group** (`/admin/focus-groups/new`).
