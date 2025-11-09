import React, { useEffect, useRef, useState, useContext } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import AddPlaceForm from "./addPlaceForm";
import FloatingButton from "./floatingButton";
import PlacePopup from "./placePopUp";
import { UserContext } from "../context/userContext";
import "./MapView.css";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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
    const [selectedPlace, setSelectedPlace] = useState(null);

    // Context utilisateur
    const { userId: currentUserId, token } = useContext(UserContext);

    // Debug : afficher userId et token
    useEffect(() => {
        console.log("[MapView] userId du context:", currentUserId);
        console.log("[MapView] token du context:", token);
        console.log("[MapView] userId dans localStorage:", localStorage.getItem("userId"));
    }, [currentUserId, token]);

    // Initialisation de la carte
    useEffect(() => {
        console.log("[MapView] Initialisation de la carte...");
        const mapInstance = L.map(mapRef.current).setView([48.8566, 2.3522], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapInstance);
        setMap(mapInstance);
        return () => mapInstance.remove();
    }, []);

    // Chargement des lieux
    useEffect(() => {
        if (!map) return;

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

    // Affichage des markers
    useEffect(() => {
        if (!map) return;

        // Supprimer anciens markers
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        places.forEach(p => {
            if (p.location?.coordinates) {
                const [lng, lat] = p.location.coordinates;
                const marker = L.marker([lat, lng])
                    .addTo(map)
                    .on("click", () => {
                        console.log("[MapView] Marker cliqué :", p.title, "| ID :", p._id);
                        setSelectedPlace(p);
                    });
                marker.bindTooltip(p.title, { permanent: false });
            }
        });
    }, [map, places]);

    // Clic sur la carte en mode ajout
    useEffect(() => {
        if (!map) return;

        const handleClick = (e) => {
            if (!addingMode) return;

            const [lng, lat] = [e.latlng.lng, e.latlng.lat];
            console.log("[MapView] Clic carte en ajout :", { lat, lng });

            if (tempMarker) map.removeLayer(tempMarker);

            const marker = L.marker([lat, lng]).addTo(map);
            setTempMarker(marker);
            setFormCoords([lng, lat]);
        };

        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [map, addingMode, tempMarker]);

    // Ajouter un lieu
    const handleAddPlace = async (data) => {
        try {
            const coords = data.coordinates.map(Number);
            console.log("[MapView] Soumission ajout lieu :", data, "coords :", coords);

            const res = await axios.post(
                "http://localhost:3000/api/places",
                { title: data.title, description: data.description, category: data.category, location: { type: "Point", coordinates: coords } },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("[MapView] Lieu ajouté :", res.data);
            setPlaces([...places, res.data]);
            setAddingMode(false);
            setTempMarker(null);
            setFormCoords(null);
        } catch (err) {
            console.error("[MapView] Erreur ajout lieu :", err);
            alert(err.response?.data?.error || "Erreur lors de l'ajout du lieu");
        }
    };
    const handleEditPlace = async (updatedData) => {
        try {
            const { title, description, category } = updatedData; // uniquement champs modifiables
            const res = await axios.put(
                `http://localhost:3000/api/places/${selectedPlace._id}`,
                { title, description, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPlaces(places.map(p => p._id === res.data._id ? res.data : p));
            setSelectedPlace(res.data);
            console.log("[MapView] Lieu modifié :", res.data);
        } catch (err) {
            console.error("[MapView] Erreur modification lieu :", err);
            alert(err.response?.data?.error || "Erreur lors de la modification du lieu");
        }
    };


    return (
        <div className="map-container">
            <div ref={mapRef} className="leaflet-container" />

            <FloatingButton
                onClick={() => {
                    console.log("[MapView] Bouton ajout cliqué, mode avant:", addingMode);
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
            {selectedPlace && (
                <PlacePopup
                    place={selectedPlace}
                    currentUserId={currentUserId}
                    onEdit={handleEditPlace} // 🔹 ici
                    onDelete={async (id) => {
                        try {
                            await axios.delete(`http://localhost:3000/api/places/${id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            setPlaces(places.filter(p => p._id !== id));
                            setSelectedPlace(null);
                        } catch (err) {
                            console.error("[MapView] Erreur suppression :", err);
                            alert("Erreur lors de la suppression du lieu.");
                        }
                    }}
                    onClose={() => setSelectedPlace(null)}
                />
            )}
        </div>
    );
}
