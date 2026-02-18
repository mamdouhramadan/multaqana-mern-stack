const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { uploadImage } = require('../middleware/uploadMiddleware');

router.get('/public', settingsController.getPublicSettings);

router.use(verifyJWT);

router.post('/upload', verifyPermission('settings:update'), ...uploadImage('file', 'settings'), settingsController.uploadSettingAsset);
router.route('/')
  .get(verifyPermission('settings:read'), settingsController.getSettings)
  .post(verifyPermission('settings:create'), settingsController.upsertSetting);
router.route('/:key')
  .delete(verifyPermission('settings:delete'), settingsController.deleteSetting);

module.exports = router;
