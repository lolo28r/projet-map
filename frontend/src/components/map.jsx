import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix des icônes par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null); // On garde la référence de la carte
    const [places, setPlaces] = useState([]);

    // Initialisation de la carte une seule fois
    useEffect(() => {
        const mapInstance = L.map(mapRef.current).setView([48.8566, 2.3522], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance);

        setMap(mapInstance);

        return () => mapInstance.remove(); // cleanup
    }, []);

    // Récupération des lieux
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/places');
                setPlaces(res.data);
            } catch (err) {
                console.error('Erreur lors du chargement des lieux :', err);
            }
        };

        fetchPlaces();
    }, []);

    // Ajouter les markers après récupération des lieux
    useEffect(() => {
        if (!map) return; // map pas encore initialisée

        places.forEach(place => {
            if (place.location?.coordinates) {
                const [lng, lat] = place.location.coordinates;
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(`<strong>${place.title}</strong><br/>${place.description}`);
            }
        });
    }, [map, places]);

    return <div ref={mapRef} style={{ height: '88vh', width: '100%' }} />;
}
