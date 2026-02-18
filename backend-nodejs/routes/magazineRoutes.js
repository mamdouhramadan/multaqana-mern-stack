const express = require('express');
const router = express.Router();
const magazineController = require('../controllers/magazineController');
const { uploadMagazineAssets } = require('../middleware/uploadMiddleware');
const validateHandler = require('../middleware/validateHandler');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { check } = require('express-validator');
const { createMagazineValidator, updateMagazineValidator, deleteMagazineValidator } = require('../validator/magazine.validator');

router.get('/', magazineController.getAllMagazines);
router.get('/:id', magazineController.getMagazineById);

router.use(verifyJWT);

router.post('/',
  verifyPermission('magazines:create'),
  ...uploadMagazineAssets(),
  createMagazineValidator,
  magazineController.createMagazine
);

router.put('/:id',
  verifyPermission('magazines:update'),
  ...uploadMagazineAssets(),
  updateMagazineValidator,
  magazineController.updateMagazine
);

router.delete('/:id',
  verifyPermission('magazines:delete'),
  deleteMagazineValidator,
  magazineController.deleteMagazine
);

module.exports = router;
