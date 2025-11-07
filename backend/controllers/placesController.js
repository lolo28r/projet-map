const Places = require('../models/places');

// 🔹 Récupérer tous les lieux
exports.getAllPlaces = async (req, res) => {
    try {
        const places = await Places.find().populate('createdBy', 'nickname');
        res.json(places);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 Récupérer un lieu par ID
exports.getPlaceById = async (req, res) => {
    try {
        const place = await Places.findById(req.params.id).populate('createdBy', 'nickname');
        if (!place) return res.status(404).json({ error: 'Lieu non trouvé' });
        res.json(place);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 Créer un nouveau lieu
// 🔹 Créer un nouveau lieu
// 🔹 Créer un nouveau lieu
exports.createPlace = async (req, res) => {
    try {
        console.log("REQ.BODY:", req.body);

        const { title, description, category, location } = req.body;

        // Vérifie que location et coordinates existent
        if (!location?.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ error: 'Coordonnées invalides' });
        }

        const [lng, lat] = location.coordinates.map(Number);
        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ error: 'Coordonnées invalides' });
        }

        const place = new Places({
            title,
            description,
            category,
            location: { type: "Point", coordinates: [lng, lat] },
            createdBy: req.userId
        });

        await place.save();
        res.status(201).json(place);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};




// 🔹 Mettre à jour un lieu
exports.updatePlace = async (req, res) => {
    try {
        const place = await Places.findById(req.params.id);
        if (!place) return res.status(404).json({ error: 'Lieu non trouvé' });

        // Vérifie que c’est bien le créateur
        if (place.createdBy.toString() !== req.userId)
            return res.status(403).json({ error: 'Non autorisé' });

        Object.assign(place, req.body);
        await place.save();

        res.json(place);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 🔹 Supprimer un lieu
exports.deletePlace = async (req, res) => {
    try {
        const place = await Places.findById(req.params.id);
        if (!place) return res.status(404).json({ error: 'Lieu non trouvé' });

        if (place.createdBy.toString() !== req.userId)
            return res.status(403).json({ error: 'Non autorisé' });

        await place.deleteOne();
        res.json({ message: 'Lieu supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
