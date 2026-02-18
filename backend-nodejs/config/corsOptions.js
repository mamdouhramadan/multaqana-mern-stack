// Import the list of allowed origins from the separate configuration file
const allowedOrigins = require('./allowedOrigins');

// Define CORS (Cross-Origin Resource Sharing) configuration options
const corsOptions = {
  // The 'origin' function controls which domains are allowed access
  origin: (origin, callback) => {
    const allowed = allowedOrigins.indexOf(origin) !== -1;
    const noOrigin = !origin;
    // In production, reject requests without origin (e.g. direct API calls without a browser)
    const allowNoOrigin = noOrigin && process.env.NODE_ENV !== 'production';
    if (allowed || allowNoOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers to be sent with the request
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Export properties to be used by the cors middleware in server.js
module.exports = corsOptions;
