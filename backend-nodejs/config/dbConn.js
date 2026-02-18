const mongoose = require('mongoose'); // Import mongoose to interact with MongoDB

// Define an asynchronous function to connect to the database
const connectDB = async () => {
  // Skip connection if in test mode (tests/setup.js handles it)
  if (process.env.NODE_ENV === 'test') return;

  try {
    // Attempt to connect to MongoDB using the connection string from environment variables
    // process.env.MONGO_URI should be defined in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If successful, log the hostname of the database we connected to
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // If connection fails, log the error message
    console.error(`Error: ${err.message}`);

    // Exit the entire Node.js process with a failure code (1)
    // This prevents the server from trying to run without a database connection
    process.exit(1);
  }
};

// Export the function so it can be called in server.js
module.exports = connectDB;
