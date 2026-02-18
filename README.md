# multaqana-mern-stack

A bilingual (English/Arabic) organizational intranet portal built with the MERN stack.

Multaqana (ملتقانا) is an enterprise portal for organizations, featuring content management (news, magazines, videos, photo albums, FAQs), HR management (employee directory, attendance, leave requests, holidays), real-time chat, events calendar, applications directory, and a full admin dashboard.

## Tech stack

| Layer    | Technologies |
|----------|--------------|
| Backend  | Node.js, Express, MongoDB (Mongoose), Socket.io, JWT |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Query, i18next (EN/AR), Zustand |

## Project structure

| Folder            | Description |
|-------------------|-------------|
| `backend-nodejs/` | Node.js + Express API, MongoDB models, Socket.io server, auth, seeders |
| `frontend-nextjs/` | React + Vite SPA: pages, components, i18n, chat, admin UI |

## Prerequisites

- **Node.js** 18+
- **npm** (or pnpm / yarn)
- **MongoDB** (local or Atlas)

## Getting started

### Backend

```bash
cd backend-nodejs
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
npm run dev
```

Optional: seed roles and defaults:

```bash
npm run data:seed-all
```

### Frontend

```bash
cd frontend-nextjs
npm install
cp .env.example .env
# Edit .env with your API URL (e.g. VITE_API_URL=http://localhost:5000)
npm run dev
```

Open the app at the URL shown (e.g. `http://localhost:5173`).

## Screenshots

The app supports **English** and **Arabic** (with RTL) and includes a public home, admin dashboard, and real-time chat. Screenshot assets are stored in `docs/screenshots/` and can be updated over time.

| Screen   | Description |
|----------|-------------|
| Home     | Landing / home with news, albums, and main sections |
| Admin    | Dashboard for content, users, HR, and settings |
| Chat     | Real-time messaging with Socket.io |

Add your own screenshots as `docs/screenshots/home.png`, `docs/screenshots/admin.png`, `docs/screenshots/chat.png`, etc., and reference them in this section, for example:

<!-- Uncomment and update paths when you add real screenshots -->
<!-- ![Home](docs/screenshots/home.png) -->
<!-- ![Admin](docs/screenshots/admin.png) -->
<!-- ![Chat](docs/screenshots/chat.png) -->

## License

ISC
