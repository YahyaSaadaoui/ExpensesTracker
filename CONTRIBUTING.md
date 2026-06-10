# Contributing

Thanks for considering a contribution to ExpensesTracker.

This project is a practical Next.js personal-finance dashboard. Contributions should make the app easier to run, easier to understand, or more useful for tracking and reporting expenses.

## Good First Contributions

- Add validation around CSV or JSON import payloads.
- Add unit tests for helpers in `src/lib`.
- Add a yearly summary endpoint and chart.
- Add sample Supabase schema SQL.
- Improve loading, empty, and error states in dashboard tables.
- Add screenshots to the README.
- Improve export formats for PDF or spreadsheet workflows.

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` before testing Supabase-backed routes:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Before Opening a PR

Please check the following:

- The app starts with `npm run dev`.
- `npm run lint` passes, or the PR explains any existing lint issue.
- New UI changes include a short description and screenshots when useful.
- No real financial data, credentials, Supabase keys, or personal data are committed.

## PR Template

```markdown
## Summary
Briefly explain what changed.

## Testing
- Ran `npm run dev`
- Ran `npm run lint`

## Notes
Mention follow-up work, limitations, or screenshots if relevant.
```

## Security

Do not commit real expense data, service-role keys, JWT secrets, database dumps, or private user information. Use fake data in examples and screenshots.
