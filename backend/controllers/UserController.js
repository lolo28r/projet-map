const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find().select('-password');

        res.status(200).json(users);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier que l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Générer le token JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Retourner le token
        res.status(200).json({
            token,
            _id: user._id,
            nickname: user.nickname
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, nickname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, nickname, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json(newUser);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



exports.updateUser = async (req, res) => {
    try {
        // Vérifier que l'utilisateur modifie son propre compte
        if (req.userId !== req.params.id) {
            return res.status(403).json({ error: "Action non autorisée" });
        }

        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    console.log("req.userId =", req.userId);
    console.log("req.params.id =", req.params.id);
    try {
        if (req.userId !== req.params.id) {
            return res.status(403).json({ error: "Action non autorisée" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};