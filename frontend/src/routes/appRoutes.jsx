import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "../components/loginForm";
import RegisterForm from "../components/registerForm";
import Logout from "../components/logout";
import Profile from "../components/profile";
import Home from "../components/Home";
import MapView from "../components/map";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/map" element={<MapView />} />
        </Routes>
    );
};