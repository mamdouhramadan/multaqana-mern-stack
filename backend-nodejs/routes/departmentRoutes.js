const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createDepartmentValidator, updateDepartmentValidator, deleteDepartmentValidator } = require('../validator/department.validator');

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

router.use(verifyJWT);

router.post('/', verifyPermission('departments:create'), createDepartmentValidator, departmentController.createDepartment);
router.put('/:id', verifyPermission('departments:update'), updateDepartmentValidator, departmentController.updateDepartment);
router.delete('/:id', verifyPermission('departments:delete'), deleteDepartmentValidator, departmentController.deleteDepartment);

module.exports = router;
