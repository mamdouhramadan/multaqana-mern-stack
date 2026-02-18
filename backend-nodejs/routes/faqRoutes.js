const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createFAQValidator } = require('../validator/faq.validator');

router.get('/', faqController.getAllFAQs);
router.get('/:id', faqController.getFAQById);

router.use(verifyJWT);

router.post('/', verifyPermission('faqs:create'), createFAQValidator, faqController.createFAQ);
router.put('/:id', verifyPermission('faqs:update'), faqController.updateFAQ);
router.delete('/:id', verifyPermission('faqs:delete'), faqController.deleteFAQ);

module.exports = router;
