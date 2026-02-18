const request = require('supertest');

// Mock sendEmail to prevent timeout (must be before imports that use it)
jest.mock('../utils/sendEmail', () => jest.fn(() => Promise.resolve()));

require('./setup');
const app = require('../server'); // We need to export app from server.js
const { createTestUser } = require('./helpers');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import bcrypt to mock it

// Mock bcrypt to avoid slow hashing/comparing
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
  compare: jest.fn((plain, hash) => Promise.resolve(plain === 'password123')) // Only match specific password
}));

// ... [rest of imports/mocks] ...

describe('Auth Endpoints', () => {

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          phoneNumber: '+971501234567',
          age: 25,
          address: 'Dubai',
          emiratesId: '784-1234-1234567-1'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
        });
      expect(res.statusCode).toEqual(400); // Or whatever validation error code
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create user manually in DB to login
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        // Since we mocked bcrypt.compare to check for 'password123', the stored hash doesn't matter for the mock logic, 
        // but we keep it realistic.
        password: 'hashed_password_placeholder',
        roles: { User: 2001 }
      });
    });

    it('should login successfully', async () => {
      // Use the user created in beforeEach
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail with wrong password', async () => {
      // Use the user created in beforeEach
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
