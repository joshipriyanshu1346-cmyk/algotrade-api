# AlgoTrade AI — API (Module 1 + 2: Foundation + Auth)

Auth module supports **email/password** and **Google OAuth**, both issuing the same JWT access token + httpOnly refresh token cookie, so the rest of the app never needs to know which method a user signed in with.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — your local Postgres connection string
- `JWT_ACCESS_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `GOOGLE_CLIENT_ID` — from Google Cloud Console (see below)

Then:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Server runs on `http://localhost:4000`. Health check: `GET /health`.

## Getting a Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID**, application type **Web application**
3. Add your frontend origin (e.g. `http://localhost:5173`) under **Authorized JavaScript origins**
4. Copy the Client ID into `.env` as `GOOGLE_CLIENT_ID`

Note: only the Client ID is needed on the backend — there's no client secret involved, because we use Google Identity Services on the frontend to get an ID token, then verify that token server-side. No OAuth redirect dance required.

## How Google auth works here

This is **not** the old redirect-based OAuth flow. Instead:

1. Frontend loads Google Identity Services and renders the "Sign in with Google" button
2. Google returns an **ID token** directly to the frontend (a signed JWT proving identity)
3. Frontend sends that ID token to `POST /api/auth/google`
4. Backend verifies the token's signature and audience against Google's public keys (via `google-auth-library`), extracts email/name, and creates or matches the user
5. Backend issues the same access + refresh token pair as a normal login

Minimal frontend snippet (React):

```html
<script src="https://accounts.google.com/gsi/client" async></script>
```

```tsx
useEffect(() => {
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: async (response: { credential: string }) => {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      // store data.data.accessToken in memory/state; refresh token is already
      // set as an httpOnly cookie by the server
    },
  });
  window.google.accounts.id.renderButton(
    document.getElementById("google-signin-button"),
    { theme: "outline", size: "large" }
  );
}, []);
```

## Endpoints

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Email/password signup |
| POST | `/api/auth/login` | `{ email, password }` | Email/password login |
| POST | `/api/auth/google` | `{ idToken }` | Google sign-in/sign-up |
| POST | `/api/auth/refresh` | — (reads cookie) | Rotates refresh token, returns new access token |
| POST | `/api/auth/logout` | — (reads cookie) | Revokes the refresh token |
| GET | `/api/auth/me` | — (needs `Authorization: Bearer <accessToken>`) | Current user |

All responses use the standard envelope:
```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "error": {} }
```

## Security notes

- Passwords hashed with bcrypt (12 rounds)
- Access tokens are short-lived JWTs (15m default); refresh tokens are opaque random strings, stored **hashed** in the DB, and rotated on every use (old one revoked when a new one is issued)
- Refresh token lives in an httpOnly, sameSite=lax cookie scoped to `/api/auth` — never exposed to JS
- Rate limiting on `/register`, `/login`, `/google` (20 requests / 15 min)
- `helmet` for security headers, CORS locked to `CLIENT_URL`
- A user who registered with Google and one who registered with email/password using the same address are merged into a single account (matched by email), not duplicated

## Next module

Module 3 — demo trading account: auto-create a virtual account (`demo_accounts` table) the moment a user registers or first logs in via Google.
