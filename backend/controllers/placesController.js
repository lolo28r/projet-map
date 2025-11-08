const Places = require('../models/places');


exports.getAllPlaces = async (req, res) => {
    try {
        const places = await Places.find().populate('createdBy', '_id nickname');
        res.status(200).json(places);
    } catch (err) {
        console.error("[getAllPlaces] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des lieux." });
    }
};

exports.getPlaceById = async (req, res) => {
    try {
        const place = await Places.findById(req.params.id).populate('createdBy', '_id nickname');
        if (!place) {
            return res.status(404).json({ error: "Lieu non trouvé." });
        }
        res.status(200).json(place);
    } catch (err) {
        console.error("[getPlaceById] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du lieu." });
    }
};

exports.createPlace = async (req, res) => {
    try {
        console.log("[createPlace] REQ.BODY :", req.body);

        const { title, description, category, location } = req.body;

        // Validation des champs requis
        if (!title || !description || !category) {
            return res.status(400).json({ error: "Titre, description et catégorie sont requis." });
        }

        // Validation des coordonnées
        if (!location?.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ error: "Coordonnées invalides ou manquantes." });
        }

        const [lng, lat] = location.coordinates.map(Number);
        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ error: "Coordonnées invalides (non numériques)." });
        }

        const place = new Places({
            title,
            description,
            category,
            location: { type: "Point", coordinates: [lng, lat] },
            createdBy: req.userId
        });

        await place.save();
        console.log("[createPlace] Lieu créé avec succès :", place.title);
        res.status(201).json(place);
    } catch (err) {
        console.error("[createPlace] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la création du lieu." });
    }
};


exports.updatePlace = async (req, res) => {
    try {
        console.log("[updatePlace] REQ.BODY :", req.body);

        const place = await Places.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ error: "Lieu non trouvé." });
        }

        if (place.createdBy.toString() !== req.userId) {
            return res.status(403).json({ error: "Non autorisé à modifier ce lieu." });
        }

        const { title, description, category, location } = req.body;

        if (location?.coordinates) {
            const [lng, lat] = location.coordinates.map(Number);
            if (isNaN(lng) || isNaN(lat)) {
                return res.status(400).json({ error: "Coordonnées invalides (non numériques)." });
            }
            place.location = { type: "Point", coordinates: [lng, lat] };
        }

        if (title) place.title = title;
        if (description) place.description = description;
        if (category) place.category = category;

        await place.save();
        console.log("[updatePlace] Lieu mis à jour :", place.title);
        res.status(200).json(place);
    } catch (err) {
        console.error("[updatePlace] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du lieu." });
    }
};


exports.deletePlace = async (req, res) => {
    try {
        const place = await Places.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ error: "Lieu non trouvé." });
        }

        if (place.createdBy.toString() !== req.userId) {
            return res.status(403).json({ error: "Non autorisé à supprimer ce lieu." });
        }

        await place.deleteOne();
        console.log("[deletePlace] Lieu supprimé :", place.title);
        res.status(200).json({ message: "Lieu supprimé avec succès." });
    } catch (err) {
        console.error("[deletePlace] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la suppression du lieu." });
    }
};
