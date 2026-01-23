import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Profile.css";
import AvatarCrop from "./AvatarCrop";
import StarRating from "./starRating";


function Profile() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [contributions, setContributions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showCrop, setShowCrop] = useState(false);
    const [formData, setFormData] = useState({ name: "", nickname: "", password: "" });
    const [avatar, setAvatar] = useState(null);

    // Pour les filtres et tris
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("dateDesc");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }

        axios
            .get("http://localhost:3000/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                setUser(res.data);
                setFormData({ name: res.data.name, nickname: res.data.nickname, password: "" });
                return axios.get(
                    `http://localhost:3000/api/users/${res.data._id}/contributions`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            })
            .then((res) => setContributions(res.data))
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate, location.pathname]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        const data = new FormData();
        data.append("name", formData.name);
        data.append("nickname", formData.nickname);
        if (formData.password) data.append("password", formData.password);
        if (avatar) data.append("image", avatar);

        const res = await axios.patch(
            `http://localhost:3000/api/users/${user._id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        setIsEditing(false);
        setAvatar(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleDelete = async () => {
        if (!window.confirm("Supprimer définitivement le compte ?")) return;
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3000/api/users/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        localStorage.removeItem("token");
        navigate("/register");
    };

    if (!user) return <p className="loading">Chargement...</p>;

    // Générer dynamiquement les catégories pour le filtre
    const categories = Array.from(new Set(contributions.map(c => c.category))).sort();

    // Appliquer filtre et tri
    const displayedContributions = [...contributions]
        .filter(c => filterType === "all" || c.category === filterType)
        .sort((a, b) => {
            if (sortBy === "dateAsc") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === "dateDesc") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === "ratingAsc") return (a.rating || 0) - (b.rating || 0);
            if (sortBy === "ratingDesc") return (b.rating || 0) - (a.rating || 0);
            return 0;
        });

    return (
        <div className="profile-dashboard">
            {/* SIDEBAR */}
            <aside className="profile-sidebar">
                <div className="avatar-wrapper">
                    {user.profileImage ? (
                        <img src={`http://localhost:3000${user.profileImage}`} alt="avatar" />
                    ) : (
                        <div className="avatar-placeholder">👤</div>
                    )}
                </div>
                <h2>{user.nickname}</h2>
                <span>{user.email}</span>
                <div className="sidebar-actions">
                    <button className="btn ghost" onClick={handleLogout}>Déconnexion</button>
                    <button className="btn danger" onClick={handleDelete}>Supprimer le compte</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="profile-main">
                {/* INFOS */}
                <section className="profile-section">
                    <h3>Mes informations</h3>
                    {isEditing ? (
                        <div className="profile-form">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Nom" />
                            <input name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Pseudo" />
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nouveau mot de passe" />
                            <div className="form-actions">
                                <button className="btn ghost" onClick={() => document.getElementById("avatarInput").click()}>
                                    Changer l’avatar
                                </button>
                                <input
                                    id="avatarInput"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setShowCrop(true);
                                        setAvatar(file);
                                        setUser((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
                                    }}
                                />
                                <button className="btn primary" onClick={handleSave}>Sauvegarder</button>
                                <button className="btn ghost" onClick={() => setIsEditing(false)}>Annuler</button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-info">
                            <p><strong>Nom :</strong> {user.name}</p>
                            <p><strong>Pseudo :</strong> {user.nickname}</p>
                            <button className="btn ghost" onClick={() => setIsEditing(true)}>Modifier le profil</button>
                        </div>
                    )}
                </section>

                {/* CONTRIBUTIONS */}
                <section className="profile-section">
                    <h3>Mes contributions</h3>

                    {/* FILTRE ET TRI */}
                    <div className="filter-sort-bar">
                        <label>
                            Filtrer par type :
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="all">Tous</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </label>
                        <label>
                            Trier par :
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="dateDesc">Date décroissante</option>
                                <option value="dateAsc">Date croissante</option>
                                <option value="ratingDesc">Note décroissante</option>
                                <option value="ratingAsc">Note croissante</option>
                            </select>
                        </label>
                    </div>

                    {displayedContributions.length === 0 ? (
                        <p className="empty">Aucune contribution</p>
                    ) : (
                        <ul className="contributions-list">
                            {displayedContributions.map((c) => (
                                <li key={c._id} className="contribution-item">
                                    <div className="contribution-info">
                                        <strong>{c.title}</strong>
                                        <span>{c.category}</span>

                                        {c.averageRating > 0 ? (
                                            <StarRating value={c.averageRating} />
                                        ) : (
                                            <span className="no-rating">Pas encore noté</span>
                                        )}
                                    </div>


                                    <div className="contribution-actions">
                                        <button className="btn ghost" onClick={() => navigate("/map", { state: { selectedPlaceId: c._id } })}>
                                            Voir / Modifier
                                        </button>
                                        <button className="btn danger" onClick={async () => {
                                            if (!window.confirm("Supprimer cette contribution ?")) return;
                                            const token = localStorage.getItem("token");
                                            await axios.delete(`http://localhost:3000/api/places/${c._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                            setContributions((prev) => prev.filter((p) => p._id !== c._id));
                                        }}>
                                            Supprimer
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            {showCrop && (
                <AvatarCrop
                    image={user.profileImage}
                    onValidate={(file) => {
                        setAvatar(file);
                        setUser((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
                        setShowCrop(false);
                    }}
                    onCancel={() => setShowCrop(false)}
                />
            )}
        </div>
    );
}

export default Profile;
