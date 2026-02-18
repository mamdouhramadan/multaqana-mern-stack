const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const {
  getRoleValidator,
  createRoleValidator,
  updateRoleValidator,
  deleteRoleValidator
} = require('../validator/role.validator');

router.use(verifyJWT);

router.get('/permissions', verifyPermission('roles:read'), roleController.getPermissions);
router.get('/default', verifyPermission('roles:read'), roleController.getDefaultRole);
router.get('/', verifyPermission('roles:read'), roleController.getAllRoles);
router.get('/:id', verifyPermission('roles:read'), getRoleValidator, roleController.getRoleById);
router.post('/', verifyPermission('roles:create'), createRoleValidator, roleController.createRole);
router.patch('/:id/set-default', verifyPermission('roles:update'), getRoleValidator, roleController.setDefaultRole);
router.patch('/:id', verifyPermission('roles:update'), updateRoleValidator, roleController.updateRole);
router.delete('/:id', verifyPermission('roles:delete'), deleteRoleValidator, roleController.deleteRole);

module.exports = router;
