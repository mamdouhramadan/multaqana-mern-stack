const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { uploadVideo } = require('../middleware/uploadMiddleware');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createVideoValidator } = require('../validator/video.validator');

router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);

router.use(verifyJWT);

router.post('/', verifyPermission('videos:create'), uploadVideo, createVideoValidator, videoController.createVideo);
router.put('/:id', verifyPermission('videos:update'), uploadVideo, videoController.updateVideo);
router.delete('/:id', verifyPermission('videos:delete'), videoController.deleteVideo);

module.exports = router;
