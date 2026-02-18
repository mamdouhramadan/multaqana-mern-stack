const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { uploadAppLogo } = require('../middleware/uploadMiddleware');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');

const { createApplicationValidator, updateApplicationValidator, deleteApplicationValidator } = require('../validator/application.validator');

router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);

router.use(verifyJWT);

router.post('/', verifyPermission('applications:create'), uploadAppLogo.fields([{ name: 'logo', maxCount: 1 }]), createApplicationValidator, applicationController.createApplication);
router.patch('/:id', verifyPermission('applications:update'), uploadAppLogo.fields([{ name: 'logo', maxCount: 1 }]), updateApplicationValidator, applicationController.updateApplication);
router.delete('/:id', verifyPermission('applications:delete'), deleteApplicationValidator, applicationController.deleteApplication);

module.exports = router;
