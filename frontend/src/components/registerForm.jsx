import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./registerForm.css";

export default function RegisterForm() {
    console.log("🟢 RegisterForm RENDU");

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        nickname: "",
        email: "",
        password: ""
    });

    const [avatar, setAvatar] = useState(null);

    // =========================
    // INPUT TEXTE
    // =========================
    const handleChange = (e) => {
        console.log("✏️ handleChange", e.target.name, e.target.value);

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // =========================
    // INPUT IMAGE
    // =========================
    const handleAvatarChange = (e) => {
        console.log("🖼️ handleAvatarChange", e.target.files);
        setAvatar(e.target.files[0]);
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🚀 handleSubmit déclenché");
        console.log("📄 form =", form);
        console.log("📸 avatar =", avatar);

        try {
            // 🔥 OBLIGATOIRE pour fichiers
            const data = new FormData();
            data.append("name", form.name);
            data.append("nickname", form.nickname);
            data.append("email", form.email);
            data.append("password", form.password);
            if (avatar) data.append("image", avatar);

            console.log("📦 FormData contenu :");
            for (let pair of data.entries()) {
                console.log("   ", pair[0], pair[1]);
            }

            const res = await axios.post(
                "http://localhost:3000/api/users/register",
                data
            );

            console.log("✅ Réponse backend :", res.data);

            const token = res.data.token;
            const userId = res.data.user._id;

            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);

            alert("Compte créé !");
            navigate("/profile");
        } catch (err) {
            console.error("❌ Erreur register :", err);
            alert(err.response?.data?.error || "Erreur lors de la création du compte");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2>Inscription</h2>

            <input
                type="text"
                name="name"
                placeholder="Nom"
                onChange={handleChange}
                required
            />

            <input
                type="text"
                name="nickname"
                placeholder="Pseudo"
                onChange={handleChange}
                required
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
            />

            <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                onChange={handleChange}
                required
            />

            {/* 🖼️ IMAGE */}
            <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
            />

            <button type="submit">Créer le compte</button>
        </form>
    );
}
