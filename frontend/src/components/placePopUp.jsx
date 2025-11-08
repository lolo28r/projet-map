import React, { useContext } from "react";
import "./PlacePopup.css";
import { UserContext } from "../context/userContext";

export default function PlacePopup({ place, onEdit, onDelete, onClose }) {
    const { userId: currentUserId } = useContext(UserContext);
    const isOwner = String(place.createdBy?._id) === String(currentUserId);

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>
                <h2>{place.title}</h2>
                <p><strong>Catégorie :</strong> {place.category}</p>
                <p><strong>Description :</strong> {place.description}</p>
                <p><strong>Ajouté par :</strong> {place.createdBy?.nickname || "Anonyme"}</p>
                <p><strong>Date :</strong> {new Date(place.createdAt).toLocaleDateString()}</p>

                {isOwner && (
                    <div className="popup-actions">
                        <button onClick={() => onEdit(place)}>Modifier</button>
                        <button className="delete" onClick={() => onDelete(place._id)}>Supprimer</button>
                    </div>
                )}
            </div>
        </div>
    );
}
