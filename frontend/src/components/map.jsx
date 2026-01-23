import React, { useEffect, useRef, useState, useContext } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import AddPlaceForm from "./AddPlaceForm";
import FloatingButton from "./FloatingButton";
import PlacePopup from "./PlacePopup";
import { UserContext } from "../context/userContext";
import "./MapView.css";
import { useLocation } from "react-router-dom";

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
    const [categories, setCategories] = useState([]);
    const [addingMode, setAddingMode] = useState(false);
    const [tempMarker, setTempMarker] = useState(null);
    const [formCoords, setFormCoords] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const location = useLocation();
    const { selectedPlaceId } = location.state || {};

    const { userId: currentUserId, token } = useContext(UserContext);

    // Debug
    useEffect(() => {
        console.log("[MapView] userId:", currentUserId, "token:", token);
    }, [currentUserId, token]);

    // Initialisation de la carte
    useEffect(() => {
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
                setPlaces(res.data);
            } catch (err) {
                console.error("[MapView] Erreur chargement lieux :", err);
            }
        };
        fetchPlaces();
    }, [map]);

    // Chargement des catégories dynamiques
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/places/categories");
                setCategories(res.data);
            } catch (err) {
                console.error("[MapView] Erreur récupération catégories :", err);
            }
        };
        fetchCategories();
    }, []);

    // Affichage des markers
    useEffect(() => {
        if (!map) return;

        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        places.forEach(p => {
            if (p.location?.coordinates) {
                const [lng, lat] = p.location.coordinates;
                const marker = L.marker([lat, lng])
                    .addTo(map)
                    .on("click", () => setSelectedPlace(p));
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
            if (tempMarker) map.removeLayer(tempMarker);
            const marker = L.marker([lat, lng]).addTo(map);
            setTempMarker(marker);
            setFormCoords([lng, lat]);
        };
        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [map, addingMode, tempMarker]);

    // Zoom sur un lieu sélectionné
    useEffect(() => {
        if (selectedPlaceId && places.length > 0 && map) {
            const place = places.find(p => p._id === selectedPlaceId);
            if (place && place.location?.coordinates) {
                const [lng, lat] = place.location.coordinates;
                map.setView([lat, lng], 16);
                setSelectedPlace(place);
            }
        }
    }, [selectedPlaceId, places, map]);

    // Ajouter un lieu
    const handleAddPlace = async (data) => {
        try {
            const coords = data.coordinates.map(Number);
            const res = await axios.post(
                "http://localhost:3000/api/places",
                { title: data.title, description: data.description, category: data.category, location: { type: "Point", coordinates: coords } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPlaces([...places, res.data]);
            setAddingMode(false);
            setTempMarker(null);
            setFormCoords(null);
        } catch (err) {
            console.error("[MapView] Erreur ajout lieu :", err);
            alert(err.response?.data?.error || "Erreur lors de l'ajout du lieu");
        }
    };

    // Modifier un lieu
    const handleEditPlace = async (updatedData) => {
        try {
            const { title, description, category } = updatedData;
            const res = await axios.put(
                `http://localhost:3000/api/places/${selectedPlace._id}`,
                { title, description, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPlaces(places.map(p => p._id === res.data._id ? res.data : p));
            setSelectedPlace(res.data);
        } catch (err) {
            console.error("[MapView] Erreur modification lieu :", err);
            alert(err.response?.data?.error || "Erreur lors de la modification du lieu");
        }
    };

    return (
        <div className="map-container">
            <div ref={mapRef} className="leaflet-container" />

            <FloatingButton
                onClick={() => setAddingMode(!addingMode)}
                active={addingMode}
            />

            {formCoords && (
                <AddPlaceForm
                    coordinates={formCoords}
                    onSubmit={handleAddPlace}
                    onCancel={() => {
                        setAddingMode(false);
                        setFormCoords(null);
                        if (tempMarker) map.removeLayer(tempMarker);
                    }}
                    categories={categories}
                />
            )}

            {selectedPlace && (
                <PlacePopup
                    place={selectedPlace}
                    currentUserId={currentUserId}
                    onEdit={handleEditPlace}
                    onDelete={async (id) => {
                        await axios.delete(`http://localhost:3000/api/places/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setPlaces(places.filter(p => p._id !== id));
                        setSelectedPlace(null);
                    }}
                    onClose={() => setSelectedPlace(null)}
                    categories={categories}
                />
            )}
        </div>
    );
}
