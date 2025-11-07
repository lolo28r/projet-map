// MapView.jsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import AddPlaceForm from "./addPlaceForm";
import FloatingButton from "./floatingButton";
import "./MapView.css";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView() {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [places, setPlaces] = useState([]);
    const [addingMode, setAddingMode] = useState(false);
    const [tempMarker, setTempMarker] = useState(null);
    const [formCoords, setFormCoords] = useState(null);
    const token = localStorage.getItem("token");

    // --- Initialisation carte
    useEffect(() => {
        console.log("[MapView] Initialisation carte...");
        const mapInstance = L.map(mapRef.current).setView([48.8566, 2.3522], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapInstance);
        setMap(mapInstance);
        return () => mapInstance.remove();
    }, []);

    // --- Charger lieux existants
    useEffect(() => {
        if (!map) return;
        console.log("[MapView] Chargement des lieux...");
        const fetchPlaces = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/places");
                console.log("[MapView] Lieux récupérés :", res.data);
                setPlaces(res.data);
            } catch (err) {
                console.error("[MapView] Erreur chargement lieux :", err);
            }
        };
        fetchPlaces();
    }, [map]);

    // --- Afficher les markers
    useEffect(() => {
        if (!map) return;

        console.log("[MapView] Affichage des markers sur la carte...");

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        places.forEach((p) => {
            if (p.location?.coordinates) {
                const [lng, lat] = p.location.coordinates;
                console.log("[MapView] Ajout marker :", p.title, "coord :", [lat, lng]);
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(`<strong>${p.title}</strong><br>${p.description}`);
            }
        });
    }, [map, places]);

    // --- Clic sur la carte en mode ajout
    useEffect(() => {
        if (!map) return;

        const handleClick = (e) => {
            console.log("[MapView] Clic sur la carte :", e.latlng);
            if (!addingMode || !e.latlng) return;

            const lng = Number(e.latlng.lng);
            const lat = Number(e.latlng.lat);
            console.log("[MapView] Coordonnées clic :", { lat, lng });

            if (isNaN(lng) || isNaN(lat)) {
                console.warn("[MapView] Coordonnées invalides :", { lat, lng });
                return;
            }

            if (tempMarker) {
                console.log("[MapView] Suppression ancien marker temporaire");
                map.removeLayer(tempMarker);
            }

            const marker = L.marker([lat, lng]).addTo(map);
            setTempMarker(marker);
            setFormCoords([lng, lat]);
            console.log("[MapView] Marker temporaire ajouté, formCoords :", [lng, lat]);
        };

        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [map, addingMode, tempMarker]);

    // --- Soumission du formulaire
    // --- Soumission du formulaire
    const handleAddPlace = async (data) => {
        console.log("[MapView] Soumission formulaire :", data);

        try {
            // data.coordinates = [lng, lat]
            const coords = data.coordinates.map(Number);
            console.log("[MapView] Coordonnées converties :", coords);

            if (coords.some(isNaN)) {
                console.error("[MapView] Coordonnées invalides :", coords);
                return;
            }

            const res = await axios.post(
                "http://localhost:3000/api/places",
                {
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    location: { type: "Point", coordinates: coords }, // <-- correspond au backend
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("[MapView] Lieu ajouté :", res.data);

            setPlaces([...places, res.data]);
            setAddingMode(false);

            if (tempMarker)
                tempMarker.bindPopup(
                    `<strong>${data.title}</strong><br>${data.description}`
                );

            setTempMarker(null);
            setFormCoords(null);
        } catch (err) {
            console.error("[MapView] Erreur ajout lieu :", err);
            alert(err.response?.data?.error || "Erreur lors de l'ajout du lieu");
        }
    };


    return (
        <div className="map-container">
            <div ref={mapRef} className="leaflet-container" />
            <FloatingButton
                onClick={() => {
                    console.log("[MapView] Bouton ajouter un point cliqué");
                    setAddingMode(!addingMode);
                }}
                active={addingMode}
            />
            {formCoords && (
                <AddPlaceForm
                    coordinates={formCoords}
                    onSubmit={handleAddPlace}
                    onCancel={() => {
                        console.log("[MapView] Annulation ajout lieu");
                        setAddingMode(false);
                        setFormCoords(null);
                        if (tempMarker) map.removeLayer(tempMarker);
                    }}
                />
            )}
        </div>
    );
}
