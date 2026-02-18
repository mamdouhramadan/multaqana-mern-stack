const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { uploadFileDoc } = require('../middleware/uploadMiddleware');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createFileValidator, deleteFileValidator } = require('../validator/file.validator');

router.get('/', fileController.getAllFiles);
router.get('/:id', fileController.getFileById);

router.use(verifyJWT);
router.post('/', verifyPermission('files:create'), uploadFileDoc.single('file'), createFileValidator, fileController.uploadFile);
router.patch('/:id', verifyPermission('files:update'), fileController.updateFile);
router.delete('/:id', verifyPermission('files:delete'), deleteFileValidator, fileController.deleteFile);

module.exports = router;
