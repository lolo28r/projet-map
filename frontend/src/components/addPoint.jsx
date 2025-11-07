import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PlacesTest() {
    const [places, setPlaces] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        latitude: "",
        longitude: "",
    });

    const token = localStorage.getItem("token");

    // Charger les lieux existants
    useEffect(() => {
        axios
            .get("http://localhost:3000/api/places")
            .then((res) => setPlaces(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Ajouter un lieu
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:3000/api/places",
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPlaces([...places, res.data]); // Ajouter le nouveau lieu à la liste
            setForm({ title: "", description: "", latitude: "", longitude: "" }); // reset
            alert("Lieu ajouté !");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l’ajout du lieu");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Test des lieux</h2>

            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Titre"
                    name="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    name="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Latitude"
                    name="latitude"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Longitude"
                    name="longitude"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    required
                />
                <button type="submit">Ajouter un lieu</button>
            </form>

            <ul>
                {places.map((p) => (
                    <li key={p._id}>
                        <strong>{p.title}</strong> — {p.description}
                        <br />
                        📍 ({p.latitude}, {p.longitude})
                    </li>
                ))}
            </ul>
        </div>
    );
}
