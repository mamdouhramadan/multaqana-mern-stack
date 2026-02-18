# Backend (Node.js)

## Data / seed scripts

| Command | Description |
|--------|-------------|
| `npm run data:seed-roles` | Seed roles and permissions from `roles.json` |
| `npm run data:seed-employee` | Add the Employee role if missing |
| `npm run data:seed-settings` | Seed default settings |
| `npm run data:seed-all` | Run seed-roles, seed-employee, and seed-settings in sequence |
| `npm run data:migrate-roles` | Migrate roles (e.g. after schema changes) |
| `npm run data:upgrade-admin` | Upgrade a user to admin |
| `npm run data:import` | Destroy then import main seeder data |
| `npm run data:destroy` | Destroy data from main seeder |
