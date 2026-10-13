# Google and Zoho OAuth Redirect Runbook

Step-by-step guide for updating the OAuth redirect URIs used by the Kluvo platform. Use it after a domain change, when adding a Clerk domain, or when Google or Zoho sign-in fails with `redirect_uri_mismatch`.

Current primary domain: **www.kluvo.ai** (Clerk frontend API `https://clerk.kluvo.ai`). `kluvo.io` and `event-site-manager.com` 301-redirect to it.

---

## 1. Google sign-in (Clerk social connection)

Google sign-in on every site (hub and satellites) goes through Clerk. Google sends the user back to **Clerk's** callback, not to the app, so only the Clerk frontend API host needs to be registered.

### Where it lives

| Item | Value |
|---|---|
| Console | [Google Cloud Console → Google Auth Platform → Clients](https://console.cloud.google.com/auth/clients) |
| Project | **OauthLocal** (project id `oauthlocal-310103`) |
| OAuth client | **kccna_app** (Web application, created Oct 17, 2021) |
| Client ID | `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m.apps.googleusercontent.com` |
| Not used | `Web client 1` in the same project |
| Consumer | Clerk Dashboard → production instance → Configure → SSO connections → Google (custom credentials) |

### Steps

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select the **OauthLocal** project in the project picker.
2. Go to **Google Auth Platform → Clients** and click **kccna_app**.
3. Under **Authorized redirect URIs**, click **+ Add URI** and enter:
   ```
   https://clerk.kluvo.ai/v1/oauth_callback
   ```
4. Click **Save**. Google notes it can take from 5 minutes to a few hours to take effect.
5. Test: sign out, open `https://www.kluvo.ai/sign-in`, choose **Continue with Google**, and confirm you land back signed in.

### Current redirect URIs (Oct 13, 2026)

| # | URI | Status |
|---|---|---|
| 1 | `https://clerk.adwiise.com/v1/oauth_callback` | Legacy |
| 2 | `https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback` | Clerk development instance |
| 3 | `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback` | Legacy |
| 4 | `https://www.mosc-temp.com/sso-callback` | Legacy |
| 5 | `https://clerk.event-site-manager.com/v1/oauth_callback` | Previous primary; remove once kluvo.ai sign-in is confirmed |
| 6 | `https://clerk.kluvo.ai/v1/oauth_callback` | **Current production** |

### Notes

- Satellites (mosc-temp, giventa, kcnj, and others) do **not** need their own redirect URIs. Sign-in happens on the primary domain, and Clerk hands the session back to the satellite.
- Authorized JavaScript origins are not required for the Clerk-hosted flow; leave the existing entries alone.
- If Clerk's production domain changes again, the new value is always `https://clerk.<primary-bare-domain>/v1/oauth_callback`. Confirm it under Clerk Dashboard → Domains → Frontend API.
- The client secret is stored only in the Clerk Dashboard Google connection. If you rotate it in Google Cloud, paste the new secret into Clerk the same day.

---

## 2. Zoho SalesIQ OAuth (server-based app)

Used to obtain a `ZOHO_REFRESH_TOKEN` for SalesIQ automation (for example, bulk article scripts). It is an admin-only, run-once flow, not end-user sign-in.

### Where it lives

| Item | Value |
|---|---|
| Console | [Zoho API Console](https://api-console.zoho.com/) (US data center; `ZOHO_ACCOUNTS_BASE_URL` is unset, so the code uses `https://accounts.zoho.com`) |
| Client type | Server-based Application |
| Client ID | Starts with `1000.EYHWE46…` (stored as `ZOHO_CLIENT_ID`) |
| Routes (hub repo only) | `src/app/oauth/zoho/start/route.ts`, `src/app/oauth/zoho/callback/route.ts` |
| Redirect logic | `src/lib/zoho/salesiq-oauth.ts` → `getZohoOAuthRedirectUri()` |

### Steps

1. Sign in to [https://api-console.zoho.com/](https://api-console.zoho.com/) with the Zoho account that owns the SalesIQ portal (`giventainc`).
2. Open the **Server-based Application** whose Client ID starts with `1000.EYHWE46`.
3. In **Client Details → Authorized Redirect URIs**, add:
   ```
   https://www.kluvo.ai/oauth/zoho/callback
   ```
   Keep `http://localhost:3000/oauth/zoho/callback` for local runs. Remove `https://www.event-site-manager.com/oauth/zoho/callback` after the new one works.
4. Click **Update**.
5. Confirm `ZOHO_OAUTH_REDIRECT_URI=https://www.kluvo.ai/oauth/zoho/callback` in Amplify (already set on test-site, giventa, kcnj-temp, mcefee-temp, keralacenter).

### Running the flow

The `/oauth/zoho/*` routes exist only in the **hub** (`event-site-manager`). The hub's Amplify app has no `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET`, so the production callback reports that credentials are missing. Two options:

- **Local (recommended):** put `ZOHO_CLIENT_ID` and `ZOHO_CLIENT_SECRET` in `event-site-manager/.env.local`, run `npm run dev`, open `http://localhost:3000/oauth/zoho/start`, then copy the refresh token from the success page into `.env.local`. Local runs always use the localhost callback regardless of `ZOHO_OAUTH_REDIRECT_URI`.
- **Production:** add `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` and `ZOHO_OAUTH_REDIRECT_URI` to the hub Amplify app (`d3gov7yn1ctow1`), redeploy, then open `https://www.kluvo.ai/oauth/zoho/start`.

Zoho requires an exact match between the `redirect_uri` sent by the app and a registered URI, including scheme, host and path.

---

## 3. Checklist after a primary domain change

- [ ] Google: add `https://clerk.<new-domain>/v1/oauth_callback` to **kccna_app** (project OauthLocal).
- [ ] Zoho: add `https://www.<new-domain>/oauth/zoho/callback` to the server-based app.
- [ ] Amplify: update `ZOHO_OAUTH_REDIRECT_URI` on every app that has it.
- [ ] Test Google sign-in on the primary domain and one satellite.
- [ ] After a week of normal use, remove the old domain's redirect URIs from Google and Zoho.

## Related

- [Clerk v7 migration and auth fix](../clerk_authentication_v7_upgrade/CLERK_V7_MIGRATION_AND_AUTH_FIX.html), section 7 (Google Cloud Console configuration)
- `.cursor/rules/clerk_auth_satellite_v7_handshake.mdc`
