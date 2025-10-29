import { useState } from "react";
import axios from "axios";
import './registerForm.css';

export default function RegisterForm() {

    const [form, setForm] = useState({
        name: '',
        nickname: '',
        email: '',
        password: '',

    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/users/register', form);
            alert('Compte crée !');
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la création du compte');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="register-form"><h2>Inscription</h2>
            <input type="text" name="name" placeholder="Nom" onChange={handleChange} required />
            <input type="text" name="nickname" placeholder="Pseudo" onChange={handleChange} required />
            <input type="text" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
            <button type="submit">Créer le compte</button>
        </form>

    );
};