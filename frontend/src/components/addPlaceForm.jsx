import React, { useState } from "react";
import "./AddPlaceForm.css";

const categories = ["poubelle", "banc", "point de vue", "toilettes", "fontaine"];

export default function AddPlaceForm({ onSubmit, onCancel, coordinates }) {
    const [form, setForm] = useState({ title: "", description: "", category: categories[0] });

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if (!coordinates || coordinates.some(c => c == null || isNaN(c))) return;
        const [lng, lat] = coordinates;
        onSubmit({ ...form, coordinates: [Number(lng), Number(lat)] });
    };

    return (
        <div className="add-place-overlay">
            <form className="add-place-form" onSubmit={handleSubmit}>
                <h3>Ajouter un lieu</h3>
                <input
                    name="title"
                    placeholder="Titre"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                />
                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>
                <div className="add-place-buttons">
                    <button type="submit" className="btn-primary">Valider</button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>Annuler</button>
                </div>
            </form>
        </div>
    );
}
