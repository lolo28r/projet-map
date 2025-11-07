import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", nickname: "", password: "" });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            // Redirige vers login avec info de provenance
            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        axios.get('http://localhost:3000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setUser(res.data);
                setFormData({ name: res.data.name, nickname: res.data.nickname, password: "" });
            })
            .catch(err => {
                console.error(err);
                localStorage.removeItem("token");
                navigate("/login", { state: { from: location.pathname } });
            });
    }, [navigate, location.pathname]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setFormData({ name: user.name, nickname: user.nickname, password: "" });
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        try {
            const dataToSend = { name: formData.name, nickname: formData.nickname };
            if (formData.password) dataToSend.password = formData.password;

            const res = await axios.patch(
                `http://localhost:3000/api/users/${user._id}`,
                dataToSend,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser(res.data);
            setIsEditing(false);
            alert("Profil mis à jour !");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) return;

        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:3000/api/users/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem("token");
            navigate("/register");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression du compte");
        }
    };

    if (!user) return <p>Chargement...</p>;

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };


    return (
        <div className="profile-container">
            <h2>Profil utilisateur</h2>

            {isEditing ? (
                <div>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nom"
                    />
                    <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        placeholder="Nickname"
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nouveau mot de passe (optionnel)"
                    />
                    <button onClick={handleSave}>Sauvegarder</button>
                    <button onClick={handleEditToggle}>Annuler</button>
                </div>
            ) : (
                <div>
                    <p>Nom : {user.name}</p>
                    <p>Nickname : {user.nickname}</p>
                    <p>Email : {user.email}</p>
                    <button onClick={handleEditToggle}>Modifier mon profil</button>
                </div>
            )}

            <button onClick={handleLogout} style={{ marginTop: "10px" }}>
                Déconnexion
            </button>


            <button onClick={handleDelete} style={{ marginTop: "10px", color: "red" }}>
                Supprimer mon compte
            </button>
        </div>
    );
}

export default Profile;
