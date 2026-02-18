const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createHolidayValidator, deleteHolidayValidator } = require('../validator/holiday.validator');

router.get('/', holidayController.getAllHolidays);
router.get('/:id', holidayController.getHolidayById);

router.use(verifyJWT);

router.post('/', verifyPermission('holidays:create'), createHolidayValidator, holidayController.createHoliday);
router.delete('/:id', verifyPermission('holidays:delete'), deleteHolidayValidator, holidayController.deleteHoliday);

module.exports = router;
