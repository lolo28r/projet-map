import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix des icônes par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
    const mapRef = useRef(null);

    useEffect(() => {
        // Initialisation de la carte
        const map = L.map(mapRef.current).setView([48.8566, 2.3522], 13);

        // TileLayer OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Marker avec popup
        L.marker([48.8566, 2.3522])
            .addTo(map)
            .bindPopup('Bienvenue à Paris 🇫🇷')
            .openPopup();

        // Cleanup à la destruction du composant
        return () => map.remove();
    }, []);

    return (
        <div
            ref={mapRef}
            style={{ height: '88vh', width: '100%' }}
        />
    );
}
