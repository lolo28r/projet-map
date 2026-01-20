import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function Profile() {
    console.log("🔵 Profile component rendu");

    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", nickname: "", password: "" });
    const [avatar, setAvatar] = useState(null);

    // =============================
    // FETCH USER
    // =============================
    useEffect(() => {
        console.log("🟣 useEffect déclenché (fetch user)");

        const token = localStorage.getItem("token");
        if (!token) {
            console.log("❌ Pas de token → redirect login");
            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        axios
            .get("http://localhost:3000/api/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => {
                console.log("✅ User reçu :", res.data);
                setUser(res.data);
                setFormData({ name: res.data.name, nickname: res.data.nickname, password: "" });
            })
            .catch(err => {
                console.error("❌ Erreur fetch user", err);
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate, location.pathname]);

    // =============================
    // HANDLERS
    // =============================
    const handleChange = (e) => {
        console.log("✏️ handleChange", e.target.name, e.target.value);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);

        // Prévisualisation instantanée
        setUser(prev => ({
            ...prev,
            profileImage: URL.createObjectURL(file)
        }));
    };


    const handleEditToggle = () => {
        console.log("✏️ toggle edit");
        setIsEditing(!isEditing);
        setAvatar(null);
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        const data = new FormData();
        data.append("name", formData.name);
        data.append("nickname", formData.nickname);
        if (formData.password) data.append("password", formData.password);
        if (avatar) data.append("image", avatar); // 🔹 Ici tu envoies le fichier

        const res = await axios.patch(
            `http://localhost:3000/api/users/${user._id}`, // PATCH user
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(res.data);
        setIsEditing(false);
        setAvatar(null);
    };


    const handleLogout = () => {
        console.log("🚪 logout");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleDelete = async () => {
        console.log("🗑️ delete user");
        if (!window.confirm("Supprimer le compte ?")) return;

        const token = localStorage.getItem("token");

        await axios.delete(`http://localhost:3000/api/users/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.removeItem("token");
        navigate("/register");
    };

    if (!user) return <p>Chargement...</p>;

    return (
        <div className="profile-container">
            <h2>Profil utilisateur</h2>

            {/* AVATAR */}
            <div className="profile-avatar-container">
                {user.profileImage ? (
                    <>
                        {console.log("🖼️ Affichage avatar :", user.profileImage)}
                        <img
                            src={`http://localhost:3000${user.profileImage}`}
                            alt="Avatar"
                            className="profile-avatar"
                        />
                    </>
                ) : (
                    <div className="profile-avatar placeholder">No Avatar</div>
                )}
            </div>

            {isEditing ? (
                <div className="profile-edit">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nom" />
                    <input name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Pseudo" />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nouveau mot de passe" />

                    <input type="file" accept="image/*" onChange={handleAvatarChange} />

                    <button onClick={handleSave}>Sauvegarder</button>
                    <button onClick={handleEditToggle}>Annuler</button>
                </div>
            ) : (
                <div className="profile-info">
                    <p>Nom : {user.name}</p>
                    <p>Nickname : {user.nickname}</p>
                    <p>Email : {user.email}</p>
                    <button onClick={handleEditToggle}>Modifier</button>
                </div>
            )}

            <button onClick={handleLogout}>Déconnexion</button>
            <button onClick={handleDelete} style={{ color: "red" }}>
                Supprimer
            </button>
        </div>
    );
}

export default Profile;
