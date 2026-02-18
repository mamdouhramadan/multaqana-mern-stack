# Roles & Permissions – Applying to the database

You can apply roles and permissions in two ways: **full seed** (new or reset DB) or **migration** (existing DB with users).

---

## Option 1: Full seed (new or empty database)

Use this when you want a clean DB with roles, users, and all seed data. **This deletes all data** then re-imports.

```bash
cd backend-nodejs
npm run data:import
```

- Imports `seeder/roles.json` into the **Role** collection.
- Imports users and other collections.
- After users are created, assigns the **default role** (the one with `isDefault: true` in `roles.json`) to any user that has no `role` set.

---

## Option 2: Existing database (migration)

Use this when you already have users (with the legacy `roles` object) and want to add the new Role model and `User.role` without wiping data.

### Step 1: Seed roles only (if you don’t have a Role collection yet)

```bash
cd backend-nodejs
npm run data:seed-roles
```

- Reads `seeder/roles.json`.
- Creates Role documents **only if** the Role collection is empty.
- Does not touch users or other collections.

### Step 2: Migrate existing users to the new `role` field

```bash
npm run data:migrate-roles
```

- Ensures Role documents exist (seeds from `roles.json` if the Role collection is empty).
- For every user that has **no** `role` ref:
  - If `user.roles.Admin === 5150` → sets `user.role` to the Admin role.
  - Else if `user.roles.Editor === 1984` → sets `user.role` to the Editor role.
  - Otherwise → sets `user.role` to the User (default) role.
- Leaves users that already have `role` set unchanged.

---

## Summary

| Scenario | Command(s) |
|----------|------------|
| New DB or you want to reset everything | `npm run data:import` |
| Existing DB, first time adding roles | `npm run data:seed-roles` then `npm run data:migrate-roles` |
| Existing DB, roles already seeded, only fix user.role | `npm run data:migrate-roles` |

---

## Environment

Migrations and seeders use the same DB URL as the app:

- `DATABASE_URI` or `MONGO_URI` in `.env`, or
- Default: `mongodb://localhost:27017/multaqana_db`

Ensure `.env` is correct before running any command.

---

## Upgrade a user to Admin (fix 403 on Roles / admin pages)

If you get **403 Forbidden** on `/api/roles` or other admin-only endpoints, your account does not have the Admin role. The JWT is built from the legacy `user.roles` object (numeric codes). To give a user Admin access:

```bash
cd backend-nodejs
npm run data:upgrade-admin -- your@email.com
```

Then **log out and log in again** so a new token (with Admin) is issued. The script sets both `user.role` to the Admin Role ref and `user.roles.Admin = 5150` so the token includes the Admin code.
