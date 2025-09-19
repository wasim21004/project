const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const TaskController = require('../controllers/taskController');

router.use(checkAuth);

router.get('/', TaskController.list);
router.post('/', TaskController.create);
router.patch('/:id', TaskController.update);
router.delete('/:id', TaskController.remove);

module.exports = router;
