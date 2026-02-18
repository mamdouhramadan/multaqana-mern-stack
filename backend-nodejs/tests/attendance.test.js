const request = require('supertest');
require('./setup');
const app = require('../server');
const { createTestUser, generateTestToken } = require('./helpers');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('Attendance Module (Private)', () => {

  describe('GET /api/attendance (Private: User)', () => {
    it('should deny Public access', async () => {
      const res = await request(app).get('/api/attendance');
      expect(res.statusCode).toEqual(401);
    });

    it('should allow Authenticated User', async () => {
      const user = await createTestUser('Employee');
      const token = generateTestToken(user);
      const res = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });

  describe('POST /api/attendance/clock-in (Private: User)', () => {
    it('should allow Authenticated User to clock in', async () => {
      const user = await createTestUser('Employee');
      const token = generateTestToken(user);
      const res = await request(app)
        .post('/api/attendance/clock-in')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      // Should be success or already clocked in error (400), but permissions OK
      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });
});
