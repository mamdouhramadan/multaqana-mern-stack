# Frontend (React + Vite)

React SPA for the **Multaqana** organizational portal. Bilingual (English / Arabic) with RTL support, admin dashboard, real-time chat, and content modules that consume the backend API.

---

## Technologies

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime / Build** | Node.js, Vite 6 | Dev server, HMR, production build |
| **Framework** | React 19 | UI library |
| **Language** | TypeScript 5.9 | Typing, tooling |
| **Routing** | React Router v7 | Client-side routing, lazy-loaded routes |
| **Styling** | Tailwind CSS v4 | Utility-first CSS; `@tailwindcss/vite`, typography, forms, animate |
| **State** | Zustand | Global state (e.g. theme); React Query for server state |
| **Data fetching** | TanStack React Query v5 | Caching, mutations, devtools |
| **Forms** | React Hook Form + Zod + @hookform/resolvers | Form state, validation, schema |
| **i18n** | i18next, react-i18next, i18next-browser-languagedetector | Translations (EN/AR), RTL, language persistence |
| **Real-time** | Socket.io Client | Chat, live updates |
| **HTTP** | Axios | API client (wrapped in `api/client.ts`) |
| **Auth** | JWT (jwt-decode) | Access/refresh tokens, protected routes |
| **UI primitives** | Radix UI (accordion, dialog, dropdown, label, radio, slot, tooltip) | Accessible components |
| **Design systems** | @aegov/design-system, @aegov/design-system-react, @dubai-design-system/components-react | UAE/Dubai gov components |
| **Rich text** | Tiptap (react, starter-kit) | Editor in admin |
| **Tables** | TanStack React Table | Admin data tables |
| **Carousels / galleries** | Embla Carousel, React Slick, Slick Carousel, Swiper | News, magazines, photos, events |
| **Calendar** | react-big-calendar | Events calendar |
| **Lightbox** | yet-another-react-lightbox | Image viewing |
| **QR** | react-qr-code | QR codes (e.g. app download) |
| **Animations** | Framer Motion, Lottie (lottie-react) | Transitions, Lottie assets |
| **URL state** | nuqs | Query params (e.g. filters, pagination) |
| **Toasts** | react-hot-toast | Notifications |
| **Icons** | @phosphor-icons/react | Icon set |
| **Utilities** | date-fns, clsx, tailwind-merge, class-variance-authority (cva) | Dates, class names, variants |
| **Drawer** | Vaul | Slide-out panels |

---

## Project structure

```
frontend-nextjs/
├── public/                 # Static assets
├── src/
│   ├── api/                # API modules (client, auth, chat, departments, positions, roles, users, etc.)
│   ├── assets/             # Images, icons, CSS (global.css, site.css)
│   ├── components/         # Reusable UI
│   │   ├── admin/          # DataTable, AdminSidebar, AdminHeader, PublishSidebar, etc.
│   │   ├── auth/           # LoginForm, LogoutDrawer, ProtectedRoute, GuestOnlyRoute, RegisterRouteGuard
│   │   ├── chat/           # ChatWindow, ConversationView, MessagesList, MessageInput, etc.
│   │   ├── features/       # News, events, applications, profile, auth forms
│   │   ├── home/           # Home sections (Hero, News, Albums, Events, Files, CTA, etc.)
│   │   ├── layout/         # MainLayout, Sidebar, Header (desktop/mobile), Footer, StickyFooter
│   │   └── ui/             # Buttons, inputs, drawers, modals, Spinner, image-upload, etc.
│   ├── config/             # site.ts (logos, social, placeholder)
│   ├── data/               # sidebarMenu, static data
│   ├── hooks/               # useGetData, useMutateData, useSocket, useAttendance
│   ├── i18n/                # i18next config (EN/AR, RTL, detection)
│   ├── layout/              # MainLayout, AdminLayout
│   ├── locales/             # en/translation.json, ar/translation.json
│   ├── pages/
│   │   ├── auth/            # Login, Register
│   │   ├── website/         # Home, Search, MagazineGrid, VideoGallery, MasonryPhotoGallery, EmployeeList, FaqPage, FilesPage, ApplicationsPage, AttendancePage, NotFound, ServerError
│   │   └── admin/           # Dashboard, Profile, Settings, CRUD (applications, employees, videos, photos, magazines, events, faqs, files, news, roles, users), messages
│   ├── providers/           # ThemeProvider, AuthProvider, SettingsProvider
│   ├── routers/             # createBrowserRouter, lazy routes, guards
│   ├── schemas/              # Zod schemas (news, file, faq, event, magazine, photo, video, employee, application)
│   ├── services/             # authService, socketService
│   ├── store/                # Zustand (e.g. useThemeStore)
│   ├── types/                # TypeScript types (user, role, chat, settings, swiper)
│   ├── utils/                # errorHandler, etc.
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components.json          # shadcn/ui config
├── index.html
├── package.json
├── tailwind.config.*        # Tailwind v4 (if present)
├── tsconfig.*
└── vite.config.ts
```

---

## Features

- **Bilingual (EN/AR) and RTL**  
  i18next with `locales/en` and `locales/ar`; language detection (localStorage + browser); document `dir`/`lang` and layout switch for RTL.

- **Public website**  
  Home (hero, news, magazines, events, photo albums, files, employees, CTAs), Search, Magazine grid, Video gallery, Masonry photo gallery, Employee list, FAQ, Files, Applications directory, Attendance (clock in/out).

- **Authentication**  
  Login, Register (with route guard), JWT access/refresh, protected and guest-only routes, logout drawer.

- **Admin dashboard**  
  Dashboard, Profile, Settings (with SettingsProvider and document head). CRUD for: Applications, Employees, Videos, Photo albums, Magazines, Events, FAQs, Files, News, Roles, Users. Data tables with pagination, filters, and toolbars; forms with validation (Zod + React Hook Form) and image/file uploads; Tiptap rich text where needed.

- **Real-time chat**  
  Socket.io-based messaging: conversations list, conversation view, message input, reactions, typing indicators; admin Messages area (layout, conversation by ID).

- **Theme**  
  Light/dark mode (ThemeProvider, useThemeStore, mode toggle in header).

- **Settings-driven UI**  
  SettingsProvider loads public settings from the API; SettingsDocumentHead and config (e.g. site name) for document title and meta.

- **Error handling**  
  Error boundaries, ServerError and NotFound pages, toast notifications (react-hot-toast), and centralized API/error handling (e.g. utils/errorHandler).

- **Performance**  
  Lazy-loaded routes (React.lazy + Suspense), code-split pages and admin screens.

---

## Prerequisites

- **Node.js** 18+
- **npm** (or pnpm / yarn)

Backend API must be running and reachable (see root and backend README).

---

## Environment variables

Create `.env` from `.env.example` and set at least:

- `VITE_API_URL` – base URL of the backend API (e.g. `http://localhost:5000`).

Other `VITE_*` variables can be added for feature flags or public config if needed.

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env: set VITE_API_URL to your backend URL (e.g. http://localhost:5000)
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). For admin and protected routes, log in with a user that has the required role/permissions on the backend.
