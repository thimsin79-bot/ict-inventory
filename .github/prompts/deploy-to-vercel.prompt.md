---
name: Deploy to Vercel
description: Push verified project changes to Git and confirm the connected Vercel deployment
argument-hint: [commit message or deployment notes]
agent: agent
---

Deploy this project to Vercel using the Git-connected deployment workflow. Treat the supplied argument as context, not permission to include unrelated work.

1. Inspect the current branch, Git status, remotes, and recent changes. Identify the intended deployment branch and confirm that the Vercel project is connected to this repository and uses that branch for production deployments. If the target or connection is unclear, stop and ask before pushing.
2. Review the changes and run the relevant checks. For this project, run `npm run lint`, `npm run typecheck`, and `npm run build` when dependencies are available. Fix only issues caused by the requested changes; report pre-existing failures.
3. Create or update the repository-root `deploy.md` with the actual setup and deployment procedure, including required environment variables and database preparation. Do not include secret values. Do not run destructive production database commands or seed demo data in production.
4. Stage only the intended files, including `deploy.md`. Never include unrelated or pre-existing user changes, secrets, `.env` files, build output, or local database data. Create a commit using the supplied message when provided; otherwise use a concise descriptive message. Do not amend or rewrite existing commits.
5. Push the commit to the confirmed deployment branch. A Git push triggers a Vercel deployment only when the Vercel project is connected and configured to deploy that branch. Do not claim that deployment succeeded based on the push alone.
6. Verify the resulting deployment in Vercel, using available project tooling or the deployment dashboard. Report the deployment URL and status only when verified; otherwise state exactly what could not be checked and what the user must do next.
7. Summarize checks, commit and branch, push result, Vercel deployment status, and confirm whether `deploy.md` is included in the deployed revision.

