const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('colors'); // Import colors to style console output


let mongoServer;

// Connect to the in-memory database before running any tests.
// Connect to the in-memory database before running any tests.
beforeAll(async () => {
  // Console Log Details:
  // What: Log start of connection
  // Why: To verify test setup is initializing
  console.log('🛑 setup.js: Disconnecting existing mongoose connections...'.red);
  // Prevent Mongoose from using the existing connection if any
  await mongoose.disconnect();

  console.log('💾 setup.js: Starting MongoMemoryServer...'.blue);
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log(`✨ setup.js: MongoMemoryServer ready at ${mongoUri}`.cyan);

  console.log('🔌 setup.js: Connecting mongoose to In-Memory DB...'.yellow);
  await mongoose.connect(mongoUri);
  console.log(`✅ setup.js: Mongoose connected to ${mongoose.connection.host}`.green.bold);
});

// Run before each test
beforeEach(() => {
  // Console Log Details:
  // What: Log the name of the test starting
  // Why: To easily track which test is running in the console output
  const testName = expect.getState().currentTestName;
  console.log(`\n🚀 STARTING TEST: ${testName}`.bgBlue.white.bold);
});

// Clear all test data after every test.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }

  // Console Log Details:
  // What: Log completion of the test
  // Why: To confirm the test finished and DB was cleaned
  const testName = expect.getState().currentTestName;
  console.log(`🏁 FINISHED TEST: ${testName}\n`.bgGreen.black.bold);
});

// Remove and close the database and server.
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
