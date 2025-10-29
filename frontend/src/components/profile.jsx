import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login"); // redirection si pas connecté
            return;
        }

        // Requête pour récupérer les infos de l'utilisateur
        axios.get('http://localhost:3000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUser(res.data))
            .catch(err => {
                console.error(err);
                navigate("/login"); // redirection si le token est invalide
            });

    }, [navigate]);

    if (!user) return <p>Chargement...</p>;

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Profil utilisateur</h2>
            <p>Nom : {user.name}</p>
            <p>Nickname : {user.nickname}</p>
            <p>Email : {user.email}</p>
        </div>
    );
}

export default Profile;
