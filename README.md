# ABDUAZIZ IT ACADEMY

Premium academy website and role-based management platform built with React, TypeScript, and Vite.

## Live site

https://abduaziz475.github.io/abduaziz-it-academy/

## Development

```sh
npm install
npm run dev
```

Every push to `main` builds and deploys the site to GitHub Pages through the workflow in `.github/workflows/pages.yml`.

## Separate portals

- Student portal: `/user`
- Admin login: `/admin/login`; after successful login the dashboard is `/admin/dashboard`.
- Director login: `/director/login`; after successful login the dashboard is `/director/dashboard`.
- Student demo: `student@academy.uz` with access code `student123`, or create an account from the public registration flow.

Each login accepts only its assigned role. GitHub Pages deep links are restored through `public/404.html`.

Credential changes are available under Security in the respective management panel. Codes are masked in the interface.

## Data and security

The typed data provider in `src/data.ts` uses localStorage and seeded demonstration data so the application works without a backend. This is a prototype architecture, not production authentication or authorization: browser storage and client-side checks can be modified by the user. Before handling real student data, connect a server-side identity provider, database, permission checks, and audit logging.
