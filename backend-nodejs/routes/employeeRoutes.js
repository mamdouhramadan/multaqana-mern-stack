const express = require('express');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// Public: list users with role "employee" (for home team section, etc.)
router.get('/', employeeController.getEmployees);

module.exports = router;
