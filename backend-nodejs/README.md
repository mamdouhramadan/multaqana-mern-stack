# Backend (Node.js)

REST API and real-time server for the Multaqana organizational portal. Built with Node.js, Express, MongoDB, and Socket.io. Handles authentication, content management, HR (attendance, leave, holidays), chat, and admin operations.

---

## Technologies

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js (≥18) | JavaScript server runtime |
| **Framework** | Express 4.x | HTTP server, routing, middleware |
| **Database** | MongoDB | Document store |
| **ODM** | Mongoose 8.x | Schemas, models, validation, queries |
| **Real-time** | Socket.io 4.x | WebSockets for chat and live updates |
| **Auth** | JWT (jsonwebtoken) | Access & refresh tokens; cookie-parser for cookies |
| **Security** | Helmet, CORS, express-rate-limit | Headers, origin control, rate limiting |
| **Validation** | express-validator | Request validation and sanitization |
| **File upload** | Multer | Multipart uploads (images, PDFs, videos) |
| **Image processing** | Sharp | Resize/optimize uploaded images |
| **Email** | Nodemailer | Verification, password reset, notifications |
| **Logging** | Winston | Structured logs (file + console) |
| **Passwords** | bcrypt | Hashing and comparison |
| **Utilities** | dotenv, colors, slugify, uuid | Env, CLI colors, slugs, IDs |

---

## Database (MongoDB)

- **Connection:** Configured via `MONGO_URI` in `.env`. Connection is established in `config/dbConn.js` using Mongoose.
- **Database name:** Typically set in the URI (e.g. `multaqana` or `multaqana_db`).

### Models (Mongoose schemas)

| Model | Description |
|-------|-------------|
| `User` | Users, roles, profile, auth fields |
| `Role` | Roles and permissions (User, Employee, Editor, Admin) |
| `Department` | Organizational departments |
| `Position` | Job positions |
| `Category` | Content categories |
| `News` | News articles |
| `Magazine` | Magazines (e.g. PDF) |
| `Video` | Video metadata and storage refs |
| `PhotoAlbum` | Photo albums and images |
| `FAQ` | FAQ entries |
| `File` | File/document management |
| `Application` | Enterprise app directory (links, logos) |
| `Event` | Events / calendar |
| `Attendance` | Employee clock-in/out |
| `LeaveRequest` | Leave requests (annual, sick, unpaid) |
| `Holiday` | Holidays |
| `Settings` | Global app settings |
| `Notification` | User notifications |
| `Conversation` | Chat conversations |
| `Message` | Chat messages |

---

## Project structure

```
backend-nodejs/
├── config/           # DB connection, CORS, rate limiters, roles, permissions, logger
├── controllers/      # Request handlers (auth, CRUD, chat, etc.)
├── middleware/       # Auth (verifyJWT), permissions, upload, sanitization, error handler
├── models/           # Mongoose models (see table above)
├── routes/           # Express routers mounted under /api/...
├── validator/       # express-validator schemas per resource
├── utils/            # Helpers (catchAsync, appError, apiResponse, sendEmail, etc.)
├── seeder/           # Seed scripts (roles, settings, employee role, full import)
├── tests/            # Jest + Supertest (e.g. auth, attendance, settings)
├── public/           # Static files
├── server.js         # Entry: Express app, Socket.io, routes, error handler
├── .env.example      # Example environment variables
└── package.json
```

---

## Environment variables

Copy `.env.example` to `.env` and set values. Required in non-test environments:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Secret for JWT access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for JWT refresh tokens |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (e.g. frontend URL) |
| `FRONTEND_URL` | Frontend base URL (verification/reset links) |

Optional (email): `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start with Nodemon (auto-reload) |
| `npm start` | Start production server (`node server.js`) |
| `npm test` | Run Jest tests (uses in-memory MongoDB when configured) |
| `npm run test:quick` | Run tests excluding slow auth suite |
| `npm run test:auth` | Run only auth tests |
| `npm run data:seed-roles` | Seed roles and permissions from `roles.json` |
| `npm run data:seed-employee` | Add Employee role if missing |
| `npm run data:seed-settings` | Seed default settings |
| `npm run data:seed-all` | Run seed-roles, seed-employee, seed-settings |
| `npm run data:migrate-roles` | Migrate roles (e.g. after schema changes) |
| `npm run data:upgrade-admin` | Upgrade a user to admin |
| `npm run data:import` | Destroy then import main seeder data |
| `npm run data:destroy` | Destroy data from main seeder |

---

## API routes (prefix `/api`)

| Path | Description |
|------|-------------|
| `/auth` | Login, signup, refresh, logout, verify email, forgot/reset password |
| `/users` | User CRUD (admin) |
| `/roles` | Role management |
| `/employees` | Employee directory / profile |
| `/departments` | Departments |
| `/positions` | Positions |
| `/categories` | Categories |
| `/news` | News articles |
| `/magazines` | Magazines |
| `/videos` | Videos |
| `/albums` | Photo albums |
| `/faqs` | FAQs |
| `/files` | File management |
| `/applications` | Applications directory |
| `/events` | Events |
| `/attendance` | Attendance (clock in/out) |
| `/leaves` | Leave requests |
| `/holidays` | Holidays |
| `/settings` | Global settings |
| `/notifications` | Notifications |
| `/chat` | Chat (REST helpers; real-time via Socket.io) |

Auth uses stricter rate limiting; general `/api` routes are rate-limited (e.g. 100 requests per 15 minutes). Protected routes use JWT and optional permission checks (`verifyJWT`, `verifyPermission`).

---

## Security and middleware

- **Helmet:** Secure HTTP headers.
- **CORS:** Allowed origins from `ALLOWED_ORIGINS`.
- **Rate limiting:** Stricter on `/api/auth`; general limit on `/api`.
- **Body sanitization:** NoSQL injection prevention on request body.
- **JWT:** Access token (short-lived) and refresh token; optional HttpOnly cookies.
- **Roles:** `User`, `Employee`, `Editor`, `Admin` (see `config/roles_list.js`). Permissions defined in `config/permissions` and enforced via `verifyPermission`.

---

## Real-time (Socket.io)

- Socket.io is attached to the same HTTP server as Express.
- Connection is protected by JWT verification.
- Used for chat (messages, typing, reactions), notifications, and other real-time features.
- CORS for Socket.io is aligned with the API CORS config.

---

## Testing

- **Jest** for test runner.
- **Supertest** for HTTP requests to the Express app.
- **mongodb-memory-server** (or similar) for in-memory MongoDB in tests when configured.
- Tests live in `tests/` (e.g. `auth.test.js`, `attendance.test.js`, `settings.test.js`). Helpers and setup in `tests/helpers.js` and `tests/setup.js`.

---

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env: set MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ALLOWED_ORIGINS, FRONTEND_URL
npm run data:seed-all   # optional: seed roles and settings
npm run dev
```

Server runs at `http://localhost:5000` (or your `PORT`). API base: `http://localhost:5000/api`.

---

## Postman collection

A Postman collection is provided so you can call the API from [Postman](https://www.postman.com/) or compatible tools.

- **Download:** [postman_collection.json](postman_collection.json) (in this folder). In GitHub, open the file and use *Raw* or *Download* to get the JSON.
- **Import:** In Postman, **File → Import** and select `postman_collection.json`, or drag and drop the file.

### How to use

1. **Set the base URL**  
   The collection uses a variable `baseUrl` (default: `http://localhost:5000/api`). To change it: select the collection → **Variables** tab → edit `baseUrl` (e.g. for a remote server).

2. **Get a JWT token**  
   Run **Auth → Login** with a valid `user-email` and `user-password`. You can set these in **Collection variables** or in a Postman Environment. The response’s `accessToken` is automatically stored in the `jwt_token` variable.

3. **Call protected routes**  
   All other folders (Users, News, Applications, etc.) use **Bearer Token** auth with `{{jwt_token}}`. After a successful login, those requests will use the saved token.

4. **Optional variables**  
   After creating a resource (e.g. an application or FAQ), the collection can auto-save its ID into variables like `app-id`, `faq-id`, etc., so “Get Single”, “Update”, and “Delete” requests work without editing URLs. Run the “Create” request first to populate them.
