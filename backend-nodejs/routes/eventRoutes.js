const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

router.use(verifyJWT);
router.post('/', verifyPermission('events:create'), eventController.createEvent);
router.put('/:id', verifyPermission('events:update'), eventController.updateEvent);
router.delete('/:id', verifyPermission('events:delete'), eventController.deleteEvent);

module.exports = router;
