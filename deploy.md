# Deployment

This application runs on Next.js and requires a persistent PostgreSQL database. A Git push deploys the app only after the repository is connected to a Vercel project and the pushed branch is configured for deployments.

## One-time setup

1. Create or select a managed PostgreSQL database and keep its connection string available. Use a provider that permits connections from Vercel and supports TLS as required by that provider.
2. Import this Git repository into Vercel. Select the Next.js framework preset and the repository root as the project root. Keep the standard Next.js build settings (`npm run build`); no custom output directory is needed.
3. In the Vercel project settings, configure the production Git branch (commonly `main`) and enable deployments for pushes to that branch.
4. Add these Production environment variables in Vercel:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Connection URL for the managed PostgreSQL database |
   | `SESSION_SECRET` | A unique, random secret; generate a value with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

   Add the same variables to Preview if preview deployments should connect to a database. Prefer a separate non-production database for previews. Never commit `.env` files or paste secret values into source control.
5. Apply the Drizzle schema to the target database before using the deployed app. Set `DATABASE_URL` locally to the intended database and run `npm run db:push`, reviewing any prompts before accepting schema changes. Do not run `npm run db:reset` against production; it wipes data and seeds demo accounts.
6. Optionally set `REDIS_URL` if live events must be shared across multiple server instances. It is not required for a single instance.

## Deploy updates

1. Review the intended changes and confirm no unrelated edits or secrets will be included.
2. Run the project checks locally:

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

3. Commit and push the intended changes to the configured production branch. For the first push of a local branch, set its upstream as needed, for example `git push -u origin main`.
4. In Vercel, check the deployment created for that commit. A successful Git push is not proof that the build or deployment succeeded.
5. Open the deployed URL and check the application. If the build fails, inspect the Vercel build log; if database-backed pages fail, verify the environment variables, database connectivity, and that the schema was applied.

## Database changes

The project provides `npm run db:push`, `npm run db:generate`, and `npm run db:migrate`. Vercel's standard build does not run these scripts automatically. Apply schema changes deliberately to the correct database before relying on application code that uses them. For repeatable production releases, generate and review migrations, commit them, and apply them through an explicitly managed migration step. Do not expose production credentials in build logs or source control.

## Current project notes

- Required runtime variables are `DATABASE_URL` and `SESSION_SECRET`; `REDIS_URL` is optional.
- The repository does not contain a Vercel project configuration, so confirm the project is linked and its production branch is configured in the Vercel dashboard.
- The README mentions a legacy Vercel URL. Do not assume that deployment is connected to this repository revision or backed by the current PostgreSQL setup; verify the active Vercel project and deployment before sharing a URL.