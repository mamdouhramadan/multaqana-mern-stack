const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { uploadImage } = require('../middleware/uploadMiddleware');
const validateHandler = require('../middleware/validateHandler');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { check } = require('express-validator');

const { createNewsValidator, updateNewsValidator, deleteNewsValidator } = require('../validator/news.validator');

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

router.use(verifyJWT);

router.post('/',
  verifyPermission('news:create'),
  ...uploadImage('thumbnail', 'news'),
  createNewsValidator,
  newsController.createNews
);

router.put('/:id',
  verifyPermission('news:update'),
  ...uploadImage('thumbnail', 'news'),
  updateNewsValidator,
  newsController.updateNews
);

router.delete('/:id',
  verifyPermission('news:delete'),
  deleteNewsValidator,
  newsController.deleteNews
);

module.exports = router;
