import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./loginForm.css";

export default function LoginForm() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:3000/api/users/login', form);
            const token = res.data.token;
            localStorage.setItem('token', token);
            const redirectTo = location.state?.from || "/profile";
            navigate(redirectTo);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Erreur lors de la connexion');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="loginForm">
            <h2>Connexion</h2>
            <input
                type="text"
                name="email"
                placeholder="Mail"
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
