const express = require('express');
const router = express.Router();
const photoAlbumController = require('../controllers/photoAlbumController');
const { uploadAlbum } = require('../middleware/uploadMiddleware');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createPhotoAlbumValidator } = require('../validator/photoalbum.validator');

router.get('/', photoAlbumController.getAllAlbums);
router.get('/:id', photoAlbumController.getAlbumById);

router.use(verifyJWT);

router.post('/', verifyPermission('photos:create'), uploadAlbum, createPhotoAlbumValidator, photoAlbumController.createAlbum);
router.put('/:id', verifyPermission('photos:update'), uploadAlbum, photoAlbumController.updateAlbum);
router.delete('/:id', verifyPermission('photos:delete'), photoAlbumController.deleteAlbum);

module.exports = router;
