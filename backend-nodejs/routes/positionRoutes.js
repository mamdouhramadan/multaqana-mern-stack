const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createPositionValidator, updatePositionValidator, deletePositionValidator } = require('../validator/position.validator');

router.get('/', positionController.getAllPositions);
router.get('/:id', positionController.getPositionById);

router.use(verifyJWT);

router.post('/', verifyPermission('positions:create'), createPositionValidator, positionController.createPosition);
router.put('/:id', verifyPermission('positions:update'), updatePositionValidator, positionController.updatePosition);
router.delete('/:id', verifyPermission('positions:delete'), deletePositionValidator, positionController.deletePosition);

module.exports = router;
