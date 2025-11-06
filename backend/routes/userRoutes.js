const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const userController = require('../controllers/UserController');

// 🔐 Connexion
router.post('/login', userController.login);

// 🆕 Inscription
router.post('/register', userController.createUser);

// 👤 Routes protégées
router.get('/me', verifyToken, userController.getMe);
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.patch('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

module.exports = router;
