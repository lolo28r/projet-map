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
        const fetchPlaces = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/places");
                setPlaces(res.data);
            } catch (err) {
                console.error("Erreur chargement lieux:", err);
            }
        };
        fetchPlaces();
    }, [map]);

    // --- Afficher les markers
    useEffect(() => {
        if (!map) return;

        // Supprimer les markers existants
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        // Ajouter les nouveaux markers
        places.forEach((p) => {
            if (p.location?.coordinates) {
                const [lng, lat] = p.location.coordinates;
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
            if (!addingMode || !e.latlng) return;

            const lng = Number(e.latlng.lng);
            const lat = Number(e.latlng.lat);
            if (isNaN(lng) || isNaN(lat)) return;

            if (tempMarker) map.removeLayer(tempMarker);
            const marker = L.marker([lat, lng]).addTo(map);
            setTempMarker(marker);
            setFormCoords([lng, lat]);
        };

        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [map, addingMode, tempMarker]);

    // --- Soumission du formulaire
    const handleAddPlace = async (data) => {
        try {
            const coords = data.coordinates.map(Number);
            if (coords.some(isNaN)) return console.error("Coordonnées invalides :", coords);

            const res = await axios.post(
                "http://localhost:3000/api/places",
                {
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    location: { type: "Point", coordinates: coords },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPlaces([...places, res.data]);
            setAddingMode(false);
            if (tempMarker)
                tempMarker.bindPopup(`<strong>${data.title}</strong><br>${data.description}`);
            setTempMarker(null);
            setFormCoords(null);
        } catch (err) {
            console.error("Erreur ajout lieu :", err);
        }
    };

    return (
        <div className="map-container">
            <div ref={mapRef} className="leaflet-container" />
            <FloatingButton onClick={() => setAddingMode(!addingMode)} active={addingMode} />
            {formCoords && (
                <AddPlaceForm
                    coordinates={formCoords}
                    onSubmit={handleAddPlace}
                    onCancel={() => {
                        setAddingMode(false);
                        setFormCoords(null);
                        if (tempMarker) map.removeLayer(tempMarker);
                    }}
                />
            )}
        </div>
    );
}
