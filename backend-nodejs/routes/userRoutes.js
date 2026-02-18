const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeMyPasswordValidator,
  updateLoggedUserValidator
} = require('../validator/user.validator');

const router = express.Router();

// Protect all routes after this middleware
// router.use(authController.protect); // Assuming you have protect middleware in authController or verifyJWT
// The existing project uses checkUser or verifyJWT?
// Let's use verifyJWT as seen in categoryRoutes.js
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');

router.use(verifyJWT);

// Routes for logged in user
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', updateLoggedUserValidator, userController.updateMe);
router.patch('/me/change-password', changeMyPasswordValidator, authController.changeMyPassword);
router.delete('/deleteMe', userController.deleteMe);

// Admin routes (permission-based)
router.get('/', verifyPermission('users:read'), userController.getAllUsers);
router.post('/', verifyPermission('users:create'), createUserValidator, userController.createUser);
router.get('/:id', verifyPermission('users:read'), getUserValidator, userController.getUser);
router.patch('/:id', verifyPermission('users:update'), updateUserValidator, userController.sanitizeUserUpdate, userController.updateUser);
router.delete('/:id', verifyPermission('users:delete'), deleteUserValidator, userController.deleteUser);

module.exports = router;
