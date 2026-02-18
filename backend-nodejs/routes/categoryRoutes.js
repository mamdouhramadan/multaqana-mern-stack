const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createCategoryValidator, updateCategoryValidator, deleteCategoryValidator } = require('../validator/category.validator');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.use(verifyJWT);

router.post('/', verifyPermission('categories:create'), createCategoryValidator, categoryController.createCategory);
router.put('/:id', verifyPermission('categories:update'), updateCategoryValidator, categoryController.updateCategory);
router.delete('/:id', verifyPermission('categories:delete'), deleteCategoryValidator, categoryController.deleteCategory);

module.exports = router;
