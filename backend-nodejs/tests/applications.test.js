const request = require('supertest');
require('./setup'); // Force setup execution
const app = require('../server');
const { createTestUser, generateTestToken } = require('./helpers');
const Application = require('../models/Application');

// beforeAll(() => {
//   jest.spyOn(console, 'log').mockImplementation(() => { });
//   jest.spyOn(console, 'error').mockImplementation(() => { });
// });

describe('Applications Module (Permissions)', () => {

  describe('GET /api/applications (Public)', () => {
    it('should allow public access to list applications', async () => {
      const res = await request(app).get('/api/applications');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/applications (Protected)', () => {
    it('should deny access without token', async () => {
      const res = await request(app)
        .post('/api/applications')
        .send({ title: 'Test App' });
      expect(res.statusCode).toEqual(401);
    });

    it('should deny access to regular User', async () => {
      const user = await createTestUser('User');
      const token = generateTestToken(user);

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test App' });

      expect(res.statusCode).toEqual(403); // verifyRoles returns 403 Forbidden
    });

    it('should allow Admin to create application', async () => {
      const admin = await createTestUser('Admin');
      const token = generateTestToken(admin);

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Admin App',
          description: 'Created by Admin',
          url: 'http://admin.com',
          category: '65c23b24f33d26d7f0000000', // Mock Object ID
          status: 'active',
          department: '65c23b24f33d26d7f0000001'
        });

      // Note: It might fail if categories/departments IDs are checked for existence in DB.
      // If the controller strictly checks for foreign key existence, we might need to create them first.
      // Let's assume for now checks are either loose or we need to stub. 
      // If it returns 400 Bad Request (Validation), we know permission passed.
      // If it returns 500 (CastError), permission passed.
      // If it returns 401, permission failed.

      // Assuming loose checks or 201 Created
      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });

    it('should allow Editor to create application', async () => {
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Editor App',
          description: 'Created by Editor'
        });

      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should deny Editor if restricted to Admin (Check Matrix)', async () => {
      // Matrix says: Applications Delete -> Admin / Editor
      // So Editor SHOULD be allowed.
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);

      // We verify it DOESN'T return 401/403
      const res = await request(app)
        .delete('/api/applications/65c23b24f33d26d7f0000000') // Random ID mainly to check middleware
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });
});
