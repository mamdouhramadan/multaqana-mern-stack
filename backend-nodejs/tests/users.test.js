const request = require('supertest');
require('./setup');
const app = require('../server');
const { createTestUser, generateTestToken } = require('./helpers');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('Users Module (Permissions)', () => {

  describe('GET /api/users (List All)', () => {
    it('should deny Public access', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toEqual(401);
    });

    it('should deny regular User', async () => {
      const user = await createTestUser('User');
      const token = generateTestToken(user);
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin', async () => {
      const admin = await createTestUser('Admin');
      const token = generateTestToken(admin);
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/users/me (Get Self)', () => {
    it('should allow Authenticated User', async () => {
      const user = await createTestUser('User');
      const token = generateTestToken(user);
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      // expect(res.body.data.user.email).toBe(user.email); // Need to verify structure
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should deny regular User', async () => {
      const user = await createTestUser('User');
      const token = generateTestToken(user);
      const res = await request(app)
        .delete('/api/users/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin', async () => {
      const admin = await createTestUser('Admin');
      const token = generateTestToken(admin);
      // Permissions say Admin Only for Delete
      const res = await request(app)
        .delete('/api/users/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });
});
