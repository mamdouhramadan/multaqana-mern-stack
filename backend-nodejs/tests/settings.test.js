const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
require('../tests/setup');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { generateTestToken, createTestUser } = require('../tests/helpers');

let adminToken;
let userToken;

beforeEach(async () => {
  const admin = await createTestUser('Admin');
  adminToken = generateTestToken(admin);
  const user = await createTestUser('User');
  userToken = generateTestToken(user);
});



describe('Settings Endpoints', () => {

  test('POST /api/settings - Admin can create setting', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        key: 'test_setting',
        value: 'test_value',
        category: 'Testing',
        isPublic: true
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('test_setting');
  });

  test('POST /api/settings - User cannot create setting', async () => {
    const res = await request(app)
      .post('/api/settings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        key: 'user_setting',
        value: 'fail'
      });

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/settings/public - Retrieve public settings', async () => {
    const res = await request(app).get('/api/settings/public');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined(); // typo in controller 'daa' -> 'data' ? I should fix controller if so.
    // Wait, I noticed 'daa' in my controller during creation step 1502...
  });

  test('DELETE /api/settings/:key - Admin can delete', async () => {
    // Create setting to delete
    await Settings.create({
      key: 'test_setting_del',
      value: 'val',
      category: 'Test',
      isPublic: false
    });

    const res = await request(app)
      .delete('/api/settings/test_setting_del')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

});
