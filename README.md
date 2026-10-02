# ABDUAZIZ IT ACADEMY

Premium academy website and role-based management platform built with React, TypeScript, and Vite.

## Development

```sh
npm install
npm run dev
```

## Demo access

- Admin login is intentionally hidden from public navigation. Press `Ctrl+Shift+L` and enter the initial admin email and access code supplied to the academy owner.
- Director login uses the same hidden entry point and the separate director credentials supplied to the owner.
- Student demo: `student@academy.uz` with access code `student123`, or create a student account from the public registration flow.

Credential changes are available under Security in the respective management panel. Codes are masked in the interface.

## Data and security

The typed data provider in `src/data.ts` uses localStorage and seeded demonstration data so the application works without a backend. This is a prototype architecture, not production authentication or authorization: browser storage and client-side checks can be modified by the user. Before handling real student data, connect a server-side identity provider, database, permission checks, and audit logging.
