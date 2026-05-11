# Miss Bato 2026 Voting Poll

## Production Deployment Checklist

### 1. Vercel Configuration
The project is configured with `vercel.json` to handle client-side routing. All requests are redirected to `index.html`.

### 2. Firebase Console Settings
To ensure the app works on your production domain (`https://missbato2026.vercel.app/`):
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `gen-lang-client-0206570504`.
3. Go to **Authentication** > **Settings** > **Authorized Domains**.
4. Add `missbato2026.vercel.app` to the list.

### 3. Environment Variables
On Vercel, you should set the following environment variables (from `firebase-applet-config.json`):
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`

### 4. Security
- **Firestore Rules**: Hardened with schema validation, atomic batch checks, and identity verification.
- **Admin Access**: Restricted to `aemann1025@gmail.com`.
- **Voting**: One vote per verified user, enforced by Firestore rules.
