const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
require('../tests/setup');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateTestToken, createTestUser } = require('../tests/helpers');

let adminToken;
let userToken;
let userId;

beforeAll(async () => {
  // Create Admin
  const admin = await createTestUser('Admin');
  adminToken = generateTestToken(admin);

  // Create User
  const user = await createTestUser('User');
  userId = user._id;
  userToken = generateTestToken(user);
});



describe('Notification Endpoints', () => {

  test('POST /api/notifications - Admin can create notification', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: userId, // Targeted user
        title: 'Test Notification',
        description: 'Testing 123',
        category: 'System'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/notifications - User can list their notifications', async () => {
    // Create notification
    await Notification.create({
      user: userId,
      title: 'Test Notification',
      description: 'Desc',
      category: 'System'
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBe('Test Notification');
  });

  test('PATCH /api/notifications/:id/read - User can mark as read', async () => {
    // Create notification
    const notification = await Notification.create({
      user: userId,
      title: 'To Read',
      description: 'Desc',
      category: 'System'
    });

    const res = await request(app)
      .patch(`/api/notifications/${notification._id}/read`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

});
