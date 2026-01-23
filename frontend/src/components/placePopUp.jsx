import React, { useContext, useState, useEffect } from "react";
import "./PlacePopup.css";
import { UserContext } from "../context/userContext";
import StarRating from "./starRating";

export default function PlacePopup({ place, onEdit, onDelete, onClose, categories }) {
    const { userId: currentUserId } = useContext(UserContext);
    const isOwner = String(place.createdBy?._id) === String(currentUserId);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: place.title,
        category: place.category,
        description: place.description,
    });

    const userRating =
        place.ratings?.find(r => String(r.user) === String(currentUserId))?.rating || 0;

    const [rating, setRating] = useState(userRating);

    useEffect(() => setRating(userRating), [userRating, place._id]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onEdit({ ...place, ...formData });
        setIsEditing(false);
    };

    const handleRate = async (value) => {
        try {
            const res = await fetch(
                `http://localhost:3000/api/places/${place._id}/rate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ rating: value }),
                }
            );
            const updatedPlace = await res.json();
            setRating(value);
            place.averageRating = updatedPlace.averageRating;
            place.ratings = updatedPlace.ratings;
        } catch (err) {
            console.error("Erreur rating :", err);
        }
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                {!isEditing ? (
                    <>
                        <h2>{place.title}</h2>
                        <p><strong>Catégorie :</strong> {place.category}</p>
                        <p><strong>Description :</strong> {place.description}</p>
                        <p><strong>Ajouté par :</strong> {place.createdBy?.nickname || "Anonyme"}</p>
                        <p><strong>Date :</strong> {new Date(place.createdAt).toLocaleDateString()}</p>

                        <div className="rating-block">
                            <div className="average-rating">
                                <strong>Note moyenne :</strong>
                                {place.averageRating > 0 ? (
                                    <StarRating value={place.averageRating} />
                                ) : <span className="no-rating">Pas encore noté</span>}
                                {place.ratings?.length > 0 && <span>({place.ratings.length})</span>}
                            </div>

                            {!isOwner && (
                                <div className="user-rating">
                                    <strong>Ta note :</strong>
                                    <div className="clickable-stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span
                                                key={star}
                                                className={star <= rating ? "star active" : "star"}
                                                onClick={() => handleRate(star)}
                                            >★</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

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
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            required
                        />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
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
