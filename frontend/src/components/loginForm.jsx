import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/userContext";
import "./loginForm.css";

export default function LoginForm() {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const { setUserId, setToken } = useContext(UserContext);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:3000/api/users/login", form);
            const { token, _id: userId } = res.data;

            console.log("Login response:", res.data);

            // Stockage local
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);

            // Mise à jour du context
            setToken(token);
            setUserId(userId);

            navigate(location.state?.from || "/profile");
        } catch (err) {
            console.error("Login error:", err);
            alert(err.response?.data?.error || "Erreur lors de la connexion");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="loginForm">
            <h2>Connexion</h2>
            <input
                type="text"
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
            <button type="submit">Connexion</button>
        </form>
    );
}
