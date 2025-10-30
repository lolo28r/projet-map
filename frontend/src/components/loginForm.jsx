import React, { useState } from "react";
import axios from "axios";
import './LoginForm.css';

export default function LoginForm() {

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/users/login', form);
            const token = res.data.token;
            localStorage.setItem('token', token);
            alert('Vous êtes connectés !');
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la connexion');
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
