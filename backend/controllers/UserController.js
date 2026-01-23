const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require("path");
const Place = require('../models/places');
exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find().select('-password');

        res.status(200).json(users);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};
exports.updateAvatar = async (req, res) => {
    try {
        const imageUrl = await uploadImage(req.file);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { profileImage: imageUrl },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
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
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

        // récupérer contributions
        const contributions = await Place.find({ createdBy: user._id }).sort({ createdAt: -1 });

        res.status(200).json({ user, contributions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        console.log("🟢 REGISTER req.body =", req.body);
        console.log("🖼️ REGISTER req.file =", req.file);

        const { name, nickname, email, password } = req.body;

        if (!name || !nickname || !email || !password) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        // 🔒 Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🖼️ Gestion de l'avatar (Multer diskStorage déjà écrit le fichier)
        let profileImage = null;
        if (req.file) {
            // req.file.filename contient le nom du fichier généré par Multer
            profileImage = `/uploads/${req.file.filename}`;
        }

        // Création utilisateur
        const newUser = new User({
            name,
            nickname,
            email,
            password: hashedPassword,
            profileImage
        });

        await newUser.save();

        // 💡 Génération token JWT
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({ user: newUser, token });
        console.log("✅ Utilisateur créé :", newUser._id);
    } catch (err) {
        console.error("❌ Erreur register :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Vérifier que l'utilisateur modifie son propre compte
        if (req.userId !== req.params.id) {
            return res.status(403).json({ error: "Action non autorisée" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        console.log("🟢 UPDATE USER");
        console.log("req.body =", req.body);
        console.log("req.file =", req.file);

        if (req.userId !== req.params.id) {
            return res.status(403).json({ error: "Action non autorisée" });
        }

        const updates = {};

        // ⚠️ SÉCURITÉ req.body
        if (req.body) {
            if (req.body.name) updates.name = req.body.name;
            if (req.body.nickname) updates.nickname = req.body.nickname;

            if (req.body.password) {
                updates.password = await bcrypt.hash(req.body.password, 10);
            }
        }

        // 🖼️ Avatar (multer diskStorage)
        if (req.file) {
            console.log("🖼️ Nouvelle photo :", req.file.filename);
            updates.profileImage = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("❌ UPDATE ERROR", err);
        res.status(400).json({ error: err.message });
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

exports.getContributions = async (req, res) => {
    try {
        const userId = req.params.id; // l'id de l'utilisateur depuis l'URL

        // On cherche toutes les places créées par cet utilisateur
        const contributions = await Place.find({ createdBy: userId }).sort({ createdAt: -1 });

        res.status(200).json(contributions);
    } catch (err) {
        console.error("❌ getContributions ERROR", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};