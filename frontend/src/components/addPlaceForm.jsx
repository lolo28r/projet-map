// addPlaceForm.jsx
import React, { useState } from "react";

export default function AddPlaceForm({ onSubmit, onCancel, coordinates }) {
    const [form, setForm] = useState({ title: "", description: "", category: "" });

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (!coordinates || coordinates.some(c => c == null || isNaN(c))) return;

        const [lng, lat] = coordinates;
        onSubmit({ ...form, coordinates: [Number(lng), Number(lat)] });
    };

    return (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                zIndex: 2000,
                width: "300px",
            }}
        >
            <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Ajouter un lieu</h3>
            <form onSubmit={handleSubmit}>
                <input
                    name="title"
                    placeholder="Titre"
                    value={form.title}
                    onChange={handleChange}
                    required
                    style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <input
                    name="category"
                    placeholder="Catégorie"
                    value={form.category}
                    onChange={handleChange}
                    style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button type="submit" style={{ backgroundColor: "#007bff", color: "white", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>Valider</button>
                    <button type="button" onClick={onCancel} style={{ backgroundColor: "#ccc", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}>Annuler</button>
                </div>
            </form>
        </div>
    );
}
