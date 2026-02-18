const request = require('supertest');
require('./setup');
const app = require('../server');
const { createTestUser, generateTestToken } = require('./helpers');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('Structure Modules (Departments/Positions/Categories)', () => {

  describe('DELETE /api/categories/:id (Admin Only)', () => {
    it('should deny Editor', async () => {
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);
      const res = await request(app)
        .delete('/api/categories/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin', async () => {
      const admin = await createTestUser('Admin');
      const token = generateTestToken(admin);
      const res = await request(app)
        .delete('/api/categories/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).not.toEqual(403);
      expect(res.statusCode).not.toEqual(401);
    });
  });

  describe('DELETE /api/departments/:id (Admin Only)', () => {
    it('should deny Editor', async () => {
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);
      const res = await request(app)
        .delete('/api/departments/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/positions/:id (Admin Only)', () => {
    it('should deny Editor', async () => {
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);
      const res = await request(app)
        .delete('/api/positions/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });
  });
});
