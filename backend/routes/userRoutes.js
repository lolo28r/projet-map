const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const userController = require('../controllers/UserController');
const upload = require("../middlewares/upload.middleware");


// 🔐 Connexion
router.post('/login', userController.login);

// 🆕 Inscription avec upload avatar
router.post(
    "/register",
    upload.single("image"),
    userController.createUser
);

// 👤 Routes protégées
router.get('/me', verifyToken, userController.getMe);
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.delete('/:id', verifyToken, userController.deleteUser);
router.get('/:id/contributions', verifyToken, userController.getContributions);



router.patch(
    "/:id",
    verifyToken,
    upload.single("image"),
    userController.updateUser
);


module.exports = router;
