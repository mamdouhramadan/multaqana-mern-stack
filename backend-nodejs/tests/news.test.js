const request = require('supertest');
require('./setup');
const app = require('../server');
const { createTestUser, generateTestToken } = require('./helpers');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('News Module (Permissions)', () => {

  describe('GET /api/news (Public)', () => {
    it('should allow public access to list news', async () => {
      const res = await request(app).get('/api/news');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true); // getAllNews returns array directly
    });
  });

  describe('POST /api/news (Protected: Admin/Editor)', () => {
    it('should deny regular User', async () => {
      const user = await createTestUser('User');
      const token = generateTestToken(user);
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test News' });
      expect(res.statusCode).toEqual(403);
    });

    it('should allow Editor', async () => {
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);
      const res = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Editor News',
          content: 'Content here',
          active: true
        });
      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });

  describe('DELETE /api/news/:id (Protected: Admin/Editor)', () => {
    it('should allow Editor to delete', async () => {
      const editor = await createTestUser('Editor');
      const token = generateTestToken(editor);
      // We assume a random ID. If it returns 404/500/200/400 it means permission passed.
      // If 401/403 permission failed.
      const res = await request(app)
        .delete('/api/news/65c23b24f33d26d7f0000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).not.toEqual(401);
      expect(res.statusCode).not.toEqual(403);
    });
  });
});
