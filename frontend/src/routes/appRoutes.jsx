import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "../components/loginForm";
import RegisterForm from "../components/registerForm";
import Logout from "../components/logout";
import Profile from "../components/profile";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
    );
};