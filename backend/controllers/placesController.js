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
        const { title, description, category, location } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ error: "Titre, description et catégorie sont requis." });
        }

        if (!location?.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({ error: "Coordonnées invalides ou manquantes." });
        }

        const [lng, lat] = location.coordinates.map(Number);
        if (isNaN(lng) || isNaN(lat)) {
            return res.status(400).json({ error: "Coordonnées invalides (non numériques)." });
        }

        // 🔹 Reverse geocoding côté serveur
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const address = {
            road: data.address?.road || "",
            postcode: data.address?.postcode || "",
            city: data.address?.city || data.address?.town || data.address?.village || "",
            country: data.address?.country || "",
            fullAddress: data.display_name || "",
        };

        const place = new Places({
            title,
            description,
            category,
            location: { type: "Point", coordinates: [lng, lat] },
            address,
            createdBy: req.userId
        });

        await place.save();
        res.status(201).json(place);

    } catch (err) {
        console.error("[createPlace] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la création du lieu." });
    }
};
exports.updatePlace = async (req, res) => {
    try {
        const placeId = req.params.id;

        // Champs autorisés à la modification
        const { title, description, category } = req.body;
        const updates = { title, description, category };

        // Vérifier que le lieu existe
        const place = await Places.findById(placeId);
        if (!place) return res.status(404).json({ error: "Lieu non trouvé" });

        // Vérifier que l'utilisateur est propriétaire
        if (String(place.createdBy) !== req.userId) {
            return res.status(403).json({ error: "Action non autorisée" });
        }

        // Mettre à jour uniquement les champs autorisés
        const updatedPlace = await Places.findByIdAndUpdate(
            placeId,
            updates,
            { new: true }
        ).populate("createdBy", "_id nickname"); // ✅ récupérer les infos du créateur

        res.status(200).json(updatedPlace);
    } catch (err) {
        console.error("[updatePlace] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors de la modification du lieu." });
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
exports.ratePlace = async (req, res) => {
    try {
        const placeId = req.params.id;
        const { rating } = req.body;

        if (rating < 0.5 || rating > 5) {
            return res.status(400).json({ error: "La note doit être entre 0,5 et 5" });
        }

        const place = await Places.findById(placeId);
        if (!place) {
            return res.status(404).json({ error: "Lieu non trouvé" });
        }


        const existingRating = place.ratings.find(
            r => r.user.toString() === req.userId
        );

        if (existingRating) {
            existingRating.rating = rating; // update
        } else {
            place.ratings.push({ user: req.userId, rating });
        }

        await place.save();

        res.status(200).json(place);
    } catch (err) {
        console.error("[ratePlace] Erreur :", err);
        res.status(500).json({ error: "Erreur serveur lors du rating" });
    }
};

