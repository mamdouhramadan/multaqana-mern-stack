// Allowed CORS origins: from ALLOWED_ORIGINS (comma-separated) or fallback to defaults for development.
// Example .env: ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  'http://localhost:5000'
];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [];

const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultOrigins;

module.exports = allowedOrigins;
