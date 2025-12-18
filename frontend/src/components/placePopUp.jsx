import React, { useContext, useState, useEffect } from "react";
import "./PlacePopup.css";
import { UserContext } from "../context/userContext";

const categories = ["poubelle", "banc", "point de vue", "toilettes", "fontaine"];

export default function PlacePopup({ place, onEdit, onDelete, onClose }) {
    const { userId: currentUserId } = useContext(UserContext);
    const isOwner = String(place.createdBy?._id) === String(currentUserId);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: place.title,
        category: place.category,
        description: place.description,
    });

    // ---- Rating ----

    const averageRating =
        place.ratings && place.ratings.length > 0
            ? (place.ratings.reduce((sum, r) => sum + r.rating, 0) / place.ratings.length).toFixed(1)
            : "Aucune note";

    const ratingsCount = place.ratings ? place.ratings.length : 0;



    const userRating = place.ratings?.find(r => String(r.user) === String(currentUserId))?.rating || 0;
    const [rating, setRating] = useState(userRating);

    useEffect(() => {
        setRating(userRating); // mettre à jour si le lieu change
    }, [userRating, place._id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onEdit({ ...place, ...formData });
        setIsEditing(false);
    };

    const handleRate = async (value) => {
        try {
            // POST la note
            const res = await fetch(`http://localhost:3000/api/places/${place._id}/rate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ rating: value }),
            });

            const updatedPlace = await res.json();

            // Mettre à jour les ratings du lieu pour recalculer la moyenne
            place.ratings = updatedPlace.ratings;
            setRating(value); // mettre à jour la note user
        } catch (err) {
            console.error("Erreur lors du rating :", err);
        }
    };
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                {!isEditing ? (
                    <>
                        <h2>{place.title}</h2>
                        <p><strong>Catégorie :</strong> {place.category}</p>
                        <p><strong>Description :</strong> {place.description}</p>
                        <p><strong>Ajouté par :</strong> {place.createdBy?.nickname || "Anonyme"}</p>
                        <p><strong>Date :</strong> {new Date(place.createdAt).toLocaleDateString()}</p>

                        <div className="rating">
                            <p>
                                <strong>Note moyenne :</strong> {averageRating} / 5
                                {ratingsCount > 0 && ` (${ratingsCount})`}
                            </p>
                            <div>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        style={{
                                            cursor: "pointer",
                                            color: star <= rating ? "gold" : "gray",
                                            fontSize: "22px",
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>;



                        {isOwner && (
                            <div className="popup-actions">
                                <button onClick={() => setIsEditing(true)}>✏️ Modifier</button>
                                <button className="delete" onClick={() => onDelete(place._id)}>🗑️ Supprimer</button>
                            </div>
                        )}
                    </>
                ) : (
                    <form className="edit-place-form" onSubmit={handleSubmit}>
                        <h3>Modifier le lieu</h3>
                        <input
                            name="title"
                            placeholder="Titre"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                        />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                        <div className="edit-place-buttons">
                            <button type="submit" className="btn-primary">💾 Enregistrer</button>
                            <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Annuler</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
