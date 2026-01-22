import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./registerForm.css";
import AvatarCrop from "./AvatarCrop";

export default function RegisterForm() {
    const [avatar, setAvatar] = useState(null);
    const [showCrop, setShowCrop] = useState(false);
    const [rawImage, setRawImage] = useState(null);

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        nickname: "",
        email: "",
        password: ""
    });
    const isFormValid =
        form.name &&
        form.nickname &&
        form.email &&
        form.password &&
        avatar;





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
        const file = e.target.files[0];
        if (!file) return;

        setRawImage(URL.createObjectURL(file)); // pour le crop
        setShowCrop(true);
    };


    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!avatar) {
            alert("Veuillez ajouter une photo de profil");
            return;
        }

        try {
            const data = new FormData();
            data.append("name", form.name);
            data.append("nickname", form.nickname);
            data.append("email", form.email);
            data.append("password", form.password);
            data.append("image", avatar);

            const res = await axios.post(
                "http://localhost:3000/api/users/register",
                data
            );

            const token = res.data.token;
            const userId = res.data.user._id;

            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);

            navigate("/profile");
        } catch (err) {
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
                value={form.name}
                onChange={handleChange}
                required
            />

            <input
                type="text"
                name="nickname"
                placeholder="Pseudo"
                value={form.nickname}
                onChange={handleChange}
                required
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
            />

            <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                required
            />


            <div className="avatar-upload">
                <input
                    type="file"
                    accept="image/*"
                    id="avatarInput"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                />
                <button type="button" onClick={() => document.getElementById("avatarInput").click()}>
                    {avatar ? "Photo sélectionnée ✅" : "Upload une photo de profil *"}
                </button>
            </div>
            {showCrop && (
                <AvatarCrop
                    image={rawImage}
                    onValidate={(croppedFile) => {
                        setAvatar(croppedFile);
                        setShowCrop(false);
                    }}
                    onCancel={() => setShowCrop(false)}
                />
            )}

            <button type="submit" disabled={!isFormValid}>
                Créer le compte
            </button>

        </form>
    );
}
